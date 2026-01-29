package models

type Competencia struct {
	ID          int     `json:"id" gorm:"primaryKey;autoIncrement"`
	Nombre      string  `json:"nombre" gorm:"column:nombre;type:varchar(100);not null"`
	Descripcion string  `json:"descripcion" gorm:"column:descripcion;type:text;null"`
	TpId        int     `json:"tp_id" gorm:"column:tp_id;type:int;not null"`
	Tp          TpModel `json:"tp" gorm:"foreignKey:TpId;references:ID"`
}

type CompetenciaUpdateRequest struct {
	Nombre      string `json:"nombre,omitempty"`
	Descripcion string `json:"descripcion,omitempty"`
	TpId        int    `json:"tp_id,omitempty"`
}