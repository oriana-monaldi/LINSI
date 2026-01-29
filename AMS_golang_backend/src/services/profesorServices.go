package services

import (
	"errors"
	"strings"

	"github.com/LINSITrack/backend/utils/validation"
	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type ProfesorService struct {
	db *gorm.DB
}

func NewProfesorService(db *gorm.DB) *ProfesorService {
	return &ProfesorService{db: db}
}

func (s *ProfesorService) CreateProfesor(profesor *models.Profesor) (*models.Profesor, error) {
	// Validaciones basicas
	if strings.TrimSpace(profesor.Nombre) == "" {
		return nil, errors.New("el nombre es requerido")
	}
	if strings.TrimSpace(profesor.Apellido) == "" {
		return nil, errors.New("el apellido es requerido")
	}
	if strings.TrimSpace(profesor.Legajo) == "" {
		return nil, errors.New("el legajo es requerido")
	}
	if strings.TrimSpace(profesor.Email) == "" {
		return nil, errors.New("el email es requerido")
	}
	if strings.TrimSpace(profesor.Password) == "" {
		return nil, errors.New("la contraseña es requerida")
	}
	if len(profesor.Password) < 8 {
		return nil, errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	// Validar unicidad contra todas las tablas
	if err := validation.ValidateEmailUniqueness(s.db, profesor.Email, "", ""); err != nil {
		return nil, err
	}
	if err := validation.ValidateLegajoUniqueness(s.db, profesor.Legajo, "", ""); err != nil {
		return nil, err
	}

	// Hasheo de password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(profesor.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	profesor.Password = string(hashedPassword)

	if err := s.db.Create(profesor).Error; err != nil {
		return nil, err
	}

	// Evitar retornar el password hasheado
	profesor.Password = ""

	return profesor, nil
}

func (s *ProfesorService) UpdateProfesor(id string, updatedData *models.ProfesorUpdateRequest) (*models.Profesor, error) {
	var profesor models.Profesor
	if err := s.db.First(&profesor, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// Solo actualizar campos que fueron proporcionados
	if updatedData.Nombre != nil {
		if strings.TrimSpace(*updatedData.Nombre) == "" {
			return nil, errors.New("el nombre no puede estar vacío")
		}
		profesor.Nombre = *updatedData.Nombre
	}

	if updatedData.Apellido != nil {
		if strings.TrimSpace(*updatedData.Apellido) == "" {
			return nil, errors.New("el apellido no puede estar vacío")
		}
		profesor.Apellido = *updatedData.Apellido
	}

	if updatedData.Legajo != nil {
		if strings.TrimSpace(*updatedData.Legajo) == "" {
			return nil, errors.New("el legajo no puede estar vacío")
		}
		// Validar unicidad de legajo contra todas las tablas
		if err := validation.ValidateLegajoUniqueness(s.db, *updatedData.Legajo, "profesor", id); err != nil {
			return nil, err
		}
		profesor.Legajo = *updatedData.Legajo
	}

	if updatedData.Email != nil {
		if strings.TrimSpace(*updatedData.Email) == "" {
			return nil, errors.New("el email no puede estar vacío")
		}
		// Validar unicidad de email contra todas las tablas
		if err := validation.ValidateEmailUniqueness(s.db, *updatedData.Email, "profesor", id); err != nil {
			return nil, err
		}
		profesor.Email = *updatedData.Email
	}

	if updatedData.Password != nil {
		if strings.TrimSpace(*updatedData.Password) == "" {
			return nil, errors.New("la contraseña no puede estar vacía")
		}
		if len(*updatedData.Password) < 8 {
			return nil, errors.New("la contraseña debe tener al menos 8 caracteres")
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*updatedData.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		profesor.Password = string(hashedPassword)
	}

	if err := s.db.Save(&profesor).Error; err != nil {
		return nil, err
	}

	// No devolver la contraseña
	profesor.Password = ""

	return &profesor, nil
}

func (s *ProfesorService) GetAllProfesores() ([]models.ProfesorResponse, error) {
	var profesores []models.Profesor
	result := s.db.Find(&profesores)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := make([]models.ProfesorResponse, 0, len(profesores))
	for _, p := range profesores {
		resp = append(resp, models.ProfesorResponse{
			ID:       p.ID,
			Nombre:   p.Nombre,
			Apellido: p.Apellido,
			Legajo:   p.Legajo,
			Email:    p.Email,
		})
	}
	return resp, nil
}

func (s *ProfesorService) GetProfesorByID(id int) (*models.ProfesorResponse, error) {
	var profesor models.Profesor
	result := s.db.First(&profesor, id)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := &models.ProfesorResponse{
		ID:       profesor.ID,
		Nombre:   profesor.Nombre,
		Apellido: profesor.Apellido,
		Legajo:   profesor.Legajo,
		Email:    profesor.Email,
	}
	return resp, nil
}

func (s *ProfesorService) DeleteProfesor(id string) error {
	result := s.db.Delete(&models.Profesor{}, "id = ?", id)
	return result.Error
}
