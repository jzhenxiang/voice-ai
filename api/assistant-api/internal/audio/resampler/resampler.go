// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.
package internal_audio_resampler

import (
	internal_resampler_default "github.com/rapidaai/api/assistant-api/internal/audio/resampler/internal/default"
	internal_resampler_soxr "github.com/rapidaai/api/assistant-api/internal/audio/resampler/internal/soxr"
	internal_type "github.com/rapidaai/api/assistant-api/internal/type"
	"github.com/rapidaai/pkg/commons"
)

// GetResampler returns the high-quality soxr resampler for all audio rate conversion.
func GetResampler(logger commons.Logger) (internal_type.AudioResampler, error) {
	return internal_resampler_soxr.NewLibsoxrAudioResampler(logger), nil
}

func GetConverter(logger commons.Logger) (internal_type.AudioConverter, error) {
	return internal_resampler_default.NewDefaultAudioConverter(logger), nil
}
