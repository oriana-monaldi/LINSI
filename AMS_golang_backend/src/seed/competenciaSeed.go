package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func CompetenciaSeed(db *gorm.DB) {
	competencias := []models.Competencia{
		{
			Nombre:      "Análisis de Algoritmos",
			Descripcion: "Capacidad para analizar la complejidad temporal y espacial de algoritmos de ordenamiento.",
			TpId:        1,
		},
		{
			Nombre:      "Implementación de Estructuras",
			Descripcion: "Habilidad para implementar algoritmos de ordenamiento eficientes en lenguajes de programación.",
			TpId:        1,
		},
		{
			Nombre:      "Evaluación de Performance",
			Descripcion: "Competencia para medir y comparar el rendimiento de diferentes algoritmos con datasets variables.",
			TpId:        1,
		},

		{
			Nombre:      "Diseño de Estructuras de Datos",
			Descripcion: "Capacidad para diseñar y planificar estructuras de datos complejas como árboles binarios.",
			TpId:        2,
		},
		{
			Nombre:      "Programación Orientada a Objetos",
			Descripcion: "Habilidad para aplicar principios de POO en la implementación de estructuras de datos.",
			TpId:        2,
		},

		{
			Nombre:      "Comprensión de Sistemas",
			Descripcion: "Entendimiento profundo de los mecanismos de planificación de procesos en sistemas operativos.",
			TpId:        3,
		},
		{
			Nombre:      "Desarrollo de Simuladores",
			Descripcion: "Capacidad para desarrollar simulaciones de componentes de sistemas operativos.",
			TpId:        3,
		},
		{
			Nombre:      "Análisis Comparativo",
			Descripcion: "Habilidad para comparar y evaluar diferentes algoritmos de planificación.",
			TpId:        3,
		},

		{
			Nombre:      "Diseño de Base de Datos",
			Descripcion: "Competencia para diseñar esquemas de base de datos normalizados y eficientes.",
			TpId:        4,
		},
		{
			Nombre:      "Normalización de Datos",
			Descripcion: "Habilidad para aplicar formas normales y eliminar redundancias en bases de datos.",
			TpId:        4,
		},
		{
			Nombre:      "Consultas SQL Avanzadas",
			Descripcion: "Capacidad para escribir consultas SQL complejas con joins, subqueries y funciones agregadas.",
			TpId:        4,
		},

		{
			Nombre:      "Programación en Base de Datos",
			Descripcion: "Habilidad para desarrollar procedimientos almacenados y funciones de base de datos.",
			TpId:        5,
		},
		{
			Nombre:      "Automatización de Procesos",
			Descripcion: "Competencia para implementar triggers y automatizar procesos de negocio en la base de datos.",
			TpId:        5,
		},

		{
			Nombre:      "Arquitectura de Software",
			Descripcion: "Capacidad para implementar patrones arquitectónicos como MVC en aplicaciones web.",
			TpId:        6,
		},
		{
			Nombre:      "Desarrollo Full-Stack",
			Descripcion: "Habilidad para desarrollar tanto el frontend como el backend de aplicaciones web.",
			TpId:        6,
		},
		{
			Nombre:      "Seguridad en Aplicaciones",
			Descripcion: "Competencia para implementar sistemas de autenticación y autorización seguros.",
			TpId:        6,
		},

		{
			Nombre:      "Métricas de Software",
			Descripcion: "Capacidad para calcular y analizar métricas de calidad de software como complejidad ciclomática.",
			TpId:        7,
		},
		{
			Nombre:      "Testing y Cobertura",
			Descripcion: "Habilidad para evaluar la cobertura de pruebas y calidad del testing en proyectos.",
			TpId:        7,
		},
		{
			Nombre:      "Análisis de Código",
			Descripcion: "Competencia para realizar revisiones de código y identificar mejoras de calidad.",
			TpId:        7,
		},

		{
			Nombre:      "Arquitectura de Redes",
			Descripcion: "Capacidad para diseñar topologías de red eficientes y seguras para organizaciones.",
			TpId:        8,
		},
		{
			Nombre:      "Administración de Servidores",
			Descripcion: "Habilidad para planificar y configurar infraestructura de servidores empresariales.",
			TpId:        8,
		},
		{
			Nombre:      "Políticas de Seguridad",
			Descripcion: "Competencia para desarrollar e implementar políticas de seguridad informática.",
			TpId:        8,
		},

		{
			Nombre:      "Análisis Exploratorio de Datos",
			Descripcion: "Capacidad para explorar, limpiar y preparar datasets para análisis posterior.",
			TpId:        9,
		},
		{
			Nombre:      "Visualización de Datos",
			Descripcion: "Habilidad para crear visualizaciones efectivas que comuniquen insights de los datos.",
			TpId:        9,
		},
		{
			Nombre:      "Modelado Predictivo",
			Descripcion: "Competencia para construir y evaluar modelos predictivos usando técnicas de machine learning.",
			TpId:        9,
		},

		{
			Nombre:      "Algoritmos de Machine Learning",
			Descripcion: "Capacidad para implementar y comparar diferentes algoritmos de aprendizaje automático.",
			TpId:        10,
		},
		{
			Nombre:      "Evaluación de Modelos",
			Descripcion: "Habilidad para evaluar y seleccionar modelos de IA usando métricas apropriadas.",
			TpId:        10,
		},
		{
			Nombre:      "Redes Neuronales",
			Descripcion: "Competencia para diseñar e implementar arquitecturas de redes neuronales.",
			TpId:        10,
		},

		{
			Nombre:      "Gestión de Proyectos",
			Descripcion: "Capacidad para planificar, ejecutar y entregar proyectos de software complejos.",
			TpId:        11,
		},
		{
			Nombre:      "Integración de Conocimientos",
			Descripcion: "Habilidad para aplicar conocimientos multidisciplinarios en un proyecto integral.",
			TpId:        11,
		},
		{
			Nombre:      "Documentación Técnica",
			Descripcion: "Competencia para crear documentación técnica completa y profesional.",
			TpId:        11,
		},
		{
			Nombre:      "Presentación de Resultados",
			Descripcion: "Habilidad para comunicar efectivamente los resultados y conclusiones del proyecto.",
			TpId:        11,
		},
	}

	for _, competencia := range competencias {
		var existingCompetencia models.Competencia
		result := db.Where("nombre = ? AND tp_id = ?", competencia.Nombre, competencia.TpId).First(&existingCompetencia)

		if result.Error == nil {
			log.Printf("Competencia '%s' for TP ID %d already exists", competencia.Nombre, competencia.TpId)
		} else {
			if err := db.Create(&competencia).Error; err != nil {
				log.Printf("Failed to create competencia '%s' for TP ID %d: %v", competencia.Nombre, competencia.TpId, err)
			} else {
				log.Printf("Competencia '%s' for TP ID %d created successfully", competencia.Nombre, competencia.TpId)
			}
		}
	}

	// Log
	log.Println("Competencia seed completed successfully")
}
