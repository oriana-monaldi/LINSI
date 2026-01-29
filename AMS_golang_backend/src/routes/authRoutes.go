package routes

import (
	"github.com/LINSITrack/backend/src/controllers"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(router *gin.Engine, service *services.AuthService) {
	authController := controllers.NewAuthController(service)

	auth := router.Group("/auth")
	{
		auth.POST("/login", authController.Login)
		auth.POST("/logout", middleware.AuthMiddleware(), authController.Logout)
		auth.GET("/whoami", middleware.AuthMiddleware(), authController.WhoAmI)
	}
}
