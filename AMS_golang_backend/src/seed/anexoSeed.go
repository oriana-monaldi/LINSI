package seed

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func AnexoSeed(db *gorm.DB) {
	log.Println("Iniciando seed de anexos...")

	// Recupera TPs existentes
	var tps []models.TpModel
	if err := db.Find(&tps).Error; err != nil {
		log.Printf("Error recuperando TPs: %v", err)
		return
	}

	if len(tps) == 0 {
		log.Println("No hay TPs disponibles para crear anexos")
		return
	}

	log.Printf("TPs encontrados: %d", len(tps))

	// Crear directorio para archivos de seed si no existe
	seedDir := "uploads/anexos"
	if err := os.MkdirAll(seedDir, 0755); err != nil {
		log.Printf("Error creando directorio de anexos: %v", err)
		return
	}

	// Obtener lista de archivos existentes en el directorio
	files, err := os.ReadDir(seedDir)
	if err != nil {
		log.Printf("Error leyendo directorio de anexos: %v", err)
		return
	}

	if len(files) == 0 {
		log.Println("No hay archivos de ejemplo en el directorio de anexos")
		return
	}

	log.Printf("Archivos encontrados en %s: %d", seedDir, len(files))

	// Mapear archivos existentes con sus tipos de contenido
	fileTypeMap := map[string]string{
		".pdf": "application/pdf",
		".js":  "application/javascript",
		".py":  "text/x-python",
		".sql": "application/sql",
		".md":  "text/markdown",
	}

	// Crear anexos basados en los archivos que realmente existen
	anexoCounter := 1
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

		// Determinar el TP (rotar entre los TPs disponibles)
		tpIndex := (anexoCounter - 1) % len(tps)
		tpID := tps[tpIndex].ID

		log.Printf("Procesando archivo: %s para TP %d", filename, tpID)

		// Verificar si ya existe un anexo con este archivo
		var existingArchivo models.AnexoArchivo

		// Buscar si ya existe un archivo con este nombre
		if err := db.Where("original_name = ?", filename).First(&existingArchivo).Error; err == nil {
			log.Printf("Anexo con archivo %s ya existe, saltando...", filename)
			anexoCounter++
			continue
		}

		// Crear nuevo anexo
		anexo := models.Anexo{
			TpID: tpID,
		}

		if err := db.Create(&anexo).Error; err != nil {
			log.Printf("Error creando anexo: %v", err)
			continue
		}

		// Crear archivo asociado directamente
		filePath := filepath.Join(seedDir, filename)
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			log.Printf("Error obteniendo info del archivo %s: %v", filename, err)
			db.Delete(&anexo) // Limpiar anexo creado
			continue
		}

		anexoArchivo := models.AnexoArchivo{
			AnexoID:      anexo.ID,
			Filename:     filename,
			OriginalName: filename,
			FilePath:     filePath,
			ContentType:  contentType,
			Size:         fileInfo.Size(),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&anexoArchivo).Error; err != nil {
			log.Printf("Error creando archivo en BD: %v", err)
			db.Delete(&anexo) // Limpiar anexo creado
			continue
		}

		log.Printf("✓ Anexo %d creado exitosamente para TP %d con archivo: %s",
			anexo.ID, tpID, filename)

		anexoCounter++
	}

	// Log final
	log.Println("✓ Seed de anexos completado")
}
