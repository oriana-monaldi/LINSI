package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type MateriaCompetenciaController struct {
	materiaCompetenciaService *services.MateriaCompetenciaService
}

func NewMateriaCompetenciaController(service *services.MateriaCompetenciaService) *MateriaCompetenciaController {
	return &MateriaCompetenciaController{materiaCompetenciaService: service}
}

func (c *MateriaCompetenciaController) GetAllMateriasCompetencias(ctx *gin.Context) {
	competencias, err := c.materiaCompetenciaService.GetAllMateriasCompetencias()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, competencias)
}

func (c *MateriaCompetenciaController) GetMateriaCompetenciaByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	competencia, err := c.materiaCompetenciaService.GetMateriaCompetenciaByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, competencia)
}

func (c *MateriaCompetenciaController) GetCompetenciasByMateriaID(ctx *gin.Context) {
	materiaID, err := strconv.Atoi(ctx.Param("materiaId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid materia ID"})
		return
	}

	competencias, err := c.materiaCompetenciaService.GetCompetenciasByMateriaID(materiaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, competencias)
}

func (c *MateriaCompetenciaController) CreateMateriaCompetencia(ctx *gin.Context) {
	materiaID, err := strconv.Atoi(ctx.Param("materiaId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid materia ID"})
		return
	}

	var competencia models.MateriaCompetencia
	if err := ctx.ShouldBindJSON(&competencia); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if competencia.Nombre == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}

	competencia.MateriaId = materiaID

	if err := c.materiaCompetenciaService.CreateMateriaCompetencia(&competencia); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, competencia)
}

func (c *MateriaCompetenciaController) UpdateMateriaCompetencia(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.MateriaCompetencia
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateRequest.Nombre == "" && updateRequest.Descripcion == "" && updateRequest.MateriaId == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "At least one field must be provided for update"})
		return
	}

	if updateRequest.Descripcion != "" && len(updateRequest.Descripcion) < 10 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La descripcion debe tener al menos 10 caracteres"})
		return
	}

	updatedCompetencia, err := c.materiaCompetenciaService.UpdateMateriaCompetencia(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, updatedCompetencia)
}

func (c *MateriaCompetenciaController) DeleteMateriaCompetencia(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.materiaCompetenciaService.DeleteMateriaCompetencia(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.Status(http.StatusNoContent)
}
