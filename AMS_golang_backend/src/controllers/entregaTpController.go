package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EntregaTPController struct {
	DB *gorm.DB
}

func NewEntregaTPController(db *gorm.DB) *EntregaTPController {
	return &EntregaTPController{DB: db}
}

// GetAllEntregas - Get all TP submissions (for teachers)
func (ctrl *EntregaTPController) GetAllEntregas(c *gin.Context) {
	var entregas []models.EntregaTP

	result := ctrl.DB.Preload("Tp").Preload("Tp.Comision").Preload("Alumno").Preload("Cursada").Find(&entregas)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching entregas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"entregas": entregas})
}

// GetEntregasByTP - Get all submissions for a specific TP
func (ctrl *EntregaTPController) GetEntregasByTP(c *gin.Context) {
	tpId := c.Param("tp_id")

	var entregas []models.EntregaTP
	result := ctrl.DB.Preload("Alumno").Preload("Cursada").Where("tp_id = ?", tpId).Find(&entregas)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching entregas for TP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"entregas": entregas})
}

// GetEntregasByAlumno - Get all submissions by a specific student
func (ctrl *EntregaTPController) GetEntregasByAlumno(c *gin.Context) {
	// Get alumno_id from authenticated user
	alumnoIdInterface, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// JWT claims["id"] comes as float64
	alumnoIdFloat, ok := alumnoIdInterface.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}
	alumnoId := int(alumnoIdFloat)

	var entregas []models.EntregaTP
	result := ctrl.DB.Preload("Tp").Preload("Tp.Comision").Preload("Tp.Comision.Materia").Preload("Cursada").Preload("Cursada.Comision").Preload("Cursada.Comision.Materia").Where("alumno_id = ?", alumnoId).Find(&entregas)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching student entregas"})
		return
	}

	c.JSON(http.StatusOK, entregas)
}

// GetEntregaByID - Get a specific submission by ID
func (ctrl *EntregaTPController) GetEntregaByID(c *gin.Context) {
	id := c.Param("id")

	var entrega models.EntregaTP
	result := ctrl.DB.Preload("Tp").Preload("Tp.Comision").Preload("Alumno").Preload("Cursada").First(&entrega, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrega not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching entrega"})
		}
		return
	}

	// Check permissions: students can only view their own submissions
	userRole, roleExists := c.Get("userRole")
	userIdInterface, idExists := c.Get("userID")

	if roleExists && idExists && userRole == models.RoleAlumno {
		userIdFloat, ok := userIdInterface.(float64)
		if ok {
			userId := int(userIdFloat)
			if entrega.AlumnoId != userId {
				c.JSON(http.StatusForbidden, gin.H{"error": "You can only view your own submissions"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, entrega)
}

// CreateEntrega - Student submits work for a TP
func (ctrl *EntregaTPController) CreateEntrega(c *gin.Context) {
	var req models.EntregaTPCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get alumno_id from authenticated user
	alumnoIdInterface, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// JWT claims["id"] comes as float64
	alumnoIdFloat, ok := alumnoIdInterface.(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}
	alumnoId := int(alumnoIdFloat)

	// Verify TP exists
	var tp models.TpModel
	if err := ctrl.DB.First(&tp, req.TpId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "TP not found"})
		return
	}

	// Check if student already submitted for this TP
	var existingEntrega models.EntregaTP
	if err := ctrl.DB.Where("tp_id = ? AND alumno_id = ?", req.TpId, alumnoId).First(&existingEntrega).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already submitted this TP"})
		return
	}

	// Create submission
	entrega := models.EntregaTP{
		TpId:         req.TpId,
		AlumnoId:     alumnoId,
		CursadaId:    req.CursadaId,
		ArchivoURL:   req.ArchivoURL,
		FechaEntrega: time.Now(),
		Estado:       "pendiente",
	}

	if result := ctrl.DB.Create(&entrega); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating entrega"})
		return
	}

	// Load relationships
	ctrl.DB.Preload("Tp").Preload("Alumno").Preload("Cursada").First(&entrega, entrega.ID)

	c.JSON(http.StatusCreated, entrega)
}

// UpdateEntrega - Update submission (for re-submission or teacher grading)
func (ctrl *EntregaTPController) UpdateEntrega(c *gin.Context) {
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req models.EntregaTPUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var entrega models.EntregaTP
	if result := ctrl.DB.First(&entrega, idInt); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrega not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching entrega"})
		}
		return
	}

	// Get user role and ID from context
	userRole, roleExists := c.Get("userRole")
	userIdInterface, idExists := c.Get("userID")

	if !roleExists || !idExists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Check permissions based on role
	if userRole == models.RoleAlumno {
		// Students can only update their own submissions
		userIdFloat, ok := userIdInterface.(float64)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
			return
		}
		userId := int(userIdFloat)

		if entrega.AlumnoId != userId {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own submissions"})
			return
		}

		// Students cannot grade - they can only update ArchivoURL
		if req.Nota != nil || req.Devolucion != nil || req.Estado != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Students cannot grade submissions"})
			return
		}
	}

	// Track if this is a grading update
	isGrading := req.Nota != nil && entrega.Nota == nil

	// Update fields if provided
	if req.ArchivoURL != nil {
		entrega.ArchivoURL = *req.ArchivoURL
	}
	if req.Nota != nil {
		entrega.Nota = req.Nota
	}
	if req.Devolucion != nil {
		entrega.Devolucion = *req.Devolucion
	}
	if req.Estado != nil {
		entrega.Estado = *req.Estado
	}

	// If nota is being set, update estado to calificado
	if req.Nota != nil && entrega.Estado == "pendiente" {
		entrega.Estado = "calificado"
	}

	if result := ctrl.DB.Save(&entrega); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating entrega"})
		return
	}

	// Reload with relationships
	ctrl.DB.Preload("Tp").Preload("Tp.Comision").Preload("Tp.Comision.Materia").Preload("Alumno").Preload("Cursada").First(&entrega, entrega.ID)

	// Create notification if TP was graded
	if isGrading && entrega.Nota != nil {
		materiaNombre := "TP"
		if entrega.Tp.Comision.Materia.Nombre != "" {
			materiaNombre = entrega.Tp.Comision.Materia.Nombre
		}

		notificacion := models.Notificacion{
			Mensaje:   "Tu TP de " + materiaNombre + " ha sido calificado con nota: " + strconv.FormatFloat(*entrega.Nota, 'f', 1, 64),
			FechaHora: time.Now(),
			Leida:     false,
			AlumnoID:  entrega.AlumnoId,
		}
		ctrl.DB.Create(&notificacion)
	}

	c.JSON(http.StatusOK, entrega)
}

// DeleteEntrega - Delete a submission
func (ctrl *EntregaTPController) DeleteEntrega(c *gin.Context) {
	id := c.Param("id")

	var entrega models.EntregaTP
	if result := ctrl.DB.First(&entrega, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entrega not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching entrega"})
		}
		return
	}

	if result := ctrl.DB.Delete(&entrega); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting entrega"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entrega deleted successfully"})
}

// UploadArchivoForAlumno - Allows a student to upload a file for a TP and returns a URL
func (ctrl *EntregaTPController) UploadArchivoForAlumno(c *gin.Context) {
	// Require authenticated user (middleware should set userID)
	if _, exists := c.Get("userID"); !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No se encontró el archivo en la petición", "details": err.Error()})
		return
	}

	if file.Size == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El archivo está vacío"})
		return
	}

	uploadDir := "uploads/entregas_tp"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo crear el directorio de uploads", "details": err.Error()})
		return
	}

	timestamp := time.Now().Unix()
	safeName := filepath.Base(file.Filename)
	filename := fmt.Sprintf("%d_%s", timestamp, safeName)
	destPath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, destPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando el archivo", "details": err.Error()})
		return
	}

	// Return a public URL path under /uploads so frontend can use it
	archivoURL := "/uploads/entregas_tp/" + filename
	c.JSON(http.StatusCreated, gin.H{"archivo_url": archivoURL})
}
