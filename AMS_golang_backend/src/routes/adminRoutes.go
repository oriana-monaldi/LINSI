package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupAdminsRoutes(router *gin.Engine, service *services.AdminService) {
	adminController := controllers.NewAdminController(service)

	// Rutas solo para administradores
	protectedAdmins := router.Group("/admins")
	protectedAdmins.Use(middleware.AuthMiddleware())
    protectedAdmins.Use(middleware.RequireRole(models.RoleAdmin))
	{
		protectedAdmins.GET("/", adminController.GetAllAdmins)
		protectedAdmins.GET("/:id", adminController.GetAdminByID)
		protectedAdmins.POST("/", adminController.CreateAdmin)
		protectedAdmins.PATCH("/:id", adminController.UpdateAdmin)
		protectedAdmins.DELETE("/:id", adminController.DeleteAdmin)
	}

}
