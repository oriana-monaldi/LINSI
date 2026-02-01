package services

import (
	"fmt"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type TpService struct {
	db *gorm.DB
}

func NewTpService(db *gorm.DB) *TpService {
	return &TpService{db: db}
}

func (s *TpService) GetAllTps() ([]models.TpModel, error) {
	var tps []models.TpModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Find(&tps)
	if result.Error != nil {
		return nil, result.Error
	}
	return tps, nil
}

// GetTpsByProfesorID returns only TPs for comisiones assigned to the given profesor
func (s *TpService) GetTpsByProfesorID(profesorID int) ([]models.TpModel, error) {
	// First get all comision IDs for this profesor
	var profesorComisiones []models.ProfesorXComision
	if err := s.db.Where("profesor_id = ?", profesorID).Find(&profesorComisiones).Error; err != nil {
		return nil, err
	}

	// Extract comision IDs
	comisionIDs := make([]int, len(profesorComisiones))
	for i, pc := range profesorComisiones {
		comisionIDs[i] = pc.ComisionId
	}

	// If no comisiones, return empty list
	if len(comisionIDs) == 0 {
		return []models.TpModel{}, nil
	}

	// Get TPs for these comisiones
	var tps []models.TpModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Where("comision_id IN ?", comisionIDs).Find(&tps)
	if result.Error != nil {
		return nil, result.Error
	}
	return tps, nil
}

// GetTpsByAlumnoID returns TPs for all comisiones that the student is enrolled in
func (s *TpService) GetTpsByAlumnoID(alumnoID int) ([]models.TpModel, error) {
	// First get all comision IDs for this alumno
	var cursadas []models.Cursada
	if err := s.db.Where("alumno_id = ?", alumnoID).Find(&cursadas).Error; err != nil {
		return nil, err
	}

	// Extract comision IDs
	comisionIDs := make([]int, len(cursadas))
	for i, cursada := range cursadas {
		comisionIDs[i] = cursada.ComisionID
	}

	// If no comisiones, return empty list
	if len(comisionIDs) == 0 {
		return []models.TpModel{}, nil
	}

	// Get TPs for these comisiones
	var tps []models.TpModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Where("comision_id IN ?", comisionIDs).Find(&tps)
	if result.Error != nil {
		return nil, result.Error
	}
	return tps, nil
}

func (s *TpService) GetTpByID(id int) (*models.TpModel, error) {
	var tp models.TpModel
	result := s.db.Preload("Comision").First(&tp, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &tp, nil
}

func (s *TpService) CreateTp(tp *models.TpModel) error {
	result := s.db.Create(tp)
	if result.Error != nil {
		return result.Error
	}

	// Load comision with materia for notification message
	var comision models.Comision
	s.db.Preload("Materia").First(&comision, tp.ComisionId)

	materiaNombre := comision.Nombre
	if comision.Materia.Nombre != "" {
		materiaNombre = comision.Materia.Nombre
	}

	// Find all students enrolled in this comision and notify them
	var cursadas []models.Cursada
	s.db.Where("comision_id = ?", tp.ComisionId).Find(&cursadas)

	for _, cursada := range cursadas {
		notificacion := models.Notificacion{
			Mensaje:   fmt.Sprintf("Nuevo TP disponible en %s: %s", materiaNombre, truncateString(tp.Consigna, 50)),
			FechaHora: time.Now(),
			Leida:     false,
			AlumnoID:  cursada.AlumnoID,
		}
		s.db.Create(&notificacion)
	}

	return nil
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func (s *TpService) UpdateTp(id int, updateRequest *models.TpUpdateRequest) (*models.TpModel, error) {
	var tp models.TpModel
	result := s.db.First(&tp, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.Consigna != nil {
		tp.Consigna = *updateRequest.Consigna
	}
	if updateRequest.FechaHoraEntrega != nil {
		tp.FechaHoraEntrega = *updateRequest.FechaHoraEntrega
	}
	if updateRequest.Vigente != nil {
		tp.Vigente = *updateRequest.Vigente
	}
	if updateRequest.Nota != nil {
		tp.Nota = *updateRequest.Nota
	}
	if updateRequest.Devolucion != nil {
		tp.Devolucion = *updateRequest.Devolucion
	}
	if updateRequest.ComisionId != nil {
		tp.ComisionId = *updateRequest.ComisionId
	}

	saveResult := s.db.Save(&tp)
	if saveResult.Error != nil {
		return nil, saveResult.Error
	}

	return &tp, nil
}

func (s *TpService) DeleteTp(id int) error {
	result := s.db.Delete(&models.TpModel{}, id)
	return result.Error
}