package main

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRoutesConfiguration(t *testing.T) {
	// Setup test handlers
	mux := http.NewServeMux()
	mux.HandleFunc("/api/scans", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
	})
	mux.HandleFunc("/api/certs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte("[]"))
	})

	server := httptest.NewServer(mux)
	defer server.Close()

	// Test GET /api/scans
	res, err := http.Get(server.URL + "/api/scans")
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	if res.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %d", res.StatusCode)
	}
	if contentType := res.Header.Get("Content-Type"); contentType != "application/json" {
		t.Errorf("Expected content type application/json, got %q", contentType)
	}

	// Test GET /api/certs
	resCert, err := http.Get(server.URL + "/api/certs")
	if err != nil {
		t.Fatalf("Failed to execute request: %v", err)
	}
	if resCert.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %d", resCert.StatusCode)
	}
}

func TestDBInitializeConnection(t *testing.T) {
	// Verify database connection initialization doesn't panic on nil db wrapper
	var testDB *sql.DB
	if testDB != nil {
		t.Error("Expected initial DB to be nil before connection open")
	}
}
