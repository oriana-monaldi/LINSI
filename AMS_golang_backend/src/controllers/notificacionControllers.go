package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type NotificacionController struct {
	notificacionService *services.NotificacionService
}

func NewNotificacionController(notificacionService *services.NotificacionService) *NotificacionController {
	return &NotificacionController{notificacionService: notificacionService}
}

func (c *NotificacionController) GetAllNotificaciones(ctx *gin.Context) {
	notificaciones, err := c.notificacionService.GetAllNotificaciones()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificaciones)
}

func (c *NotificacionController) GetNotificacionByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	notificacion, err := c.notificacionService.GetNotificacionByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificacion)
}

func (c *NotificacionController) GetNotificacionesByAlumnoID(ctx *gin.Context) {
	alumnoID, err := strconv.Atoi(ctx.Param("alumnoId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alumno ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo acceda a sus propias notificaciones
	if userRole.(string) == string(models.RoleAlumno) {
		userAlumnoID := int(userID.(float64))
		if alumnoID != userAlumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes acceder a tus propias notificaciones"})
			return
		}
	}

	notificaciones, err := c.notificacionService.GetNotificacionesByAlumnoID(alumnoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificaciones)
}

func (c *NotificacionController) GetUnreadNotificacionesByAlumnoID(ctx *gin.Context) {
	alumnoID, err := strconv.Atoi(ctx.Param("alumnoId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alumno ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo acceda a sus propias notificaciones
	if userRole.(string) == string(models.RoleAlumno) {
		userAlumnoID := int(userID.(float64))
		if alumnoID != userAlumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes acceder a tus propias notificaciones"})
			return
		}
	}

	notificaciones, err := c.notificacionService.GetUnreadNotificacionesByAlumnoID(alumnoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificaciones)
}

func (c *NotificacionController) GetReadNotificacionesByAlumnoID(ctx *gin.Context) {
	alumnoID, err := strconv.Atoi(ctx.Param("alumnoId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alumno ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo acceda a sus propias notificaciones
	if userRole.(string) == string(models.RoleAlumno) {
		userAlumnoID := int(userID.(float64))
		if alumnoID != userAlumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes acceder a tus propias notificaciones"})
			return
		}
	}

	notificaciones, err := c.notificacionService.GetReadNotificacionesByAlumnoID(alumnoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificaciones)
}

func (c *NotificacionController) MarkNotificacionAsRead(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.notificacionService.MarkNotificacionAsRead(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Notificación marcada como leída"})
}

func (c *NotificacionController) MarkAllNotificacionAsReadByAlumnoID(ctx *gin.Context) {
	alumnoID, err := strconv.Atoi(ctx.Param("alumnoId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alumno ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo acceda a sus propias notificaciones
	if userRole.(string) == string(models.RoleAlumno) {
		userAlumnoID := int(userID.(float64))
		if alumnoID != userAlumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes modificar tus propias notificaciones"})
			return
		}
	}

	if err := c.notificacionService.MarkAllNotificacionAsReadByAlumnoID(alumnoID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Todas las notificaciones marcadas como leídas"})
}

func (c *NotificacionController) CreateNotificacion(ctx *gin.Context) {
	var notificacion models.Notificacion
	if err := ctx.ShouldBindJSON(&notificacion); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}
	if notificacion.Mensaje == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El mensaje es obligatorio"})
		return
	}
	if notificacion.AlumnoID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El ID del alumno es obligatorio"})
		return
	}
	notificacion.Leida = false // Toda notificación nueva es no leída por defecto
	if notificacion.FechaHora.IsZero() {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La fecha y hora son obligatorias"})
		return
	}
	if err := c.notificacionService.CreateNotificacion(&notificacion); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, notificacion)
}

func (c *NotificacionController) UpdateNotificacion(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.NotificacionUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if updateRequest.Mensaje != nil && *updateRequest.Mensaje == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El mensaje no puede estar vacío"})
		return
	}
	notificacion, err := c.notificacionService.UpdateNotificacion(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificacion)
}

func (c *NotificacionController) DeleteNotificacion(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.notificacionService.DeleteNotificacion(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Notificación eliminada correctamente"})
}