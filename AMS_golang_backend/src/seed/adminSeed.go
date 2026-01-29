package seed

import (
	"log"

	"github.com/LINSITrack/backend/src/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func AdminSeed(db *gorm.DB) {
	admins := []struct {
		Nombre   string
		Apellido string
		Email    string
		Password string
	}{
		{
			Nombre:   "Admin",
			Apellido: "Admin",
			Email:    "admin@linsi.com",
			Password: "admin",
		},
		{
			Nombre:   "Mateo",
			Apellido: "Polci",
			Email:    "mateo@linsi.com",
			Password: "mateo",
		},
	}

	for _, adminData := range admins {
		var existingAdmin models.Admin
		result := db.Where("email = ?", adminData.Email).First(&existingAdmin)

		if result.Error == nil {
			log.Printf("Admin '%s' already exists", adminData.Email)
		} else {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminData.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Failed to hash password for admin '%s': %v", adminData.Email, err)
				continue
			}

			newAdmin := models.Admin{
				BaseUser: models.BaseUser{
					Nombre:   adminData.Nombre,
					Apellido: adminData.Apellido,
					Email:    adminData.Email,
					Password: string(hashedPassword),
				},
			}

			if err := db.Create(&newAdmin).Error; err != nil {
				log.Printf("Failed to create admin '%s': %v", adminData.Email, err)
			} else {
				log.Printf("Admin '%s' created successfully", adminData.Email)
			}
		}
	}

	// Log
	log.Println("Admin seed completed successfully")
}
