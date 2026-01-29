package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type ComisionService struct {
	db *gorm.DB
}

func NewComisionService(db *gorm.DB) *ComisionService {
	return &ComisionService{db: db}
}

func (s *ComisionService) GetAllComisiones() ([]models.Comision, error) {
	var comisiones []models.Comision
	result := s.db.Preload("Materia").Find(&comisiones)
	if result.Error != nil {
		return nil, result.Error
	}
	return comisiones, nil
}

func (s *ComisionService) GetComisionByID(id int) (*models.Comision, error) {
	var comision models.Comision
	result := s.db.Preload("Materia").First(&comision, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &comision, nil
}

func (s *ComisionService) GetComisionesByMateriaID(materiaID int) ([]models.Comision, error) {
    var comisiones []models.Comision
    result := s.db.Preload("Materia").Where("materia_id = ?", materiaID).Find(&comisiones)
    if result.Error != nil {
        return nil, result.Error
    }
    return comisiones, nil
}

func (s *ComisionService) CreateComision(comision *models.Comision) error {
	result := s.db.Create(comision)
	return result.Error
}

func (s *ComisionService) UpdateComision(id int, updateRequest *models.ComisionUpdateRequest) (*models.Comision, error) {
	var comision models.Comision
	result := s.db.First(&comision, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.Nombre != nil {
		comision.Nombre = *updateRequest.Nombre
	}
	if updateRequest.Horarios != nil {
		comision.Horarios = *updateRequest.Horarios
	}
	if updateRequest.MateriaId != nil {
		comision.MateriaId = *updateRequest.MateriaId
	}

	result = s.db.Save(&comision)
	if result.Error != nil {
		return nil, result.Error
	}
	return &comision, nil
}

func (s *ComisionService) DeleteComision(id int) error {
	result := s.db.Delete(&models.Comision{}, id)
	return result.Error
}