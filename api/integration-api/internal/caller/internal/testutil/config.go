// Rapida – Open Source Voice AI Orchestration Platform
// Copyright (C) 2023-2025 Prashant Srivastav <prashant@rapida.ai>
// Licensed under a modified GPL-2.0. See the LICENSE file for details.
package caller_testutil

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"gopkg.in/yaml.v3"
)

// CallerTestConfig is the top-level configuration for LLM caller integration tests.
type CallerTestConfig struct {
	Chat      map[string]ProviderConfig `yaml:"chat"`
	Embedding map[string]ProviderConfig `yaml:"embedding"`
	Reranking map[string]ProviderConfig `yaml:"reranking"`
	Verify    map[string]ProviderConfig `yaml:"verify"`
}

// ProviderConfig holds credentials and options for a single provider.
type ProviderConfig struct {
	Enabled    bool                   `yaml:"enabled"`
	Credential map[string]string      `yaml:"credential"`
	Options    map[string]interface{} `yaml:"options"`
}

// testdataDir returns the absolute path to the testdata directory relative to this file.
func testdataDir() string {
	_, filename, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(filename), "..", "..", "testdata")
}

// LoadConfig reads integration_config.yaml from testdata/ and parses it.
// The config file path can be overridden via INTEGRATION_TEST_CONFIG env var.
func LoadConfig(t *testing.T) *CallerTestConfig {
	t.Helper()
	configPath := os.Getenv("INTEGRATION_TEST_CONFIG")
	if configPath == "" {
		configPath = filepath.Join(testdataDir(), "integration_config.yaml")
	}
	data, err := os.ReadFile(configPath)
	if err != nil {
		t.Skipf("integration config not found at %s: %v (create from integration_config.yaml.example)", configPath, err)
	}
	var cfg CallerTestConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		t.Fatalf("failed to parse integration config: %v", err)
	}
	return &cfg
}

// ChatProvider returns the ProviderConfig for the given chat provider name.
// It skips the test if the provider is not configured or not enabled.
func (c *CallerTestConfig) ChatProvider(t *testing.T, name string) ProviderConfig {
	t.Helper()
	p, ok := c.Chat[name]
	if !ok || !p.Enabled {
		t.Skipf("chat provider %q not configured or disabled", name)
	}
	return p
}

// EmbeddingProvider returns the ProviderConfig for the given embedding provider name.
// It skips the test if the provider is not configured or not enabled.
func (c *CallerTestConfig) EmbeddingProvider(t *testing.T, name string) ProviderConfig {
	t.Helper()
	p, ok := c.Embedding[name]
	if !ok || !p.Enabled {
		t.Skipf("embedding provider %q not configured or disabled", name)
	}
	return p
}

// RerankingProvider returns the ProviderConfig for the given reranking provider name.
// It skips the test if the provider is not configured or not enabled.
func (c *CallerTestConfig) RerankingProvider(t *testing.T, name string) ProviderConfig {
	t.Helper()
	p, ok := c.Reranking[name]
	if !ok || !p.Enabled {
		t.Skipf("reranking provider %q not configured or disabled", name)
	}
	return p
}

// VerifyProvider returns the ProviderConfig for the given verify provider name.
// It skips the test if the provider is not configured or not enabled.
func (c *CallerTestConfig) VerifyProvider(t *testing.T, name string) ProviderConfig {
	t.Helper()
	p, ok := c.Verify[name]
	if !ok || !p.Enabled {
		t.Skipf("verify provider %q not configured or disabled", name)
	}
	return p
}
