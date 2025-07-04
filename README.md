
# 🎯 Taller 3 - Arquitectura de Microservicios con CI/CD

Este repositorio corresponde al **Taller 3 de Arquitectura de Sistemas**, donde se implementa un sistema distribuido compuesto por **microservicios** desarrollados en **NestJS**, comunicados vía **gRPC** y **RabbitMQ**, orquestados mediante **Docker Compose**, y con **CI/CD** usando **GitHub Actions**.

---

## 🚀 ¿Cómo levantar el proyecto?

> Todo el sistema se ejecuta automáticamente con Docker.

### Requisitos:
- Tener instalado Docker y Docker Compose.
- Tener acceso a una terminal (PowerShell, CMD o Bash).

### Pasos:

```bash
docker-compose up --build
```

Este comando:
- Construye todas las imágenes Docker necesarias.
- Levanta todos los microservicios.
- Conecta los servicios entre sí (bases de datos, RabbitMQ, etc).

⏱ Espera unos segundos hasta que todos estén levantados correctamente.

📍 Puedes verificar el estado de cada microservicio accediendo al endpoint `/health` expuesto en cada uno de ellos.

---

## 📦 CI/CD con GitHub Actions

Este proyecto incluye **2 flujos de trabajo automáticos** configurados en `.github/workflows/`:

### 1. Subir imágenes Docker (build-and-push)
- Se ejecuta automáticamente en cada push a la rama `main`.
- Compila y sube las imágenes de cada microservicio a Docker Hub.
- Asigna `latest` y el `commit SHA` como tags.

### 2. Pruebas E2E
- Ejecuta automáticamente pruebas integradas cuando se hace commit en la rama principal del microservicio de usuarios.
- Valida todo el flujo CRUD a través de la API Gateway, incluyendo casos de éxito y error.

---

## 🔐 Configurar Secrets de GitHub Actions

Para que el flujo de CI/CD funcione correctamente, debes configurar los siguientes `secrets` en tu repositorio en GitHub:

1. Ve a tu repositorio → `Settings` → `Secrets and variables` → `Actions`.
2. Agrega estos dos secrets:

| Nombre del Secret         | Descripción                          |
|---------------------------|--------------------------------------|
| `DOCKER_USERNAME`         | Tu nombre de usuario de Docker Hub   |
| `DOCKER_PASSWORD`         | Tu contraseña o token de acceso de Docker Hub |

> ⚠️ El token debe tener permisos de **lectura, escritura y eliminación**. Si no tiene estos permisos, el flujo fallará al intentar subir la imagen.

Para generar un token:
- Ve a [https://hub.docker.com/settings/security](https://hub.docker.com/settings/security)
- Crea un **Access Token** con los permisos mencionados.
- Usa ese token como valor para `DOCKER_PASSWORD`.

---

## 🗄️ Bases de datos por microservicio

Todas las bases de datos se crean automáticamente al levantar los servicios. Aquí se indica el nombre y motor usado:

| Microservicio              | Motor       | Nombre base de datos              |
|----------------------------|-------------|-----------------------------------|
| `auth`                    | PostgreSQL  | `authT2_db`                       |
| `usuarios`                | MariaDB     | `usuarios_db`                     |
| `facturas`                | MariaDB     | `facturacion`                     |
| `listas-reproduccion`     | PostgreSQL  | `listas_db`                       |
| `videos`                  | MongoDB     | `tallerMicro`                     |
| `monitoreo`               | MongoDB     | `micro_monitoreo`                 |
| `interacciones sociales` | MongoDB     | `interacciones`                   |
| `correo`                  | —           | *No utiliza base de datos*        |

---

## ✅ Endpoints disponibles

Todos los endpoints están expuestos a través de la **API Gateway**.

> Cada microservicio expone además un endpoint `/health` para verificar que está funcionando correctamente.

### 🔐 Autenticación
- `POST /auth/login`
- `POST /auth/logout`
- `PATCH /auth/usuarios/:id`
- `GET /auth/health`

### 👤 Usuarios
- `POST /usuarios`
- `GET /usuarios`
- `GET /usuarios/:id`
- `PATCH /usuarios/:id`
- `DELETE /usuarios/:id`
- `GET /usuarios/health`

### 🧾 Facturas
- `POST /facturas`
- `GET /facturas`
- `GET /facturas/:id`
- `PATCH /facturas/:id`
- `DELETE /facturas/:id`
- `GET /facturas/health`

### 🎞 Videos
- `POST /videos`
- `GET /videos`
- `GET /videos/:id`
- `PATCH /videos/:id`
- `DELETE /videos/:id`
- `GET /videos/buscar/titulo`
- `POST /videos/seed`
- `GET /videos/health`

### 📊 Monitoreo
- `GET /monitoreo/acciones`
- `GET /monitoreo/errores`
- `GET /monitoreo/health`

### 🎵 Listas de Reproducción
- `POST /listas-reproduccion`
- `GET /listas-reproduccion`
- `DELETE /listas-reproduccion/:id`
- `POST /listas-reproduccion/:id/videos`
- `DELETE /listas-reproduccion/:id/videos`
- `GET /listas-reproduccion/:id/videos`
- `GET /listas-reproduccion/health`

### 💬 Interacciones Sociales
- `POST /interacciones/like`
- `POST /interacciones/comentario`
- `GET /interacciones/:id`
- `POST /interacciones/seed`
- `GET /interacciones/health`

---

## 🔄 Seeders

Para poblar la base de datos automáticamente, cada microservicio expone un endpoint `/seed`. **Ejecuta en este orden**:

1. `POST /usuarios/seed`
2. `POST /videos/seed`
3. `POST /facturas/seed`
4. `POST /interacciones/seed`

> Asegúrate de que todos los microservicios estén levantados antes de usar los seeders.

---

## 🆘 ¿Dudas o errores?

Revisa los logs del contenedor con:

```bash
docker logs nombre_del_contenedor
```

O pregunta en el grupo de apoyo del Taller.

---

## 🔧 Configuración de variables de entorno (.env)

Cada microservicio requiere un archivo `.env` para definir sus variables de entorno. A continuación se detallan las variables necesarias por servicio:

### 🛡️ `auth`
```env
DB_AUTH_HOST=auth-db
DB_AUTH_PORT=5432
DB_AUTH_USERNAME=postgres
DB_AUTH_PASSWORD=123
DB_AUTH_NAME=authT2_db

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h
```

### 📬 `correo`
```env
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion
```

### 💸 `facturas`
```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_FACTURAS_NAME=facturacion
```

### 💬 `interacciones`
```env
MONGO_INTERACCIONES_URI=mongodb://localhost:27017/interacciones
```

### 🎵 `listas-reproduccion`
```env
DB_LISTAS_HOST=listas-db
DB_LISTAS_PORT=5432
DB_LISTAS_USERNAME=postgres
DB_LISTAS_PASSWORD=123
DB_LISTAS_NAME=listas_db
```

### 📊 `monitoreo`
```env
MONGO_URI=mongodb://monitoreo-db:27017/micro_monitoreo
```

### 👥 `usuarios`
```env
DB_USERS_HOST=usuarios-db
DB_USERS_PORT=3306
DB_USERS_USERNAME=devuser
DB_USERS_PASSWORD=superseguro123
DB_USERS_NAME=usuariosT2_db
```

### 🎞 `videos`
```env
MONGODB_URI=mongodb://localhost:27017/tallerMicro
```

> 📁 Recuerda: todos estos archivos `.env` deben estar ubicados en la raíz del respectivo microservicio para que Docker los tome correctamente.
