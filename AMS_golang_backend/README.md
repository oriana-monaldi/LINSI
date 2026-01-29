# LINSITrack

## Running the stack locally

```bash
docker-compose up -d
```

## Documentacion

### Auth

- Admin

- Profesor

- Alumno

### Notificaciones

### Cursadas

### Comisiones

### Materias

### Evaluaciones

### TPs

### Competencias

### Archivos Anexos (por parte de profesores para los TPs)

### Entregas (de tps resueltos por los alumnos)

#### Crear Entrega con datos obligatorios
POST /entregas
body type: JSON
```json
{
  "fecha_hora": "2023-10-05T14:48:00Z",
  "alumno_id": 6,
  "tp_id": 11
}
```
(Almacenar el id de la entrega creada al recibir la respuesta del servidor para usarlo en las siguientes operaciones)

#### Adjuntar archivo a una entrega
POST /entregas/{id_de_entrega}/upload
body type: multipart/form-data
```json
{
  "file": "value: <base64-encoded-file-content>"
}
```