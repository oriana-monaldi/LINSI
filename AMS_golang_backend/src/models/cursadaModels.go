package models

type Cursada struct {
	ID             int      `json:"id" gorm:"primaryKey;autoIncrement"`
	AnoLectivo     int      `json:"ano_lectivo" gorm:"column:ano_lectivo;type:int;not null"`
	NotaFinal      float64  `json:"nota_final" gorm:"column:nota_final;type:decimal(4,2)"`
	NotaConceptual float64  `json:"nota_conceptual" gorm:"column:nota_conceptual;type:decimal(4,2)"`
	Feedback       string   `json:"feedback" gorm:"column:feedback;type:varchar(255)"`
	AlumnoID       int      `json:"alumno_id" gorm:"column:alumno_id;type:int;not null"`
	Alumno         Alumno   `json:"alumno" gorm:"foreignKey:AlumnoID;references:ID"`
	ComisionID     int      `json:"comision_id" gorm:"column:comision_id;type:int;not null"`
	Comision       Comision `json:"comision" gorm:"foreignKey:ComisionID;references:ID"`
}

type CursadaUpdateRequest struct {
	AnoLectivo     *int     `json:"ano_lectivo,omitempty"`
	NotaFinal      *float64 `json:"nota_final,omitempty"`
	NotaConceptual *float64 `json:"nota_conceptual,omitempty"`
	Feedback       *string  `json:"feedback,omitempty"`
	AlumnoID       *int     `json:"alumno_id,omitempty"`
	ComisionID     *int     `json:"comision_id,omitempty"`
}

type CursadaResponse struct {
	ID             int            `json:"id"`
	AnoLectivo     int            `json:"ano_lectivo"`
	NotaFinal      float64        `json:"nota_final"`
	NotaConceptual float64        `json:"nota_conceptual"`
	Feedback       string         `json:"feedback"`
	AlumnoID       int            `json:"alumno_id"`
	Alumno         AlumnoResponse `json:"alumno"`
	ComisionID     int            `json:"comision_id"`
	Comision       Comision       `json:"comision"`
}
