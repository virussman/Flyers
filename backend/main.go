package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"

	"flyers-backend/config"
	"flyers-backend/routes"
)

// loadEnv reads a .env file and sets environment variables
func loadEnv(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return // .env is optional
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		val := strings.TrimSpace(parts[1])
		if os.Getenv(key) == "" {
			os.Setenv(key, val)
		}
	}
}

// corsMiddleware handles CORS for production with strict origin validation
func corsMiddleware(next http.Handler) http.Handler {
	// Define allowed origins - UPDATE THESE FOR YOUR DOMAINS
	allowedOrigins := map[string]bool{
		"https://flyers.com":      true,
		"https://www.flyers.com":  true,
		"https://app.flyers.com":  true,
		"http://localhost:5173":   true, // Vite dev server
		"http://localhost:5174":   true, // Vite dev server alternative
		"http://localhost:3000":   true, // Alternative dev port
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Handle same-origin requests (no Origin header)
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Check if origin is allowed
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		} else {
			// Reject unauthorized origins
			w.WriteHeader(http.StatusForbidden)
			return
		}
	})
}

func main() {
	// Load .env file first (optional)
	loadEnv(".env")

	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	// DOUBLE-CHECK database
	var currentDB string
	db.QueryRow("SELECT current_database()").Scan(&currentDB)
	log.Printf("MAIN: Using database: %s", currentDB)

	// Cloudinary check - after DB, before routes
	if os.Getenv("CLOUDINARY_CLOUD_NAME") != "" {
		log.Println("Cloudinary configured:", os.Getenv("CLOUDINARY_CLOUD_NAME"))
	} else {
		log.Println("Warning: Cloudinary not configured - photo uploads will fail")
	}

	router := routes.RegisterRoutes(db)

	// Wrap router with CORS middleware
	handlerWithCORS := corsMiddleware(router)

	log.Println("Server running on http://localhost:3001")
	log.Fatal(http.ListenAndServe(":3001", handlerWithCORS))
}