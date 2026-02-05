# 📘 LINSITrack  - Práctica Profesional Supervisada.
Sistema de Gestión de Seguimiento Académico

## 🧠 Descripción del proyecto

**LINSITrack** es una plataforma de seguimiento académico que centraliza en un solo sistema los procesos de una cursada  
trabajos prácticos, entregas, evaluaciones, notas, progreso, competencias y feedback.

Surge como respuesta a la dispersión de herramientas (CVG, planillas, mensajes y registros manuales) que generan inconsistencias y dificultan el seguimiento real del estudiante.

El sistema permite pasar de un modelo estático de registro de notas a uno **dinámico y trazable**, donde cada acción (entrega, corrección, calificación o comentario) impacta de forma directa y visible en el estado general de la cursada.

---

## 🎯 Objetivos

- Centralizar la gestión académica en una única plataforma.  
- Facilitar el seguimiento del estudiante mediante métricas automáticas:
  - progreso  
  - promedio  
  - estado de entregas  
- Incorporar el concepto de **competencias** como parte de la evaluación.  
- Fomentar la comunicación mediante **feedback** entre docentes y alumnos.

---

## 🛠 Tecnologías

| Capa         | Tecnología |
|--------------|------------|
| Frontend     | Next.js    |
| Backend      | Go + Gin   |
| Contenedores | Docker     |
| Comunicación | API REST   |

---

## 🚀 Cómo levantar el proyecto

### Requisitos

- Node.js  
- npm  
- Docker  
- Docker Compose  

---

### ▶ Frontend (Next.js)

Desde la carpeta del frontend:

```bash
npm install
npm run dev



```bash
docker compose build
docker compose up
