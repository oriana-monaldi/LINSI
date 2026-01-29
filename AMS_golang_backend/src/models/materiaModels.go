package models

type Materia struct {
	ID       int    `json:"id" gorm:"primaryKey;autoIncrement"`
	Nombre   string `json:"nombre" gorm:"column:nombre;type:varchar(100);not null"`
	AnoCarrera int   `json:"ano_carrera" gorm:"column:ano_carrera;type:int;not null"`
}

type MateriaUpdateRequest struct {
    Nombre     *string `json:"nombre,omitempty"`
    AnoCarrera *int    `json:"ano_carrera,omitempty"`
}