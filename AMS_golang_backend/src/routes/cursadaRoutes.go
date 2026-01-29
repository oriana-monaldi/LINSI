package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupCursadasRoutes(router *gin.Engine, service *services.CursadaService) {
	cursadaController := controllers.NewCursadaController(service)

	// Rutas para Admin y Profesor (GET, POST)
	adminProfesorCursadas := router.Group("/cursadas")
	adminProfesorCursadas.Use(middleware.AuthMiddleware())
	adminProfesorCursadas.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		adminProfesorCursadas.GET("", cursadaController.GetAllCursadas)
		adminProfesorCursadas.POST("", cursadaController.CreateCursada)
		adminProfesorCursadas.GET("/:id", cursadaController.GetCursadaByID)
	}
	
	// Ruta PATCH compartida para Admin, Profesor y Alumno
	cursadasPatch := router.Group("/cursadas")
	cursadasPatch.Use(middleware.AuthMiddleware())
	cursadasPatch.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno))
	{
		cursadasPatch.PATCH("/:id", cursadaController.UpdateCursada)
		cursadasPatch.GET("/alumno/:alumnoId", cursadaController.GetCursadaByAlumnoID)
	}

	// Rutas exclusivas para Admin (DELETE)
	adminOnlyCursadas := router.Group("/cursadas")
	adminOnlyCursadas.Use(middleware.AuthMiddleware())
	adminOnlyCursadas.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyCursadas.DELETE("/:id", cursadaController.DeleteCursada)
	}

	// Rutas exclusivas para Profesor
	profesorCursadas := router.Group("/cursadas")
	profesorCursadas.Use(middleware.AuthMiddleware())
	profesorCursadas.Use(middleware.RequireRole(models.RoleProfesor))
	{
		profesorCursadas.GET("/mis-comisiones", cursadaController.GetCursadasByProfesor)
		profesorCursadas.GET("/comision/:comisionId", cursadaController.GetCursadasByProfesorAndComision)
	}

}
