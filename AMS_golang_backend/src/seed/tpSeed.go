package seed

import (
	"log"
	"time"

	"github.com/LINSITrack/backend/src/models"
	"gorm.io/gorm"
)

func TpSeed(db *gorm.DB) {
	tps := []models.TpModel{
		// TPs para Algoritmos y estructuras de datos
		// Comisión S11 - Algoritmos (ID: 1)
		{
			Consigna:         "Implementar algoritmos de ordenamiento: QuickSort, MergeSort y HeapSort. Comparar su rendimiento con diferentes tamaños de datos.",
			FechaHoraEntrega: time.Date(2024, 12, 15, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       1,
		},
		// Comisión S12 - Algoritmos (ID: 2)
		{
			Consigna:         "Diseñar e implementar una estructura de datos tipo árbol binario de búsqueda con operaciones de inserción, eliminación y búsqueda.",
			FechaHoraEntrega: time.Date(2024, 12, 20, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       2,
		},

		// TPs para Sistemas operativos
		// Comisión S21 - Sistemas Operativos (ID: 3)
		{
			Consigna:         "Implementar un simulador de planificación de procesos utilizando algoritmos FIFO, SJF y Round Robin.",
			FechaHoraEntrega: time.Date(2024, 11, 30, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       3,
		},

		// TPs para Bases de datos
		// Comisión S31 - Bases de Datos (ID: 4)
		{
			Consigna:         "Diseñar una base de datos para un sistema de gestión bibliotecaria incluyendo normalización hasta 3FN y consultas SQL complejas.",
			FechaHoraEntrega: time.Date(2024, 12, 10, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       4,
		},
		// Comisión S32 - Bases de Datos (ID: 5)
		{
			Consigna:         "Implementar procedimientos almacenados y triggers para un sistema de facturación con control de stock.",
			FechaHoraEntrega: time.Date(2024, 12, 12, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       5,
		},

		// TPs para Desarrollo de software
		// Comisión S31 - Desarrollo de Software (ID: 6)
		{
			Consigna:         "Desarrollar una aplicación web completa utilizando el patrón MVC con autenticación de usuarios y CRUD completo.",
			FechaHoraEntrega: time.Date(2025, 1, 15, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       6,
		},

		// TPs para Ingeniería y calidad de software
		// Comisión S41 - Ingeniería y Calidad (ID: 7)
		{
			Consigna:         "Realizar un análisis de calidad de software sobre un proyecto existente utilizando métricas de complejidad ciclomática y cobertura de pruebas.",
			FechaHoraEntrega: time.Date(2025, 2, 28, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       7,
		},

		// TPs para Administración de sistemas de información
		// Comisión S41 - Administración SI (ID: 8)
		{
			Consigna:         "Diseñar la arquitectura de sistemas para una empresa mediana incluyendo diagrama de red, servidores y políticas de seguridad.",
			FechaHoraEntrega: time.Date(2025, 3, 15, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       8,
		},

		// TPs para Ciencia de datos
		// Comisión S51 - Ciencia de Datos (ID: 9)
		{
			Consigna:         "Realizar un análisis exploratorio de datos completo sobre un dataset real, incluyendo limpieza, visualización y modelado predictivo.",
			FechaHoraEntrega: time.Date(2025, 4, 30, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       9,
		},

		// TPs para Inteligencia artificial
		// Comisión S51 - Inteligencia Artificial (ID: 10)
		{
			Consigna:         "Implementar y comparar algoritmos de aprendizaje automático (regresión lineal, árboles de decisión, redes neuronales) para un problema de clasificación.",
			FechaHoraEntrega: time.Date(2025, 5, 15, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       10,
		},

		// TPs para Proyecto final
		// Comisión S51 - Proyecto Final (ID: 11)
		{
			Consigna:         "Desarrollar un proyecto integral que demuestre la aplicación de conocimientos adquiridos durante la carrera, incluyendo documentación técnica completa.",
			FechaHoraEntrega: time.Date(2025, 6, 30, 23, 59, 0, 0, time.UTC),
			Vigente:          true,
			ComisionId:       11,
		},
	}

	for _, tp := range tps {
		var existingTp models.TpModel
		result := db.Where("consigna = ? AND comision_id = ?", tp.Consigna, tp.ComisionId).First(&existingTp)

		if result.Error == nil {
			log.Printf("TP for comision ID %d already exists", tp.ComisionId)
		} else {
			if err := db.Create(&tp).Error; err != nil {
				log.Printf("Failed to create TP for comision ID %d: %v", tp.ComisionId, err)
			} else {
				log.Printf("TP for comision ID %d created successfully", tp.ComisionId)
			}
		}
	}

	// Log
	log.Println("TP seed completed successfully")
}
