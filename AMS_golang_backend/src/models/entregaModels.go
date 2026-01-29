package models

import "time"

type Entrega struct {
	ID        int       `json:"id" gorm:"primaryKey;autoIncrement"`
	FechaHora string    `json:"fecha_hora" gorm:"column:fecha_hora;not null"`
	AlumnoID  int       `json:"alumno_id" gorm:"column:alumno_id;type:int;not null"`
	Alumno    Alumno    `json:"alumno" gorm:"foreignKey:AlumnoID;references:ID"`
	TpID      int       `json:"tp_id" gorm:"column:tp_id;type:int;not null"`
	Tp        TpModel   `json:"tp" gorm:"foreignKey:TpID;references:ID"`
	Archivo   []Archivo `json:"archivo,omitempty" gorm:"foreignKey:EntregaID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Archivo struct {
	ID           int       `json:"id" gorm:"primaryKey;autoIncrement"`
	EntregaID    int       `json:"entrega_id" gorm:"column:entrega_id;not null"`
	Filename     string    `json:"filename" gorm:"type:varchar(255);not null"`
	OriginalName string    `json:"originalName" gorm:"column:original_name;type:varchar(255)"`
	FilePath     string    `json:"filePath" gorm:"column:file_path;type:varchar(500);not null"`
	ContentType  string    `json:"contentType" gorm:"column:content_type;type:varchar(50)"`
	Size         int64     `json:"size"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at"`
}

type EntregaUpdateRequest struct {
	FechaHora *string `json:"fecha_hora,omitempty"`
	AlumnoID  *int    `json:"alumno_id,omitempty"`
	TpID      *int    `json:"tp_id,omitempty"`
}
