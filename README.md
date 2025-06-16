# 🎯 Taller 2 - Arquitectura de Microservicios

Este repositorio corresponde al Taller 2 de Arquitectura de Sistemas, donde se implementa una arquitectura distribuida basada en **microservicios** utilizando **NestJS**, **gRPC**, **RabbitMQ**, y múltiples bases de datos.

---

## 👨‍💻 Rol del Desarrollador A

Este trabajo corresponde a la implementación de los microservicios a cargo del **Desarrollador A**, los cuales son:

- ✅ auth → Microservicio de autenticación (PostgreSQL + JWT + blacklist)
- ✅ usuarios → Gestión de usuarios (MariaDB + control por roles)
- ✅ listas-reproduccion → Manejo de listas y videos (PostgreSQL)
- ✅ correo → Envío de emails al recibir eventos factura.creada / factura.actualizada
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
      - "5672:5672"
      - "15672:15672"
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
Usuario: `guest`  
Contraseña: `guest`

---

## ⚙️ Instalación y ejecución por microservicio

Cada microservicio se ejecuta por separado. Desde su carpeta, debes hacer:

```bash
npm install
npm run start:dev
```

## 🚪 API Gateway

La API Gateway expone todos los endpoints vía HTTP y comunica con los microservicios por gRPC. Para ejecutarla:

```bash
cd api-gateway
npm install
npm run start:dev
```

---

## 📮 Endpoints disponibles

A continuación se listan todos los endpoints expuestos a través de la API Gateway:

## PARA LOS SEEDER PRIMERO USUARIOS, LUEGO VIDEOS, LUEGO FACTURAS O INTERACCIONES

### 🔐 Autenticación
- `POST /auth/login`
- `POST /auth/logout`
- `PATCH /auth/usuarios/:id`

### 👤 Usuarios
- `POST /usuarios`
- `GET /usuarios`
- `GET /usuarios/:id`
- `PATCH /usuarios/:id`
- `DELETE /usuarios/:id`

### 🧾 Facturas
- `POST /facturas`
- `GET /facturas`
- `GET /facturas/:id`
- `PATCH /facturas/:id`
- `DELETE /facturas/:id`

### 🎞 Videos
- `POST /videos`
- `GET /videos`
- `GET /videos/:id`
- `PATCH /videos/:id`
- `DELETE /videos/:id`
- `GET /videos/buscar/titulo`
- `POST /videos/seed`

### 📊 Monitoreo
- `GET /monitoreo/acciones`
- `GET /monitoreo/errores`

### 🎵 Listas de Reproducción
- `POST /listas-reproduccion`
- `GET /listas-reproduccion`
- `DELETE /listas-reproduccion/:id`
- `POST /listas-reproduccion/:id/videos`
- `DELETE /listas-reproduccion/:id/videos`
- `GET /listas-reproduccion/:id/videos`

### 💬 Interacciones Sociales
- `POST /interacciones/like`
- `POST /interacciones/comentario`
- `GET /interacciones/:id`
- `POST /interacciones/seed`

---

## 🗄️ Bases de datos

Cada microservicio tiene su propia base de datos. **Debes crear manualmente cada base con el nombre especificado en el archivo `.env` correspondiente**. Las tablas se generan automáticamente al correr los servicios.

| Microservicio              | Motor       | Nombre base de datos (`.env`)      |
|----------------------------|-------------|-------------------------------------|
| `auth`                    | PostgreSQL  | `authT2_db`                         |
| `usuarios`                | MariaDB     | `usuarios_db`                       |
| `facturas`                | MariaDB     | `facturacion`                       |
| `listas-reproduccion`     | PostgreSQL  | `listas_db`                         |
| `videos`                  | MongoDB     | `tallerMicro`                       |
| `monitoreo`               | MongoDB     | `micro_monitoreo`                   |
| `interacciones sociales` | MongoDB     | `interacciones`                     |
| `correo`                  | —           | *No utiliza base de datos*          |

---

## 📌 Notas Finales

- Este proyecto sigue una estructura monorepo  
- Cada microservicio tiene su propio archivo `.env`  
- Las bases de datos deben estar creadas antes de ejecutar los servicios  
- RabbitMQ es esencial para la comunicación entre microservicios  
- Se ha agregado el archivo de colección Postman y ajustes menores en el proyecto

---

¿Dudas o preguntas?  
Contáctame o revisa los comentarios en el código.
---

## 📁 Archivos `.env` por microservicio

A continuación se presentan los contenidos esperados para cada archivo `.env` según el microservicio correspondiente:

### 🔐 auth `.env`
```env
DB_AUTH_HOST=localhost
DB_AUTH_PORT=5432
DB_AUTH_USERNAME=postgres
DB_AUTH_PASSWORD=123
DB_AUTH_NAME=authT2_db

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h
```

### 📧 correo `.env`
```env
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion
```

### 🧾 facturas `.env`
```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_FACTURAS_NAME=facturacion
```

### 💬 interacciones `.env`
```env
MONGO_INTERACCIONES_URI=mongodb://localhost:27017/interacciones
```

### 🎵 listas-reproduccion `.env`
```env
DB_LISTAS_HOST=localhost
DB_LISTAS_PORT=5432
DB_LISTAS_USERNAME=postgres
DB_LISTAS_PASSWORD=123
DB_LISTAS_NAME=listas_db
```

### 📊 monitoreo `.env`
```env
MONGO_URI=mongodb://localhost:27017/micro_monitoreo
```

### 👤 usuarios `.env`
```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_USERS_NAME=usuarios_db
```

### 🎞 videos `.env`
```env
MONGODB_URI=mongodb://localhost:27017/tallerMicro
```
