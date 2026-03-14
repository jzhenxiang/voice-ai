//go:build integration

// Copyright (c) 2023-2025 RapidaAI
// Author: Prashant Srivastav <prashant@rapida.ai>
//
// Licensed under GPL-2.0 with Rapida Additional Terms.
// See LICENSE.md or contact sales@rapida.ai for commercial usage.

package internal_voyageai_callers

import (
	"context"
	"testing"
	"time"

	testutil "github.com/rapidaai/api/integration-api/internal/caller/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const providerName = "voyageai"

// TestIntegration_Embedding verifies embedding generation: a single document
// should produce a non-empty vector with TIME_TAKEN metric.
func TestIntegration_Embedding(t *testing.T) {
	cfg := testutil.LoadConfig(t)
	pcfg := cfg.EmbeddingProvider(t, providerName)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cred := testutil.BuildCredential(pcfg.Credential)
	caller := NewEmbeddingCaller(testutil.NewTestLogger(), cred)
	opts := testutil.BuildEmbeddingOptions(pcfg)

	embeddings, metrics, err := caller.GetEmbedding(ctx, testutil.EmbeddingContent(), opts)
	require.NoError(t, err, "GetEmbedding should succeed")
	require.NotEmpty(t, embeddings, "should return at least one embedding")
	for i, emb := range embeddings {
		assert.NotEmpty(t, emb.GetEmbedding(), "embedding[%d] vector should not be empty", i)
	}
	testutil.AssertHasMetric(t, metrics, "TIME_TAKEN")
	t.Logf("provider=%s embeddings=%d dimensions=%d", providerName, len(embeddings), len(embeddings[0].GetEmbedding()))
}

// TestIntegration_Reranking verifies document reranking: given a query and
// candidate documents, the top result should have a positive relevance score.
func TestIntegration_Reranking(t *testing.T) {
	cfg := testutil.LoadConfig(t)
	pcfg := cfg.RerankingProvider(t, providerName)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cred := testutil.BuildCredential(pcfg.Credential)
	caller := NewRerankingCaller(testutil.NewTestLogger(), cred)
	opts := testutil.BuildRerankerOptions(pcfg)

	results, metrics, err := caller.GetReranking(ctx, testutil.RerankingQuery(), testutil.RerankingContent(), opts)
	require.NoError(t, err, "GetReranking should succeed")
	require.NotEmpty(t, results, "should return reranked results")
	assert.Greater(t, results[0].GetRelevanceScore(), float64(0), "top result should have positive relevance score")
	testutil.AssertHasMetric(t, metrics, "TIME_TAKEN")
	t.Logf("provider=%s results=%d top_score=%.4f", providerName, len(results), results[0].GetRelevanceScore())
}

// TestIntegration_VerifyCredential verifies that valid credentials pass
// the provider's credential verification endpoint without error.
func TestIntegration_VerifyCredential(t *testing.T) {
	cfg := testutil.LoadConfig(t)
	pcfg := cfg.VerifyProvider(t, providerName)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cred := testutil.BuildCredential(pcfg.Credential)
	verifier := NewVerifyCredentialCaller(testutil.NewTestLogger(), cred)
	_, err := verifier.CredentialVerifier(ctx, testutil.BuildVerifyOptions(pcfg))
	require.NoError(t, err, "CredentialVerifier should succeed with valid credentials")
	t.Logf("provider=%s credential_verification=ok", providerName)
}
