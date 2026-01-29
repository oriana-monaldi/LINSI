package models

import "time"

type Notificacion struct {
	ID        int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Mensaje   string    `json:"mensaje" gorm:"column:mensaje;type:varchar(255);not null"`
	FechaHora time.Time `json:"fecha_hora" gorm:"column:fecha_hora;not null"`
	Leida     bool      `json:"leida" gorm:"column:leida;type:boolean;not null;default:false"`
	AlumnoID  int       `json:"alumno_id" gorm:"column:alumno_id;not null"`
	Alumno    Alumno    `json:"alumno" gorm:"foreignKey:AlumnoID;references:ID"`
}

type NotificacionUpdateRequest struct {
	Mensaje   *string    `json:"mensaje" gorm:"column:mensaje;type:varchar(255)"`
	FechaHora *time.Time `json:"fecha_hora" gorm:"column:fecha_hora"`
	Leida     *bool      `json:"leida" gorm:"column:leida;type:boolean"`
	AlumnoID  *int       `json:"alumno_id" gorm:"column:alumno_id"`
}

type NotificacionResponse struct {
	ID        int            `json:"id"`
	Mensaje   string         `json:"mensaje"`
	FechaHora time.Time      `json:"fecha_hora"`
	Leida     bool           `json:"leida"`
	AlumnoID  int            `json:"alumno_id"`
	Alumno    AlumnoResponse `json:"alumno"`
}
