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

func loadEnv(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return
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

func corsMiddleware(next http.Handler) http.Handler {
	allowedOrigins := map[string]bool{
		"https://ankitacharya11.com.np":     true,
		"https://www.ankitacharya11.com.np": true,
		"http://localhost:5173":             true,
		"http://localhost:5174":             true,
		"http://localhost:3000":             true,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}
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
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
}

func main() {
	loadEnv(".env")

	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer db.Close()

	var currentDB string
	db.QueryRow("SELECT current_database()").Scan(&currentDB)
	log.Printf("MAIN: Using database: %s", currentDB)

	if os.Getenv("CLOUDINARY_CLOUD_NAME") != "" {
		log.Println("Cloudinary configured:", os.Getenv("CLOUDINARY_CLOUD_NAME"))
	} else {
		log.Println("Warning: Cloudinary not configured")
	}

	router := routes.RegisterRoutes(db)
	handlerWithCORS := corsMiddleware(router)

	log.Println("Server running on http://localhost:3001")
	log.Fatal(http.ListenAndServe(":3001", handlerWithCORS))
}
