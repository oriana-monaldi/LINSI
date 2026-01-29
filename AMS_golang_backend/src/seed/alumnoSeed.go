package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func AlumnoSeed(db *gorm.DB) {

	alumnos := []struct {
		Nombre   string
		Apellido string
		Email    string
		Password string
		Legajo   string
	}{
		{
			Nombre:   "Alumno",
			Apellido: "Alumno",
			Email:    "alumno@linsi.com",
			Password: "alumno",
			Legajo:   "54321",
		},
		{
			Nombre:   "Joaquin",
			Apellido: "Botteri",
			Email:    "joaquin@linsi.com",
			Password: "joaquin",
			Legajo:   "21212",
		},
		{
			Nombre:   "Lucia",
			Apellido: "Fernandez",
			Email:    "lucia@linsi.com",
			Password: "lucia123",
			Legajo:   "65432",
		},
		{
			Nombre:   "Mateo",
			Apellido: "Gimenez",
			Email:    "mateo@linsi.com",
			Password: "mateo321",
			Legajo:   "77889",
		},
		{
			Nombre:   "Camila",
			Apellido: "Torres",
			Email:    "camila@linsi.com",
			Password: "camila",
			Legajo:   "99887",
		},
		{
			Nombre:   "Franco",
			Apellido: "Garcia",
			Email:    "franco@linsi.com",
			Password: "franco",
			Legajo:   "88776",
		},
	}

	for _, alumnoData := range alumnos {
		var existingAlumno models.Alumno
		result := db.Where("email = ?", alumnoData.Email).First(&existingAlumno)

		if result.Error == nil {
			log.Printf("Alumno '%s' already exists", alumnoData.Email)
		} else {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(alumnoData.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Failed to hash password for alumno '%s': %v", alumnoData.Email, err)
				continue
			}

			newAlumno := models.Alumno{
				BaseUser: models.BaseUser{
					Nombre:   alumnoData.Nombre,
					Apellido: alumnoData.Apellido,
					Email:    alumnoData.Email,
					Password: string(hashedPassword),
				},
				Legajo: alumnoData.Legajo,
			}

			if err := db.Create(&newAlumno).Error; err != nil {
				log.Printf("Failed to create alumno '%s': %v", alumnoData.Email, err)
			} else {
				log.Printf("Alumno '%s' created successfully", alumnoData.Email)
			}
		}
	}

	// Log
	log.Println("Alumno seed completed successfully")
}
