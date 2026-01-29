package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type EntregaController struct {
	entregaService *services.EntregaService
}

func NewEntregaController(entregaService *services.EntregaService) *EntregaController {
	return &EntregaController{entregaService: entregaService}
}

func (c *EntregaController) GetAllEntregas(ctx *gin.Context) {
	entregas, err := c.entregaService.GetAllEntregas()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, entregas)
}

func (c *EntregaController) GetEntregaByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	entrega, err := c.entregaService.GetEntregaByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, entrega)
}

func (c *EntregaController) CreateEntrega(ctx *gin.Context) {
	var entrega models.Entrega
	if err := ctx.ShouldBindJSON(&entrega); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if entrega.FechaHora == "" {
		// Si no se proporciona fecha, usar la actual
		entrega.FechaHora = time.Now().Format("2006-01-02 15:04:05")
	}

	if entrega.AlumnoID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el ID del alumno es obligatorio"})
		return
	}

	if entrega.TpID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "el ID del TP es obligatorio"})
		return
	}

	if err := c.entregaService.CreateEntrega(&entrega); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, entrega)
}

func (c *EntregaController) UpdateEntrega(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var updateRequest models.EntregaUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"details": err.Error(),
		})
		return
	}

	if updateRequest.FechaHora != nil && *updateRequest.FechaHora == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "la fecha y hora no pueden estar vacías"})
		return
	}

	entrega, err := c.entregaService.UpdateEntrega(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, entrega)
}

func (c *EntregaController) DeleteEntrega(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.entregaService.DeleteEntrega(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}

func (c *EntregaController) UploadArchivo(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Verificar que la entrega existe
	_, err = c.entregaService.GetEntregaByID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Entrega no encontrada"})
		return
	}

	// Obtener el archivo del request
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "No se pudo obtener el archivo",
			"details": err.Error(),
		})
		return
	}

	// Validaciones básicas del archivo
	if file.Size == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El archivo está vacío"})
		return
	}

	// Límite de tamaño (ejemplo: 50MB)
	maxSize := int64(50 * 1024 * 1024) // 50MB
	if file.Size > maxSize {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El archivo es demasiado grande (máximo 50MB)"})
		return
	}

	// Guardar archivo
	archivo, err := c.entregaService.SaveFile(file, entregaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al guardar el archivo",
			"details": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Archivo subido exitosamente",
		"archivo": archivo,
	})
}

func (c *EntregaController) DeleteArchivo(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Obtener todos los archivos de la entrega y eliminarlos
	archivos, err := c.entregaService.GetArchivosByEntregaID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(archivos) == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No hay archivos para eliminar en esta entrega"})
		return
	}

	// Eliminar todos los archivos de la entrega
	for _, archivo := range archivos {
		if err := c.entregaService.DeleteArchivoByID(archivo.ID); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":             "Todos los archivos eliminados exitosamente",
		"archivos_eliminados": len(archivos),
	})
}

func (c *EntregaController) GetArchivosByEntregaID(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	archivos, err := c.entregaService.GetArchivosByEntregaID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, archivos)
}

func (c *EntregaController) DownloadArchivo(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Obtener el archivo principal de la entrega
	archivo, err := c.entregaService.GetPrimaryArchivoByEntregaID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No hay archivos asociados a esta entrega"})
		return
	}

	// Verificar que el archivo físico existe
	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.Header("Content-Disposition", "attachment; filename="+archivo.OriginalName)
	ctx.Header("Content-Type", archivo.ContentType)
	ctx.File(archivo.FilePath)
}

// GetEntregasByAlumno - Obtiene todas las entregas del alumno logueado
func (c *EntregaController) GetEntregasByAlumno(ctx *gin.Context) {
	// Obtener el ID del usuario logueado del contexto
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	alumnoID, ok := userID.(float64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener ID de usuario"})
		return
	}

	entregas, err := c.entregaService.GetEntregasByAlumnoID(int(alumnoID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, entregas)
}

// GetEntregaByIDForAlumno - Obtiene una entrega específica del alumno logueado
func (c *EntregaController) GetEntregaByIDForAlumno(ctx *gin.Context) {
	// Obtener el ID de la entrega de los parámetros
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Obtener el ID del usuario logueado del contexto
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	alumnoID, ok := userID.(float64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener ID de usuario"})
		return
	}

	entrega, err := c.entregaService.GetEntregaByIDAndAlumnoID(entregaID, int(alumnoID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Entrega no encontrada o no pertenece al usuario"})
		return
	}
	ctx.JSON(http.StatusOK, entrega)
}

// GetArchivosByEntregaIDForAlumno - Obtiene archivos de una entrega específica del alumno logueado
func (c *EntregaController) GetArchivosByEntregaIDForAlumno(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Obtener el ID del usuario logueado del contexto
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	alumnoID, ok := userID.(float64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener ID de usuario"})
		return
	}

	// Verificar que la entrega pertenece al alumno
	_, err = c.entregaService.GetEntregaByIDAndAlumnoID(entregaID, int(alumnoID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Entrega no encontrada o no pertenece al usuario"})
		return
	}

	// Si la entrega es del alumno, obtener los archivos
	archivos, err := c.entregaService.GetArchivosByEntregaID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, archivos)
}

// DownloadArchivoForAlumno - Descarga archivo de una entrega específica del alumno logueado
func (c *EntregaController) DownloadArchivoForAlumno(ctx *gin.Context) {
	entregaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entrega ID"})
		return
	}

	// Obtener el ID del usuario logueado del contexto
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	alumnoID, ok := userID.(float64)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener ID de usuario"})
		return
	}

	// Verificar que la entrega pertenece al alumno
	_, err = c.entregaService.GetEntregaByIDAndAlumnoID(entregaID, int(alumnoID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Entrega no encontrada o no pertenece al usuario"})
		return
	}

	// Si la entrega es del alumno, obtener el archivo principal
	archivo, err := c.entregaService.GetPrimaryArchivoByEntregaID(entregaID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No hay archivos asociados a esta entrega"})
		return
	}

	// Verificar que el archivo físico existe y enviarlo
	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.Header("Content-Disposition", "attachment; filename="+archivo.OriginalName)
	ctx.Header("Content-Type", archivo.ContentType)
	ctx.File(archivo.FilePath)
}
