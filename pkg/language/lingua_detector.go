package language

import (
	"strings"
	"sync"

	lingua "github.com/pemistahl/lingua-go"
	rapida_types "github.com/rapidaai/pkg/types"
)

type linguaParser struct {
	once     sync.Once
	cfg      Config
	detector lingua.LanguageDetector
}

// NewLinguaParser builds a lazily initialized language parser backed by lingua-go.
func NewLinguaParser(cfg Config) Parser {
	return &linguaParser{cfg: cfg}
}

func (d *linguaParser) Parse(text string, argument map[string]interface{}) rapida_types.Language {
	result := d.ParseDetailed(text, argument)
	return result.Language
}

func (d *linguaParser) ParseDetailed(text string, _ map[string]interface{}) IdentificationResult {
	cleaned := strings.TrimSpace(text)
	if cleaned == "" {
		return IdentificationResult{
			Language: rapida_types.GetLanguageByName("en"),
		}
	}
	d.once.Do(func() {
		builder := lingua.NewLanguageDetectorBuilder()
		var configured lingua.LanguageDetectorBuilder
		if len(d.cfg.Languages) > 0 {
			configured = builder.FromLanguages(d.cfg.Languages...)
		} else {
			configured = builder.FromAllLanguages()
		}
		if d.cfg.LowAccuracyMode {
			configured = configured.WithLowAccuracyMode()
		}
		d.detector = configured.Build()
	})
	language, reliable := d.detector.DetectLanguageOf(cleaned)
	iso1 := strings.ToLower(language.IsoCode639_1().String())
	result := IdentificationResult{
		Language: rapida_types.GetLanguageByName(iso1),
		Confidence: d.detector.ComputeLanguageConfidence(
			cleaned,
			language,
		),
		Reliable: reliable,
	}
	return result
}
