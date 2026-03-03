package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func ConnectDB() (*sql.DB, error) {
	// Connection parameters
	const (
		host     = "localhost"
		port     = 5432
		user     = "apple"
		password = ""
		dbname   = "flyers_db"
	)

	// Use explicit URL format to force correct database
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=disable",
		user, password, host, port, dbname)

	log.Printf("DEBUG: Connection string: %s", connStr)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	// Verify correct database
	var currentDB string
	if err := db.QueryRow("SELECT current_database()").Scan(&currentDB); err != nil {
		return nil, err
	}
	log.Printf("DEBUG: Actually connected to: %s", currentDB)

	if currentDB != dbname {
		log.Fatalf("❌ WRONG DATABASE! Expected %s, got %s", dbname, currentDB)
	}

	log.Println("✅ Connected to PostgreSQL")
	return db, nil
}
