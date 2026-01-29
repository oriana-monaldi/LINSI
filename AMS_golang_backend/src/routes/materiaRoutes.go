package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupMateriasRoutes(router *gin.Engine, service *services.MateriaService) {
	materiaController := controllers.NewMateriaController(service)
	
	protectedMaterias := router.Group("/materias")
	protectedMaterias.Use(middleware.AuthMiddleware())
	protectedMaterias.Use(middleware.RequireRole(models.RoleAdmin, models.RoleProfesor))
	{
		protectedMaterias.GET("/", materiaController.GetAllMaterias)
		protectedMaterias.GET("/:id", materiaController.GetMateriaByID)
	}
	adminOnlyMaterias := router.Group("/materias")
	adminOnlyMaterias.Use(middleware.AuthMiddleware())
	adminOnlyMaterias.Use(middleware.RequireRole(models.RoleAdmin))
	{
		adminOnlyMaterias.POST("/", materiaController.CreateMateria)
		adminOnlyMaterias.PATCH("/:id", materiaController.UpdateMateria)
		adminOnlyMaterias.DELETE("/:id", materiaController.DeleteMateria)
	}
}