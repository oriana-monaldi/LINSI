# Manual de Buenas Prácticas de Desarrollo

## Tabla de Contenidos

1. [Principios Generales](#principios-generales)
2. [Convenciones de Código](#convenciones-de-código)
3. [Control de Versiones](#control-de-versiones)
4. [Testing y Quality Assurance](#testing-y-quality-assurance)
5. [Documentación](#documentación)
6. [Seguridad](#seguridad)
7. [Performance](#performance)
8. [Deployment](#deployment)

## Principios Generales

### 1. SOLID Principles

#### Single Responsibility Principle (SRP)

-   Cada clase debe tener una sola razón para cambiar
-   Una función debe hacer una sola cosa y hacerla bien

```python
# ❌ Malo - múltiples responsabilidades
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def save_to_database(self):
        # lógica de base de datos
        pass

    def send_email(self):
        # lógica de email
        pass

# ✅ Bueno - responsabilidades separadas
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

class UserRepository:
    def save(self, user):
        # lógica de base de datos
        pass

class EmailService:
    def send_email(self, user):
        # lógica de email
        pass
```

#### Open/Closed Principle (OCP)

-   Abierto para extensión, cerrado para modificación

#### Liskov Substitution Principle (LSP)

-   Los objetos derivados deben ser sustituibles por sus objetos base

#### Interface Segregation Principle (ISP)

-   Los clientes no deben depender de interfaces que no usan

#### Dependency Inversion Principle (DIP)

-   Depender de abstracciones, no de implementaciones concretas

### 2. DRY (Don't Repeat Yourself)

-   Evita la duplicación de código
-   Extrae funcionalidad común a funciones o clases reutilizables

### 3. KISS (Keep It Simple, Stupid)

-   Mantén el código simple y legible
-   Evita la sobre-ingeniería

## Convenciones de Código

### Naming Conventions

#### Variables y Funciones

```python
# ✅ Descriptivo y claro
user_age = 25
calculate_total_price(items)

# ❌ Confuso
ua = 25
calc(items)
```

#### Clases

```python
# ✅ PascalCase
class UserManager:
    pass

class DatabaseConnection:
    pass
```

#### Constantes

```python
# ✅ SCREAMING_SNAKE_CASE
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT = 30
```

### Formateo de Código

#### Indentación

-   Usar 4 espacios para indentación (Python)
-   Usar 2 espacios para JavaScript/TypeScript
-   Ser consistente en todo el proyecto

#### Longitud de Línea

-   Máximo 80-120 caracteres por línea
-   Romper líneas largas de manera legible

```python
# ✅ Bueno
result = some_function(
    parameter_one,
    parameter_two,
    parameter_three
)

# ❌ Malo
result = some_function(parameter_one, parameter_two, parameter_three, parameter_four, parameter_five)
```

### Comentarios

#### Cuando Comentar

```python
# ✅ Explica el "por qué", no el "qué"
# Usamos binary search porque los datos están ordenados
# y necesitamos O(log n) performance
def binary_search(arr, target):
    pass

# ❌ Comenta lo obvio
# Incrementa i en 1
i += 1
```

#### Documentación de Funciones

```python
def calculate_compound_interest(principal, rate, time, compounds_per_year):
    """
    Calcula el interés compuesto.

    Args:
        principal (float): Cantidad inicial de dinero
        rate (float): Tasa de interés anual (como decimal)
        time (float): Tiempo en años
        compounds_per_year (int): Número de veces que se compone por año

    Returns:
        float: El monto final después del interés compuesto

    Raises:
        ValueError: Si algún parámetro es negativo
    """
    if any(x < 0 for x in [principal, rate, time, compounds_per_year]):
        raise ValueError("Los parámetros no pueden ser negativos")

    return principal * (1 + rate / compounds_per_year) ** (compounds_per_year * time)
```

## Control de Versiones

### Git Best Practices

#### Commit Messages

```bash
# ✅ Formato recomendado
feat: add user authentication system
fix: resolve memory leak in image processor
docs: update API documentation for endpoints
refactor: simplify user validation logic
test: add unit tests for payment processing

# ❌ Mensajes poco descriptivos
git commit -m "fix"
git commit -m "changes"
git commit -m "stuff"
```

#### Branching Strategy

```bash
# Estructura recomendada
main/master     # Código en producción
develop         # Rama de desarrollo
feature/*       # Nuevas características
hotfix/*        # Correcciones urgentes
release/*       # Preparación de releases
```

#### .gitignore Examples

```gitignore
# Python
__pycache__/
*.pyc
*.pyo
*.env
venv/
.venv/

# Node.js
node_modules/
npm-debug.log
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

## Testing y Quality Assurance

### Tipos de Testing

#### Unit Tests

```python
import unittest

class TestCalculator(unittest.TestCase):

    def setUp(self):
        self.calc = Calculator()

    def test_add_positive_numbers(self):
        result = self.calc.add(2, 3)
        self.assertEqual(result, 5)

    def test_add_negative_numbers(self):
        result = self.calc.add(-1, -1)
        self.assertEqual(result, -2)

    def test_divide_by_zero(self):
        with self.assertRaises(ZeroDivisionError):
            self.calc.divide(5, 0)
```

#### Integration Tests

```python
class TestUserAPI(unittest.TestCase):

    def test_create_user_workflow(self):
        # Test completo del flujo de creación de usuario
        response = self.client.post('/api/users', data={
            'name': 'John Doe',
            'email': 'john@example.com'
        })
        self.assertEqual(response.status_code, 201)

        # Verificar que el usuario fue creado en la base de datos
        user = User.objects.get(email='john@example.com')
        self.assertEqual(user.name, 'John Doe')
```

### Test Coverage

-   Mantener al menos 80% de cobertura de código
-   Priorizar testing de funciones críticas del negocio

```bash
# Python coverage
pip install coverage
coverage run -m pytest
coverage report -m
coverage html  # Genera reporte HTML
```

## Documentación

### README.md Template

````markdown
# Project Name

Brief description of what this project does.

## Installation

```bash
git clone https://github.com/username/project.git
cd project
pip install -r requirements.txt
```
````

## Usage

```python
from project import MyClass

instance = MyClass()
result = instance.do_something()
```

## API Documentation

### Endpoints

#### GET /api/users

Returns a list of users.

**Response:**

```json
{
    "users": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com"
        }
    ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

````

## Seguridad

### Input Validation
```python
# ✅ Validación adecuada
def update_user_email(user_id, new_email):
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user ID")

    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', new_email):
        raise ValueError("Invalid email format")

    # Procesar actualización
````

### SQL Injection Prevention

```python
# ✅ Usando parámetros
cursor.execute(
    "SELECT * FROM users WHERE email = %s",
    (user_email,)
)

# ❌ Concatenación directa (vulnerable)
cursor.execute(
    f"SELECT * FROM users WHERE email = '{user_email}'"
)
```

### Authentication & Authorization

```python
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect('/login')
        return f(*args, **kwargs)
    return decorated_function

@require_auth
def protected_route():
    return "This is a protected route"
```

## Performance

### Database Optimization

-   Usar índices apropiados
-   Evitar consultas N+1
-   Implementar paginación para grandes datasets

```python
# ✅ Eager loading
users = User.objects.select_related('profile').all()

# ❌ N+1 queries
users = User.objects.all()
for user in users:
    print(user.profile.bio)  # Query por cada usuario
```

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_computation(param):
    # Operación costosa
    return result
```

### Memory Management

-   Usar generadores para procesar grandes cantidades de datos
-   Liberar recursos explícitamente cuando sea necesario

```python
# ✅ Generador eficiente en memoria
def process_large_file(filename):
    with open(filename, 'r') as f:
        for line in f:
            yield process_line(line)

# ❌ Carga todo en memoria
def process_large_file_bad(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()  # Todo el archivo en memoria
        return [process_line(line) for line in lines]
```

## Deployment

### Environment Configuration

```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
```

### Docker Best Practices

```dockerfile
FROM python:3.9-slim

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash app
USER app
WORKDIR /home/app

# Instalar dependencias primero (para cache)
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

EXPOSE 8000
CMD ["python", "app.py"]
```

### Monitoring y Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def process_payment(amount):
    logger.info(f"Processing payment of ${amount}")
    try:
        # Procesar pago
        result = payment_service.process(amount)
        logger.info(f"Payment processed successfully: {result.transaction_id}")
        return result
    except Exception as e:
        logger.error(f"Payment processing failed: {str(e)}")
        raise
```

## Checklist Pre-Deploy

-   [ ] Todos los tests pasan
-   [ ] Cobertura de tests > 80%
-   [ ] No hay secretos hardcodeados
-   [ ] Variables de entorno configuradas
-   [ ] Base de datos migrada
-   [ ] Logging configurado
-   [ ] Monitoring configurado
-   [ ] Documentación actualizada
-   [ ] Security scan ejecutado

---

**Recuerda:** Estas son pautas generales. Adapta según las necesidades específicas de tu proyecto y equipo.
