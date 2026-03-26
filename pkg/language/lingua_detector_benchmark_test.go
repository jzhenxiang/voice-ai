package language

import (
	"testing"

	lingua "github.com/pemistahl/lingua-go"
)

func BenchmarkDetect_LongEnglishText(b *testing.B) {
	parser := NewLinguaParser(Config{Languages: []lingua.Language{lingua.English, lingua.French, lingua.Spanish}})
	text := "This is a longer English paragraph intended to benchmark the language detector under realistic sentence input."
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = parser.Parse(text, nil)
	}
}

func BenchmarkDetect_ShortText(b *testing.B) {
	parser := NewLinguaParser(Config{Languages: []lingua.Language{lingua.English, lingua.French, lingua.Spanish}})
	text := "hello"
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = parser.Parse(text, nil)
	}
}

func BenchmarkDetect_LowAccuracyMode(b *testing.B) {
	parser := NewLinguaParser(Config{
		Languages:       []lingua.Language{lingua.English, lingua.French, lingua.Spanish},
		LowAccuracyMode: true,
	})
	text := "Bonjour, this mixed sentence is for benchmark checks only."
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = parser.Parse(text, nil)
	}
}
