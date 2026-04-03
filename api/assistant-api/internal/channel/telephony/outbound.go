// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package channel_telephony

import (
	"context"
	"fmt"

	"github.com/rapidaai/api/assistant-api/config"
	callcontext "github.com/rapidaai/api/assistant-api/internal/callcontext"
	channel_pipeline "github.com/rapidaai/api/assistant-api/internal/channel/pipeline"
	internal_services "github.com/rapidaai/api/assistant-api/internal/services"
	web_client "github.com/rapidaai/pkg/clients/web"
	"github.com/rapidaai/pkg/commons"
)

// OutboundDispatcher handles outbound call dispatching across all telephony
// channels (SIP, Asterisk, Twilio, Exotel, Vonage). It resolves the call
// context from Redis and places the call via the appropriate provider.
type OutboundDispatcher struct {
	cfg                 *config.AssistantConfig
	store               callcontext.Store
	logger              commons.Logger
	vaultClient         web_client.VaultClient
	assistantService    internal_services.AssistantService
	telephonyOpt TelephonyOption
	pipeline            *channel_pipeline.Dispatcher
}

// NewOutboundDispatcher creates a new outbound call dispatcher.
func NewOutboundDispatcher(deps TelephonyDispatcherDeps) *OutboundDispatcher {
	return &OutboundDispatcher{
		cfg:                 deps.Cfg,
		store:               deps.Store,
		logger:              deps.Logger,
		vaultClient:      deps.VaultClient,
		assistantService: deps.AssistantService,
		telephonyOpt:     deps.TelephonyOpt,
		pipeline:            deps.Pipeline,
	}
}

// SetPipeline sets the pipeline dispatcher (for late initialization).
func (d *OutboundDispatcher) SetPipeline(p *channel_pipeline.Dispatcher) {
	d.pipeline = p
}

// Dispatch resolves the call context for the given contextID and places the
// outbound call. It should be called in a goroutine so the caller does not
// block on telephony provider latency.
func (d *OutboundDispatcher) Dispatch(ctx context.Context, contextID string) error {
	cc, err := d.store.Claim(ctx, contextID)
	if err != nil {
		d.logger.Errorf("outbound dispatcher: failed to claim call context %s: %v", contextID, err)
		return err
	}

	d.logger.Infof("outbound dispatcher[%s]: processing call contextId=%s, assistant=%d, conversation=%d",
		cc.Provider, cc.ContextID, cc.AssistantID, cc.ConversationID)

	if err := d.performOutbound(ctx, cc); err != nil {
		d.logger.Errorf("outbound dispatcher[%s]: call failed for contextId=%s: %v", cc.Provider, contextID, err)
		if updateErr := d.store.UpdateField(ctx, contextID, "status", callcontext.StatusFailed); updateErr != nil {
			d.logger.Errorf("outbound dispatcher[%s]: failed to update status for %s: %v", cc.Provider, contextID, updateErr)
		}
		return err
	}

	d.logger.Infof("outbound dispatcher[%s]: call initiated for contextId=%s", cc.Provider, contextID)
	return nil
}

// performOutbound resolves the telephony provider, places the call, and emits
// all telemetry (success AND failure) through the pipeline observer.
// No direct ApplyConversationMetrics/Metadata calls — everything flows through observer.
func (d *OutboundDispatcher) performOutbound(ctx context.Context, cc *callcontext.CallContext) error {
	emitFailed := func(stage string, err error) {
		if d.pipeline != nil {
			d.pipeline.OnPipeline(ctx, channel_pipeline.CallFailedPipeline{
				ID:    cc.ContextID,
				Stage: stage,
				Error: err,
			})
		}
	}

	telephony, err := GetTelephony(Telephony(cc.Provider), d.cfg, d.logger, d.telephonyOpt)
	if err != nil {
		emitFailed("provider_resolve", err)
		return fmt.Errorf("telephony provider %s not available: %w", cc.Provider, err)
	}

	auth := cc.ToAuth()

	assistant, err := d.assistantService.Get(ctx, auth, cc.AssistantID, nil, &internal_services.GetAssistantOption{InjectPhoneDeployment: true})
	if err != nil {
		emitFailed("assistant_load", err)
		return fmt.Errorf("failed to load assistant %d: %w", cc.AssistantID, err)
	}

	if !assistant.IsPhoneDeploymentEnable() {
		err := fmt.Errorf("phone deployment not enabled for assistant %d", cc.AssistantID)
		emitFailed("phone_deployment", err)
		return err
	}

	credentialID, err := assistant.AssistantPhoneDeployment.GetOptions().GetUint64("rapida.credential_id")
	if err != nil {
		emitFailed("credential_resolve", err)
		return fmt.Errorf("failed to get credential ID: %w", err)
	}

	vltC, err := d.vaultClient.GetCredential(ctx, auth, credentialID)
	if err != nil {
		emitFailed("vault_credential", err)
		return fmt.Errorf("failed to get vault credential: %w", err)
	}

	opts := assistant.AssistantPhoneDeployment.GetOptions()
	opts["rapida.context_id"] = cc.ContextID

	callInfo, callErr := telephony.OutboundCall(auth, cc.CallerNumber, cc.FromNumber, cc.AssistantID, cc.ConversationID, vltC, opts)
	if callErr != nil {
		d.logger.Errorf("outbound dispatcher[%s]: telephony call failed for contextId=%s: %v", cc.Provider, cc.ContextID, callErr)
	}

	if callInfo == nil {
		emitFailed("dial", callErr)
		return callErr
	}

	// Persist provider call UUID for downstream operations (transfer, disconnect)
	if callInfo.ChannelUUID != "" {
		if updateErr := d.store.UpdateField(ctx, cc.ContextID, "channel_uuid", callInfo.ChannelUUID); updateErr != nil {
			d.logger.Warnf("outbound dispatcher[%s]: failed to store channel UUID: %v", cc.Provider, updateErr)
		}
	}

	// Emit success telemetry through pipeline observer
	if d.pipeline != nil {
		d.pipeline.OnPipeline(ctx, channel_pipeline.OutboundDialedPipeline{
			ID:       cc.ContextID,
			CallInfo: callInfo,
		})
	}

	return callErr
}
