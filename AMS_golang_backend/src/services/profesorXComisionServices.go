package services

import (
	"errors"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type ProfesorXComisionService struct {
	db *gorm.DB
}

func NewProfesorXComisionService(db *gorm.DB) *ProfesorXComisionService {
	return &ProfesorXComisionService{db: db}
}

func (s *ProfesorXComisionService) CreateProfesorXComision(req *models.ProfesorXComisionCreateRequest) (*models.ProfesorXComisionResponse, error) {
	// Validar que el cargo sea válido
	if req.Cargo != models.CargoTitular && req.Cargo != models.CargoAdjunto && req.Cargo != models.CargoJTP {
		return nil, errors.New("cargo inválido")
	}

	// Verificar que el profesor existe
	var profesor models.Profesor
	if err := s.db.First(&profesor, req.ProfesorId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("profesor no encontrado")
		}
		return nil, err
	}

	// Verificar que la comision existe
	var comision models.Comision
	if err := s.db.First(&comision, req.ComisionId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comision no encontrada")
		}
		return nil, err
	}

	// Verificar que no existe ya esta relación (profesor-comision debe ser única)
	var existing models.ProfesorXComision
	result := s.db.Where("profesor_id = ? AND comision_id = ?", req.ProfesorId, req.ComisionId).First(&existing)
	if result.Error == nil {
		return nil, errors.New("el profesor ya está asignado a esta comision")
	}

	// Crear la relación
	profesorXComision := models.ProfesorXComision{
		Cargo:      req.Cargo,
		ProfesorId: req.ProfesorId,
		ComisionId: req.ComisionId,
	}

	if err := s.db.Create(&profesorXComision).Error; err != nil {
		return nil, err
	}

	// Cargar las relaciones para la respuesta
	if err := s.db.Preload("Profesor").Preload("Comision.Materia").First(&profesorXComision, profesorXComision.ID).Error; err != nil {
		return nil, err
	}

	response := &models.ProfesorXComisionResponse{
		ID:         profesorXComision.ID,
		Cargo:      profesorXComision.Cargo,
		ProfesorId: profesorXComision.ProfesorId,
		ComisionId: profesorXComision.ComisionId,
		Profesor: &models.ProfesorResponse{
			ID:       profesorXComision.Profesor.ID,
			Nombre:   profesorXComision.Profesor.Nombre,
			Apellido: profesorXComision.Profesor.Apellido,
			Legajo:   profesorXComision.Profesor.Legajo,
			Email:    profesorXComision.Profesor.Email,
		},
		Comision: &profesorXComision.Comision,
	}

	return response, nil
}

func (s *ProfesorXComisionService) GetAllProfesorXComision() ([]models.ProfesorXComisionResponse, error) {
	var relaciones []models.ProfesorXComision
	result := s.db.Preload("Profesor").Preload("Comision.Materia").Find(&relaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.ProfesorXComisionResponse, 0, len(relaciones))
	for _, rel := range relaciones {
		response := models.ProfesorXComisionResponse{
			ID:         rel.ID,
			Cargo:      rel.Cargo,
			ProfesorId: rel.ProfesorId,
			ComisionId: rel.ComisionId,
			Profesor: &models.ProfesorResponse{
				ID:       rel.Profesor.ID,
				Nombre:   rel.Profesor.Nombre,
				Apellido: rel.Profesor.Apellido,
				Legajo:   rel.Profesor.Legajo,
				Email:    rel.Profesor.Email,
			},
			Comision: &rel.Comision,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *ProfesorXComisionService) GetProfesorXComisionByID(id int) (*models.ProfesorXComisionResponse, error) {
	var relacion models.ProfesorXComision
	result := s.db.Preload("Profesor").Preload("Comision.Materia").First(&relacion, id)
	if result.Error != nil {
		return nil, result.Error
	}

	response := &models.ProfesorXComisionResponse{
		ID:         relacion.ID,
		Cargo:      relacion.Cargo,
		ProfesorId: relacion.ProfesorId,
		ComisionId: relacion.ComisionId,
		Profesor: &models.ProfesorResponse{
			ID:       relacion.Profesor.ID,
			Nombre:   relacion.Profesor.Nombre,
			Apellido: relacion.Profesor.Apellido,
			Legajo:   relacion.Profesor.Legajo,
			Email:    relacion.Profesor.Email,
		},
		Comision: &relacion.Comision,
	}

	return response, nil
}

func (s *ProfesorXComisionService) GetComisionesByProfesorID(profesorID int) ([]models.ProfesorXComisionResponse, error) {
	var relaciones []models.ProfesorXComision
	result := s.db.Preload("Profesor").Preload("Comision.Materia").Where("profesor_id = ?", profesorID).Find(&relaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.ProfesorXComisionResponse, 0, len(relaciones))
	for _, rel := range relaciones {
		response := models.ProfesorXComisionResponse{
			ID:         rel.ID,
			Cargo:      rel.Cargo,
			ProfesorId: rel.ProfesorId,
			ComisionId: rel.ComisionId,
			Profesor: &models.ProfesorResponse{
				ID:       rel.Profesor.ID,
				Nombre:   rel.Profesor.Nombre,
				Apellido: rel.Profesor.Apellido,
				Legajo:   rel.Profesor.Legajo,
				Email:    rel.Profesor.Email,
			},
			Comision: &rel.Comision,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *ProfesorXComisionService) GetProfesoresByComisionID(comisionID int) ([]models.ProfesorXComisionResponse, error) {
	var relaciones []models.ProfesorXComision
	result := s.db.Preload("Profesor").Preload("Comision.Materia").Where("comision_id = ?", comisionID).Find(&relaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.ProfesorXComisionResponse, 0, len(relaciones))
	for _, rel := range relaciones {
		response := models.ProfesorXComisionResponse{
			ID:         rel.ID,
			Cargo:      rel.Cargo,
			ProfesorId: rel.ProfesorId,
			ComisionId: rel.ComisionId,
			Profesor: &models.ProfesorResponse{
				ID:       rel.Profesor.ID,
				Nombre:   rel.Profesor.Nombre,
				Apellido: rel.Profesor.Apellido,
				Legajo:   rel.Profesor.Legajo,
				Email:    rel.Profesor.Email,
			},
			Comision: &rel.Comision,
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *ProfesorXComisionService) UpdateProfesorXComision(id int, req *models.ProfesorXComisionUpdateRequest) (*models.ProfesorXComisionResponse, error) {
	var relacion models.ProfesorXComision
	if err := s.db.First(&relacion, id).Error; err != nil {
		return nil, err
	}

	// Actualizar solo los campos proporcionados
	if req.Cargo != nil {
		if *req.Cargo != models.CargoTitular && *req.Cargo != models.CargoAdjunto && *req.Cargo != models.CargoJTP {
			return nil, errors.New("cargo inválido")
		}
		relacion.Cargo = *req.Cargo
	}

	if req.ProfesorId != nil {
		// Verificar que el profesor existe
		var profesor models.Profesor
		if err := s.db.First(&profesor, *req.ProfesorId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("profesor no encontrado")
			}
			return nil, err
		}
		relacion.ProfesorId = *req.ProfesorId
	}

	if req.ComisionId != nil {
		// Verificar que la comision existe
		var comision models.Comision
		if err := s.db.First(&comision, *req.ComisionId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("comision no encontrada")
			}
			return nil, err
		}
		relacion.ComisionId = *req.ComisionId
	}

	// Verificar unicidad si se cambió profesor o comision
	if req.ProfesorId != nil || req.ComisionId != nil {
		var existing models.ProfesorXComision
		result := s.db.Where("profesor_id = ? AND comision_id = ? AND id != ?", relacion.ProfesorId, relacion.ComisionId, id).First(&existing)
		if result.Error == nil {
			return nil, errors.New("el profesor ya está asignado a esta comision")
		}
	}

	if err := s.db.Save(&relacion).Error; err != nil {
		return nil, err
	}

	// Cargar las relaciones para la respuesta
	if err := s.db.Preload("Profesor").Preload("Comision.Materia").First(&relacion, relacion.ID).Error; err != nil {
		return nil, err
	}

	response := &models.ProfesorXComisionResponse{
		ID:         relacion.ID,
		Cargo:      relacion.Cargo,
		ProfesorId: relacion.ProfesorId,
		ComisionId: relacion.ComisionId,
		Profesor: &models.ProfesorResponse{
			ID:       relacion.Profesor.ID,
			Nombre:   relacion.Profesor.Nombre,
			Apellido: relacion.Profesor.Apellido,
			Legajo:   relacion.Profesor.Legajo,
			Email:    relacion.Profesor.Email,
		},
		Comision: &relacion.Comision,
	}

	return response, nil
}

func (s *ProfesorXComisionService) DeleteProfesorXComision(id int) error {
	result := s.db.Delete(&models.ProfesorXComision{}, id)
	return result.Error
}
