package services

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type AnexoService struct {
	db *gorm.DB
}

func NewAnexoService(db *gorm.DB) *AnexoService {
	return &AnexoService{db: db}
}

func (s *AnexoService) GetAllAnexos() ([]models.Anexo, error) {
	var anexos []models.Anexo
	result := s.db.Preload("AnexoArchivo").Preload("Tp").Preload("Tp.Comision").Find(&anexos)
	if result.Error != nil {
		return nil, result.Error
	}
	return anexos, nil
}

func (s *AnexoService) GetAnexoByID(id int) (*models.Anexo, error) {
	var anexo models.Anexo
	result := s.db.Preload("AnexoArchivo").Preload("Tp").Preload("Tp.Comision").First(&anexo, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &anexo, nil
}

func (s *AnexoService) CreateAnexo(anexo *models.Anexo) error {
	result := s.db.Create(anexo)
	return result.Error
}

func (s *AnexoService) UpdateAnexo(id int, updateRequest *models.AnexoUpdateRequest) (*models.Anexo, error) {
	var anexo models.Anexo
	result := s.db.First(&anexo, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.TpID != nil {
		anexo.TpID = *updateRequest.TpID
	}

	result = s.db.Save(&anexo)
	if result.Error != nil {
		return nil, result.Error
	}
	return &anexo, nil
}

func (s *AnexoService) DeleteAnexo(id int) error {
	// Primero obtener el anexo con sus archivos para eliminar los archivos físicos
	var anexo models.Anexo
	result := s.db.Preload("AnexoArchivo").First(&anexo, id)
	if result.Error != nil {
		return result.Error
	}

	// Eliminar archivos físicos
	for _, archivo := range anexo.AnexoArchivo {
		if err := s.DeletePhysicalFile(archivo.FilePath); err != nil {
			// Log error but continue with other files
			fmt.Printf("Warning: could not delete file %s: %v\n", archivo.FilePath, err)
		}
	}

	// Eliminar de la base de datos (GORM eliminará los archivos relacionados automáticamente)
	result = s.db.Delete(&models.Anexo{}, id)
	return result.Error
}

func (s *AnexoService) SaveFile(file *multipart.FileHeader, anexoID int) (*models.AnexoArchivo, error) {
	// Crear directorio si no existe
	uploadDir := "uploads/anexos"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("error creating upload directory: %v", err)
	}

	// Generar nombre único para el archivo
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%d_%s", anexoID, timestamp, file.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Abrir archivo subido
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("error opening uploaded file: %v", err)
	}
	defer src.Close()

	// Crear archivo destino
	dst, err := os.Create(filepath)
	if err != nil {
		return nil, fmt.Errorf("error creating destination file: %v", err)
	}
	defer dst.Close()

	// Copiar contenido
	if _, err := io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("error copying file: %v", err)
	}

	// Crear registro en base de datos
	anexoArchivo := &models.AnexoArchivo{
		AnexoID:      anexoID,
		Filename:     filename,
		OriginalName: file.Filename,
		FilePath:     filepath,
		ContentType:  file.Header.Get("Content-Type"),
		Size:         file.Size,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	result := s.db.Create(anexoArchivo)
	if result.Error != nil {
		// Si falla la creación en BD, eliminar archivo físico
		os.Remove(filepath)
		return nil, result.Error
	}

	return anexoArchivo, nil
}

func (s *AnexoService) DeletePhysicalFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(filePath)
}

func (s *AnexoService) DeleteAnexoArchivoByID(archivoID int) error {
	var anexoArchivo models.AnexoArchivo
	result := s.db.First(&anexoArchivo, archivoID)
	if result.Error != nil {
		return result.Error
	}

	// Eliminar archivo físico
	if err := s.DeletePhysicalFile(anexoArchivo.FilePath); err != nil {
		fmt.Printf("Warning: could not delete file %s: %v\n", anexoArchivo.FilePath, err)
	}

	// Eliminar de base de datos
	result = s.db.Delete(&anexoArchivo)
	return result.Error
}

func (s *AnexoService) GetAnexoArchivosByAnexoID(anexoID int) ([]models.AnexoArchivo, error) {
	var archivos []models.AnexoArchivo
	result := s.db.Where("anexo_id = ?", anexoID).Find(&archivos)
	if result.Error != nil {
		return nil, result.Error
	}
	return archivos, nil
}

func (s *AnexoService) GetAnexoArchivoByID(archivoID int) (*models.AnexoArchivo, error) {
	var anexoArchivo models.AnexoArchivo
	result := s.db.First(&anexoArchivo, archivoID)
	if result.Error != nil {
		return nil, result.Error
	}
	return &anexoArchivo, nil
}

func (s *AnexoService) GetPrimaryAnexoArchivoByAnexoID(anexoID int) (*models.AnexoArchivo, error) {
	var archivos []models.AnexoArchivo
	result := s.db.Where("anexo_id = ?", anexoID).Order("created_at ASC").Find(&archivos)
	if result.Error != nil {
		return nil, result.Error
	}

	if len(archivos) == 0 {
		return nil, fmt.Errorf("no files found for anexo %d", anexoID)
	}

	// Retornar el primer archivo (más antiguo) como archivo principal
	// Podrías cambiar esta lógica para priorizar por tipo de archivo, nombre, etc.
	return &archivos[0], nil
}

func (s *AnexoService) GetAnexosByTpID(tpID int) ([]models.Anexo, error) {
	var anexos []models.Anexo
	result := s.db.Preload("AnexoArchivo").Preload("Tp").Preload("Tp.Comision").Where("tp_id = ?", tpID).Find(&anexos)
	if result.Error != nil {
		return nil, result.Error
	}
	return anexos, nil
}
