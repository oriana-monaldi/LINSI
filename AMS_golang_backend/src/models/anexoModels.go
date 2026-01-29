package models

import "time"

type Anexo struct {
	ID           int            `json:"id" gorm:"primaryKey;autoIncrement"`
	TpID         int            `json:"tp_id" gorm:"column:tp_id;type:int;not null"`
	Tp           TpModel        `json:"tp" gorm:"foreignKey:TpID;references:ID"`
	AnexoArchivo []AnexoArchivo `json:"anexo_archivo,omitempty" gorm:"foreignKey:AnexoID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type AnexoUpdateRequest struct {
	TpID *int `json:"tp_id,omitempty"`
}

type AnexoArchivo struct {
	ID           int       `json:"id" gorm:"primaryKey;autoIncrement"`
	AnexoID      int       `json:"anexo_id" gorm:"column:anexo_id;not null;uniqueIndex"`
	Filename     string    `json:"filename" gorm:"type:varchar(255);not null"`
	OriginalName string    `json:"originalName" gorm:"column:original_name;type:varchar(255)"`
	FilePath     string    `json:"filePath" gorm:"column:file_path;type:varchar(500);not null"`
	ContentType  string    `json:"contentType" gorm:"column:content_type;type:varchar(50)"`
	Size         int64     `json:"size"`
	CreatedAt    time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"column:updated_at"`
}