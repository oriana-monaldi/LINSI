package models

import "time"

type TpModel struct {
	ID               int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Consigna         string    `json:"consigna" gorm:"column:consigna;type:text;not null"`
	FechaHoraEntrega time.Time `json:"fecha_entrega" gorm:"column:fecha_entrega;type:timestamptz;not null"`
	Vigente          bool      `json:"vigente" gorm:"column:vigente;type:boolean;not null;default:true"`
	Nota             float64   `json:"nota" gorm:"column:nota;type:float;default:null"`
	Devolucion       string    `json:"devolucion" gorm:"column:devolucion;type:text;default:null"`
	ComisionId       int       `json:"comision_id" gorm:"column:comision_id;type:int;not null"`
	Comision         Comision  `json:"comision" gorm:"foreignKey:ComisionId;references:ID"`
}

type TpUpdateRequest struct {
	Consigna         *string    `json:"consigna,omitempty"`
	FechaHoraEntrega *time.Time `json:"fecha_entrega,omitempty"`
	Vigente          *bool      `json:"vigente,omitempty"`
	Nota             *float64   `json:"nota,omitempty"`
	Devolucion       *string    `json:"devolucion,omitempty"`
	ComisionId       *int       `json:"comision_id,omitempty"`
}