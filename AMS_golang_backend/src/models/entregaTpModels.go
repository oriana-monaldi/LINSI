package models

import "time"

type EntregaTP struct {
	ID           int       `json:"id" gorm:"primaryKey;autoIncrement"`
	TpId         int       `json:"tp_id" gorm:"column:tp_id;type:int;not null"`
	AlumnoId     int       `json:"alumno_id" gorm:"column:alumno_id;type:int;not null"`
	CursadaId    int       `json:"cursada_id" gorm:"column:cursada_id;type:int;not null"`
	ArchivoURL   string    `json:"archivo_url" gorm:"column:archivo_url;type:text"`
	FechaEntrega time.Time `json:"fecha_entrega" gorm:"column:fecha_entrega;type:timestamp;not null"`
	Nota         *float64  `json:"nota" gorm:"column:nota;type:float;default:null"`
	Devolucion   string    `json:"devolucion" gorm:"column:devolucion;type:text;default:null"`
	Estado       string    `json:"estado" gorm:"column:estado;type:varchar(50);not null;default:'pendiente'"`
	Tp           TpModel   `json:"tp" gorm:"foreignKey:TpId;references:ID"`
	Alumno       Alumno    `json:"alumno" gorm:"foreignKey:AlumnoId;references:ID"`
	Cursada      Cursada   `json:"cursada" gorm:"foreignKey:CursadaId;references:ID"`
}

func (EntregaTP) TableName() string {
	return "entregas_tp"
}

type EntregaTPCreateRequest struct {
	TpId       int    `json:"tp_id" binding:"required"`
	CursadaId  int    `json:"cursada_id" binding:"required"`
	ArchivoURL string `json:"archivo_url"`
}

type EntregaTPUpdateRequest struct {
	ArchivoURL *string  `json:"archivo_url"`
	Nota       *float64 `json:"nota"`
	Devolucion *string  `json:"devolucion"`
	Estado     *string  `json:"estado"`
}
