package main

import (
	"log"
	"net/http"

	"flyers-backend/config"
	"flyers-backend/routes"
)

// corsMiddleware adds CORS headers so the frontend (localhost:5173) can talk to the backend
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")  // Added PATCH
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

		// Handle preflight requests — browser sends OPTIONS before the real request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	db, err := config.ConnectDB()
	if err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer db.Close()

	// DOUBLE-CHECK
	var currentDB string
	db.QueryRow("SELECT current_database()").Scan(&currentDB)
	log.Printf("MAIN: Using database: %s", currentDB)

	router := routes.RegisterRoutes(db)

	// Wrap router with CORS middleware
	handlerWithCORS := corsMiddleware(router)

	log.Println("🚀 Server running on http://localhost:3001")
	log.Fatal(http.ListenAndServe(":3001", handlerWithCORS))
}