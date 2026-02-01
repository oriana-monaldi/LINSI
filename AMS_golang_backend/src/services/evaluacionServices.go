package services

import (
	"strconv"
	"time"

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
	if result.Error != nil {
		return result.Error
	}

	// Find all students enrolled in this comision and create EntregaEvaluacion for each
	var cursadas []models.Cursada
	if err := s.db.Where("comision_id = ?", evaluacion.ComisionId).Find(&cursadas).Error; err != nil {
		return err
	}

	for _, cursada := range cursadas {
		entregaEvaluacion := models.EntregaEvaluacion{
			EvaluacionId: evaluacion.ID,
			AlumnoId:     cursada.AlumnoID,
		}
		if err := s.db.Create(&entregaEvaluacion).Error; err != nil {
			return err
		}
	}

	return nil
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

// GetEntregasEvaluacionesByAlumnoID returns all evaluation submissions for a specific student
func (s *EvaluacionService) GetEntregasEvaluacionesByAlumnoID(alumnoID int) ([]models.EntregaEvaluacion, error) {
	var entregas []models.EntregaEvaluacion
	result := s.db.Preload("Evaluacion").Preload("Evaluacion.Comision").Preload("Evaluacion.Comision.Materia").Preload("Alumno").Where("alumno_id = ?", alumnoID).Find(&entregas)
	if result.Error != nil {
		return nil, result.Error
	}
	return entregas, nil
}

// GetEntregasEvaluacionesByEvaluacionID returns all evaluation submissions for a specific evaluation
func (s *EvaluacionService) GetEntregasEvaluacionesByEvaluacionID(evaluacionID int) ([]models.EntregaEvaluacion, error) {
	var entregas []models.EntregaEvaluacion
	result := s.db.Preload("Evaluacion").Preload("Evaluacion.Comision").Preload("Evaluacion.Comision.Materia").Preload("Alumno").
		Where("evaluacion_id = ?", evaluacionID).Find(&entregas)
	if result.Error != nil {
		return nil, result.Error
	}
	return entregas, nil
}

// GetEntregaEvaluacionByEvaluacionAndAlumno returns a specific evaluation submission for a student
func (s *EvaluacionService) GetEntregaEvaluacionByEvaluacionAndAlumno(evaluacionID, alumnoID int) (*models.EntregaEvaluacion, error) {
	var entrega models.EntregaEvaluacion
	result := s.db.Preload("Evaluacion").Preload("Evaluacion.Comision").Preload("Evaluacion.Comision.Materia").Preload("Alumno").
		Where("evaluacion_id = ? AND alumno_id = ?", evaluacionID, alumnoID).First(&entrega)
	if result.Error != nil {
		return nil, result.Error
	}
	return &entrega, nil
}

// UpdateEntregaEvaluacion updates the grading fields for a student's evaluation submission
func (s *EvaluacionService) UpdateEntregaEvaluacion(evaluacionID, alumnoID int, updateRequest *models.EntregaEvaluacionUpdateRequest) (*models.EntregaEvaluacion, error) {
	var entrega models.EntregaEvaluacion
	result := s.db.Where("evaluacion_id = ? AND alumno_id = ?", evaluacionID, alumnoID).First(&entrega)
	if result.Error != nil {
		return nil, result.Error
	}

	// Track if this is a grading update
	isGrading := updateRequest.Nota != nil && entrega.Nota == nil

	if updateRequest.Nota != nil {
		entrega.Nota = updateRequest.Nota
	}
	if updateRequest.Devolucion != nil {
		entrega.Devolucion = updateRequest.Devolucion
	}
	if updateRequest.Observaciones != nil {
		entrega.Observaciones = updateRequest.Observaciones
	}

	if err := s.db.Save(&entrega).Error; err != nil {
		return nil, err
	}

	// Reload with relationships
	s.db.Preload("Evaluacion").Preload("Evaluacion.Comision").Preload("Evaluacion.Comision.Materia").Preload("Alumno").First(&entrega, entrega.ID)

	// Create notification if evaluation was graded
	if isGrading && entrega.Nota != nil {
		materiaNombre := "Evaluación"
		if entrega.Evaluacion.Comision.Materia.Nombre != "" {
			materiaNombre = entrega.Evaluacion.Comision.Materia.Nombre
		}

		notificacion := models.Notificacion{
			Mensaje:   "Tu evaluación de " + materiaNombre + " ha sido calificada con nota: " + strconv.FormatFloat(*entrega.Nota, 'f', 1, 64),
			FechaHora: time.Now(),
			Leida:     false,
			AlumnoID:  entrega.AlumnoId,
		}
		s.db.Create(&notificacion)
	}

	return &entrega, nil
}

// SyncEntregasEvaluaciones creates missing EntregaEvaluacion entries for all evaluations
func (s *EvaluacionService) SyncEntregasEvaluaciones() error {
	// Get all evaluaciones
	var evaluaciones []models.EvaluacionModel
	if err := s.db.Find(&evaluaciones).Error; err != nil {
		return err
	}

	// For each evaluacion, create EntregaEvaluacion for all students in the comision
	for _, evaluacion := range evaluaciones {
		// Get all students in this comision
		var cursadas []models.Cursada
		if err := s.db.Where("comision_id = ?", evaluacion.ComisionId).Find(&cursadas).Error; err != nil {
			return err
		}

		// For each student, check if EntregaEvaluacion exists, if not create it
		for _, cursada := range cursadas {
			var count int64
			s.db.Model(&models.EntregaEvaluacion{}).Where("evaluacion_id = ? AND alumno_id = ?", evaluacion.ID, cursada.AlumnoID).Count(&count)

			if count == 0 {
				entregaEvaluacion := models.EntregaEvaluacion{
					EvaluacionId: evaluacion.ID,
					AlumnoId:     cursada.AlumnoID,
				}
				if err := s.db.Create(&entregaEvaluacion).Error; err != nil {
					return err
				}
			}
		}
	}

	return nil
}
