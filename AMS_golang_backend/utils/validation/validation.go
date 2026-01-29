package validation

import (
	"errors"
	"strings"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

// validateUniqueField es una función utilitaria interna que valida la unicidad
// de un campo en una tabla específica, permitiendo excluir un registro concreto.
// Esto evita repetir la lógica en todas las validaciones.
func validateUniqueField(db *gorm.DB, model interface{}, field string, value string, excludeID string) error {
	query := db.Where(field+" = ?", value)

	// Si se brinda excludeID, lo excluimos de la búsqueda (caso update)
	if excludeID != "" {
		query = query.Where("id <> ?", excludeID)
	}

	err := query.First(model).Error

	// Si encontró un registro, entonces no es único
	if err == nil {
		return errors.New("ya existe un registro con ese " + field)
	}

	// Ignoramos el caso "no encontrado" — es el comportamiento esperado
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return nil
}

// ValidateEmailUniqueness verifica que el email no exista en Admin, Profesor o Alumno.
// También permite excluir una tabla y un ID específico (caso update).
func ValidateEmailUniqueness(db *gorm.DB, email string, excludeTable string, excludeID string) error {
	// Validación mínima del email
	if email == "" {
		return errors.New("el email no puede estar vacío")
	}
	if !strings.Contains(email, "@") {
		return errors.New("el email no es válido")
	}

	// Normalizar para evitar falsos duplicados
	email = strings.TrimSpace(strings.ToLower(email))

	// Verificar en Admin
	if excludeTable != "admin" {
		if err := validateUniqueField(db, &models.Admin{}, "email", email, excludeID); err != nil {
			return err
		}
	}

	// Verificar en Profesor
	if excludeTable != "profesor" {
		if err := validateUniqueField(db, &models.Profesor{}, "email", email, excludeID); err != nil {
			return err
		}
	}

	// Verificar en Alumno
	if excludeTable != "alumno" {
		if err := validateUniqueField(db, &models.Alumno{}, "email", email, excludeID); err != nil {
			return err
		}
	}

	return nil
}

// ValidateLegajoUniqueness verifica que el legajo no exista en profesores ni alumnos.
// También permite excluir una tabla y un ID para operaciones de actualización.
func ValidateLegajoUniqueness(db *gorm.DB, legajo string, excludeTable string, excludeID string) error {
	if legajo == "" {
		return errors.New("el legajo no puede estar vacío")
	}

	// Normalizamos para evitar inconsistencias
	legajo = strings.TrimSpace(strings.ToUpper(legajo))

	// Verificar en Profesor
	if excludeTable != "profesor" {
		if err := validateUniqueField(db, &models.Profesor{}, "legajo", legajo, excludeID); err != nil {
			return err
		}
	}

	// Verificar en Alumno
	if excludeTable != "alumno" {
		if err := validateUniqueField(db, &models.Alumno{}, "legajo", legajo, excludeID); err != nil {
			return err
		}
	}

	return nil
}
