package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupComisionRoutes(router *gin.Engine, service *services.ComisionService) {
	comisionController := controllers.NewComisionController(service)

	// Routes for Admin and Profesor (read access)
	readComisiones := router.Group("/comisiones")
	readComisiones.Use(middleware.AuthMiddleware())
	readComisiones.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		readComisiones.GET("/", comisionController.GetAllComisiones)
		readComisiones.GET("/:id", comisionController.GetComisionByID)
		readComisiones.GET("/materia/:materiaId", comisionController.GetComisionesByMateriaID)
	}

	// Routes for Admin only (write access)
	adminOnlyComisiones := router.Group("/comisiones")
	adminOnlyComisiones.Use(middleware.AuthMiddleware())
	adminOnlyComisiones.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyComisiones.POST("/", comisionController.CreateComision)
		adminOnlyComisiones.PATCH("/:id", comisionController.UpdateComision)
		adminOnlyComisiones.DELETE("/:id", comisionController.DeleteComision)
	}
}