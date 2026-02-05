package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type MateriaCompetenciaService struct {
	db *gorm.DB
}

func NewMateriaCompetenciaService(db *gorm.DB) *MateriaCompetenciaService {
	return &MateriaCompetenciaService{db: db}
}

func (s *MateriaCompetenciaService) GetAllMateriasCompetencias() ([]models.MateriaCompetencia, error) {
	var competencias []models.MateriaCompetencia
	if err := s.db.Find(&competencias).Error; err != nil {
		return nil, err
	}
	return competencias, nil
}

func (s *MateriaCompetenciaService) GetMateriaCompetenciaByID(id int) (*models.MateriaCompetencia, error) {
	var competencia models.MateriaCompetencia
	if err := s.db.Preload("Materia").First(&competencia, id).Error; err != nil {
		return nil, err
	}
	return &competencia, nil
}

func (s *MateriaCompetenciaService) GetCompetenciasByMateriaID(materiaID int) ([]models.MateriaCompetencia, error) {
	var competencias []models.MateriaCompetencia
	if err := s.db.Preload("Materia").Where("materia_id = ?", materiaID).Find(&competencias).Error; err != nil {
		return nil, err
	}
	return competencias, nil
}

func (s *MateriaCompetenciaService) CreateMateriaCompetencia(competencia *models.MateriaCompetencia) error {
	result := s.db.Create(competencia)
	return result.Error
}

func (s *MateriaCompetenciaService) UpdateMateriaCompetencia(id int, updateRequest *models.MateriaCompetencia) (*models.MateriaCompetencia, error) {
	var competencia models.MateriaCompetencia
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
	if updateRequest.MateriaId != 0 {
		competencia.MateriaId = updateRequest.MateriaId
	}

	if err := s.db.Save(&competencia).Error; err != nil {
		return nil, err
	}
	return &competencia, nil
}

func (s *MateriaCompetenciaService) DeleteMateriaCompetencia(id int) error {
	result := s.db.Delete(&models.MateriaCompetencia{}, id)
	return result.Error
}
