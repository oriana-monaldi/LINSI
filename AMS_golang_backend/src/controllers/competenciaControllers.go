package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type CompetenciaController struct {
	competenciaService *services.CompetenciaService
}

func NewCompetenciaController(competenciaService *services.CompetenciaService) *CompetenciaController {
	return &CompetenciaController{competenciaService: competenciaService}
}

func (c *CompetenciaController) GetAllCompetencias(ctx *gin.Context) {
	competencias, err := c.competenciaService.GetAllCompetencias()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, competencias)
}

func (c *CompetenciaController) GetCompetenciaByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	competencia, err := c.competenciaService.GetCompetenciaByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, competencia)
}

func (c *CompetenciaController) CreateCompetencia(ctx *gin.Context) {
	var competencia models.Competencia
	if err := ctx.ShouldBindJSON(&competencia); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.competenciaService.CreateCompetencia(&competencia); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, competencia)
}

func (c *CompetenciaController) UpdateCompetencia(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.Competencia
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateRequest.Nombre == "" && updateRequest.Descripcion == "" && updateRequest.TpId == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "At least one field must be provided for update"})
		return
	}

	if updateRequest.Descripcion != "" && len(updateRequest.Descripcion) < 10 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La descripcion debe tener al menos 10 caracteres"})
		return
	}

	if updateRequest.TpId != 0 {
		tp, err := c.competenciaService.GetCompetenciaByID(updateRequest.TpId)
		if err != nil || tp == nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "El TP asociado no existe"})
			return
		}
	}

	updatedCompetencia, err := c.competenciaService.UpdateCompetencia(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, updatedCompetencia)
}

func (c *CompetenciaController) DeleteCompetencia(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.competenciaService.DeleteCompetencia(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.Status(http.StatusNoContent)
}