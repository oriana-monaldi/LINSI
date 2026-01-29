package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupProfesorXComisionRoutes(router *gin.Engine, service *services.ProfesorXComisionService) {
	controller := controllers.NewProfesorXComisionController(service)

	// Rutas admin
	adminOnly := router.Group("/profesor-comision")
	adminOnly.Use(middleware.AuthMiddleware())
	adminOnly.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnly.POST("/", controller.CreateProfesorXComision)
		adminOnly.GET("/", controller.GetAllProfesorXComision)
		adminOnly.GET("/:id", controller.GetProfesorXComisionByID)
		adminOnly.GET("/profesor/:profesorId", controller.GetComisionesByProfesorID)
		adminOnly.GET("/comision/:comisionId", controller.GetProfesoresByComisionID)
		adminOnly.PATCH("/:id", controller.UpdateProfesorXComision)
		adminOnly.DELETE("/:id", controller.DeleteProfesorXComision)
	}

	// Admin y profesor
	protected := router.Group("/profesor-comision")
	protected.Use(middleware.AuthMiddleware())
	protected.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		protected.GET("/mis-comisiones", controller.GetMisComisiones)
	}
}
