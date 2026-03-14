package internal_transformer_rime

import (
	"testing"

	"github.com/rapidaai/pkg/commons"
	"github.com/rapidaai/pkg/utils"
	"github.com/rapidaai/protos"
	"github.com/stretchr/testify/assert"
	"google.golang.org/protobuf/types/known/structpb"
)

func newTestLogger() commons.Logger {
	l, _ := commons.NewApplicationLogger()
	return l
}

func newVaultCredential(m map[string]interface{}) *protos.VaultCredential {
	val, _ := structpb.NewStruct(m)
	return &protos.VaultCredential{Value: val}
}

// --- Constructor Tests ---

func TestNewRimeOption_ValidCredentials(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{"key": "test-api-key"})
	opt, err := NewRimeOption(newTestLogger(), cred, utils.Option{})
	assert.NoError(t, err)
	assert.NotNil(t, opt)
	assert.Equal(t, "test-api-key", opt.GetKey())
}

func TestNewRimeOption_MissingKey(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{"other": "value"})
	opt, err := NewRimeOption(newTestLogger(), cred, utils.Option{})
	assert.Error(t, err)
	assert.Nil(t, opt)
	assert.Contains(t, err.Error(), "missing 'key'")
}

func TestNewRimeOption_EmptyVault(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{})
	opt, err := NewRimeOption(newTestLogger(), cred, utils.Option{})
	assert.Error(t, err)
	assert.Nil(t, opt)
}

// --- Connection String Tests ---

func TestGetTextToSpeechConnectionString_Default(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{"key": "k"})
	opt, _ := NewRimeOption(newTestLogger(), cred, utils.Option{})
	connStr := opt.GetTextToSpeechConnectionString()

	assert.Contains(t, connStr, "wss://users-ws.rime.ai/ws3?")
	assert.Contains(t, connStr, "audioFormat=pcm")
	assert.Contains(t, connStr, "samplingRate=16000")
	assert.Contains(t, connStr, "segment=never")
	assert.Contains(t, connStr, "speaker="+RIME_DEFAULT_VOICE)
	assert.Contains(t, connStr, "modelId="+RIME_DEFAULT_MODEL)
	assert.Contains(t, connStr, "lang="+RIME_DEFAULT_LANG)
	assert.NotContains(t, connStr, "speedAlpha=")
}

func TestGetTextToSpeechConnectionString_WithOverrides(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{"key": "k"})
	opts := utils.Option{
		"speak.voice.id":   "aria",
		"speak.model":      "mist",
		"speak.language":   "fra",
		"speak.speed_alpha": "1.2",
	}
	opt, _ := NewRimeOption(newTestLogger(), cred, opts)
	connStr := opt.GetTextToSpeechConnectionString()

	assert.Contains(t, connStr, "speaker=aria")
	assert.Contains(t, connStr, "modelId=mist")
	assert.Contains(t, connStr, "lang=fra")
	assert.Contains(t, connStr, "speedAlpha=1.2")
	assert.Contains(t, connStr, "audioFormat=pcm")
	assert.Contains(t, connStr, "samplingRate=16000")
}

func TestGetTextToSpeechConnectionString_PartialOverrides(t *testing.T) {
	cred := newVaultCredential(map[string]interface{}{"key": "k"})
	opts := utils.Option{
		"speak.voice.id": "custom-voice",
	}
	opt, _ := NewRimeOption(newTestLogger(), cred, opts)
	connStr := opt.GetTextToSpeechConnectionString()

	assert.Contains(t, connStr, "speaker=custom-voice")
	assert.Contains(t, connStr, "modelId="+RIME_DEFAULT_MODEL)
	assert.Contains(t, connStr, "lang="+RIME_DEFAULT_LANG)
}
