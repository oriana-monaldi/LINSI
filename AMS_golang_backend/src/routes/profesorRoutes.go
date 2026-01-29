package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupProfesoresRoutes(router *gin.Engine, service *services.ProfesorService) {
	profesorController := controllers.NewProfesorController(service)

	// Rutas protegidas (tanto profesores como admins pueden acceder)
	protectedProfesores := router.Group("/profesores")
	protectedProfesores.Use(middleware.AuthMiddleware())
	protectedProfesores.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		protectedProfesores.PATCH("/:id", profesorController.UpdateProfesor)
	}

	// Rutas exclusivas para administradores
	adminOnlyProfesores := router.Group("/profesores")
	adminOnlyProfesores.Use(middleware.AuthMiddleware())
	adminOnlyProfesores.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyProfesores.GET("/", profesorController.GetAllProfesores)
		adminOnlyProfesores.GET("/:id", profesorController.GetProfesorByID)
		adminOnlyProfesores.POST("/", profesorController.CreateProfesor)
		adminOnlyProfesores.DELETE("/:id", profesorController.DeleteProfesor)
	}
}
