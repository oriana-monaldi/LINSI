package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupTpRoutes(router *gin.Engine, service *services.TpService) {
	tpController := controllers.NewTpController(service)

	tps := router.Group("/tps")
	tps.Use(middleware.AuthMiddleware())
	{
		// Students can view TPs to see assignments
		tps.GET("/", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), tpController.GetAllTps)

		// Only teachers and admins can create/update/delete TPs
		tps.POST("/", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), tpController.CreateTp)
		tps.PATCH("/:id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), tpController.UpdateTp)
		tps.DELETE("/:id", middleware.RequireRole(models.RoleAdmin), tpController.DeleteTp)
		tps.GET("/:id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), tpController.GetTpByID)
	}

	// Profesor-specific endpoint at different path to avoid /:id conflict
	profesor := router.Group("/profesor")
	profesor.Use(middleware.AuthMiddleware())
	{
		profesor.GET("/tps", middleware.RequireRole(models.RoleProfesor), tpController.GetMyTps)
	}

	// Alumno-specific endpoint to get TPs for their comisiones
	alumno := router.Group("/alumno")
	alumno.Use(middleware.AuthMiddleware())
	{
		alumno.GET("/tps", middleware.RequireRole(models.RoleAlumno), tpController.GetMyTpsAsAlumno)
	}
}
