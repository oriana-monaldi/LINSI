package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func MateriaSeed(db *gorm.DB) {
	materias := []models.Materia{
		{
			Nombre:     "Algoritmos y estructuras de datos",
			AnoCarrera: 1,
		},
		{
			Nombre:     "Sistemas operativos",
			AnoCarrera: 2,
		},
		{
			Nombre:     "Bases de datos",
			AnoCarrera: 3,
		},
		{
			Nombre:     "Desarrollo de software",
			AnoCarrera: 3,
		},
		{
			Nombre:     "Ingeniería y calidad de software",
			AnoCarrera: 4,
		},
		{
			Nombre:     "Administración de sistemas de información",
			AnoCarrera: 4,
		},
		{
			Nombre:     "Ciencia de datos",
			AnoCarrera: 5,
		},
		{
			Nombre:     "Inteligencia artificial",
			AnoCarrera: 5,
		},
		{
			Nombre:     "Proyecto final",
			AnoCarrera: 5,
		},
	}

	for _, materia := range materias {
		var existingMateria models.Materia
		result := db.Where("nombre = ?", materia.Nombre).First(&existingMateria)

		if result.Error == nil {
			log.Printf("Materia '%s' already exists", materia.Nombre)
		} else {
			if err := db.Create(&materia).Error; err != nil {
				log.Printf("Failed to create materia '%s': %v", materia.Nombre, err)
			} else {
				log.Printf("Materia '%s' created successfully", materia.Nombre)
			}
		}
	}

	// Log
	log.Println("Materia seed completed successfully")
}
