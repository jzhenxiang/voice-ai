// Rapida – Open Source Voice AI Orchestration Platform
// Copyright (C) 2023-2025 Prashant Srivastav <prashant@rapida.ai>
// Licensed under a modified GPL-2.0. See the LICENSE file for details.
package internal_mistral_callers

import (
	"testing"

	"github.com/rapidaai/pkg/commons"
	"github.com/rapidaai/protos"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestLogger() commons.Logger {
	lgr, _ := commons.NewApplicationLogger()
	return lgr
}

func TestMessageBuilding_UserAndAssistant(t *testing.T) {
	msgs := []*protos.Message{
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "Hello"}}},
		{Role: "assistant", Message: &protos.Message_Assistant{Assistant: &protos.AssistantMessage{Contents: []string{"Hi there"}}}},
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "How are you?"}}},
	}

	// Replicate the message-building logic from GetChatCompletion
	result := buildMessages(msgs)
	require.Len(t, result, 3)
	assert.Equal(t, "user", result[0]["role"])
	assert.Equal(t, "Hello", result[0]["content"])
	assert.Equal(t, "assistant", result[1]["role"])
	assert.Equal(t, "Hi there", result[1]["content"])
	assert.Equal(t, "user", result[2]["role"])
	assert.Equal(t, "How are you?", result[2]["content"])
}

func TestMessageBuilding_AlternationEnforced(t *testing.T) {
	// Two consecutive user messages — the second should be skipped
	msgs := []*protos.Message{
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "First"}}},
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "Second"}}},
	}

	result := buildMessages(msgs)
	require.Len(t, result, 1)
	assert.Equal(t, "First", result[0]["content"])
}

func TestMessageBuilding_SystemTreatedAsUser(t *testing.T) {
	msgs := []*protos.Message{
		{Role: "system", Message: &protos.Message_System{System: &protos.SystemMessage{Content: "You are helpful"}}},
	}

	// System messages use the user content path in Mistral
	result := buildMessages(msgs)
	// System message has no User content, so it should produce nothing
	assert.Empty(t, result)
}

func TestMessageBuilding_Empty(t *testing.T) {
	result := buildMessages([]*protos.Message{})
	assert.Empty(t, result)
}

func TestStreamChatCompletion_Panics(t *testing.T) {
	caller := &largeLanguageCaller{
		Mistral: Mistral{logger: newTestLogger()},
	}
	assert.Panics(t, func() {
		_ = caller.StreamChatCompletion(nil, nil, nil, nil, nil, nil)
	}, "StreamChatCompletion should panic with unimplemented")
}

// buildMessages replicates the message-building logic from GetChatCompletion
// for unit testing without requiring API credentials.
func buildMessages(allMessages []*protos.Message) []map[string]string {
	msg := make([]map[string]string, 0)
	var lastRole string
	for _, cntn := range allMessages {
		currentRole := cntn.GetRole()
		if currentRole == "user" || currentRole == "system" {
			if lastRole == "user" {
				continue
			}
			if user := cntn.GetUser(); user != nil {
				msg = append(msg, map[string]string{
					"role":    "user",
					"content": user.GetContent(),
				})
				lastRole = "user"
			}
		}
		if currentRole == "assistant" {
			if lastRole == "assistant" {
				continue
			}
			if assistant := cntn.GetAssistant(); assistant != nil && len(assistant.GetContents()) > 0 {
				msg = append(msg, map[string]string{
					"role":    "assistant",
					"content": assistant.GetContents()[0],
				})
				lastRole = "assistant"
			}
		}
	}
	return msg
}
