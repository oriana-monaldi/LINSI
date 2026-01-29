// Core domain types based on class diagram

export type UserRole = "student" | "teacher" | "admin"

export type ProfesorCargo = "Adjunto" | "JTP" | "Titular"

export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  role: UserRole
  legajo?: number // For students and teachers
  contraseña: string
}

export interface Alumno extends User {
  role: "student"
  legajo: number
}

export interface Profesor extends User {
  role: "teacher"
  legajo: number
}

export interface Admin extends User {
  role: "admin"
}

export interface Competencia {
  id: string
  nombre: string
  descripcion: string
}

export interface Catedra {
  id: string
  nombre: string
  horarios: string
  competencias: Competencia[]
}

export interface Comision {
  id: string
  nombre: string
  añoCarrera: number
  catedraId: string
}

export interface CatedraXProfesor {
  id: string
  catedraId: string
  profesorId: string
  cargo: ProfesorCargo
}

export interface Cursada {
  id: string
  añoLectivo: number
  notaFinal: number | null
  notaConceptual: number | null
  feedback: string
  alumnoId: string
  catedraId: string
  comisionId: string
}

export interface TP {
  id: string
  consigna: string
  vigente: boolean
  nota: number | null
  devolucion: string
  cursadaId: string
  fechaEntrega: Date
  notaEntrega: Date
}

export interface Evaluacion {
  id: string
  fecha: Date
  fechaDevolucion: Date | null
  temas: string
  nota: number | null
  devolucion: string
  observaciones: string
  cursadaId: string
}

export interface Entrega {
  id: string
  archivo: File | null
  fecha: Date
  hora: string
  tpId: string
}

export interface ArchivoAnexo {
  id: string
  nombre: string
  archivo: File | null
  fechaEntrega: Date
  notaEntrega: Date
  tpId: string
}

export interface Notificacion {
  id: string
  mensaje: string
  fecha: Date
  alumnoId: string
  leida: boolean
}
