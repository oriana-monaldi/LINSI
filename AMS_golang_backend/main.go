package main

import (
	"log"
	"os"

	"github.com/LINSITrack/backend/src/db"
	"github.com/LINSITrack/backend/src/middleware"
	"github.com/LINSITrack/backend/src/models"
	"github.com/LINSITrack/backend/src/routes"
	"github.com/LINSITrack/backend/src/seed"
	"github.com/LINSITrack/backend/src/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func initAuth() {
	_ = godotenv.Load()

	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		log.Fatal("ERROR: SECRET_KEY is not set")
	}
	middleware.SetSecretKey(secretKey)
}

func main() {

	// Database connection
	db, err := db.Connect()
	if err != nil {
		log.Fatalf("Error connecting to database: %v\n", err)
	}

	// Carga de la secret key
	initAuth()

	// Setup de router
	router := gin.Default()

	// Configuración CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Logs
	const Reset, Cyan = "\033[0m", "\033[36m"
	log.SetPrefix(Cyan)
	log.SetFlags(log.LstdFlags)
	log.Printf("-----------------------------------------------: %s\n", Reset)
	log.Printf("SERVER RUNNING ON: %s %s\n", "http://localhost:8080", Reset)
	log.Printf("PGADMIN WEB RUNNING ON: %s %s\n", "http://localhost:5050", Reset)
	log.Printf("-----------------------------------------------: %s\n", Reset)

	// Ruta unprotected
	router.GET("/unprotected", func(c *gin.Context) {
		c.String(200, "Hello from Gin! Server is up and running. (Unprotected Route)")
	})

	// Ruta protected
	router.GET("/protected", middleware.AuthMiddleware(), func(c *gin.Context) {
		c.String(200, "Hello from Gin! Server is up and running. (Protected Route)")
	})

	// Serve uploads directory so frontend can access uploaded files
	router.Static("/uploads", "./uploads")

	// // (¡Peligro: Borra la base de datos al descomentar! Excepto las instancias creadas con la seed al iniciar el servidor)
	//  	db.Migrator().DropTable(
	// 	&models.Profesor{},
	// 	&models.Admin{},
	// 	&models.Alumno{},
	// 	&models.Materia{},
	// 	&models.Comision{},
	// 	&models.Cursada{},
	// 	&models.Notificacion{},
	// 	&models.ProfesorXComision{},
	// 	&models.TpModel{},
	// 	&models.Competencia{},
	// 	&models.Entrega{},
	// 	&models.Archivo{},
	// 	&models.EvaluacionModel{},
	// 	&models.Anexo{},
	// 	&models.AnexoArchivo{},
	// ) 

	// Automigraciones
	if err := db.AutoMigrate(
		&models.Profesor{},
		&models.Admin{},
		&models.Alumno{},
		&models.Materia{},
		&models.Comision{},
		&models.Cursada{},
		&models.Notificacion{},
		&models.ProfesorXComision{},
		&models.TpModel{},
		&models.EntregaTP{},
		&models.Competencia{},
		&models.Entrega{},
		&models.Archivo{},
		&models.EvaluacionModel{},
		&models.EntregaEvaluacion{},
		&models.Anexo{},
		&models.AnexoArchivo{},
	); err != nil {
		log.Fatalf("Error during auto migration: %v\n", err)
	}

	// Ejecutar seed inicial de la DB
	log.Println("=== Iniciando proceso de seeding ===")
	seed.AdminSeed(db)
	seed.ProfesorSeed(db)
	seed.AlumnoSeed(db)
	seed.MateriaSeed(db)
	seed.ComisionSeed(db)
	seed.CursadaSeed(db)
	seed.NotificacionSeed(db)
	seed.ProfesorXComisionSeed(db)
	seed.TpSeed(db)
	seed.CompetenciaSeed(db)
	seed.EntregaSeed(db)
	seed.EvaluacionSeed(db)
	seed.AnexoSeed(db)
	log.Println("=== Seeding completado ===")

	// Setup de services
	authService := services.NewAuthService(db)
	profesorService := services.NewProfesorService(db)
	adminService := services.NewAdminService(db)
	alumnoService := services.NewAlumnoService(db)
	materiaService := services.NewMateriaService(db)
	comisionService := services.NewComisionService(db)
	cursadaService := services.NewCursadaService(db)
	notificacionService := services.NewNotificacionService(db)
	profesorXComisionService := services.NewProfesorXComisionService(db)
	tpService := services.NewTpService(db)
	competenciaService := services.NewCompetenciaService(db)
	// entregaService := services.NewEntregaService(db) // Commented out - using EntregaTP instead
	evaluacionService := services.NewEvaluacionService(db)
	anexoService := services.NewAnexoService(db)

	// Setup de rutas
	routes.SetupAuthRoutes(router, authService)
	routes.SetupProfesoresRoutes(router, profesorService)
	routes.SetupAdminsRoutes(router, adminService)
	routes.SetupAlumnosRoutes(router, alumnoService)
	routes.SetupMateriasRoutes(router, materiaService)
	routes.SetupComisionRoutes(router, comisionService)
	routes.SetupCursadasRoutes(router, cursadaService)
	routes.SetupNotificacionRoutes(router, notificacionService)
	routes.SetupProfesorXComisionRoutes(router, profesorXComisionService)
	routes.SetupTpRoutes(router, tpService)
	routes.SetupEntregaTPRoutes(router, db)
	routes.SetupCompetenciaRoutes(router, competenciaService)
	// routes.SetupEntregaRoutes(router, entregaService) // Commented out - using EntregaTP instead
	routes.SetupEvaluacionRoutes(router, evaluacionService)
	routes.SetupAnexoRoutes(router, anexoService)

	// Run
	router.Run()
}
