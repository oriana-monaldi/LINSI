package controllers

import (
	"net/http"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type CursadaController struct {
	cursadaService *services.CursadaService
}

func NewCursadaController(cursadaService *services.CursadaService) *CursadaController {
	return &CursadaController{cursadaService: cursadaService}
}

func (c *CursadaController) GetAllCursadas(ctx *gin.Context) {
	cursadas, err := c.cursadaService.GetAllCursadas()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, cursadas)
}

func (c *CursadaController) GetCursadaByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	cursada, err := c.cursadaService.GetCursadaByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, cursada)
}

func (c *CursadaController) GetCursadaByAlumnoID(ctx *gin.Context) {
	alumnoID, err := strconv.Atoi(ctx.Param("alumnoId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alumno ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar que solo acceda a sus propias cursadas
	if userRole.(string) == string(models.RoleAlumno) {
		userAlumnoID := int(userID.(float64))
		if alumnoID != userAlumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes acceder a tus propias cursadas"})
			return
		}
	}

	cursadas, err := c.cursadaService.GetCursadaByAlumnoID(alumnoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, cursadas)
}

func (c *CursadaController) CreateCursada(ctx *gin.Context) {
	var cursada models.Cursada
	if err := ctx.ShouldBindJSON(&cursada); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":  "datos invalidos",
			"detail": err.Error(),
		})
		return
	}
	if cursada.AnoLectivo <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El año lectivo debe ser un número positivo"})
		return
	}
	if cursada.NotaFinal < 0 || cursada.NotaFinal > 10 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota final debe estar entre 0 y 10"})
		return
	}
	if cursada.NotaConceptual < 0 || cursada.NotaConceptual > 10 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota conceptual debe estar entre 0 y 10"})
		return
	}
	if cursada.AlumnoID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El alumno asociado a la cursada es obligatorio"})
		return
	}
	if cursada.ComisionID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La comision asociada a la cursada es obligatoria"})
		return
	}
	if err := c.cursadaService.CreateCursada(&cursada); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, cursada)
}

func (c *CursadaController) UpdateCursada(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID, _ := ctx.Get("userID")
	userRole, _ := ctx.Get("userRole")

	// Si es alumno, verificar permisos especiales
	if userRole.(string) == string(models.RoleAlumno) {
		// Obtener la cursada para verificar que pertenece al alumno
		cursada, err := c.cursadaService.GetCursadaByID(id)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Verificar que la cursada pertenece al alumno que hace la request
		alumnoID := int(userID.(float64))
		if cursada.AlumnoID != alumnoID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "solo puedes modificar tus propias cursadas"})
			return
		}

		// Para alumnos, solo permitir modificación del feedback
		var alumnoUpdateRequest struct {
			Feedback *string `json:"feedback,omitempty"`
		}

		if err := ctx.ShouldBindJSON(&alumnoUpdateRequest); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "Datos inválidos",
				"details": err.Error(),
			})
			return
		}

		// Crear el request de actualización solo con feedback
		updateRequest := models.CursadaUpdateRequest{
			Feedback: alumnoUpdateRequest.Feedback,
		}

		cursadaUpdated, err := c.cursadaService.UpdateCursada(id, &updateRequest)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, cursadaUpdated)
		return
	}

	// Admin y Profesor
	var updateRequest models.CursadaUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if updateRequest.AnoLectivo != nil && *updateRequest.AnoLectivo <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El año lectivo debe ser un número positivo"})
		return
	}
	if updateRequest.NotaFinal != nil && (*updateRequest.NotaFinal < 0 || *updateRequest.NotaFinal > 10) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota final debe estar entre 0 y 10"})
		return
	}
	if updateRequest.NotaConceptual != nil && (*updateRequest.NotaConceptual < 0 || *updateRequest.NotaConceptual > 10) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "La nota conceptual debe estar entre 0 y 10"})
		return
	}
	if updateRequest.AlumnoID != nil && *updateRequest.AlumnoID <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El ID del alumno debe ser un número positivo"})
		return
	}
	if updateRequest.ComisionID != nil && *updateRequest.ComisionID <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El ID de la comisión debe ser un número positivo"})
		return
	}

	cursada, err := c.cursadaService.UpdateCursada(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, cursada)
}

func (c *CursadaController) DeleteCursada(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.cursadaService.DeleteCursada(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "cursada eliminada exitosamente"})
}

func (c *CursadaController) GetCursadasByProfesor(ctx *gin.Context) {
	// Obtener el ID del profesor desde el token JWT
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario no encontrado"})
		return
	}

	profesorID := int(userID.(float64))

	cursadas, err := c.cursadaService.GetCursadasByProfesorID(profesorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, cursadas)
}

func (c *CursadaController) GetCursadasByProfesorAndComision(ctx *gin.Context) {
	// Obtener el ID del profesor desde el token JWT
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario no encontrado"})
		return
	}

	profesorID := int(userID.(float64))

	// Obtener el ID de la comisión desde los parámetros de la URL
	comisionID, err := strconv.Atoi(ctx.Param("comisionId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de comisión inválido"})
		return
	}

	cursadas, err := c.cursadaService.GetCursadasByProfesorAndComision(profesorID, comisionID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, cursadas)
}