package models

type MateriaCompetencia struct {
	ID          int     `json:"id" gorm:"primaryKey;autoIncrement"`
	Nombre      string  `json:"nombre" gorm:"column:nombre;type:varchar(100);not null"`
	Descripcion string  `json:"descripcion" gorm:"column:descripcion;type:text;null"`
	MateriaId   int     `json:"materia_id" gorm:"column:materia_id;type:int;not null"`
	Materia     Materia `json:"materia" gorm:"foreignKey:MateriaId;references:ID"`
}

type MateriaCompetenciaUpdateRequest struct {
	Nombre      string `json:"nombre,omitempty"`
	Descripcion string `json:"descripcion,omitempty"`
	MateriaId   int    `json:"materia_id,omitempty"`
}
