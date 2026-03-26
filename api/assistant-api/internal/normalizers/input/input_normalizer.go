// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package internal_input_normalizers

import (
	"context"
	"fmt"
	"strings"

	internal_type "github.com/rapidaai/api/assistant-api/internal/type"
	"github.com/rapidaai/pkg/commons"
	rapida_language "github.com/rapidaai/pkg/language"
	rapida_types "github.com/rapidaai/pkg/types"
)

var errInputNormalizerNotInitialized = fmt.Errorf("input normalizer not initialized")

type inputNormalizer struct {
	logger commons.Logger

	onPacket func(...internal_type.Packet) error
	parser   rapida_language.Parser
}

// NewInputNormalizer builds an input normalizer with internal pipeline routing.
func NewInputNormalizer(logger commons.Logger) InputNormalizer {
	return &inputNormalizer{
		logger: logger,
		parser: rapida_language.NewLinguaParser(rapida_language.Config{}),
	}
}

func (n *inputNormalizer) Initialize(_ context.Context, onPacket func(...internal_type.Packet) error) error {
	n.onPacket = onPacket
	return nil
}

func (n *inputNormalizer) Close(_ context.Context) error {
	n.onPacket = nil
	return nil
}

// Normalize routes packet groups through InputPipeline -> DetectLanguageProcessPipeline -> OutputPipeline.
func (n *inputNormalizer) Normalize(ctx context.Context, packets ...internal_type.Packet) error {
	if n.onPacket == nil {
		return errInputNormalizerNotInitialized
	}

	for _, pkt := range packets {
		switch p := pkt.(type) {
		case internal_type.EndOfSpeechPacket:
			pipelinePacket := PipelinePacket{
				ContextID: p.ContextID,
				Speech:    p.Speech,
				Speechs:   p.Speechs,
			}
			if err := n.Pipeline(ctx, InputPipeline{PipelinePacket: pipelinePacket}); err != nil {
				return err
			}
		case internal_type.UserTextPacket:
			pipelinePacket := PipelinePacket{
				ContextID: p.ContextID,
				Speech:    p.Text,
			}
			if p.Language != "" {
				pipelinePacket.Speechs = []internal_type.SpeechToTextPacket{{
					ContextID: p.ContextID,
					Script:    p.Text,
					Language:  p.Language,
				}}
			}
			if err := n.Pipeline(ctx, InputPipeline{PipelinePacket: pipelinePacket}); err != nil {
				return err
			}
		}
	}
	return nil
}

// Pipeline rotates typed pipeline packets until OutputPipeline or stop.
func (n *inputNormalizer) Pipeline(ctx context.Context, v PipelineType) error {
	switch p := v.(type) {
	case InputPipeline:
		if p.IsStop() {
			return nil
		}
		return n.Pipeline(ctx, DetectLanguageProcessPipeline{ProcessPipeline: ProcessPipeline{PipelinePacket: p.PipelinePacket}})

	case DetectLanguageProcessPipeline:
		if p.IsStop() {
			return nil
		}
		language := n.detectLanguage(p.PipelinePacket)
		return n.Pipeline(ctx, OutputPipeline{
			PipelinePacket: p.PipelinePacket,
			Language:       language,
		})

	case OutputPipeline:
		if p.IsStop() {
			return nil
		}
		if n.onPacket == nil {
			return nil
		}
		return n.onPacket(internal_type.NormalizedTextPacket{
			ContextID: p.ContextID,
			Text:      p.Speech,
			Language:  p.Language,
		})

	default:
		return fmt.Errorf("unsupported input-normalizer pipeline type: %T", v)
	}
}

func (n *inputNormalizer) detectLanguage(p PipelinePacket) rapida_types.Language {
	if code := consensusLanguageCode(p.Speechs); code != "" {
		return rapida_types.GetLanguageByName(code)
	}

	if strings.TrimSpace(p.Speech) == "" {
		return rapida_types.GetLanguageByName("en")
	}

	return n.parser.Parse(p.Speech, nil)
}

func consensusLanguageCode(speeches []internal_type.SpeechToTextPacket) string {
	if len(speeches) == 0 {
		return ""
	}
	counts := make(map[string]int)
	bestCode := ""
	bestCount := 0
	for _, s := range speeches {
		code := normalizeLanguageCode(s.Language)
		if code == "" {
			continue
		}
		counts[code]++
		if counts[code] > bestCount {
			bestCount = counts[code]
			bestCode = code
		}
	}
	return bestCode
}

func normalizeLanguageCode(v string) string {
	clean := strings.TrimSpace(strings.ToLower(v))
	if clean == "" {
		return ""
	}
	if idx := strings.Index(clean, "-"); idx > 0 {
		clean = clean[:idx]
	}
	if len(clean) < 2 {
		return ""
	}
	if len(clean) > 3 {
		clean = clean[:3]
	}
	canonical := rapida_types.GetLanguageByName(clean)
	return canonical.ISO639_1
}
