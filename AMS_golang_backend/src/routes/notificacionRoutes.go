package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupNotificacionRoutes(router *gin.Engine, service *services.NotificacionService) {
	notificacionController := controllers.NewNotificacionController(service)

	// Rutas para Admin solamente
	adminOnlyNotificaciones := router.Group("/notificaciones")
	adminOnlyNotificaciones.Use(middleware.AuthMiddleware())
	adminOnlyNotificaciones.Use(middleware.RequireRole(models.RoleAdmin))
	{
		// Rutas generales
		adminOnlyNotificaciones.GET("/", notificacionController.GetAllNotificaciones)
		adminOnlyNotificaciones.POST("/", notificacionController.CreateNotificacion)
		adminOnlyNotificaciones.GET("/:id", notificacionController.GetNotificacionByID)
		adminOnlyNotificaciones.PATCH("/:id", notificacionController.UpdateNotificacion)
		adminOnlyNotificaciones.DELETE("/:id", notificacionController.DeleteNotificacion)
	}

	// Rutas para Alumno (sus propias notificaciones)
	alumnoNotificaciones := router.Group("/notificaciones")
	alumnoNotificaciones.Use(middleware.AuthMiddleware())
	alumnoNotificaciones.Use(middleware.RequireRole(models.RoleAdmin, models.RoleAlumno))
	{
		// Rutas específicas de alumno
		alumnoNotificaciones.GET("/alumnos/:alumnoId", notificacionController.GetNotificacionesByAlumnoID)
		alumnoNotificaciones.GET("/alumnos/:alumnoId/unread", notificacionController.GetUnreadNotificacionesByAlumnoID)
		alumnoNotificaciones.GET("/alumnos/:alumnoId/read", notificacionController.GetReadNotificacionesByAlumnoID)

		// Acciones
		alumnoNotificaciones.PATCH("/:id/mark-read", notificacionController.MarkNotificacionAsRead)
		alumnoNotificaciones.PATCH("/alumnos/:alumnoId/mark-all-read", notificacionController.MarkAllNotificacionAsReadByAlumnoID)
	}
}
