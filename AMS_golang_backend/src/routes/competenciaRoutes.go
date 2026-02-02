package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupCompetenciaRoutes(router *gin.Engine, service *services.CompetenciaService) {
	competenciaController := controllers.NewCompetenciaController(service)

	competenciasGroup := router.Group("/competencias")
	competenciasGroup.Use(middleware.AuthMiddleware())

	competenciasGroup.GET("/", middleware.RequireRole(models.RoleProfesor, models.RoleAlumno, models.RoleAdmin), competenciaController.GetAllCompetencias)
	competenciasGroup.GET("/:id", middleware.RequireRole(models.RoleProfesor, models.RoleAlumno, models.RoleAdmin), competenciaController.GetCompetenciaByID)
	competenciasGroup.GET("/comision/:comisionId", middleware.RequireRole(models.RoleProfesor, models.RoleAlumno, models.RoleAdmin), competenciaController.GetCompetenciasByComisionID)

	competenciasGroup.POST("/", middleware.RequireRole(models.RoleProfesor, models.RoleAdmin), competenciaController.CreateCompetencia)
	competenciasGroup.POST("/comision/:comisionId", middleware.RequireRole(models.RoleProfesor, models.RoleAdmin), competenciaController.CreateCompetenciaForComision)
	competenciasGroup.PATCH("/:id", middleware.RequireRole(models.RoleProfesor, models.RoleAdmin), competenciaController.UpdateCompetencia)

	competenciasGroup.DELETE("/:id", middleware.RequireRole(models.RoleAdmin), competenciaController.DeleteCompetencia)
}
