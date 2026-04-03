// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package sip_pipeline

import (
	"context"

	obs "github.com/rapidaai/api/assistant-api/internal/observe"
	sip_infra "github.com/rapidaai/api/assistant-api/sip/infra"
)

func (d *Dispatcher) handleEventEmitted(ctx context.Context, v sip_infra.EventEmittedPipeline) {
	d.logger.Debugw("Pipeline: Event", "call_id", v.ID, "event", v.Event)
	d.emitEvent(ctx, v.ID, obs.ComponentSIP, v.Data)
}

func (d *Dispatcher) handleMetricEmitted(ctx context.Context, v sip_infra.MetricEmittedPipeline) {
	if len(v.Metrics) == 0 {
		return
	}
	d.logger.Debugw("Pipeline: Metric", "call_id", v.ID, "count", len(v.Metrics))
	d.emitMetric(ctx, v.ID, v.Metrics)
}

func (d *Dispatcher) handleRecordingStarted(ctx context.Context, v sip_infra.RecordingStartedPipeline) {
	d.logger.Infow("Pipeline: RecordingStarted", "call_id", v.ID, "recording_id", v.RecordingID)
	d.emitEvent(ctx, v.ID, obs.ComponentRecording, map[string]string{
		obs.DataType:   obs.EventRecordingStarted,
		"recording_id": v.RecordingID,
	})
}

func (d *Dispatcher) handleDTMFReceived(ctx context.Context, v sip_infra.DTMFReceivedPipeline) {
	d.logger.Debugw("Pipeline: DTMFReceived", "call_id", v.ID, "digit", v.Digit)
	d.emitEvent(ctx, v.ID, obs.ComponentSIP, map[string]string{
		obs.DataType:  obs.EventDTMF,
		obs.DataDigit: v.Digit,
	})
}
