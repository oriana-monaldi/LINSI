package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type MateriaController struct {
	materiaService *services.MateriaService
}

func NewMateriaController(materiaService *services.MateriaService) *MateriaController {
	return &MateriaController{materiaService: materiaService}
}

func (c *MateriaController) GetAllMaterias(ctx *gin.Context) {
	materias, err := c.materiaService.GetAllMaterias()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, materias)
}

func (c *MateriaController) GetMateriaByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	materia, err := c.materiaService.GetMateriaByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, materia)
}

func (c *MateriaController) CreateMateria(ctx *gin.Context) {
	var materia models.Materia
	if err := ctx.ShouldBindJSON(&materia); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if materia.Nombre == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el nombre de la materia es obligatorio"})
		return
	}

	if materia.AnoCarrera < 1 || materia.AnoCarrera > 5 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el año de carrera debe estar entre 1 y 5"})
		return
	}

	if err := c.materiaService.CreateMateria(&materia); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, materia)
}

func (c *MateriaController) UpdateMateria(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.MateriaUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if updateRequest.Nombre != nil && *updateRequest.Nombre == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El nombre de la materia no puede estar vacío"})
		return
	}

	if updateRequest.AnoCarrera != nil && (*updateRequest.AnoCarrera < 1 || *updateRequest.AnoCarrera > 5) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El año de carrera debe estar entre 1 y 5"})
		return
	}

	materia, err := c.materiaService.UpdateMateria(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, materia)
}

func (c *MateriaController) DeleteMateria(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.materiaService.DeleteMateria(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}
