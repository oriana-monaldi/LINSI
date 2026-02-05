package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupMateriaCompetenciaRoutes(router *gin.Engine, service *services.MateriaCompetenciaService) {
	materiaCompetenciaController := controllers.NewMateriaCompetenciaController(service)

	materiaCompetenciaRoutes := router.Group("/materia-competencias")
	materiaCompetenciaRoutes.Use(middleware.AuthMiddleware())
	{
		materiaCompetenciaRoutes.GET("/", materiaCompetenciaController.GetAllMateriasCompetencias)
		materiaCompetenciaRoutes.GET("/materia/:materiaId", materiaCompetenciaController.GetCompetenciasByMateriaID)
		materiaCompetenciaRoutes.POST("/materia/:materiaId", materiaCompetenciaController.CreateMateriaCompetencia)
		materiaCompetenciaRoutes.GET("/:id", materiaCompetenciaController.GetMateriaCompetenciaByID)
		materiaCompetenciaRoutes.PATCH("/:id", materiaCompetenciaController.UpdateMateriaCompetencia)
		materiaCompetenciaRoutes.DELETE("/:id", materiaCompetenciaController.DeleteMateriaCompetencia)
	}
}
