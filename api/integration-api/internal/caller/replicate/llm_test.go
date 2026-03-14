// Rapida – Open Source Voice AI Orchestration Platform
// Copyright (C) 2023-2025 Prashant Srivastav <prashant@rapida.ai>
// Licensed under a modified GPL-2.0. See the LICENSE file for details.
package internal_replicate_callers

import (
	"testing"

	"github.com/rapidaai/pkg/commons"
	"github.com/stretchr/testify/assert"
)

func newTestLogger() commons.Logger {
	lgr, _ := commons.NewApplicationLogger()
	return lgr
}

func TestStreamChatCompletion_Panics(t *testing.T) {
	caller := &largeLanguageCaller{
		Replicate: Replicate{logger: newTestLogger()},
	}
	assert.Panics(t, func() {
		_ = caller.StreamChatCompletion(nil, nil, nil, nil, nil, nil)
	}, "StreamChatCompletion should panic with unimplemented")
}

func TestNewLargeLanguageCaller(t *testing.T) {
	// Nil credential is lazily resolved, so constructor should not panic.
	caller := NewLargeLanguageCaller(newTestLogger(), nil)
	assert.NotNil(t, caller)
}
