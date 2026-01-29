package services

import (
	"errors"
	"strings"

	"github.com/LINSITrack/backend/utils/validation"
	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminService struct {
	db *gorm.DB
}

func NewAdminService(db *gorm.DB) *AdminService {
	return &AdminService{db: db}
}

func (s *AdminService) GetAllAdmins() ([]models.AdminResponse, error) {
	var admins []models.Admin
	result := s.db.Find(&admins)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := make([]models.AdminResponse, 0, len(admins))
	for _, a := range admins {
		resp = append(resp, models.AdminResponse{
			ID:       a.ID,
			Nombre:   a.Nombre,
			Apellido: a.Apellido,
			Email:    a.Email,
		})
	}
	return resp, nil
}

func (s *AdminService) GetAdminByID(id int) (*models.AdminResponse, error) {
	var admin models.Admin
	result := s.db.First(&admin, id)
	if result.Error != nil {
		return nil, result.Error
	}
	resp := &models.AdminResponse{
		ID:       admin.ID,
		Nombre:   admin.Nombre,
		Apellido: admin.Apellido,
		Email:    admin.Email,
	}
	return resp, nil
}

func (s *AdminService) CreateAdmin(admin *models.Admin) (*models.Admin, error) {
	// Validaciones basicas
	if strings.TrimSpace(admin.Nombre) == "" {
		return nil, errors.New("el nombre es requerido")
	}
	if strings.TrimSpace(admin.Apellido) == "" {
		return nil, errors.New("el apellido es requerido")
	}
	if strings.TrimSpace(admin.Email) == "" {
		return nil, errors.New("el email es requerido")
	}
	if strings.TrimSpace(admin.Password) == "" {
		return nil, errors.New("la contraseña es requerida")
	}
	if len(admin.Password) < 8 {
		return nil, errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	// Validar unicidad de email contra todas las tablas
	if err := validation.ValidateEmailUniqueness(s.db, admin.Email, "", ""); err != nil {
		return nil, err
	}

	// Hasheo de password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	admin.Password = string(hashedPassword)

	if err := s.db.Create(admin).Error; err != nil {
		return nil, err
	}

	// Evitar retornar el password hasheado
	admin.Password = ""

	return admin, nil
}

func (s *AdminService) UpdateAdmin(id string, updatedData *models.AdminUpdateRequest) (*models.Admin, error) {
	var admin models.Admin
	if err := s.db.First(&admin, "id = ?", id).Error; err != nil {
		return nil, err
	}

	// Solo actualizar campos que fueron proporcionados
	if updatedData.Nombre != nil {
		if strings.TrimSpace(*updatedData.Nombre) == "" {
			return nil, errors.New("el nombre no puede estar vacío")
		}
		admin.Nombre = *updatedData.Nombre
	}

	if updatedData.Apellido != nil {
		if strings.TrimSpace(*updatedData.Apellido) == "" {
			return nil, errors.New("el apellido no puede estar vacío")
		}
		admin.Apellido = *updatedData.Apellido
	}

	if updatedData.Email != nil {
		if strings.TrimSpace(*updatedData.Email) == "" {
			return nil, errors.New("el email no puede estar vacío")
		}
		// Validar unicidad de email contra todas las tablas
		if err := validation.ValidateEmailUniqueness(s.db, *updatedData.Email, "admin", id); err != nil {
			return nil, err
		}
		admin.Email = *updatedData.Email
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
		admin.Password = string(hashedPassword)
	}

	if err := s.db.Save(&admin).Error; err != nil {
		return nil, err
	}

	// No devolver la contraseña
	admin.Password = ""

	return &admin, nil
}

func (s *AdminService) DeleteAdmin(id string) error {
	result := s.db.Delete(&models.Admin{}, "id = ?", id)
	return result.Error
}
