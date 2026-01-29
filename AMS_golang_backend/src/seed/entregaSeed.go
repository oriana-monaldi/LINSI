package seed

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func EntregaSeed(db *gorm.DB) {
	log.Println("Iniciando seed de entregas...")

	// Recupera alumnos existentes
	var alumnos []models.Alumno
	if err := db.Find(&alumnos).Error; err != nil {
		log.Printf("Error recuperando alumnos: %v", err)
		return
	}

	// Recupera TPs existentes
	var tps []models.TpModel
	if err := db.Find(&tps).Error; err != nil {
		log.Printf("Error recuperando TPs: %v", err)
		return
	}

	if len(alumnos) == 0 || len(tps) == 0 {
		log.Println("No hay alumnos o TPs disponibles para crear entregas")
		return
	}

	log.Printf("Alumnos encontrados: %d, TPs encontrados: %d", len(alumnos), len(tps))

	// Crear directorio para archivos de seed si no existe
	seedDir := "uploads/entregas"
	if err := os.MkdirAll(seedDir, 0755); err != nil {
		log.Printf("Error creando directorio de entregas: %v", err)
		return
	}

	// Obtener lista de archivos existentes en el directorio
	files, err := os.ReadDir(seedDir)
	if err != nil {
		log.Printf("Error leyendo directorio de entregas: %v", err)
		return
	}

	if len(files) == 0 {
		log.Println("No hay archivos de ejemplo en el directorio de entregas")
		return
	}

	log.Printf("Archivos encontrados en %s: %d", seedDir, len(files))

	// Mapear archivos existentes con sus tipos de contenido
	fileTypeMap := map[string]string{
		".py":   "text/x-python",
		".cpp":  "text/x-c++src",
		".java": "text/x-java-source",
		".sql":  "application/sql",
		".js":   "application/javascript",
		".txt":  "text/plain",
	}

	// Datos predefinidos para las entregas (solo usar los primeros archivos disponibles)
	predefinedEntregas := []struct {
		AlumnoIndex int
		TpIndex     int
		FechaHora   string
	}{
		{0, 0, "2024-12-14 18:30:00"}, // Juan Pérez - Primer TP
		{1, 0, "2024-12-14 19:15:00"}, // María García - Primer TP
		{2, 1, "2024-12-15 10:20:00"}, // Carlos López - Segundo TP
		{0, 1, "2024-12-15 14:45:00"}, // Juan Pérez - Segundo TP
		{1, 2, "2024-12-16 16:30:00"}, // María García - Tercer TP
	}

	// Crear entregas basadas en los archivos que realmente existen
	entregaCounter := 1
	fileCounter := 0

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filename := file.Name()
		ext := filepath.Ext(filename)
		contentType, exists := fileTypeMap[ext]

		if !exists {
			log.Printf("Tipo de archivo no soportado: %s", filename)
			continue
		}

		// Usar datos predefinidos o rotar si hay más archivos que entregas predefinidas
		entregaIndex := fileCounter % len(predefinedEntregas)
		entregaData := predefinedEntregas[entregaIndex]

		alumnoID := alumnos[entregaData.AlumnoIndex%len(alumnos)].ID
		tpID := tps[entregaData.TpIndex%len(tps)].ID

		log.Printf("Procesando archivo: %s para Alumno %d, TP %d", filename, alumnoID, tpID)

		// Verificar si ya existe una entrega con este archivo
		var existingArchivo models.Archivo
		if err := db.Where("original_name = ?", filename).First(&existingArchivo).Error; err == nil {
			log.Printf("Entrega con archivo %s ya existe, saltando...", filename)
			fileCounter++
			continue
		}

		// Crear nueva entrega
		entrega := models.Entrega{
			FechaHora: entregaData.FechaHora,
			AlumnoID:  alumnoID,
			TpID:      tpID,
		}

		if err := db.Create(&entrega).Error; err != nil {
			log.Printf("Error creando entrega: %v", err)
			continue
		}

		// Crear archivo asociado directamente
		filePath := filepath.Join(seedDir, filename)
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			log.Printf("Error obteniendo info del archivo %s: %v", filename, err)
			db.Delete(&entrega) // Limpiar entrega creada
			continue
		}

		archivo := models.Archivo{
			EntregaID:    entrega.ID,
			Filename:     filename,
			OriginalName: filename,
			FilePath:     filePath,
			ContentType:  contentType,
			Size:         fileInfo.Size(),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&archivo).Error; err != nil {
			log.Printf("Error creando archivo en BD: %v", err)
			db.Delete(&entrega) // Limpiar entrega creada
			continue
		}

		log.Printf("✓ Entrega %d creada exitosamente - Alumno %d, TP %d, archivo: %s",
			entrega.ID, alumnoID, tpID, filename)

		fileCounter++
		entregaCounter++
	}

	// Log final
	log.Println("✓ Seed de entregas completado")
}
