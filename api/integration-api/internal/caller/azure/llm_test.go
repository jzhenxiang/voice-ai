// Rapida – Open Source Voice AI Orchestration Platform
// Copyright (C) 2023-2025 Prashant Srivastav <prashant@rapida.ai>
// Licensed under a modified GPL-2.0. See the LICENSE file for details.
package internal_azure_callers

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

func newTestCaller() *largeLanguageCaller {
	return &largeLanguageCaller{
		AzureAi: AzureAi{logger: newTestLogger()},
	}
}

func TestBuildHistory_UserMessage(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role:    "user",
			Message: &protos.Message_User{User: &protos.UserMessage{Content: "Hello"}},
		},
	}

	history := caller.buildHistory(msgs)
	require.Len(t, history, 1)
	assert.NotNil(t, history[0].OfUser)
}

func TestBuildHistory_SystemMessage(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role:    "system",
			Message: &protos.Message_System{System: &protos.SystemMessage{Content: "You are helpful"}},
		},
	}

	history := caller.buildHistory(msgs)
	require.Len(t, history, 1)
	assert.NotNil(t, history[0].OfSystem)
}

func TestBuildHistory_AssistantWithContent(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role: "assistant",
			Message: &protos.Message_Assistant{
				Assistant: &protos.AssistantMessage{
					Contents: []string{"Hello!", "More"},
				},
			},
		},
	}

	history := caller.buildHistory(msgs)
	require.Len(t, history, 1)
	assert.NotNil(t, history[0].OfAssistant)
}

func TestBuildHistory_AssistantWithToolCall(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role: "assistant",
			Message: &protos.Message_Assistant{
				Assistant: &protos.AssistantMessage{
					ToolCalls: []*protos.ToolCall{
						{
							Id:   "call_1",
							Type: "function",
							Function: &protos.FunctionCall{
								Name:      "get_weather",
								Arguments: `{"city":"NYC"}`,
							},
						},
					},
				},
			},
		},
	}

	history := caller.buildHistory(msgs)
	require.Len(t, history, 1)
	assert.NotNil(t, history[0].OfAssistant)
	require.Len(t, history[0].OfAssistant.ToolCalls, 1)
	assert.Equal(t, "call_1", history[0].OfAssistant.ToolCalls[0].ID)
	assert.Equal(t, "get_weather", history[0].OfAssistant.ToolCalls[0].Function.Name)
}

func TestBuildHistory_ToolMessage(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role: "tool",
			Message: &protos.Message_Tool{
				Tool: &protos.ToolMessage{
					Tools: []*protos.ToolMessage_Tool{
						{Id: "call_1", Name: "get_weather", Content: `{"temp":72}`},
					},
				},
			},
		},
	}

	history := caller.buildHistory(msgs)
	require.Len(t, history, 1)
	assert.NotNil(t, history[0].OfTool)
}

func TestBuildHistory_MixedMessages(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{Role: "system", Message: &protos.Message_System{System: &protos.SystemMessage{Content: "Be brief"}}},
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "Hi"}}},
		{Role: "assistant", Message: &protos.Message_Assistant{Assistant: &protos.AssistantMessage{Contents: []string{"Hello"}}}},
		{Role: "user", Message: &protos.Message_User{User: &protos.UserMessage{Content: "Bye"}}},
	}

	history := caller.buildHistory(msgs)
	assert.Len(t, history, 4)
	assert.NotNil(t, history[0].OfSystem)
	assert.NotNil(t, history[1].OfUser)
	assert.NotNil(t, history[2].OfAssistant)
	assert.NotNil(t, history[3].OfUser)
}

func TestBuildHistory_EmptyMessages(t *testing.T) {
	caller := newTestCaller()
	history := caller.buildHistory([]*protos.Message{})
	assert.Empty(t, history)
}

func TestBuildHistory_MultipleToolResults(t *testing.T) {
	caller := newTestCaller()
	msgs := []*protos.Message{
		{
			Role: "tool",
			Message: &protos.Message_Tool{
				Tool: &protos.ToolMessage{
					Tools: []*protos.ToolMessage_Tool{
						{Id: "call_1", Name: "fn1", Content: `{"a":1}`},
						{Id: "call_2", Name: "fn2", Content: `{"b":2}`},
					},
				},
			},
		},
	}

	history := caller.buildHistory(msgs)
	// Each tool result becomes a separate message
	assert.Len(t, history, 2)
}
