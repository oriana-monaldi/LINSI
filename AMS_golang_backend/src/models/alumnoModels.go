package models

type Alumno struct {
    BaseUser
    Legajo   string `json:"legajo" gorm:"column:legajo;type:varchar(10);unique;not null"`
}

func (p Alumno) GetRole() Role {
    return RoleAlumno
}

type AlumnoResponse struct {
	ID       int    `json:"id"`
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Legajo   string `json:"legajo"`
	Email    string `json:"email"`
}

type AlumnoUpdateRequest struct {
    Nombre   *string `json:"nombre,omitempty"`
    Apellido *string `json:"apellido,omitempty"`
    Legajo   *string `json:"legajo,omitempty"`
    Email    *string `json:"email,omitempty"`
    Password *string `json:"password,omitempty"`
}