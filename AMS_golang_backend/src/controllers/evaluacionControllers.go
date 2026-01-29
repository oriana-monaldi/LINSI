package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type EvaluacionController struct {
	evaluacionService *services.EvaluacionService
}

func NewEvaluacionController(evaluacionService *services.EvaluacionService) *EvaluacionController {
	return &EvaluacionController{evaluacionService: evaluacionService}
}

func (c *EvaluacionController) GetAllEvaluaciones(ctx *gin.Context) {
	evaluaciones, err := c.evaluacionService.GetAllEvaluaciones()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, evaluaciones)
}

// GetMyEvaluaciones returns only evaluaciones for comisiones assigned to the current profesor
func (c *EvaluacionController) GetMyEvaluaciones(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	profesorID := int(userID.(float64))
	evaluaciones, err := c.evaluacionService.GetEvaluacionesByProfesorID(profesorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, evaluaciones)
}

func (c *EvaluacionController) GetEvaluacionByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	evaluacion, err := c.evaluacionService.GetEvaluacionByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, evaluacion)
}

func (c *EvaluacionController) GetEvaluacionesByComisionID(ctx *gin.Context) {
	comisionID, err := strconv.Atoi(ctx.Param("comisionId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comision ID"})
		return
	}

	evaluaciones, err := c.evaluacionService.GetEvaluacionesByComisionID(comisionID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, evaluaciones)
}

func (c *EvaluacionController) CreateEvaluacion(ctx *gin.Context) {
	var evaluacion models.EvaluacionModel
	if err := ctx.ShouldBindJSON(&evaluacion); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	// Validaciones requeridas
	if evaluacion.FechaEvaluacion == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la fecha de evaluación es obligatoria"})
		return
	}
	if evaluacion.FechaDevolucion == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la fecha de devolución es obligatoria"})
		return
	}
	if evaluacion.Temas == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "los temas de la evaluación son obligatorios"})
		return
	}
	if evaluacion.ComisionId == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la comisión es obligatoria"})
		return
	}

	if err := c.evaluacionService.CreateEvaluacion(&evaluacion); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, evaluacion)
}

func (c *EvaluacionController) UpdateEvaluacion(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.EvaluacionUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	// Validaciones para campos que no pueden estar vacíos si se envían
	if updateRequest.FechaEvaluacion != nil && *updateRequest.FechaEvaluacion == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la fecha de evaluación no puede estar vacía"})
		return
	}
	if updateRequest.FechaDevolucion != nil && *updateRequest.FechaDevolucion == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la fecha de devolución no puede estar vacía"})
		return
	}
	if updateRequest.Temas != nil && *updateRequest.Temas == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "los temas no pueden estar vacíos"})
		return
	}

	evaluacion, err := c.evaluacionService.UpdateEvaluacion(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, evaluacion)
}

func (c *EvaluacionController) DeleteEvaluacion(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.evaluacionService.DeleteEvaluacion(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}
