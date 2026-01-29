package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupEntregaRoutes(router *gin.Engine, service *services.EntregaService) {
	entregaController := controllers.NewEntregaController(service)

	// Rutas para administradores (acceso completo)
	adminOnlyEntregas := router.Group("/entregas")
	adminOnlyEntregas.Use(middleware.AuthMiddleware())
	adminOnlyEntregas.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyEntregas.GET("/", entregaController.GetAllEntregas)
		adminOnlyEntregas.GET("/:id", entregaController.GetEntregaByID)
		adminOnlyEntregas.POST("/", entregaController.CreateEntrega)
		adminOnlyEntregas.PATCH("/:id", entregaController.UpdateEntrega)
		adminOnlyEntregas.DELETE("/:id", entregaController.DeleteEntrega)
	}

	// Rutas para manejo de archivos (admin y profesores)
	archivoRoutes := router.Group("/entregas")
	archivoRoutes.Use(middleware.AuthMiddleware())
	archivoRoutes.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		archivoRoutes.POST("/:id/upload", entregaController.UploadArchivo)
		archivoRoutes.GET("/:id/archivos", entregaController.GetArchivosByEntregaID)
		archivoRoutes.GET("/:id/archivo/download", entregaController.DownloadArchivo)
		archivoRoutes.DELETE("/:id/archivos", entregaController.DeleteArchivo)
	}

	// Rutas adicionales para alumnos (solo lectura de sus propias entregas)
	alumnoEntregas := router.Group("/mis-entregas")
	alumnoEntregas.Use(middleware.AuthMiddleware())
	alumnoEntregas.Use(middleware.RequireRole(models.RoleAlumno))
	{
		alumnoEntregas.GET("/", entregaController.GetEntregasByAlumno)
		alumnoEntregas.GET("/:id", entregaController.GetEntregaByIDForAlumno)
		alumnoEntregas.GET("/:id/archivos", entregaController.GetArchivosByEntregaIDForAlumno)
		alumnoEntregas.GET("/:id/archivo/download", entregaController.DownloadArchivoForAlumno)
	}
}
