-- Base de Datos: Sistema de Gestión Académica
-- Curso: Base de Datos Relacionales
-- Script de creación de tablas y datos de ejemplo

-- =============================================
-- CREACIÓN DE BASE DE DATOS
-- =============================================

CREATE DATABASE IF NOT EXISTS sistema_academico;
USE sistema_academico;

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla de Universidades
CREATE TABLE universidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    sitio_web VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Facultades
CREATE TABLE facultades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    universidad_id INT NOT NULL,
    decano VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (universidad_id) REFERENCES universidades(id) ON DELETE CASCADE
);

-- Tabla de Carreras
CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    facultad_id INT NOT NULL,
    duracion_años INT NOT NULL,
    titulo VARCHAR(150),
    modalidad ENUM('Presencial', 'Virtual', 'Semipresencial') DEFAULT 'Presencial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE CASCADE
);

-- Tabla de Materias
CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    creditos INT NOT NULL,
    semestre INT,
    carrera_id INT NOT NULL,
    prerequisitos TEXT,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE
);

-- Tabla de Profesores
CREATE TABLE profesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    titulo_academico VARCHAR(150),
    especialidad VARCHAR(100),
    fecha_ingreso DATE,
    estado ENUM('Activo', 'Inactivo', 'Licencia') DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estudiantes
CREATE TABLE estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    direccion TEXT,
    carrera_id INT NOT NULL,
    semestre_actual INT DEFAULT 1,
    estado ENUM('Activo', 'Inactivo', 'Graduado', 'Suspendido') DEFAULT 'Activo',
    fecha_ingreso DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT
);

-- Tabla de Grupos/Secciones
CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    materia_id INT NOT NULL,
    profesor_id INT NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    año INT NOT NULL,
    horario TEXT,
    aula VARCHAR(50),
    capacidad_maxima INT DEFAULT 30,
    estudiantes_inscritos INT DEFAULT 0,
    estado ENUM('Activo', 'Finalizado', 'Cancelado') DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_grupo (codigo, materia_id, periodo, año)
);

-- Tabla de Inscripciones
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    grupo_id INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    estado ENUM('Inscrito', 'Retirado', 'Completado') DEFAULT 'Inscrito',
    nota_final DECIMAL(4,2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inscripcion (estudiante_id, grupo_id)
);

-- Tabla de Evaluaciones
CREATE TABLE evaluaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('Parcial', 'Final', 'Quiz', 'Taller', 'Proyecto') NOT NULL,
    fecha DATE NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE
);

-- Tabla de Notas
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL,
    evaluacion_id INT NOT NULL,
    nota DECIMAL(4,2) NOT NULL,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nota (inscripcion_id, evaluacion_id),
    CHECK (nota >= 0 AND nota <= 5)
);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

CREATE INDEX idx_estudiantes_carrera ON estudiantes(carrera_id);
CREATE INDEX idx_estudiantes_estado ON estudiantes(estado);
CREATE INDEX idx_grupos_materia ON grupos(materia_id);
CREATE INDEX idx_grupos_profesor ON grupos(profesor_id);
CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_inscripciones_grupo ON inscripciones(grupo_id);
CREATE INDEX idx_notas_inscripcion ON notas(inscripcion_id);
CREATE INDEX idx_evaluaciones_grupo ON evaluaciones(grupo_id);

-- =============================================
-- DATOS DE EJEMPLO
-- =============================================

-- Insertar Universidad
INSERT INTO universidades (nombre, direccion, telefono, email, sitio_web) VALUES
('Universidad Nacional de Tecnología', 'Av. Principal 123, Ciudad Capital', '+1-555-0123', 'info@unt.edu', 'www.unt.edu');

-- Insertar Facultades
INSERT INTO facultades (nombre, universidad_id, decano, telefono, email) VALUES
('Facultad de Ingeniería', 1, 'Dr. Carlos Rodríguez', '+1-555-0124', 'ingenieria@unt.edu'),
('Facultad de Ciencias', 1, 'Dra. María González', '+1-555-0125', 'ciencias@unt.edu');

-- Insertar Carreras
INSERT INTO carreras (nombre, codigo, facultad_id, duracion_años, titulo, modalidad) VALUES
('Ingeniería de Sistemas', 'IS', 1, 5, 'Ingeniero de Sistemas', 'Presencial'),
('Ingeniería Industrial', 'II', 1, 5, 'Ingeniero Industrial', 'Presencial'),
('Matemáticas', 'MAT', 2, 4, 'Licenciado en Matemáticas', 'Presencial');

-- Insertar Materias
INSERT INTO materias (nombre, codigo, creditos, semestre, carrera_id, descripcion) VALUES
('Programación I', 'PROG1', 4, 1, 1, 'Fundamentos de programación'),
('Estructuras de Datos', 'ED', 4, 2, 1, 'Algoritmos y estructuras de datos'),
('Base de Datos', 'BD', 3, 3, 1, 'Diseño y manejo de bases de datos'),
('Cálculo Diferencial', 'CAL1', 4, 1, 1, 'Fundamentos del cálculo'),
('Álgebra Lineal', 'AL', 3, 2, 1, 'Vectores, matrices y transformaciones');

-- Insertar Profesores
INSERT INTO profesores (nombres, apellidos, documento, email, telefono, titulo_academico, especialidad, fecha_ingreso, estado) VALUES
('Juan Carlos', 'Pérez López', '12345678', 'jperez@unt.edu', '+1-555-1001', 'PhD en Ciencias de la Computación', 'Algoritmos', '2020-01-15', 'Activo'),
('Ana María', 'García Silva', '23456789', 'agarcia@unt.edu', '+1-555-1002', 'Magíster en Matemáticas', 'Análisis Numérico', '2019-03-01', 'Activo'),
('Roberto', 'Martínez Torres', '34567890', 'rmartinez@unt.edu', '+1-555-1003', 'PhD en Ingeniería de Software', 'Base de Datos', '2021-08-20', 'Activo');

-- Insertar Estudiantes
INSERT INTO estudiantes (nombres, apellidos, documento, email, telefono, fecha_nacimiento, direccion, carrera_id, semestre_actual, fecha_ingreso, estado) VALUES
('Luis Fernando', 'Rodríguez Gómez', '1001234567', 'lrodriguez@estudiante.unt.edu', '+1-555-2001', '2000-05-15', 'Calle 45 #12-34', 1, 3, '2022-02-01', 'Activo'),
('Carolina', 'López Herrera', '1001234568', 'clopez@estudiante.unt.edu', '+1-555-2002', '1999-11-22', 'Carrera 78 #90-12', 1, 2, '2023-02-01', 'Activo'),
('Diego Andrés', 'Morales Castro', '1001234569', 'dmorales@estudiante.unt.edu', '+1-555-2003', '2001-03-08', 'Av. 123 #45-67', 1, 1, '2024-02-01', 'Activo');

-- Insertar Grupos
INSERT INTO grupos (codigo, materia_id, profesor_id, periodo, año, horario, aula, capacidad_maxima) VALUES
('IS-PROG1-001', 1, 1, '2024-1', 2024, 'Lunes y Miércoles 8:00-10:00', 'Lab 201', 25),
('IS-ED-001', 2, 1, '2024-1', 2024, 'Martes y Jueves 10:00-12:00', 'Lab 202', 25),
('IS-BD-001', 3, 3, '2024-1', 2024, 'Viernes 8:00-11:00', 'Lab 203', 30);

-- Insertar Inscripciones
INSERT INTO inscripciones (estudiante_id, grupo_id, fecha_inscripcion, estado) VALUES
(1, 2, '2024-02-05', 'Inscrito'),
(1, 3, '2024-02-05', 'Inscrito'),
(2, 1, '2024-02-05', 'Inscrito'),
(2, 2, '2024-02-05', 'Inscrito'),
(3, 1, '2024-02-05', 'Inscrito');

-- Insertar Evaluaciones
INSERT INTO evaluaciones (grupo_id, nombre, tipo, fecha, porcentaje, descripcion) VALUES
(1, 'Primer Parcial', 'Parcial', '2024-03-15', 30.00, 'Evaluación de conceptos básicos'),
(1, 'Segundo Parcial', 'Parcial', '2024-04-20', 30.00, 'Evaluación intermedia'),
(1, 'Examen Final', 'Final', '2024-05-25', 40.00, 'Evaluación final del curso'),
(2, 'Quiz 1', 'Quiz', '2024-03-10', 15.00, 'Quiz sobre arrays'),
(2, 'Proyecto', 'Proyecto', '2024-05-15', 40.00, 'Implementación de estructura de datos');

-- Insertar Notas
INSERT INTO notas (inscripcion_id, evaluacion_id, nota, observaciones) VALUES
(2, 1, 4.2, 'Buen desempeño'),
(2, 2, 3.8, 'Puede mejorar'),
(3, 1, 4.5, 'Excelente trabajo'),
(3, 2, 4.0, 'Muy bien'),
(4, 4, 4.8, 'Sobresaliente'),
(4, 5, 4.3, 'Buen proyecto');

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista de estudiantes con su información completa
CREATE VIEW vista_estudiantes_completa AS
SELECT 
    e.id,
    CONCAT(e.nombres, ' ', e.apellidos) AS nombre_completo,
    e.documento,
    e.email,
    c.nombre AS carrera,
    f.nombre AS facultad,
    e.semestre_actual,
    e.estado
FROM estudiantes e
JOIN carreras c ON e.carrera_id = c.id
JOIN facultades f ON c.facultad_id = f.id;

-- Vista de notas por estudiante
CREATE VIEW vista_notas_estudiantes AS
SELECT 
    CONCAT(est.nombres, ' ', est.apellidos) AS estudiante,
    m.nombre AS materia,
    ev.nombre AS evaluacion,
    ev.tipo,
    n.nota,
    ev.porcentaje,
    g.periodo,
    g.año
FROM notas n
JOIN inscripciones i ON n.inscripcion_id = i.id
JOIN estudiantes est ON i.estudiante_id = est.id
JOIN grupos g ON i.grupo_id = g.id
JOIN materias m ON g.materia_id = m.id
JOIN evaluaciones ev ON n.evaluacion_id = ev.id
ORDER BY estudiante, materia, ev.fecha;

-- =============================================
-- PROCEDIMIENTOS ALMACENADOS
-- =============================================

DELIMITER //

-- Procedimiento para calcular promedio de un estudiante
CREATE PROCEDURE calcular_promedio_estudiante(
    IN p_estudiante_id INT,
    IN p_grupo_id INT,
    OUT p_promedio DECIMAL(4,2)
)
BEGIN
    SELECT AVG(n.nota * (ev.porcentaje / 100)) INTO p_promedio
    FROM notas n
    JOIN inscripciones i ON n.inscripcion_id = i.id
    JOIN evaluaciones ev ON n.evaluacion_id = ev.id
    WHERE i.estudiante_id = p_estudiante_id AND i.grupo_id = p_grupo_id;
END//

DELIMITER ;

-- =============================================
-- CONSULTAS DE EJEMPLO
-- =============================================

-- Mostrar todos los estudiantes de Ingeniería de Sistemas
SELECT * FROM vista_estudiantes_completa WHERE carrera = 'Ingeniería de Sistemas';

-- Mostrar notas de un estudiante específico
SELECT * FROM vista_notas_estudiantes WHERE estudiante = 'Luis Fernando Rodríguez Gómez';

-- Estudiantes por carrera
SELECT c.nombre AS carrera, COUNT(e.id) AS total_estudiantes
FROM carreras c
LEFT JOIN estudiantes e ON c.id = e.carrera_id
GROUP BY c.id, c.nombre;

-- Promedio general por materia
SELECT 
    m.nombre AS materia,
    ROUND(AVG(n.nota), 2) AS promedio_general
FROM materias m
JOIN grupos g ON m.id = g.materia_id
JOIN inscripciones i ON g.id = i.grupo_id
JOIN notas n ON i.id = n.inscripcion_id
GROUP BY m.id, m.nombre;

-- Esta base de datos proporciona una estructura completa para un sistema académico
-- con todas las relaciones necesarias y ejemplos de datos para pruebas.