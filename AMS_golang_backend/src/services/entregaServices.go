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

type EntregaService struct {
	db *gorm.DB
}

func NewEntregaService(db *gorm.DB) *EntregaService {
	return &EntregaService{db: db}
}

func (s *EntregaService) GetAllEntregas() ([]models.Entrega, error) {
	var entregas []models.Entrega
	result := s.db.Preload("Archivo").Preload("Alumno").Preload("Tp").Preload("Tp.Comision").Find(&entregas)
	if result.Error != nil {
		return nil, result.Error
	}
	return entregas, nil
}

func (s *EntregaService) GetEntregaByID(id int) (*models.Entrega, error) {
	var entrega models.Entrega
	result := s.db.Preload("Archivo").Preload("Alumno").Preload("Tp").Preload("Tp.Comision").First(&entrega, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &entrega, nil
}

func (s *EntregaService) CreateEntrega(entrega *models.Entrega) error {
	result := s.db.Create(entrega)
	return result.Error
}

func (s *EntregaService) UpdateEntrega(id int, updateRequest *models.EntregaUpdateRequest) (*models.Entrega, error) {
	var entrega models.Entrega
	result := s.db.First(&entrega, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.FechaHora != nil {
		entrega.FechaHora = *updateRequest.FechaHora
	}
	if updateRequest.AlumnoID != nil {
		entrega.AlumnoID = *updateRequest.AlumnoID
	}
	if updateRequest.TpID != nil {
		entrega.TpID = *updateRequest.TpID
	}

	result = s.db.Save(&entrega)
	if result.Error != nil {
		return nil, result.Error
	}
	return &entrega, nil
}

func (s *EntregaService) DeleteEntrega(id int) error {
	// Primero obtener la entrega con sus archivos para eliminar los archivos físicos
	var entrega models.Entrega
	result := s.db.Preload("Archivo").First(&entrega, id)
	if result.Error != nil {
		return result.Error
	}

	// Eliminar archivos físicos
	for _, archivo := range entrega.Archivo {
		if err := s.DeletePhysicalFile(archivo.FilePath); err != nil {
			// Log error but continue with database deletion
			fmt.Printf("Error deleting physical file %s: %v\n", archivo.FilePath, err)
		}
	}

	// Eliminar de la base de datos (GORM eliminará los archivos relacionados automáticamente)
	result = s.db.Delete(&models.Entrega{}, id)
	return result.Error
}

func (s *EntregaService) SaveFile(file *multipart.FileHeader, entregaID int) (*models.Archivo, error) {
	// Crear directorio si no existe
	uploadDir := "uploads/entregas"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("error creating upload directory: %v", err)
	}

	// Generar nombre único para el archivo
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%d_%s", entregaID, timestamp, file.Filename)
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
	archivo := &models.Archivo{
		EntregaID:    entregaID,
		Filename:     filename,
		OriginalName: file.Filename,
		FilePath:     filepath,
		ContentType:  file.Header.Get("Content-Type"),
		Size:         file.Size,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	result := s.db.Create(archivo)
	if result.Error != nil {
		// Si falla la creación en BD, eliminar archivo físico
		os.Remove(filepath)
		return nil, result.Error
	}

	return archivo, nil
}

func (s *EntregaService) DeletePhysicalFile(filePath string) error {
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(filePath)
}

func (s *EntregaService) DeleteArchivoByID(archivoID int) error {
	var archivo models.Archivo
	result := s.db.First(&archivo, archivoID)
	if result.Error != nil {
		return result.Error
	}

	// Eliminar archivo físico
	if err := s.DeletePhysicalFile(archivo.FilePath); err != nil {
		fmt.Printf("Error deleting physical file %s: %v\n", archivo.FilePath, err)
	}

	// Eliminar de base de datos
	result = s.db.Delete(&archivo)
	return result.Error
}

func (s *EntregaService) GetArchivosByEntregaID(entregaID int) ([]models.Archivo, error) {
	var archivos []models.Archivo
	result := s.db.Where("entrega_id = ?", entregaID).Find(&archivos)
	if result.Error != nil {
		return nil, result.Error
	}
	return archivos, nil
}

func (s *EntregaService) GetArchivoByID(archivoID int) (*models.Archivo, error) {
	var archivo models.Archivo
	result := s.db.First(&archivo, archivoID)
	if result.Error != nil {
		return nil, result.Error
	}
	return &archivo, nil
}

func (s *EntregaService) GetPrimaryArchivoByEntregaID(entregaID int) (*models.Archivo, error) {
	var archivos []models.Archivo
	result := s.db.Where("entrega_id = ?", entregaID).Order("created_at ASC").Find(&archivos)
	if result.Error != nil {
		return nil, result.Error
	}

	if len(archivos) == 0 {
		return nil, fmt.Errorf("no files found for entrega ID %d", entregaID)
	}

	// Retornar el primer archivo (más antiguo) como archivo principal
	// Podrías cambiar esta lógica para priorizar por tipo de archivo, nombre, etc.
	return &archivos[0], nil
}

func (s *EntregaService) GetEntregasByAlumnoID(alumnoID int) ([]models.Entrega, error) {
	var entregas []models.Entrega
	result := s.db.Preload("Archivo").Preload("Alumno").Preload("Tp").Preload("Tp.Comision").Where("alumno_id = ?", alumnoID).Find(&entregas)
	if result.Error != nil {
		return nil, result.Error
	}
	return entregas, nil
}

func (s *EntregaService) GetEntregaByIDAndAlumnoID(entregaID, alumnoID int) (*models.Entrega, error) {
	var entrega models.Entrega
	result := s.db.Preload("Archivo").Preload("Alumno").Preload("Tp").Preload("Tp.Comision").Where("id = ? AND alumno_id = ?", entregaID, alumnoID).First(&entrega)
	if result.Error != nil {
		return nil, result.Error
	}
	return &entrega, nil
}
