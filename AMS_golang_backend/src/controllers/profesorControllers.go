package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProfesorController struct {
	service *services.ProfesorService
}

func NewProfesorController(service *services.ProfesorService) *ProfesorController {
	return &ProfesorController{service: service}
}

func (c *ProfesorController) UpdateProfesor(ctx *gin.Context) {
	id := ctx.Param("id")
	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es profesor, verificar que solo modifique su propia cuenta
	if userRole.(string) == string(models.RoleProfesor) {
		userIDStr := strconv.Itoa(int(userID.(float64)))
		if userIDStr != id {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes modificar tu propia cuenta"})
			return
		}
	}
	// Si es admin, puede modificar cualquier cuenta

	var updateReq models.ProfesorUpdateRequest

	if err := ctx.ShouldBindJSON(&updateReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedProfesor, err := c.service.UpdateProfesor(id, &updateReq)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "profesor no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if updatedProfesor == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "update returned nil"})
		return
	}

	ctx.JSON(http.StatusOK, updatedProfesor)
}

func (c *ProfesorController) GetAllProfesores(ctx *gin.Context) {
	resp, err := c.service.GetAllProfesores()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

func (c *ProfesorController) GetProfesorByID(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}
	profResp, err := c.service.GetProfesorByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "profesor no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, profResp)
}

func (c *ProfesorController) CreateProfesor(ctx *gin.Context) {
	var createReq models.Profesor
	if err := ctx.ShouldBindJSON(&createReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	createdProfesor, err := c.service.CreateProfesor(&createReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, createdProfesor)
}

func (c *ProfesorController) DeleteProfesor(ctx *gin.Context) {
	idParam := ctx.Param("id")
	if err := c.service.DeleteProfesor(idParam); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "profesor eliminado exitosamente"})
}
