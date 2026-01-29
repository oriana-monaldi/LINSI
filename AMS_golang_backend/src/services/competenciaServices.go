package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type CompetenciaService struct {
	db *gorm.DB
}

func NewCompetenciaService(db *gorm.DB) *CompetenciaService {
	return &CompetenciaService{db: db}
}

func (s *CompetenciaService) GetAllCompetencias() ([]models.Competencia, error) {
	var competencias []models.Competencia
	if err := s.db.Find(&competencias).Error; err != nil {
		return nil, err
	}
	return competencias, nil
}

func (s *CompetenciaService) GetCompetenciaByID(id int) (*models.Competencia, error) {
	var competencia models.Competencia
	if err := s.db.Preload("Tp").First(&competencia, id).Error; err != nil {
		return nil, err
	}
	return &competencia, nil
}

func (s *CompetenciaService) CreateCompetencia(competencia *models.Competencia) error {
	result := s.db.Create(competencia)
	return result.Error
}

func (s *CompetenciaService) UpdateCompetencia(id int, updateRequest *models.Competencia) (*models.Competencia, error) {
	var competencia models.Competencia
	result := s.db.First(&competencia, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.Nombre != "" {
		competencia.Nombre = updateRequest.Nombre
	}
	if updateRequest.Descripcion != "" {
		competencia.Descripcion = updateRequest.Descripcion
	}
	if updateRequest.TpId != 0 {
		competencia.TpId = updateRequest.TpId
	}

	if err := s.db.Save(&competencia).Error; err != nil {
		return nil, err
	}
	return &competencia, nil
}

func (s *CompetenciaService) DeleteCompetencia(id int) error {
	result := s.db.Delete(&models.Competencia{}, id)
	return result.Error
}