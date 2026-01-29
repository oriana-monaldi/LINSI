package models

type Role string

const (
    RoleAdmin     Role = "admin"
    RoleProfesor  Role = "profesor"
    RoleAlumno    Role = "alumno"
)

type BaseUser struct {
    ID       int    `json:"id" gorm:"primaryKey;autoIncrement"`
    Nombre   string `json:"nombre" gorm:"column:nombre;type:varchar(60);not null"`
    Apellido string `json:"apellido" gorm:"column:apellido;type:varchar(60);not null"`
    Email    string `json:"email" gorm:"column:email;type:varchar(60);unique;not null"`
    Password string `json:"password" gorm:"column:password;type:varchar(70);not null"`
}

type UserRoleProvider interface {
    GetRole() Role
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type WhoAmIResponse struct {
	ID       interface{} `json:"id"`
	Email    string      `json:"email"`
	Role     string      `json:"role"`
	Nombre   *string     `json:"nombre,omitempty"`
	Apellido *string     `json:"apellido,omitempty"`
	Legajo   *string     `json:"legajo,omitempty"`
}
