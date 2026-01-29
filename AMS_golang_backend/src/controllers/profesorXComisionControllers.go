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

type ProfesorXComisionController struct {
	service *services.ProfesorXComisionService
}

func NewProfesorXComisionController(service *services.ProfesorXComisionService) *ProfesorXComisionController {
	return &ProfesorXComisionController{service: service}
}

func (c *ProfesorXComisionController) CreateProfesorXComision(ctx *gin.Context) {
	var req models.ProfesorXComisionCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := c.service.CreateProfesorXComision(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, response)
}

func (c *ProfesorXComisionController) GetAllProfesorXComision(ctx *gin.Context) {
	responses, err := c.service.GetAllProfesorXComision()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, responses)
}

func (c *ProfesorXComisionController) GetProfesorXComisionByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	response, err := c.service.GetProfesorXComisionByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "relación no encontrada"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *ProfesorXComisionController) GetComisionesByProfesorID(ctx *gin.Context) {
	profesorID, err := strconv.Atoi(ctx.Param("profesorId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de profesor inválido"})
		return
	}

	responses, err := c.service.GetComisionesByProfesorID(profesorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, responses)
}

func (c *ProfesorXComisionController) GetProfesoresByComisionID(ctx *gin.Context) {
	comisionID, err := strconv.Atoi(ctx.Param("comisionId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de comisión inválido"})
		return
	}

	responses, err := c.service.GetProfesoresByComisionID(comisionID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, responses)
}

func (c *ProfesorXComisionController) GetMisComisiones(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario no encontrado"})
		return
	}

	profesorID := int(userID.(float64))
	responses, err := c.service.GetComisionesByProfesorID(profesorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, responses)
}

func (c *ProfesorXComisionController) UpdateProfesorXComision(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req models.ProfesorXComisionUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := c.service.UpdateProfesorXComision(id, &req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "relación no encontrada"})
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *ProfesorXComisionController) DeleteProfesorXComision(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := c.service.DeleteProfesorXComision(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "relación eliminada exitosamente"})
}
