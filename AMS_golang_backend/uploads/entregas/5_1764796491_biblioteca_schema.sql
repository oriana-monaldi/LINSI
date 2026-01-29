-- TP Sistema Bibliotecario - Juan Pérez
-- Base de datos para gestión bibliotecaria

CREATE DATABASE biblioteca_db;
USE biblioteca_db;

-- Tabla de autores
CREATE TABLE autores (
    id_autor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    nacionalidad VARCHAR(50),
    fecha_nacimiento DATE
);

-- Tabla de géneros
CREATE TABLE generos (
    id_genero INT PRIMARY KEY AUTO_INCREMENT,
    nombre_genero VARCHAR(50) NOT NULL
);

-- Tabla de libros
CREATE TABLE libros (
    id_libro INT PRIMARY KEY AUTO_INCREMENT,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    id_autor INT,
    id_genero INT,
    fecha_publicacion DATE,
    editorial VARCHAR(100),
    paginas INT,
    disponibles INT DEFAULT 1,
    total_copias INT DEFAULT 1,
    FOREIGN KEY (id_autor) REFERENCES autores(id_autor),
    FOREIGN KEY (id_genero) REFERENCES generos(id_genero)
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    numero_carnet VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(20),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de préstamos
CREATE TABLE prestamos (
    id_prestamo INT PRIMARY KEY AUTO_INCREMENT,
    id_libro INT,
    id_usuario INT,
    fecha_prestamo DATE DEFAULT CURRENT_DATE,
    fecha_devolucion_esperada DATE,
    fecha_devolucion_real DATE NULL,
    multa DECIMAL(10,2) DEFAULT 0.00,
    estado ENUM('ACTIVO', 'DEVUELTO', 'VENCIDO') DEFAULT 'ACTIVO',
    FOREIGN KEY (id_libro) REFERENCES libros(id_libro),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Insertar datos de prueba
INSERT INTO autores (nombre, apellido, nacionalidad, fecha_nacimiento) VALUES
('Gabriel', 'García Márquez', 'Colombiana', '1927-03-06'),
('Mario', 'Vargas Llosa', 'Peruana', '1936-03-28'),
('Isabel', 'Allende', 'Chilena', '1942-08-02');

INSERT INTO generos (nombre_genero) VALUES
('Realismo Mágico'),
('Novela'),
('Ensayo'),
('Biografía');

INSERT INTO libros (isbn, titulo, id_autor, id_genero, fecha_publicacion, editorial, paginas, total_copias, disponibles) VALUES
('9780060883287', 'Cien años de soledad', 1, 1, '1967-06-05', 'Sudamericana', 471, 3, 2),
('9788420471839', 'La ciudad y los perros', 2, 2, '1963-01-01', 'Seix Barral', 413, 2, 1),
('9788401242298', 'La casa de los espíritus', 3, 1, '1982-01-01', 'Plaza & Janés', 462, 2, 2);

-- Consultas complejas requeridas
-- 1. Libros más prestados
SELECT l.titulo, COUNT(p.id_prestamo) as total_prestamos
FROM libros l
LEFT JOIN prestamos p ON l.id_libro = p.id_libro
GROUP BY l.id_libro, l.titulo
ORDER BY total_prestamos DESC;

-- 2. Usuarios con multas pendientes
SELECT u.nombre, u.apellido, SUM(p.multa) as total_multa
FROM usuarios u
INNER JOIN prestamos p ON u.id_usuario = p.id_usuario
WHERE p.multa > 0 AND p.estado != 'DEVUELTO'
GROUP BY u.id_usuario
HAVING total_multa > 0;

-- 3. Libros disponibles por género
SELECT g.nombre_genero, COUNT(l.id_libro) as libros_disponibles
FROM generos g
LEFT JOIN libros l ON g.id_genero = l.id_genero AND l.disponibles > 0
GROUP BY g.id_genero, g.nombre_genero;
