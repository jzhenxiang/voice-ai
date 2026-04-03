// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package channel_pipeline

import (
	"context"
	"fmt"

	obs "github.com/rapidaai/api/assistant-api/internal/observe"
	internal_type "github.com/rapidaai/api/assistant-api/internal/type"
	"github.com/rapidaai/pkg/types"
	"github.com/rapidaai/protos"
)

// handleOutboundRequested drives the complete outbound call flow:
// validate → load assistant → create conversation → save context → observer → dispatch.
// This is a SYNC handler — the controller blocks on resultCh.
func (d *Dispatcher) handleOutboundRequested(ctx context.Context, v OutboundRequestedPipeline, resultCh chan<- *PipelineResult) {
	d.logger.Infow("Pipeline: OutboundRequested",
		"to", v.ToPhone,
		"from", v.FromPhone,
		"assistant_id", v.AssistantID)

	// Stage 1: Load assistant
	if d.onLoadAssistant == nil {
		sendResult(resultCh, &PipelineResult{Error: ErrCallbackNotConfigured})
		return
	}
	assistant, err := d.onLoadAssistant(ctx, v.Auth, v.AssistantID)
	if err != nil {
		sendResult(resultCh, &PipelineResult{Error: fmt.Errorf("invalid assistant: %w", err)})
		return
	}
	if assistant.AssistantPhoneDeployment == nil {
		sendResult(resultCh, &PipelineResult{Error: fmt.Errorf("phone deployment not enabled")})
		return
	}

	// Stage 2: Resolve from phone
	fromPhone := v.FromPhone
	if fromPhone == "" {
		fn, err := assistant.AssistantPhoneDeployment.GetOptions().GetString("phone")
		if err != nil {
			sendResult(resultCh, &PipelineResult{Error: fmt.Errorf("no phone number configured: %w", err)})
			return
		}
		fromPhone = fn
	}
	provider := assistant.AssistantPhoneDeployment.TelephonyProvider

	// Stage 3: Create conversation
	if d.onCreateConversation == nil {
		sendResult(resultCh, &PipelineResult{Error: ErrCallbackNotConfigured})
		return
	}
	conversationID, err := d.onCreateConversation(ctx, v.Auth, v.ToPhone, assistant.Id, assistant.AssistantProviderId, "outbound")
	if err != nil {
		sendResult(resultCh, &PipelineResult{Error: fmt.Errorf("failed to create conversation: %w", err)})
		return
	}

	// Stage 4: Apply conversation extras (options, arguments, metadata)
	if d.onApplyConversationExtras != nil {
		if err := d.onApplyConversationExtras(ctx, v.Auth, assistant.Id, conversationID, v.Options, v.Args, v.Metadata); err != nil {
			d.logger.Warnw("Failed to apply conversation extras", "error", err)
		}
	}

	// Stage 5: Save call context
	if d.onSaveCallContext == nil {
		sendResult(resultCh, &PipelineResult{Error: ErrCallbackNotConfigured})
		return
	}
	callInfo := &internal_type.CallInfo{CallerNumber: v.ToPhone, Provider: provider, Status: "queued"}
	contextID, err := d.onSaveCallContext(ctx, v.Auth, assistant, conversationID, callInfo, provider)
	if err != nil {
		sendResult(resultCh, &PipelineResult{Error: fmt.Errorf("failed to save call context: %w", err)})
		return
	}

	// Stage 6: Create observer
	if d.onCreateObserver != nil {
		o := d.onCreateObserver(ctx, contextID, v.Auth, assistant.Id, conversationID)
		if o != nil {
			d.storeObserver(contextID, o)
		}
	}

	// Emit metadata through observer
	if o, ok := d.getObserver(contextID); ok {
		o.EmitMetadata(ctx, []*types.Metadata{
			types.NewMetadata("telephony.contextId", contextID),
			types.NewMetadata("telephony.toPhone", v.ToPhone),
			types.NewMetadata("telephony.fromPhone", fromPhone),
			types.NewMetadata("telephony.provider", provider),
		})
	}

	d.emitEvent(ctx, contextID, obs.ComponentTelephony, map[string]string{
		obs.DataType:      obs.EventOutboundRequested,
		obs.DataProvider:  provider,
		obs.DataTo:        v.ToPhone,
		obs.DataFrom:      fromPhone,
		obs.DataContextID: contextID,
	})

	// Stage 7: Dispatch outbound call
	if d.onDispatchOutbound != nil {
		if err := d.onDispatchOutbound(ctx, contextID); err != nil {
			d.logger.Error("Pipeline: outbound dispatch failed", "error", err)
			d.OnPipeline(ctx, CallFailedPipeline{ID: contextID, Stage: "dispatch", Error: err})
			sendResult(resultCh, &PipelineResult{
				ContextID:      contextID,
				ConversationID: conversationID,
				Error:          err,
			})
			return
		}
	}

	d.logger.Infow("Pipeline: OutboundDispatched",
		"context_id", contextID,
		"provider", provider,
		"conversation_id", conversationID)

	sendResult(resultCh, &PipelineResult{
		ContextID:      contextID,
		ConversationID: conversationID,
	})
}

// handleOutboundDialed emits CallInfo telemetry from the provider after dialing.
func (d *Dispatcher) handleOutboundDialed(ctx context.Context, v OutboundDialedPipeline) {
	d.logger.Infow("Pipeline: OutboundDialed", "call_id", v.ID)

	if v.CallInfo == nil {
		return
	}

	if o, ok := d.getObserver(v.ID); ok {
		metadata := []*types.Metadata{}
		if v.CallInfo.ChannelUUID != "" {
			metadata = append(metadata, types.NewMetadata("telephony.uuid", v.CallInfo.ChannelUUID))
		}
		if v.CallInfo.ErrorMessage != "" {
			metadata = append(metadata, types.NewMetadata("telephony.error", v.CallInfo.ErrorMessage))
		}
		for k, val := range v.CallInfo.Extra {
			metadata = append(metadata, types.NewMetadata(k, val))
		}
		if len(metadata) > 0 {
			o.EmitMetadata(ctx, metadata)
		}
	}

	if v.CallInfo.Status != "" {
		d.emitMetric(ctx, v.ID, []*protos.Metric{
			{Name: obs.MetricCallStatus, Value: v.CallInfo.Status, Description: "Outbound call status"},
		})
	}

	if v.CallInfo.StatusInfo.Event != "" {
		d.emitEvent(ctx, v.ID, obs.ComponentTelephony, map[string]string{
			obs.DataType:   v.CallInfo.StatusInfo.Event,
			"channel_uuid": v.CallInfo.ChannelUUID,
		})
	}
}
