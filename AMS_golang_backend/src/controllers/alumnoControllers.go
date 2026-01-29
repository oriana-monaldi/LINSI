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

type AlumnoController struct {
	service *services.AlumnoService
}

func NewAlumnoController(service *services.AlumnoService) *AlumnoController {
	return &AlumnoController{service: service}
}

func (c *AlumnoController) UpdateAlumno(ctx *gin.Context) {
	id := ctx.Param("id")
	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo modifique su propia cuenta
	if userRole.(string) == string(models.RoleAlumno) {
		userIDStr := strconv.Itoa(int(userID.(float64)))
		if userIDStr != id {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes modificar tu propia cuenta"})
			return
		}
	}
	// Si es admin, puede modificar cualquier cuenta

	var updateReq models.AlumnoUpdateRequest

	if err := ctx.ShouldBindJSON(&updateReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedAlumno, err := c.service.UpdateAlumno(id, &updateReq)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "alumno no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if updatedAlumno == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "update returned nil"})
		return
	}

	ctx.JSON(http.StatusOK, updatedAlumno)
}

func (c *AlumnoController) GetAllAlumnos(ctx *gin.Context) {
	resp, err := c.service.GetAllAlumnos()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

func (c *AlumnoController) GetAlumnoByID(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}
	profResp, err := c.service.GetAlumnoByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "alumno no encontrado"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, profResp)
}

func (c *AlumnoController) CreateAlumno(ctx *gin.Context) {
	var createReq models.Alumno
	if err := ctx.ShouldBindJSON(&createReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	createdAlumno, err := c.service.CreateAlumno(&createReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, createdAlumno)
}

func (c *AlumnoController) DeleteAlumno(ctx *gin.Context) {
	idParam := ctx.Param("id")
	if err := c.service.DeleteAlumno(idParam); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "alumno eliminado exitosamente"})
}
