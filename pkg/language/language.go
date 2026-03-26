package language

import (
	lingua "github.com/pemistahl/lingua-go"
	rapida_types "github.com/rapidaai/pkg/types"
)

// IdentificationResult contains canonical language information resolved by identifier.
type IdentificationResult struct {
	Language   rapida_types.Language
	Confidence float64
	Reliable   bool
}

// Parser follows the same Parse-style contract used across pkg/parsers.
// Parse returns canonical rapida language metadata for the given input text.
type Parser interface {
	Parse(text string, argument map[string]interface{}) rapida_types.Language
}

// DetailedParser exposes parse output with confidence metadata.
type DetailedParser interface {
	ParseDetailed(text string, argument map[string]interface{}) IdentificationResult
}

// Config controls detector model scope and runtime behavior.
type Config struct {
	// Languages restricts detection to specific Lingua languages. Empty means all languages.
	Languages []lingua.Language
	// LowAccuracyMode trades short-text accuracy for lower memory and faster inference.
	LowAccuracyMode bool
}
