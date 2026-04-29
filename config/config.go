package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the voice-ai service.
type Config struct {
	// Server settings
	ServerHost string
	ServerPort int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration

	// AI provider settings
	OpenAIAPIKey   string
	OpenAIModel    string
	MaxTokens      int

	// Audio processing settings
	SampleRate     int
	Channels       int
	BitDepth       int
	MaxAudioSizeMB int

	// Logging
	LogLevel string
	LogJSON  bool
}

// Load reads configuration from environment variables and returns a Config.
// Required environment variables will cause an error if missing.
func Load() (*Config, error) {
	cfg := &Config{
		// Defaults
		ServerHost:     getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort:     getEnvInt("SERVER_PORT", 8080),
		ReadTimeout:    getEnvDuration("READ_TIMEOUT", 30*time.Second),
		WriteTimeout:   getEnvDuration("WRITE_TIMEOUT", 30*time.Second),
		OpenAIModel:    getEnv("OPENAI_MODEL", "gpt-4o-realtime-preview"),
		MaxTokens:      getEnvInt("MAX_TOKENS", 4096),
		SampleRate:     getEnvInt("AUDIO_SAMPLE_RATE", 16000),
		Channels:       getEnvInt("AUDIO_CHANNELS", 1),
		BitDepth:       getEnvInt("AUDIO_BIT_DEPTH", 16),
		// Bumped from 25 to 50 — the 25 MB default was too restrictive for longer recordings
		MaxAudioSizeMB: getEnvInt("MAX_AUDIO_SIZE_MB", 50),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		LogJSON:        getEnvBool("LOG_JSON", false),
	}

	// Required fields
	cfg.OpenAIAPIKey = os.Getenv("OPENAI_API_KEY")
	if cfg.OpenAIAPIKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY environment variable is required")
	}

	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return cfg, nil
}

// validate checks that configuration values are within acceptable ranges.
func (c *Config) validate() error {
	if c.ServerPort < 1 || c.ServerPort > 65535 {
		return fmt.Errorf("SERVER_PORT must be between 1 and 65535, got %d", c.ServerPort)
	}
	if c.MaxTokens < 1 {
		return fmt.Errorf("MAX_TOKENS must be positive, got %d", c.MaxTokens)
	}
	if c.MaxAudioSizeMB < 1 {
		return fmt.Errorf("MAX_AUDIO_SIZE_MB must be positive, got %d", c.MaxAudioSizeMB)
	}
	return nil
}

// Addr returns the full server address string.
func (c *Config) Addr() string {
	return fmt.Sprintf("%s:%d", c.ServerHost, c.ServerPort)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}
