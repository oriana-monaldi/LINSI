package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func ProfesorSeed(db *gorm.DB) {
	profesores := []struct {
		Nombre   string
		Apellido string
		Email    string
		Password string
		Legajo   string
	}{
		{
			Nombre:   "Profesor",
			Apellido: "Profesor",
			Email:    "profesor@linsi.com",
			Password: "profesor",
			Legajo:   "12345",
		},
		{
			Nombre:   "Martin",
			Apellido: "Jorge",
			Email:    "martin@linsi.com",
			Password: "martin",
			Legajo:   "12121",
		},
		{
			Nombre:   "Laura",
			Apellido: "Dominguez",
			Email:    "laura@linsi.com",
			Password: "laura123",
			Legajo:   "33445",
		},
		{
			Nombre:   "Santiago",
			Apellido: "Rossi",
			Email:    "santiago@linsi.com",
			Password: "santiago",
			Legajo:   "55667",
		},
		{
			Nombre:   "Patricia",
			Apellido: "Acosta",
			Email:    "patricia@linsi.com",
			Password: "patricia",
			Legajo:   "66778",
		},
		{
			Nombre:   "Diego",
			Apellido: "Marquez",
			Email:    "diego@linsi.com",
			Password: "diego",
			Legajo:   "77890",
		},
	}

	for _, profesorData := range profesores {
		var existingProfesor models.Profesor
		result := db.Where("email = ?", profesorData.Email).First(&existingProfesor)

		if result.Error == nil {
			log.Printf("Profesor '%s' already exists", profesorData.Email)
		} else {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(profesorData.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Failed to hash password for profesor '%s': %v", profesorData.Email, err)
				continue
			}

			newProfesor := models.Profesor{
				BaseUser: models.BaseUser{
					Nombre:   profesorData.Nombre,
					Apellido: profesorData.Apellido,
					Email:    profesorData.Email,
					Password: string(hashedPassword),
				},
				Legajo: profesorData.Legajo,
			}

			if err := db.Create(&newProfesor).Error; err != nil {
				log.Printf("Failed to create profesor '%s': %v", profesorData.Email, err)
			} else {
				log.Printf("Profesor '%s' created successfully", profesorData.Email)
			}
		}
	}

	// Log
	log.Println("Profesor seed completed successfully")
}
