package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type ComisionController struct {
	comisionService *services.ComisionService
}

func NewComisionController(comisionService *services.ComisionService) *ComisionController {
	return &ComisionController{comisionService: comisionService}
}

func (c *ComisionController) GetAllComisiones(ctx *gin.Context) {
	comisiones, err := c.comisionService.GetAllComisiones()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, comisiones)
}

func (c *ComisionController) GetComisionByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	comision, err := c.comisionService.GetComisionByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, comision)
}

func (c *ComisionController) GetComisionesByMateriaID(ctx *gin.Context) {
	materiaID, err := strconv.Atoi(ctx.Param("materiaId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid materia ID"})
		return
	}

	comisiones, err := c.comisionService.GetComisionesByMateriaID(materiaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, comisiones)
}

func (c *ComisionController) CreateComision(ctx *gin.Context) {
	var comision models.Comision
	if err := ctx.ShouldBindJSON(&comision); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}
	if comision.Nombre == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el nombre de la comisión es obligatorio"})
		return
	}
	if comision.Horarios == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "los horarios de la comisión son obligatorios"})
		return
	}
	if comision.MateriaId == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la materia de la comisión es obligatoria"})
		return
	}
	if err := c.comisionService.CreateComision(&comision); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, comision)
}

func (c *ComisionController) UpdateComision(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.ComisionUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if updateRequest.Nombre != nil && *updateRequest.Nombre == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el nombre de la comisión no puede estar vacío"})
		return
	}
	if updateRequest.Horarios != nil && *updateRequest.Horarios == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "los horarios de la comisión no pueden estar vacíos"})
		return
	}
	comision, err := c.comisionService.UpdateComision(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, comision)
}

func (c *ComisionController) DeleteComision(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.comisionService.DeleteComision(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}