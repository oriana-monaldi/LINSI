package services

import (
	"errors"
	"strings"

	"github.com/LINSITrack/backend/utils/validation"
	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AlumnoService struct {
	db *gorm.DB
}

func NewAlumnoService(db *gorm.DB) *AlumnoService {
	return &AlumnoService{db: db}
}

func (s *AlumnoService) CreateAlumno(alumno *models.Alumno) (*models.Alumno, error) {
	// Validaciones basicas
	if strings.TrimSpace(alumno.Nombre) == "" {
		return nil, errors.New("el nombre es requerido")
	}
	if strings.TrimSpace(alumno.Apellido) == "" {
		return nil, errors.New("el apellido es requerido")
	}
	if strings.TrimSpace(alumno.Legajo) == "" {
		return nil, errors.New("el legajo es requerido")
	}
	if strings.TrimSpace(alumno.Email) == "" {
		return nil, errors.New("el email es requerido")
	}
	if strings.TrimSpace(alumno.Password) == "" {
		return nil, errors.New("la contraseña es requerida")
	}
	if len(alumno.Password) < 8 {
		return nil, errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	// Validar unicidad contra todas las tablas
	if err := validation.ValidateEmailUniqueness(s.db, alumno.Email, "", ""); err != nil {
		return nil, err
	}
	if err := validation.ValidateLegajoUniqueness(s.db, alumno.Legajo, "", ""); err != nil {
		return nil, err
	}

	// Hasheo de password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(alumno.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	alumno.Password = string(hashedPassword)

	if err := s.db.Create(alumno).Error; err != nil {
		return nil, err
	}

	// Evitar retornar el password hasheado
	alumno.Password = ""

	return alumno, nil
}

func (s *AlumnoService) UpdateAlumno(id string, updatedData *models.AlumnoUpdateRequest) (*models.Alumno, error) {
	var alumno models.Alumno
	if err := s.db.First(&alumno, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// Solo actualizar campos que fueron proporcionados
	if updatedData.Nombre != nil {
		if strings.TrimSpace(*updatedData.Nombre) == "" {
			return nil, errors.New("el nombre no puede estar vacío")
		}
		alumno.Nombre = *updatedData.Nombre
	}

	if updatedData.Apellido != nil {
		if strings.TrimSpace(*updatedData.Apellido) == "" {
			return nil, errors.New("el apellido no puede estar vacío")
		}
		alumno.Apellido = *updatedData.Apellido
	}

	if updatedData.Legajo != nil {
		if strings.TrimSpace(*updatedData.Legajo) == "" {
			return nil, errors.New("el legajo no puede estar vacío")
		}
		// Validar unicidad de legajo contra todas las tablas
		if err := validation.ValidateLegajoUniqueness(s.db, *updatedData.Legajo, "alumno", id); err != nil {
			return nil, err
		}
		alumno.Legajo = *updatedData.Legajo
	}

	if updatedData.Email != nil {
		if strings.TrimSpace(*updatedData.Email) == "" {
			return nil, errors.New("el email no puede estar vacío")
		}
		// Validar unicidad de email contra todas las tablas
		if err := validation.ValidateEmailUniqueness(s.db, *updatedData.Email, "alumno", id); err != nil {
			return nil, err
		}
		alumno.Email = *updatedData.Email
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
		alumno.Password = string(hashedPassword)
	}

	if err := s.db.Save(&alumno).Error; err != nil {
		return nil, err
	}

	// No devolver la contraseña
	alumno.Password = ""

	return &alumno, nil
}

func (s *AlumnoService) GetAllAlumnos() ([]models.AlumnoResponse, error) {
	var Alumnos []models.Alumno
	result := s.db.Find(&Alumnos)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := make([]models.AlumnoResponse, 0, len(Alumnos))
	for _, p := range Alumnos {
		resp = append(resp, models.AlumnoResponse{
			ID:       p.ID,
			Nombre:   p.Nombre,
			Apellido: p.Apellido,
			Legajo:   p.Legajo,
			Email:    p.Email,
		})
	}
	return resp, nil
}

func (s *AlumnoService) GetAlumnoByID(id int) (*models.AlumnoResponse, error) {
	var alumno models.Alumno
	result := s.db.First(&alumno, id)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := &models.AlumnoResponse{
		ID:       alumno.ID,
		Nombre:   alumno.Nombre,
		Apellido: alumno.Apellido,
		Legajo:   alumno.Legajo,
		Email:    alumno.Email,
	}
	return resp, nil
}

func (s *AlumnoService) DeleteAlumno(id string) error {
	result := s.db.Delete(&models.Alumno{}, "id = ?", id)
	return result.Error
}
