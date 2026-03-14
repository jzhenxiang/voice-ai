// Rapida – Open Source Voice AI Orchestration Platform
// Copyright (C) 2023-2025 Prashant Srivastav <prashant@rapida.ai>
// Licensed under a modified GPL-2.0. See the LICENSE file for details.
package caller_testutil

import (
	"github.com/rapidaai/pkg/commons"
	"github.com/rapidaai/protos"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/structpb"
)

// BuildCredential converts a flat string map (from YAML config) into a Credential proto.
func BuildCredential(creds map[string]string) *protos.Credential {
	fields := make(map[string]interface{}, len(creds))
	for k, v := range creds {
		fields[k] = v
	}
	s, err := structpb.NewStruct(fields)
	if err != nil {
		panic("failed to build structpb.Struct from credentials: " + err.Error())
	}
	return &protos.Credential{Value: s}
}

// BuildModelParameters converts a YAML options map into the map[string]*anypb.Any
// format expected by AIOptions.ModelParameter.
func BuildModelParameters(opts map[string]interface{}) map[string]*anypb.Any {
	if opts == nil {
		return nil
	}
	params := make(map[string]*anypb.Any, len(opts))
	for key, value := range opts {
		structValue, err := structpb.NewValue(value)
		if err != nil {
			continue
		}
		anyValue, err := anypb.New(structValue)
		if err != nil {
			continue
		}
		params[key] = anyValue
	}
	return params
}

// NewTestLogger creates a lightweight logger suitable for integration tests.
func NewTestLogger() commons.Logger {
	logger, _ := commons.NewApplicationLogger()
	return logger
}
