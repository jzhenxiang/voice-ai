// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package channel_pipeline

import (
	"context"

	obs "github.com/rapidaai/api/assistant-api/internal/observe"
)

func (d *Dispatcher) handleEventEmitted(ctx context.Context, v EventEmittedPipeline) {
	d.logger.Debugw("Pipeline: Event", "call_id", v.ID, "event", v.Event)
	d.emitEvent(ctx, v.ID, obs.ComponentTelephony, v.Data)
}

func (d *Dispatcher) handleMetricEmitted(ctx context.Context, v MetricEmittedPipeline) {
	if len(v.Metrics) == 0 {
		return
	}
	d.logger.Debugw("Pipeline: Metric", "call_id", v.ID, "count", len(v.Metrics))
	d.emitMetric(ctx, v.ID, v.Metrics)
}
