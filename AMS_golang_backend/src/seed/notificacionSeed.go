package seed

import (
	"log"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func NotificacionSeed(db *gorm.DB) {

	notificaciones := []struct {
		Mensaje   string
		FechaHora time.Time
		Leida     bool
		AlumnoID  int
	}{
		{
			Mensaje:   "Bienvenido al sistema LINSITrack",
			FechaHora: time.Now().AddDate(0, 0, -7),
			Leida:     false,
			AlumnoID:  1,
		},
		{
			Mensaje:   "Tu solicitud de proyecto ha sido aprobada",
			FechaHora: time.Now().AddDate(0, 0, -5),
			Leida:     true,
			AlumnoID:  2,
		},
		{
			Mensaje:   "Recordatorio: Entrega del proyecto final el 30/11",
			FechaHora: time.Now().AddDate(0, 0, -3),
			Leida:     false,
			AlumnoID:  3,
		},
		{
			Mensaje:   "Nueva actualización disponible en el sistema",
			FechaHora: time.Now().AddDate(0, 0, -2),
			Leida:     false,
			AlumnoID:  4,
		},
		{
			Mensaje:   "Tu informe de progreso ha sido revisado",
			FechaHora: time.Now().AddDate(0, 0, -1),
			Leida:     true,
			AlumnoID:  5,
		},
		{
			Mensaje:   "Reunión programada para mañana a las 10:00 AM",
			FechaHora: time.Now(),
			Leida:     false,
			AlumnoID:  6,
		},
	}

	for _, notifData := range notificaciones {
		// Verificar que el alumno existe por ID
		var alumno models.Alumno
		if err := db.Where("id = ?", notifData.AlumnoID).First(&alumno).Error; err != nil {
			log.Printf("Alumno with ID '%d' not found, skipping notification", notifData.AlumnoID)
			continue
		}

		// Verificar si la notificación ya existe (por mensaje y alumno)
		var existingNotif models.Notificacion
		result := db.Where("mensaje = ? AND alumno_id = ?", notifData.Mensaje, notifData.AlumnoID).First(&existingNotif)

		if result.Error == nil {
			log.Printf("Notification '%s' for alumno ID '%d' already exists", notifData.Mensaje, notifData.AlumnoID)
		} else {
			newNotificacion := models.Notificacion{
				Mensaje:   notifData.Mensaje,
				FechaHora: notifData.FechaHora,
				Leida:     notifData.Leida,
				AlumnoID:  notifData.AlumnoID,
			}

			if err := db.Create(&newNotificacion).Error; err != nil {
				log.Printf("Failed to create notification for alumno ID '%d': %v", notifData.AlumnoID, err)
			} else {
				log.Printf("Notification created successfully for alumno ID '%d'", notifData.AlumnoID)
			}
		}
	}

	// Log
	log.Println("Notificacion seed completed successfully")
}
