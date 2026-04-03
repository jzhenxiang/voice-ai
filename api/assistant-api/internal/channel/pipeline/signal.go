// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package channel_pipeline

import (
	"context"
	"fmt"

	"github.com/rapidaai/protos"
)

func (d *Dispatcher) handleDisconnectRequested(ctx context.Context, v DisconnectRequestedPipeline) {
	d.logger.Infow("Pipeline: DisconnectRequested", "call_id", v.ID, "reason", v.Reason)
	d.emitEvent(ctx, v.ID, "session", map[string]string{
		"type":   "disconnect_requested",
		"reason": v.Reason,
	})
}

func (d *Dispatcher) handleCallCompleted(ctx context.Context, v CallCompletedPipeline) {
	d.logger.Infow("Pipeline: CallCompleted",
		"call_id", v.ID,
		"duration", v.Duration,
		"messages", v.Messages,
		"reason", v.Reason)

	d.emitEvent(ctx, v.ID, "session", map[string]string{
		"type":        "call_completed",
		"reason":      v.Reason,
		"duration_ms": fmt.Sprintf("%d", v.Duration.Milliseconds()),
		"messages":    fmt.Sprintf("%d", v.Messages),
	})

	d.emitMetric(ctx, v.ID, []*protos.Metric{
		{Name: "telephony.call_duration_ms", Value: fmt.Sprintf("%d", v.Duration.Milliseconds()), Description: "Call duration"},
		{Name: "telephony.end_reason", Value: v.Reason, Description: "Call end reason"},
	})

	d.removeObserver(ctx, v.ID)
}

func (d *Dispatcher) handleCallFailed(ctx context.Context, v CallFailedPipeline) {
	d.logger.Warnw("Pipeline: CallFailed",
		"call_id", v.ID,
		"stage", v.Stage,
		"error", v.Error)

	d.emitEvent(ctx, v.ID, "session", map[string]string{
		"type":  "call_failed",
		"stage": v.Stage,
		"error": fmt.Sprintf("%v", v.Error),
	})

	d.emitMetric(ctx, v.ID, []*protos.Metric{
		{Name: "telephony.call_failed", Value: v.Stage, Description: fmt.Sprintf("Call failed at %s: %v", v.Stage, v.Error)},
	})

	d.removeObserver(ctx, v.ID)
}
