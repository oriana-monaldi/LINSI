package services

import (
	"errors"
	"time"

	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Login(email, password string) (string, error) {
	// Intentar login como profesor primero
	var profesor models.Profesor
	err := s.db.Where("email = ?", email).First(&profesor).Error
	if err == nil {
		// Es un profesor, verificar contraseña
		if err := bcrypt.CompareHashAndPassword([]byte(profesor.Password), []byte(password)); err == nil {
			return s.generateToken(profesor.ID, profesor.Nombre, profesor.Apellido, profesor.Email, profesor.Legajo, profesor.GetRole())
		}
		// Si encontró el profesor pero la contraseña es incorrecta, no continuar con admin
		return "", errors.New("credenciales inválidas")
	}

	// Intentar login como admin solo si no se encontró como profesor
	var admin models.Admin
	err = s.db.Where("email = ?", email).First(&admin).Error
	if err == nil {
		// Es un admin, verificar contraseña
		if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password)); err == nil {
			return s.generateToken(admin.ID, admin.Nombre, admin.Apellido, admin.Email, "", admin.GetRole())
		}
		return "", errors.New("credenciales inválidas")
	}

	// Intentar login como alumno primero
	var alumno models.Alumno
	err = s.db.Where("email = ?", email).First(&alumno).Error
	if err == nil {
		// Es un alumno, verificar contraseña
		if err := bcrypt.CompareHashAndPassword([]byte(alumno.Password), []byte(password)); err == nil {
			return s.generateToken(alumno.ID, alumno.Nombre, alumno.Apellido, alumno.Email, alumno.Legajo, alumno.GetRole())
		}
		// Si encontró el alumno pero la contraseña es incorrecta, no continuar con admin
		return "", errors.New("credenciales inválidas")
	}

	// No se encontró ni como profesor ni como admin
	return "", errors.New("credenciales inválidas")
}

func (s *AuthService) GetCurrentUser(userID interface{}, userEmail, userRole string, userName, userSurname, userLegajo interface{}) *models.WhoAmIResponse {
	response := &models.WhoAmIResponse{
		ID:    userID,
		Email: userEmail,
		Role:  userRole,
	}

	// Agregar campos opcionales si existen
	if userName != nil {
		if name, ok := userName.(string); ok {
			response.Nombre = &name
		}
	}
	if userSurname != nil {
		if surname, ok := userSurname.(string); ok {
			response.Apellido = &surname
		}
	}
	if userLegajo != nil {
		if legajo, ok := userLegajo.(string); ok {
			response.Legajo = &legajo
		}
	}

	return response
}

func (s *AuthService) generateToken(id int, nombre, apellido, email, legajo string, role models.Role) (string, error) {
	claims := jwt.MapClaims{
		"id":       id,
		"nombre":   nombre,
		"apellido": apellido,
		"email":    email,
		"role":     string(role),
		"exp":      jwt.NewNumericDate(time.Now().Add(24 * time.Hour)).Unix(),
	}

	// Agregar legajo solo si no está vacío (profesores)
	if legajo != "" {
		claims["legajo"] = legajo
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(middleware.GetSecretKey()))
}
