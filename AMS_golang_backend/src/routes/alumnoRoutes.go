package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupAlumnosRoutes(router *gin.Engine, service *services.AlumnoService) {
	alumnoController := controllers.NewAlumnoController(service)

	// Rutas protegidas (tanto alumnos como admins pueden acceder)
	protectedAlumnos := router.Group("/alumnos")
	protectedAlumnos.Use(middleware.AuthMiddleware())
	protectedAlumnos.Use(middleware.RequireRole(models.RoleAdmin, models.RoleAlumno))
	{
		protectedAlumnos.PATCH("/:id", alumnoController.UpdateAlumno)
	}

	// Rutas exclusivas para administradores
	adminOnlyAlumnos := router.Group("/alumnos")
	adminOnlyAlumnos.Use(middleware.AuthMiddleware())
	adminOnlyAlumnos.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyAlumnos.GET("/", alumnoController.GetAllAlumnos)
		adminOnlyAlumnos.GET("/:id", alumnoController.GetAlumnoByID)
		adminOnlyAlumnos.POST("/", alumnoController.CreateAlumno)
		adminOnlyAlumnos.DELETE("/:id", alumnoController.DeleteAlumno)
	}
}
