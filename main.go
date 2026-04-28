package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/voice-ai/internal/config"
	"github.com/voice-ai/internal/server"
)

func main() {
	// Load configuration from environment / config file
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	// Set up a root context that is cancelled on OS interrupt signals
	// Also handles SIGINT (Ctrl+C) for easier local development
	ctx, cancel := signal.NotifyContext(context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
		syscall.SIGINT,
	)
	defer cancel()

	// Build and start the HTTP/WebSocket server
	srv, err := server.New(cfg)
	if err != nil {
		log.Fatalf("failed to initialise server: %v", err)
	}

	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	log.Printf("voice-ai server listening on %s", addr)

	if err := srv.Run(ctx, addr); err != nil {
		log.Fatalf("server exited with error: %v", err)
	}

	log.Println("shutdown complete")
}
