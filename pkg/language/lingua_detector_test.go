package language

import (
	"testing"

	lingua "github.com/pemistahl/lingua-go"
)

func TestParse_EmptyInputDefaultsToEnglish(t *testing.T) {
	parser := NewLinguaParser(Config{})
	res := parser.Parse("   ", nil)
	if res.ISO639_1 != "en" {
		t.Fatalf("expected en, got %q", res.ISO639_1)
	}
}

func TestParse_English(t *testing.T) {
	parser := NewLinguaParser(Config{Languages: []lingua.Language{lingua.English, lingua.French}})
	res := parser.Parse("Hello there, how are you doing today?", nil)
	if res.ISO639_1 != "en" {
		t.Fatalf("expected en, got %q", res.ISO639_1)
	}
	if res.ISO639_2 != "eng" {
		t.Fatalf("expected eng, got %q", res.ISO639_2)
	}
	detailed := parser.(DetailedParser).ParseDetailed("Hello there, how are you doing today?", nil)
	if !detailed.Reliable {
		t.Fatalf("expected reliable detection")
	}
}

func TestParse_French(t *testing.T) {
	parser := NewLinguaParser(Config{Languages: []lingua.Language{lingua.English, lingua.French}})
	res := parser.Parse("Bonjour tout le monde, comment allez-vous?", nil)
	if res.ISO639_1 != "fr" {
		t.Fatalf("expected fr, got %q", res.ISO639_1)
	}
	if res.ISO639_2 != "fra" {
		t.Fatalf("expected fra, got %q", res.ISO639_2)
	}
}

func TestParse_WithLowAccuracyMode(t *testing.T) {
	parser := NewLinguaParser(Config{
		Languages:       []lingua.Language{lingua.English, lingua.Spanish},
		LowAccuracyMode: true,
	})
	res := parser.Parse("Hola, esto es una prueba corta", nil)
	if res.ISO639_1 == "" || res.ISO639_2 == "" || res.Name == "" {
		t.Fatalf("expected non-empty detection result, got %+v", res)
	}
}
