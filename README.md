# 🎯 Taller 2 - Arquitectura de Microservicios

Este repositorio corresponde al Taller 2 de Arquitectura de Sistemas, donde se implementa una arquitectura distribuida basada en **microservicios** utilizando **NestJS**, **gRPC**, **RabbitMQ**, y múltiples bases de datos.

---

## 👨‍💻 Rol del Desarrollador A

Este trabajo corresponde a la implementación de los microservicios a cargo del **Desarrollador A**, los cuales son:

- ✅ `auth` → Microservicio de autenticación (PostgreSQL + JWT + blacklist)
- ✅ `usuarios` → Gestión de usuarios (MariaDB + control por roles)
- ✅ `listas-reproduccion` → Manejo de listas y videos (PostgreSQL)
- ✅ `correo` → Envío de emails al recibir eventos `factura.creada` / `factura.actualizada`
- ✅ API Gateway (exposición de todos los endpoints por HTTP)

---

## 📦 Requisitos

- Node.js 18+
- Docker + Docker Compose
- RabbitMQ corriendo localmente o vía Docker

---

## 🐇 RabbitMQ

Puedes levantar RabbitMQ fácilmente con Docker:

```bash
docker-compose up -d
```

> Asegúrate de tener el archivo `docker-compose.yml` en la raíz del proyecto con el siguiente contenido:

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"     # AMQP
      - "15672:15672"   # Web UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    networks:
      - microservices-net

networks:
  microservices-net:
    driver: bridge
```

📍 Accede a la consola en [http://localhost:15672](http://localhost:15672)  
Usuario: `admin`  
Contraseña: `admin`

---

## ⚙️ Instalación y ejecución por microservicio

Cada microservicio se ejecuta por separado. Desde su carpeta, debes hacer:

```bash
npm install
npm run start:dev
```

### 📁 `microservicios/auth`

#### `.env`:

```env
DB_AUTH_HOST=localhost
DB_AUTH_PORT=5432
DB_AUTH_USERNAME=postgres
DB_AUTH_PASSWORD=123
DB_AUTH_NAME=authT2_db

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h
```

---

### 📁 `microservicios/usuarios`

#### `.env`:

```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_USERS_NAME=usuarios_db
```

---

### 📁 `microservicios/listas-reproduccion`

#### `.env`:

```env
DB_LISTAS_HOST=localhost
DB_LISTAS_PORT=5432
DB_LISTAS_USERNAME=postgres
DB_LISTAS_PASSWORD=123
DB_LISTAS_NAME=listas_db
```

---

### 📁 `microservicios/correo`

Este microservicio **escucha eventos RabbitMQ** (`factura.creada`, `factura.actualizada`) y envía correos al cliente.

#### `.env`:

```env
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion
```

> Requiere una contraseña de aplicación de Gmail:  
> https://myaccount.google.com/apppasswords

---

## 🚪 API Gateway

La API Gateway expone todos los endpoints vía HTTP y comunica con los microservicios por gRPC. Para ejecutarla:

```bash
cd api-gateway
npm install
npm run start:dev
```

Endpoints disponibles:
- `POST /auth/login`
- `POST /auth/logout`
- `PATCH /auth/usuarios/:id`
- `POST /usuarios`
- `GET /usuarios`
- `GET /usuarios/:id`
- `DELETE /usuarios/:id`
- `POST /listas-reproduccion`
- `GET /listas-reproduccion`
- `DELETE /listas-reproduccion/:id`
- `POST /listas-reproduccion/:id/videos`
- `DELETE /listas-reproduccion/:id/videos`
- `GET /listas-reproduccion/:id/videos`

---

## 📌 Notas Finales

- Este proyecto sigue una estructura monorepo
- Cada microservicio tiene su propio `.env` y conexión a base de datos
- RabbitMQ es esencial para la comunicación entre servicios

---

¿Dudas o preguntas?  
Contáctame o revisa los comentarios en el código.
