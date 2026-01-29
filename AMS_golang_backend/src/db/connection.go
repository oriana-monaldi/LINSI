package db

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	// Cargar .env solo si no estamos en Docker
	if _, err := os.Stat(".env"); err == nil {
		err := godotenv.Load()
		if err != nil {
			log.Println("Warning: Could not load .env file")
		}
	}

	time.Local = time.UTC

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN environment variable is not set")
	}

	var db *gorm.DB
	var err error

	for i := 0; i < 10; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("LINSITrack DB connected successfully!")
			return db, nil
		}

		log.Printf("Failed to connect to database (attempt %d/10): %v", i+1, err)
		time.Sleep(5 * time.Second)
	}

	return nil, err
}
