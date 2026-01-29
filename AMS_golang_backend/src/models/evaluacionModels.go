package models

type EvaluacionModel struct {
	ID              int           `json:"id" gorm:"primaryKey;autoIncrement"`
	FechaEvaluacion string        `json:"fecha_evaluacion" gorm:"column:fecha_evaluacion;type:date;not null"`
	FechaDevolucion string        `json:"fecha_devolucion" gorm:"column:fecha_devolucion;type:date;not null"`
	Temas           string        `json:"temas" gorm:"column:temas;type:text;not null"`
	Nota            float64       `json:"nota" gorm:"column:nota;type:float;null"`
	Devolucion      string        `json:"devolucion" gorm:"column:devolucion;type:text;null"`
	Observaciones   string        `json:"observaciones" gorm:"column:observaciones;type:text;null"`
	ComisionId      int           `json:"comision_id" gorm:"column:comision_id;type:int;not null"`
	Comision        Comision `json:"comision" gorm:"foreignKey:ComisionId;references:ID"`
}

type EvaluacionUpdateRequest struct {
	FechaEvaluacion *string  `json:"fecha_evaluacion,omitempty"`
	FechaDevolucion *string  `json:"fecha_devolucion,omitempty"`
	Temas           *string  `json:"temas,omitempty"`
	Nota            *float64 `json:"nota,omitempty"`
	Devolucion      *string  `json:"devolucion,omitempty"`
	Observaciones   *string  `json:"observaciones,omitempty"`
	ComisionId      *int     `json:"comision_id,omitempty"`
}