package models

type Profesor struct {
    BaseUser
    Legajo   string `json:"legajo" gorm:"column:legajo;type:varchar(10);unique;not null"`
}

func (p Profesor) GetRole() Role {
    return RoleProfesor
}

type ProfesorResponse struct {
	ID       int    `json:"id"`
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Legajo   string `json:"legajo"`
	Email    string `json:"email"`
}

type ProfesorUpdateRequest struct {
	Nombre   *string `json:"nombre,omitempty"`
    Apellido *string `json:"apellido,omitempty"`
    Legajo   *string `json:"legajo,omitempty"`
    Email    *string `json:"email,omitempty"`
    Password *string `json:"password,omitempty"`
}