package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func ComisionSeed(db *gorm.DB) {
	comisiones := []models.Comision{
		// 1
		// Algoritmos y estructuras de datos (ID: 1)
		{
			Nombre:    "S11 - Algoritmos",
			Horarios:  "Lunes 8:00-12:00, Miércoles 14:00-18:00",
			MateriaId: 1,
		},
		{
			Nombre:    "S12 - Algoritmos",
			Horarios:  "Martes 14:00-18:00, Jueves 8:00-12:00",
			MateriaId: 1,
		},
		// 2
		// Sistemas operativos (ID: 2)
		{
			Nombre:    "S21 - Sistemas Operativos",
			Horarios:  "Lunes 14:00-18:00, Viernes 8:00-12:00",
			MateriaId: 2,
		},
		// 3
		// Bases de datos (ID: 3)
		{
			Nombre:    "S31 - Bases de Datos",
			Horarios:  "Martes 8:00-12:00, Jueves 14:00-18:00",
			MateriaId: 3,
		},
		{
			Nombre:    "S32 - Bases de Datos",
			Horarios:  "Miércoles 8:00-12:00, Viernes 14:00-18:00",
			MateriaId: 3,
		},
		// Desarrollo de software (ID: 4)
		{
			Nombre:    "S31 - Desarrollo de Software",
			Horarios:  "Lunes 18:00-22:00, Miércoles 18:00-22:00",
			MateriaId: 4,
		},
		// 4
		// Ingeniería y calidad de software (ID: 5)
		{
			Nombre:    "S41 - Ingeniería y Calidad",
			Horarios:  "Martes 18:00-22:00, Viernes 18:00-22:00",
			MateriaId: 5,
		},
		// Administración de sistemas de información (ID: 6)
		{
			Nombre:    "S41 - Administración SI",
			Horarios:  "Jueves 18:00-22:00, Sábado 8:00-12:00",
			MateriaId: 6,
		},
		// 5
		// Ciencia de datos (ID: 7)
		{
			Nombre:    "S51 - Ciencia de Datos",
			Horarios:  "Lunes 8:00-12:00, Jueves 8:00-12:00",
			MateriaId: 7,
		},
		// Inteligencia artificial (ID: 8)
		{
			Nombre:    "S51 - Inteligencia Artificial",
			Horarios:  "Martes 8:00-12:00, Viernes 8:00-12:00",
			MateriaId: 8,
		},
		// Proyecto final (ID: 9)
		{
			Nombre:    "S51 - Proyecto Final",
			Horarios:  "Miércoles 14:00-18:00, Sábado 14:00-18:00",
			MateriaId: 9,
		},
	}

	for _, comision := range comisiones {
		var existingComision models.Comision
		result := db.Where("nombre = ? AND materia_id = ?", comision.Nombre, comision.MateriaId).First(&existingComision)

		if result.Error == nil {
			log.Printf("Comisión '%s' already exists", comision.Nombre)
		} else {
			if err := db.Create(&comision).Error; err != nil {
				log.Printf("Failed to create comisión '%s': %v", comision.Nombre, err)
			} else {
				log.Printf("Comisión '%s' created successfully", comision.Nombre)
			}
		}
	}

	// Log
	log.Println("Comision seed completed successfully")
}
