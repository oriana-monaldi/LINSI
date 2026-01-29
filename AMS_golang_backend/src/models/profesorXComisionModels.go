package models

type ProfesorCargo string

const (
	CargoTitular ProfesorCargo = "Titular"
	CargoAdjunto ProfesorCargo = "Adjunto"
	CargoJTP     ProfesorCargo = "JTP"
)

type ProfesorXComision struct {
	ID         int           `json:"id" gorm:"primaryKey;autoIncrement"`
	Cargo      ProfesorCargo `json:"cargo" gorm:"column:cargo;type:varchar(20);not null"`
	ProfesorId int           `json:"profesor_id" gorm:"column:profesor_id;type:int;not null"`
	Profesor   Profesor      `json:"profesor" gorm:"foreignKey:ProfesorId;references:ID"`
	ComisionId int           `json:"comision_id" gorm:"column:comision_id;type:int;not null"`
	Comision   Comision      `json:"comision" gorm:"foreignKey:ComisionId;references:ID"`
}

type ProfesorXComisionResponse struct {
	ID         int               `json:"id"`
	Cargo      ProfesorCargo     `json:"cargo"`
	ProfesorId int               `json:"profesor_id"`
	Profesor   *ProfesorResponse `json:"profesor,omitempty"`
	ComisionId int               `json:"comision_id"`
	Comision   *Comision         `json:"comision,omitempty"`
}

type ProfesorXComisionCreateRequest struct {
	Cargo      ProfesorCargo `json:"cargo" binding:"required"`
	ProfesorId int           `json:"profesor_id" binding:"required"`
	ComisionId int           `json:"comision_id" binding:"required"`
}

type ProfesorXComisionUpdateRequest struct {
	Cargo      *ProfesorCargo `json:"cargo,omitempty"`
	ProfesorId *int           `json:"profesor_id,omitempty"`
	ComisionId *int           `json:"comision_id,omitempty"`
}
