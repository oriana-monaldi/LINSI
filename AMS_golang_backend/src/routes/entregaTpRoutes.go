package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupEntregaTPRoutes(router *gin.Engine, db *gorm.DB) {
	entregaTPController := controllers.NewEntregaTPController(db)

	entregas := router.Group("/entregas")
	entregas.Use(middleware.AuthMiddleware())
	{
		// Get all submissions (teachers/admin)
		entregas.GET("/", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), entregaTPController.GetAllEntregas)

		// Get submissions for a specific TP (teachers/admin)
		entregas.GET("/tp/:tp_id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor), entregaTPController.GetEntregasByTP)

		// Get student's own submissions (students)
		entregas.GET("/mis-entregas", middleware.RequireRole(models.RoleAlumno), entregaTPController.GetEntregasByAlumno)

		// Get specific submission by ID (all authenticated users, controller checks ownership for students)
		entregas.GET("/:id", middleware.RequireRole(models.RoleAdmin, models.RoleProfesor, models.RoleAlumno), entregaTPController.GetEntregaByID)

		// Create submission (students)
		entregas.POST("/", middleware.RequireRole(models.RoleAlumno), entregaTPController.CreateEntrega)

		// Upload a file for a TP (students) - returns archivo_url
		entregas.POST("/upload", middleware.RequireRole(models.RoleAlumno), entregaTPController.UploadArchivoForAlumno)

		// Update submission (students can resubmit, teachers can grade)
		entregas.PATCH("/:id", entregaTPController.UpdateEntrega)

		// Delete submission (admin only)
		entregas.DELETE("/:id", middleware.RequireRole(models.RoleAdmin), entregaTPController.DeleteEntrega)
	}
}
