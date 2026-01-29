package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type EvaluacionService struct {
	db *gorm.DB
}

func NewEvaluacionService(db *gorm.DB) *EvaluacionService {
	return &EvaluacionService{db: db}
}

func (s *EvaluacionService) GetAllEvaluaciones() ([]models.EvaluacionModel, error) {
	var evaluaciones []models.EvaluacionModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Find(&evaluaciones)
	if result.Error != nil {
		return nil, result.Error
	}
	return evaluaciones, nil
}

// GetEvaluacionesByProfesorID returns only evaluaciones for comisiones assigned to the given profesor
func (s *EvaluacionService) GetEvaluacionesByProfesorID(profesorID int) ([]models.EvaluacionModel, error) {
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
		return []models.EvaluacionModel{}, nil
	}

	// Get evaluaciones for these comisiones
	var evaluaciones []models.EvaluacionModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Where("comision_id IN ?", comisionIDs).Find(&evaluaciones)
	if result.Error != nil {
		return nil, result.Error
	}
	return evaluaciones, nil
}

func (s *EvaluacionService) GetEvaluacionByID(id int) (*models.EvaluacionModel, error) {
	var evaluacion models.EvaluacionModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").First(&evaluacion, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &evaluacion, nil
}

func (s *EvaluacionService) GetEvaluacionesByComisionID(comisionID int) ([]models.EvaluacionModel, error) {
	var evaluaciones []models.EvaluacionModel
	result := s.db.Preload("Comision").Preload("Comision.Materia").Where("comision_id = ?", comisionID).Find(&evaluaciones)
	if result.Error != nil {
		return nil, result.Error
	}
	return evaluaciones, nil
}

func (s *EvaluacionService) CreateEvaluacion(evaluacion *models.EvaluacionModel) error {
	result := s.db.Create(evaluacion)
	return result.Error
}

func (s *EvaluacionService) UpdateEvaluacion(id int, updateRequest *models.EvaluacionUpdateRequest) (*models.EvaluacionModel, error) {
	var evaluacion models.EvaluacionModel
	result := s.db.First(&evaluacion, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.FechaEvaluacion != nil {
		evaluacion.FechaEvaluacion = *updateRequest.FechaEvaluacion
	}
	if updateRequest.FechaDevolucion != nil {
		evaluacion.FechaDevolucion = *updateRequest.FechaDevolucion
	}
	if updateRequest.Temas != nil {
		evaluacion.Temas = *updateRequest.Temas
	}
	if updateRequest.Nota != nil {
		evaluacion.Nota = *updateRequest.Nota
	}
	if updateRequest.Devolucion != nil {
		evaluacion.Devolucion = *updateRequest.Devolucion
	}
	if updateRequest.Observaciones != nil {
		evaluacion.Observaciones = *updateRequest.Observaciones
	}
	if updateRequest.ComisionId != nil {
		evaluacion.ComisionId = *updateRequest.ComisionId
	}

	result = s.db.Save(&evaluacion)
	if result.Error != nil {
		return nil, result.Error
	}
	return &evaluacion, nil
}

func (s *EvaluacionService) DeleteEvaluacion(id int) error {
	result := s.db.Delete(&models.EvaluacionModel{}, id)
	return result.Error
}
