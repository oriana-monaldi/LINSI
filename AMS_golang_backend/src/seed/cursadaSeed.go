package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func CursadaSeed(db *gorm.DB) {
	// Recupera alumnos existentes
	var alumnos []models.Alumno
	if err := db.Find(&alumnos).Error; err != nil {
		log.Printf("Failed to get alumnos for cursada seed: %v", err)
		return
	}

	// Recupera comisiones existentes
	var comisiones []models.Comision
	if err := db.Find(&comisiones).Error; err != nil {
		log.Printf("Failed to get comisiones for cursada seed: %v", err)
		return
	}

	if len(alumnos) == 0 || len(comisiones) == 0 {
		log.Println("No alumnos or comisiones found. Run alumno and comision seeds first.")
		return
	}

	cursadas := []struct {
		AnoLectivo     int
		NotaFinal      float64
		NotaConceptual float64
		Feedback       string
		AlumnoIndex    int
		ComisionIndex  int
	}{
		{
			AnoLectivo:     2024,
			NotaFinal:      8.5,
			NotaConceptual: 9.0,
			Feedback:       "El profesor mostró dominio del tema, explicó con claridad y usó buenos ejemplos prácticos; su retroalimentación fue precisa y útil para mejorar mi desempeño.",
			AlumnoIndex:    0,
			ComisionIndex:  0,
		},
		{
			AnoLectivo:     2024,
			NotaFinal:      7.2,
			NotaConceptual: 7.5,
			Feedback:       "Buena disposición del docente, aunque podría mejorar la organización de las clases y dar más tiempo para preguntas durante las explicaciones.",
			AlumnoIndex:    1,
			ComisionIndex:  0,
		},
		{
			AnoLectivo:     2024,
			NotaFinal:      9.1,
			NotaConceptual: 8.8,
			Feedback:       "Profesor comprometido, fomentó el pensamiento crítico y brindó apoyo individual cuando fue necesario; las actividades fueron muy alineadas con los objetivos del curso.",
			AlumnoIndex:    2,
			ComisionIndex:  1,
		},
		{
			AnoLectivo:     2024,
			NotaFinal:      6.8,
			NotaConceptual: 7.0,
			Feedback:       "El docente tiene buenos conocimientos, pero la comunicación de expectativas y criterios de evaluación fue poco clara; se podría mejorar la guía para los trabajos prácticos.",
			AlumnoIndex:    3,
			ComisionIndex:  1,
		},
		{
			AnoLectivo:     2023,
			NotaFinal:      8.0,
			NotaConceptual: 8.3,
			Feedback:       "Profesor accesible y atento a las dudas; las clases combinaron teoría y práctica de forma equilibrada, lo que facilitó el aprendizaje sostenido.",
			AlumnoIndex:    4,
			ComisionIndex:  0,
		},
		{
			AnoLectivo:     2023,
			NotaFinal:      7.8,
			NotaConceptual: 8.1,
			Feedback:       "Docente puntual y responsable con las devoluciones; sería beneficioso incorporar más ejemplos aplicados y ejercicios para afianzar conceptos.",
			AlumnoIndex:    5,
			ComisionIndex:  1,
		},
	}

	for _, cursadaData := range cursadas {
		// Recorrer y validar índices
		if cursadaData.AlumnoIndex >= len(alumnos) {
			log.Printf("Alumno index %d out of range, skipping cursada", cursadaData.AlumnoIndex)
			continue
		}
		if cursadaData.ComisionIndex >= len(comisiones) {
			log.Printf("Comision index %d out of range, skipping cursada", cursadaData.ComisionIndex)
			continue
		}

		alumnoID := alumnos[cursadaData.AlumnoIndex].ID
		comisionID := comisiones[cursadaData.ComisionIndex].ID

		// Verificar si ya existe una cursada para este alumno y comisión en el año lectivo
		var existingCursada models.Cursada
		result := db.Where("alumno_id = ? AND comision_id = ? AND ano_lectivo = ?",
			alumnoID, comisionID, cursadaData.AnoLectivo).First(&existingCursada)

		if result.Error == nil {
			log.Printf("Cursada for alumno ID %d, comision ID %d, año %d already exists",
				alumnoID, comisionID, cursadaData.AnoLectivo)
		} else {
			newCursada := models.Cursada{
				AnoLectivo:     cursadaData.AnoLectivo,
				NotaFinal:      cursadaData.NotaFinal,
				NotaConceptual: cursadaData.NotaConceptual,
				Feedback:       cursadaData.Feedback,
				AlumnoID:       alumnoID,
				ComisionID:     comisionID,
			}

			if err := db.Create(&newCursada).Error; err != nil {
				log.Printf("Failed to create cursada for alumno ID %d: %v", alumnoID, err)
			} else {
				log.Printf("Cursada for alumno ID %d created successfully", alumnoID)
			}
		}
	}

	// Log
	log.Println("Cursada seed completed successfully")
}
