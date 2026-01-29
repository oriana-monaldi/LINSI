package services

import (
	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

type NotificacionService struct {
	db *gorm.DB
}

func NewNotificacionService(db *gorm.DB) *NotificacionService {
	return &NotificacionService{db: db}
}

func (s *NotificacionService) GetAllNotificaciones() ([]models.NotificacionResponse, error) {
	var notificaciones []models.Notificacion
	result := s.db.Preload("Alumno").Find(&notificaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.NotificacionResponse, 0, len(notificaciones))
	for _, notificacion := range notificaciones {
		response := models.NotificacionResponse{
			ID:        notificacion.ID,
			Mensaje:   notificacion.Mensaje,
			FechaHora: notificacion.FechaHora,
			Leida:     notificacion.Leida,
			AlumnoID:  notificacion.AlumnoID,
			Alumno: models.AlumnoResponse{
				ID:       notificacion.Alumno.ID,
				Nombre:   notificacion.Alumno.Nombre,
				Apellido: notificacion.Alumno.Apellido,
				Legajo:   notificacion.Alumno.Legajo,
				Email:    notificacion.Alumno.Email,
			},
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *NotificacionService) GetNotificacionByID(id int) (*models.NotificacionResponse, error) {
	var notificacion models.Notificacion
	result := s.db.Preload("Alumno").First(&notificacion, id)
	if result.Error != nil {
		return nil, result.Error
	}

	response := &models.NotificacionResponse{
		ID:        notificacion.ID,
		Mensaje:   notificacion.Mensaje,
		FechaHora: notificacion.FechaHora,
		Leida:     notificacion.Leida,
		AlumnoID:  notificacion.AlumnoID,
		Alumno: models.AlumnoResponse{
			ID:       notificacion.Alumno.ID,
			Nombre:   notificacion.Alumno.Nombre,
			Apellido: notificacion.Alumno.Apellido,
			Legajo:   notificacion.Alumno.Legajo,
			Email:    notificacion.Alumno.Email,
		},
	}

	return response, nil
}

func (s *NotificacionService) GetNotificacionesByAlumnoID(alumnoID int) ([]models.NotificacionResponse, error) {
	var notificaciones []models.Notificacion
	result := s.db.Preload("Alumno").Where("alumno_id = ?", alumnoID).Find(&notificaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.NotificacionResponse, 0, len(notificaciones))
	for _, notificacion := range notificaciones {
		response := models.NotificacionResponse{
			ID:        notificacion.ID,
			Mensaje:   notificacion.Mensaje,
			FechaHora: notificacion.FechaHora,
			Leida:     notificacion.Leida,
			AlumnoID:  notificacion.AlumnoID,
			Alumno: models.AlumnoResponse{
				ID:       notificacion.Alumno.ID,
				Nombre:   notificacion.Alumno.Nombre,
				Apellido: notificacion.Alumno.Apellido,
				Legajo:   notificacion.Alumno.Legajo,
				Email:    notificacion.Alumno.Email,
			},
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *NotificacionService) GetUnreadNotificacionesByAlumnoID(alumnoID int) ([]models.NotificacionResponse, error) {
	var notificaciones []models.Notificacion
	result := s.db.Preload("Alumno").Where("alumno_id = ? AND leida = false", alumnoID).Find(&notificaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.NotificacionResponse, 0, len(notificaciones))
	for _, notificacion := range notificaciones {
		response := models.NotificacionResponse{
			ID:        notificacion.ID,
			Mensaje:   notificacion.Mensaje,
			FechaHora: notificacion.FechaHora,
			Leida:     notificacion.Leida,
			AlumnoID:  notificacion.AlumnoID,
			Alumno: models.AlumnoResponse{
				ID:       notificacion.Alumno.ID,
				Nombre:   notificacion.Alumno.Nombre,
				Apellido: notificacion.Alumno.Apellido,
				Legajo:   notificacion.Alumno.Legajo,
				Email:    notificacion.Alumno.Email,
			},
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *NotificacionService) GetReadNotificacionesByAlumnoID(alumnoID int) ([]models.NotificacionResponse, error) {
	var notificaciones []models.Notificacion
	result := s.db.Preload("Alumno").Where("alumno_id = ? AND leida = true", alumnoID).Find(&notificaciones)
	if result.Error != nil {
		return nil, result.Error
	}

	responses := make([]models.NotificacionResponse, 0, len(notificaciones))
	for _, notificacion := range notificaciones {
		response := models.NotificacionResponse{
			ID:        notificacion.ID,
			Mensaje:   notificacion.Mensaje,
			FechaHora: notificacion.FechaHora,
			Leida:     notificacion.Leida,
			AlumnoID:  notificacion.AlumnoID,
			Alumno: models.AlumnoResponse{
				ID:       notificacion.Alumno.ID,
				Nombre:   notificacion.Alumno.Nombre,
				Apellido: notificacion.Alumno.Apellido,
				Legajo:   notificacion.Alumno.Legajo,
				Email:    notificacion.Alumno.Email,
			},
		}
		responses = append(responses, response)
	}

	return responses, nil
}

func (s *NotificacionService) CreateNotificacion(notificacion *models.Notificacion) error {
	result := s.db.Create(notificacion)
	return result.Error
}

func (s *NotificacionService) MarkNotificacionAsRead(id int) error {
	var notificacion models.Notificacion
	result := s.db.First(&notificacion, id)
	if result.Error != nil {
		return result.Error
	}
	notificacion.Leida = true
	return s.db.Save(&notificacion).Error
}

func (s *NotificacionService) MarkAllNotificacionAsReadByAlumnoID(alumnoID int) error {
	result := s.db.Model(&models.Notificacion{}).Where("alumno_id = ?", alumnoID).Update("leida", true)
	return result.Error
}

func (s *NotificacionService) UpdateNotificacion(id int, updateRequest *models.NotificacionUpdateRequest) (*models.Notificacion, error) {
	var notificacion models.Notificacion
	result := s.db.First(&notificacion, id)
	if result.Error != nil {
		return nil, result.Error
	}

	if updateRequest.Mensaje != nil {
		notificacion.Mensaje = *updateRequest.Mensaje
	}
	if updateRequest.FechaHora != nil {
		notificacion.FechaHora = *updateRequest.FechaHora
	}
	if updateRequest.Leida != nil {
		notificacion.Leida = *updateRequest.Leida
	}
	if updateRequest.AlumnoID != nil {
		notificacion.AlumnoID = *updateRequest.AlumnoID
	}

	result = s.db.Save(&notificacion)
	if result.Error != nil {
		return nil, result.Error
	}
	return &notificacion, nil
}

func (s *NotificacionService) DeleteNotificacion(id int) error {
	result := s.db.Delete(&models.Notificacion{}, id)
	return result.Error
}
