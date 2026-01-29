package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupAnexoRoutes(router *gin.Engine, service *services.AnexoService) {
	anexoController := controllers.NewAnexoController(service)

	// Rutas para administradores (acceso completo)
	adminOnlyAnexos := router.Group("/anexos")
	adminOnlyAnexos.Use(middleware.AuthMiddleware())
	adminOnlyAnexos.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyAnexos.GET("/", anexoController.GetAllAnexos)
		adminOnlyAnexos.GET("/:id", anexoController.GetAnexoByID)
		adminOnlyAnexos.POST("/", anexoController.CreateAnexo)
		adminOnlyAnexos.PATCH("/:id", anexoController.UpdateAnexo)
		adminOnlyAnexos.DELETE("/:id", anexoController.DeleteAnexo)
	}

	// Rutas para manejo de archivos (admin y profesores)
	anexoArchivoRoutes := router.Group("/anexos")
	anexoArchivoRoutes.Use(middleware.AuthMiddleware())
	anexoArchivoRoutes.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		anexoArchivoRoutes.POST("/:id/upload", anexoController.UploadAnexoArchivo)
		anexoArchivoRoutes.GET("/:id/archivos", anexoController.GetAnexoArchivosByAnexoID)
		anexoArchivoRoutes.GET("/:id/archivo/download", anexoController.DownloadAnexoArchivo)
		anexoArchivoRoutes.DELETE("/:id/archivos", anexoController.DeleteAnexoArchivo)
	}

	// Rutas para profesores (crear anexos y subir archivos)
	profesorAnexos := router.Group("/profesor/anexos")
	profesorAnexos.Use(middleware.AuthMiddleware())
	profesorAnexos.Use(middleware.RequireRole(models.RoleProfesor))
	{
		profesorAnexos.POST("/", anexoController.CreateAnexo)
		profesorAnexos.GET("/tp/:tp_id", anexoController.GetAnexosByTpID)
		profesorAnexos.GET("/:id", anexoController.GetAnexoByID)
		profesorAnexos.PATCH("/:id", anexoController.UpdateAnexo)
		profesorAnexos.DELETE("/:id", anexoController.DeleteAnexo)
		profesorAnexos.POST("/:id/upload", anexoController.UploadAnexoArchivo)
		profesorAnexos.GET("/:id/archivos", anexoController.GetAnexoArchivosByAnexoID)
		profesorAnexos.GET("/:id/archivo/download", anexoController.DownloadAnexoArchivo)
		profesorAnexos.DELETE("/:id/archivos", anexoController.DeleteAnexoArchivo)
	}

	// Rutas para alumnos (solo lectura de anexos y descarga)
	alumnoAnexos := router.Group("/alumno/anexos")
	alumnoAnexos.Use(middleware.AuthMiddleware())
	alumnoAnexos.Use(middleware.RequireRole(models.RoleAlumno))
	{
		alumnoAnexos.GET("/tp/:tp_id", anexoController.GetAnexosByTpID)
		alumnoAnexos.GET("/:id", anexoController.GetAnexoByID)
		alumnoAnexos.GET("/:id/archivos", anexoController.GetAnexoArchivosByAnexoID)
		alumnoAnexos.GET("/:id/archivo/download", anexoController.DownloadAnexoArchivo)
	}
}
