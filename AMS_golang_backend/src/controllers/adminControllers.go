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

type AdminController struct {
	service *services.AdminService
}

func NewAdminController(service *services.AdminService) *AdminController {
	return &AdminController{service: service}
}

func (c *AdminController) GetAllAdmins(ctx *gin.Context) {
	resp, err := c.service.GetAllAdmins()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

func (c *AdminController) GetAdminByID(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}
	profResp, err := c.service.GetAdminByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "admin no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, profResp)
}

func (c *AdminController) CreateAdmin(ctx *gin.Context) {
	var createReq models.Admin
	if err := ctx.ShouldBindJSON(&createReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	createdAdmin, err := c.service.CreateAdmin(&createReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, createdAdmin)
}

func (c *AdminController) UpdateAdmin(ctx *gin.Context) {
	id := ctx.Param("id")
	var updateReq models.AdminUpdateRequest

	if err := ctx.ShouldBindJSON(&updateReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedAdmin, err := c.service.UpdateAdmin(id, &updateReq)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "admin no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if updatedAdmin == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "update returned nil"})
		return
	}

	ctx.JSON(http.StatusOK, updatedAdmin)
}

func (c *AdminController) DeleteAdmin(ctx *gin.Context) {
	idParam := ctx.Param("id")
	if err := c.service.DeleteAdmin(idParam); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "admin eliminado exitosamente"})
}
