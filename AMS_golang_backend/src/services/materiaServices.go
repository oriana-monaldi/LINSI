package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type MateriaService struct {
	db *gorm.DB
}

func NewMateriaService(db *gorm.DB) *MateriaService {
	return &MateriaService{db: db}
}

func (s *MateriaService) GetAllMaterias() ([]models.Materia, error) {
	var materias []models.Materia
	result := s.db.Find(&materias)
	if result.Error != nil {
		return nil, result.Error
	}
	return materias, nil
}

func (s *MateriaService) GetMateriaByID(id int) (*models.Materia, error) {
	var materia models.Materia
	result := s.db.First(&materia, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &materia, nil
}

func (s *MateriaService) CreateMateria(materia *models.Materia) error {
	result := s.db.Create(materia)
	return result.Error
}

func (s *MateriaService) UpdateMateria(id int, updateRequest *models.MateriaUpdateRequest) (*models.Materia, error) {
	var materia models.Materia
	result := s.db.First(&materia, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.Nombre != nil {
		materia.Nombre = *updateRequest.Nombre
	}

	if updateRequest.AnoCarrera != nil {
		materia.AnoCarrera = *updateRequest.AnoCarrera
	}

	result = s.db.Save(&materia)
	if result.Error != nil {
		return nil, result.Error
	}

	return &materia, nil
}

func (s *MateriaService) DeleteMateria(id int) error {
	result := s.db.Delete(&models.Materia{}, id)
	return result.Error
}
