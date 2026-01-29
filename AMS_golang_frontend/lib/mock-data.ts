// Mock data for demonstration
import type {
  Alumno,
  Profesor,
  Admin,
  Catedra,
  Competencia,
  TP,
  Evaluacion,
  Notificacion,
  Cursada,
  Comision,
} from "./types"

export const mockCompetencias: Competencia[] = [
  {
    id: "1",
    nombre: "Programación Orientada a Objetos",
    descripcion: "Capacidad de diseñar y desarrollar software usando POO",
  },
  { id: "2", nombre: "Bases de Datos", descripcion: "Diseño y gestión de bases de datos relacionales" },
  { id: "3", nombre: "Desarrollo Web", descripcion: "Creación de aplicaciones web modernas" },
  { id: "4", nombre: "Algoritmos y Estructuras de Datos", descripcion: "Análisis y diseño de algoritmos eficientes" },
]

export const mockCatedras: Catedra[] = [
  {
    id: "1",
    nombre: "Programación II",
    horarios: "Lunes y Miércoles 14:00-18:00",
    competencias: [mockCompetencias[0], mockCompetencias[3]],
  },
  {
    id: "2",
    nombre: "Bases de Datos",
    horarios: "Martes y Jueves 10:00-14:00",
    competencias: [mockCompetencias[1]],
  },
  {
    id: "3",
    nombre: "Desarrollo Web",
    horarios: "Viernes 14:00-18:00",
    competencias: [mockCompetencias[2]],
  },
]

export const mockComisiones: Comision[] = [
  { id: "1", nombre: "Comisión A", añoCarrera: 2024, catedraId: "1" },
  { id: "2", nombre: "Comisión B", añoCarrera: 2024, catedraId: "1" },
  { id: "3", nombre: "Comisión A", añoCarrera: 2024, catedraId: "2" },
]

export const mockAlumnos: Alumno[] = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@estudiante.edu",
    role: "student",
    legajo: 12345,
    contraseña: "student123",
  },
  {
    id: "2",
    nombre: "María",
    apellido: "González",
    email: "maria.gonzalez@estudiante.edu",
    role: "student",
    legajo: 12346,
    contraseña: "student123",
  },
]

export const mockProfesores: Profesor[] = [
  {
    id: "1",
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@profesor.edu",
    role: "teacher",
    legajo: 5001,
    contraseña: "teacher123",
  },
  {
    id: "2",
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@profesor.edu",
    role: "teacher",
    legajo: 5002,
    contraseña: "teacher123",
  },
]

export const mockAdmins: Admin[] = [
  {
    id: "1",
    nombre: "Admin",
    apellido: "Sistema",
    email: "admin@sistema.edu",
    role: "admin",
    contraseña: "admin123",
  },
]

export const mockCursadas: Cursada[] = [
  {
    id: "1",
    añoLectivo: 2024,
    notaFinal: null,
    notaConceptual: 8,
    feedback: "Buen desempeño en clase",
    alumnoId: "1",
    catedraId: "1",
    comisionId: "1",
  },
  {
    id: "2",
    añoLectivo: 2024,
    notaFinal: null,
    notaConceptual: 7,
    feedback: "Participación activa",
    alumnoId: "1",
    catedraId: "2",
    comisionId: "3",
  },
]

export const mockTPs: TP[] = [
  {
    id: "1",
    consigna: "Implementar un sistema de gestión de biblioteca usando POO",
    vigente: true,
    nota: 8,
    devolucion: "Buen trabajo, mejorar la documentación",
    cursadaId: "1",
    fechaEntrega: new Date("2024-12-20"),
    notaEntrega: new Date("2024-12-15"),
  },
  {
    id: "2",
    consigna: "Diseñar un modelo de datos para un e-commerce",
    vigente: true,
    nota: null,
    devolucion: "",
    cursadaId: "2",
    fechaEntrega: new Date("2024-12-25"),
    notaEntrega: new Date("2024-12-18"),
  },
  {
    id: "3",
    consigna: "Crear una API REST con autenticación",
    vigente: true,
    nota: null,
    devolucion: "",
    cursadaId: "1",
    fechaEntrega: new Date("2024-12-30"),
    notaEntrega: new Date("2024-12-22"),
  },
]

export const mockEvaluaciones: Evaluacion[] = [
  {
    id: "1",
    fecha: new Date("2024-11-15"),
    fechaDevolucion: new Date("2024-11-22"),
    temas: "Herencia, Polimorfismo, Interfaces",
    nota: 7,
    devolucion: "Buen manejo de conceptos teóricos",
    observaciones: "Repasar polimorfismo",
    cursadaId: "1",
  },
  {
    id: "2",
    fecha: new Date("2024-12-10"),
    fechaDevolucion: null,
    temas: "Normalización, SQL avanzado",
    nota: null,
    devolucion: "",
    observaciones: "",
    cursadaId: "2",
  },
]

export const mockNotificaciones: Notificacion[] = [
  {
    id: "1",
    mensaje: "Nueva calificación disponible para TP1 de Programación II",
    fecha: new Date("2024-12-15"),
    alumnoId: "1",
    leida: false,
  },
  {
    id: "2",
    mensaje: "Recordatorio: Entrega de TP2 el 25/12",
    fecha: new Date("2024-12-18"),
    alumnoId: "1",
    leida: false,
  },
  {
    id: "3",
    mensaje: "Material complementario subido en Bases de Datos",
    fecha: new Date("2024-12-10"),
    alumnoId: "1",
    leida: true,
  },
]

export const allUsers = [...mockAlumnos, ...mockProfesores, ...mockAdmins]
