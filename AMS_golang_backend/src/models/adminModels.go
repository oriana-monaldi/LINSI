package models

type Admin struct {
	BaseUser
}

func (a Admin) GetRole() Role {
    return RoleAdmin
}

type AdminResponse struct {
	ID       int    `json:"id" gorm:"primaryKey;autoIncrement"`
	Nombre   string `json:"nombre" gorm:"column:nombre;type:varchar(60);not null"`
	Apellido string `json:"apellido" gorm:"column:apellido;type:varchar(60);not null"`
	Email    string `json:"email" gorm:"column:email;type:varchar(60);unique;not null"`
}

type AdminUpdateRequest struct {
    Nombre   *string `json:"nombre,omitempty"`
    Apellido *string `json:"apellido,omitempty"`
    Email    *string `json:"email,omitempty"`
    Password *string `json:"password,omitempty"`
}