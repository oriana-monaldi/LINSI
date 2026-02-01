package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupEvaluacionRoutes(router *gin.Engine, service *services.EvaluacionService) {
	evaluacionController := controllers.NewEvaluacionController(service)

	evaluaciones := router.Group("/evaluaciones")
	evaluaciones.Use(middleware.AuthMiddleware())
	{
		evaluaciones.GET("/", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), evaluacionController.GetAllEvaluaciones)
		evaluaciones.GET("/:id/entregas", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), evaluacionController.GetEntregasByEvaluacionID)
		evaluaciones.GET("/:id/entregas/:alumnoId", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), evaluacionController.GetEntregaEvaluacion)
		evaluaciones.PATCH("/:id/entregas/:alumnoId", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), evaluacionController.UpdateEntregaEvaluacion)
		evaluaciones.POST("/", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), evaluacionController.CreateEvaluacion)
		evaluaciones.GET("/comision/:comisionId", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), evaluacionController.GetEvaluacionesByComisionID)
		evaluaciones.GET("/:id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), evaluacionController.GetEvaluacionByID)
		evaluaciones.PATCH("/:id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), evaluacionController.UpdateEvaluacion)
		evaluaciones.DELETE("/:id", middleware.RequireRole(models.RoleAdmin), evaluacionController.DeleteEvaluacion)
	}

	// Profesor-specific endpoint at different path to avoid /:id conflict
	profesor := router.Group("/profesor")
	profesor.Use(middleware.AuthMiddleware())
	{
		profesor.GET("/evaluaciones", middleware.RequireRole(models.RoleProfesor), evaluacionController.GetMyEvaluaciones)
	}

	// Alumno-specific endpoint to get student's evaluation submissions
	alumno := router.Group("/alumno")
	alumno.Use(middleware.AuthMiddleware())
	{
		alumno.GET("/evaluaciones", middleware.RequireRole(models.RoleAlumno), evaluacionController.GetMyEvaluacionesAsAlumno)
	}

	// Admin endpoint for sync
	admin := router.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	{
		admin.POST("/sync-evaluaciones", middleware.RequireRole(models.RoleAdmin), evaluacionController.SyncEntregasEvaluaciones)
	}
}
