package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func ProfesorXComisionSeed(db *gorm.DB) {
	// Verificar si ya existen datos
	var count int64
	db.Model(&models.ProfesorXComision{}).Count(&count)
	if count > 0 {
		log.Println("ProfesorXComision seed ya ejecutado, saltando...")
		return
	}

	profesoresComisiones := []models.ProfesorXComision{
		{
			Cargo:      models.CargoTitular,
			ProfesorId: 1,
			ComisionId: 1,
		},
		{
			Cargo:      models.CargoAdjunto,
			ProfesorId: 2,
			ComisionId: 1,
		},
		{
			Cargo:      models.CargoJTP,
			ProfesorId: 3,
			ComisionId: 2,
		},
		{
			Cargo:      models.CargoTitular,
			ProfesorId: 1,
			ComisionId: 3,
		},
	}

	for _, pc := range profesoresComisiones {
		// Verificar que el profesor existe
		var profesor models.Profesor
		if err := db.First(&profesor, pc.ProfesorId).Error; err != nil {
			log.Printf("Profesor con ID %d no encontrado, saltando relación", pc.ProfesorId)
			continue
		}

		// Verificar que la comision existe
		var comision models.Comision
		if err := db.First(&comision, pc.ComisionId).Error; err != nil {
			log.Printf("Comision con ID %d no encontrada, saltando relación", pc.ComisionId)
			continue
		}

		// Verificar que no existe ya esta relación
		var existing models.ProfesorXComision
		result := db.Where("profesor_id = ? AND comision_id = ?", pc.ProfesorId, pc.ComisionId).First(&existing)
		if result.Error == nil {
			log.Printf("Relación profesor %d - comision %d ya existe, saltando", pc.ProfesorId, pc.ComisionId)
			continue
		}

		if err := db.Create(&pc).Error; err != nil {
			log.Printf("Error creando relación profesor-comision: %v", err)
		} else {
			log.Printf("Relación profesor-comision creada: Profesor %d - Comision %d (%s)", pc.ProfesorId, pc.ComisionId, pc.Cargo)
		}
	}

	// Log
	log.Println("ProfesorXComision seed completed successfully")
}
