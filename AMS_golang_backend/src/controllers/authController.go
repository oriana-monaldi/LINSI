package controllers

import (
	"net/http"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type AuthController struct {
	service *services.AuthService
}

func NewAuthController(service *services.AuthService) *AuthController {
	return &AuthController{service: service}
}

func (c *AuthController) Login(ctx *gin.Context) {
	var loginReq models.LoginRequest

	if err := ctx.ShouldBindJSON(&loginReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := c.service.Login(loginReq.Email, loginReq.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "credenciales inválidas"})
		return
	}

	c.setCookie(ctx, token)
}

func (c *AuthController) WhoAmI(ctx *gin.Context) {
	// Obtener los datos del contexto
	userID, _ := ctx.Get("userID")
	userEmail, _ := ctx.Get("userEmail")
	userRole, _ := ctx.Get("userRole")

	// Obtener otros claims si existen
	userName, _ := ctx.Get("userName")
	userSurname, _ := ctx.Get("userSurname")
	userLegajo, _ := ctx.Get("userLegajo")

	// Usar el servicio para generar la respuesta
	user := c.service.GetCurrentUser(userID, userEmail.(string), userRole.(string), userName, userSurname, userLegajo)

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Usuario autenticado",
		"user":    user,
	})
}

func (c *AuthController) Logout(ctx *gin.Context) {
	ctx.SetSameSite(http.SameSiteLaxMode)
	ctx.SetCookie("jwt", "", -1, "/", "", false, true)
	ctx.JSON(http.StatusOK, gin.H{"message": "Logout successful"})
}

func (c *AuthController) setCookie(ctx *gin.Context, token string) {
	ctx.SetSameSite(http.SameSiteLaxMode)

	ctx.SetCookie(
		"jwt",
		token,
		3600*24, // 1 día
		"/",
		"",
		false,
		true,
	)

	ctx.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}
