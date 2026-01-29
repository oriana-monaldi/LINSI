package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type TpController struct {
	tpService *services.TpService
}

func NewTpController(tpService *services.TpService) *TpController {
	return &TpController{tpService: tpService}
}

func (c *TpController) GetAllTps(ctx *gin.Context) {
	tps, err := c.tpService.GetAllTps()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tps)
}

// GetMyTps returns only TPs for comisiones assigned to the current profesor
func (c *TpController) GetMyTps(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	profesorID := int(userID.(float64))
	tps, err := c.tpService.GetTpsByProfesorID(profesorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tps)
}

func (c *TpController) GetTpByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	tp, err := c.tpService.GetTpByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tp)
}

func (c *TpController) CreateTp(ctx *gin.Context) {
	var tp models.TpModel
	if err := ctx.ShouldBindJSON(&tp); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.tpService.CreateTp(&tp); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, tp)
}

func (c *TpController) UpdateTp(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.TpUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateRequest.Nota != nil && (*updateRequest.Nota < 0 || *updateRequest.Nota > 10) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota debe estar entre 0 y 10"})
		return
	}

	if updateRequest.FechaHoraEntrega != nil {
		if updateRequest.FechaHoraEntrega.Before(time.Now().Add(-24 * time.Hour)) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "La fecha de entrega no puede ser en el pasado"})
			return
		}
	}

	if updateRequest.Consigna != nil && *updateRequest.Consigna == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La consigna no puede estar vacía"})
		return
	}

	if updateRequest.Nota != nil && *updateRequest.Nota < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota no puede ser negativa"})
		return
	}

	if updateRequest.Devolucion != nil && *updateRequest.Devolucion == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La devolución no puede estar vacía"})
		return
	}

	if updateRequest.ComisionId != nil && *updateRequest.ComisionId <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El ID de la comisión debe ser un entero positivo"})
		return
	}

	updatedTp, err := c.tpService.UpdateTp(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, updatedTp)
}

func (c *TpController) DeleteTp(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.tpService.DeleteTp(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}