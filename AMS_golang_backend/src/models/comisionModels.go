package models

type Comision struct {
	ID        int     `json:"id" gorm:"primaryKey;autoIncrement"`
	Nombre    string  `json:"nombre" gorm:"column:nombre;type:varchar(100);not null"`
	Horarios  string  `json:"horarios" gorm:"column:horarios;type:varchar(255);not null"`
	MateriaId int     `json:"materia_id" gorm:"column:materia_id;type:int;not null"`
	Materia   Materia `json:"materia" gorm:"foreignKey:MateriaId;references:ID"`
}

type ComisionUpdateRequest struct {
	Nombre    *string `json:"nombre" gorm:"column:nombre;type:varchar(100)"`
	Horarios  *string `json:"horarios" gorm:"column:horarios;type:varchar(255)"`
	MateriaId *int    `json:"materia_id" gorm:"column:materia_id;type:int"`
}
