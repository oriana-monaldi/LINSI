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

func (s *CompetenciaService) GetCompetenciasByComisionID(comisionID int) ([]models.Competencia, error) {
	var tpIds []int
	if err := s.db.Model(&models.TpModel{}).Where("comision_id = ?", comisionID).Pluck("id", &tpIds).Error; err != nil {
		return nil, err
	}
	if len(tpIds) == 0 {
		return []models.Competencia{}, nil
	}

	var competencias []models.Competencia
	if err := s.db.Preload("Tp").Where("tp_id IN ?", tpIds).Find(&competencias).Error; err != nil {
		return nil, err
	}
	return competencias, nil
}

func (s *CompetenciaService) CreateCompetencia(competencia *models.Competencia) error {
	result := s.db.Create(competencia)
	return result.Error
}

func (s *CompetenciaService) CreateCompetenciaForComision(comisionID int, nombre string, descripcion string) (*models.Competencia, error) {
	var tp models.TpModel
	if err := s.db.Where("comision_id = ?", comisionID).Order("id").First(&tp).Error; err != nil {
		return nil, err
	}
	competencia := models.Competencia{
		Nombre:      nombre,
		Descripcion: descripcion,
		TpId:        tp.ID,
	}
	if err := s.db.Create(&competencia).Error; err != nil {
		return nil, err
	}
	return &competencia, nil
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