package controllers

import (
	"net/http"
	"os"
	"strconv"

	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-gonic/gin"
)

type AnexoController struct {
	anexoService *services.AnexoService
}

func NewAnexoController(anexoService *services.AnexoService) *AnexoController {
	return &AnexoController{anexoService: anexoService}
}

func (c *AnexoController) GetAllAnexos(ctx *gin.Context) {
	anexos, err := c.anexoService.GetAllAnexos()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, anexos)
}

func (c *AnexoController) GetAnexoByID(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	anexo, err := c.anexoService.GetAnexoByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Anexo no encontrado"})
		return
	}
	ctx.JSON(http.StatusOK, anexo)
}

func (c *AnexoController) CreateAnexo(ctx *gin.Context) {
	var anexo models.Anexo
	if err := ctx.ShouldBindJSON(&anexo); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if anexo.TpID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El ID del TP es requerido"})
		return
	}

	err := c.anexoService.CreateAnexo(&anexo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, anexo)
}

func (c *AnexoController) UpdateAnexo(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var updateRequest models.AnexoUpdateRequest
	if err := ctx.ShouldBindJSON(&updateRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	anexo, err := c.anexoService.UpdateAnexo(id, &updateRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, anexo)
}

func (c *AnexoController) DeleteAnexo(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	err = c.anexoService.DeleteAnexo(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusNoContent, nil)
}

func (c *AnexoController) UploadAnexoArchivo(ctx *gin.Context) {
	anexoID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de anexo inválido"})
		return
	}

	// Verificar que el anexo existe
	_, err = c.anexoService.GetAnexoByID(anexoID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Anexo no encontrado"})
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

	// Límite de tamaño (ejemplo: 100MB para anexos)
	maxSize := int64(100 * 1024 * 1024) // 100MB
	if file.Size > maxSize {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "El archivo excede el tamaño máximo permitido (100MB)"})
		return
	}

	// Guardar archivo
	anexoArchivo, err := c.anexoService.SaveFile(file, anexoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al guardar el archivo",
			"details": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message":       "Archivo subido exitosamente",
		"anexo_archivo": anexoArchivo,
	})
}

func (c *AnexoController) DeleteAnexoArchivo(ctx *gin.Context) {
	anexoID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de anexo inválido"})
		return
	}

	// Obtener todos los archivos del anexo y eliminarlos
	archivos, err := c.anexoService.GetAnexoArchivosByAnexoID(anexoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(archivos) == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No se encontraron archivos para este anexo"})
		return
	}

	// Eliminar todos los archivos del anexo
	for _, archivo := range archivos {
		if err := c.anexoService.DeleteAnexoArchivoByID(archivo.ID); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar archivo: " + err.Error()})
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":             "Todos los archivos eliminados exitosamente",
		"archivos_eliminados": len(archivos),
	})
}

func (c *AnexoController) GetAnexoArchivosByAnexoID(ctx *gin.Context) {
	anexoID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de anexo inválido"})
		return
	}

	archivos, err := c.anexoService.GetAnexoArchivosByAnexoID(anexoID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, archivos)
}

func (c *AnexoController) DownloadAnexoArchivo(ctx *gin.Context) {
	anexoID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de anexo inválido"})
		return
	}

	// Obtener el archivo principal del anexo
	anexoArchivo, err := c.anexoService.GetPrimaryAnexoArchivoByAnexoID(anexoID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Archivo no encontrado"})
		return
	}

	// Verificar que el archivo físico existe
	if _, err := os.Stat(anexoArchivo.FilePath); os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "El archivo físico no existe"})
		return
	}

	// Establecer headers para la descarga
	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Transfer-Encoding", "binary")
	ctx.Header("Content-Disposition", "attachment; filename="+anexoArchivo.OriginalName)
	ctx.Header("Content-Type", anexoArchivo.ContentType)
	ctx.Header("Content-Length", strconv.FormatInt(anexoArchivo.Size, 10))

	// Enviar archivo
	ctx.File(anexoArchivo.FilePath)
}

// GetAnexosByTpID - Obtiene todos los anexos de un TP específico
func (c *AnexoController) GetAnexosByTpID(ctx *gin.Context) {
	tpID, err := strconv.Atoi(ctx.Param("tp_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de TP inválido"})
		return
	}

	anexos, err := c.anexoService.GetAnexosByTpID(tpID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, anexos)
}
