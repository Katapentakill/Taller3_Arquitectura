README

# 🎯 Taller 2 - Arquitectura de Microservicios

Este repositorio corresponde al Taller 2 de Arquitectura de Sistemas, donde se implementa una arquitectura distribuida basada en **microservicios** utilizando **NestJS**, **gRPC**, **RabbitMQ**, y múltiples bases de datos.

---

## 👨‍💻 Rol del Desarrollador A

Este trabajo corresponde a la implementación de los microservicios a cargo del **Desarrollador A**, los cuales son:

- ✅ auth → Microservicio de autenticación (PostgreSQL + JWT + blacklist)
- ✅ usuarios → Gestión de usuarios (MariaDB + control por roles)
- ✅ listas-reproduccion → Manejo de listas y videos (PostgreSQL)
- ✅ correo → Envío de emails al recibir eventos factura.creada / factura.actualizada *(no implementado)*
- ✅ API Gateway (exposición de todos los endpoints por HTTP)

## 👨‍💻 Rol del Desarrollador B

- ✅ facturas → CRUD de facturas (MariaDB)
- ✅ interacciones sociales → Comentarios y likes (MongoDB)
- ✅ monitoreo → Registro de acciones y errores *(no implementado)*
- ✅ videos → CRUD de videos (MongoDB)

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
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
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

---

## 🚪 API Gateway

La API Gateway expone todos los endpoints vía HTTP y comunica con los microservicios por gRPC. Para ejecutarla:

```bash
cd api-gateway
npm install
npm run start:dev
```

---

## 🔁 Balanceador de Carga con NGINX

### Paso a paso para usar NGINX como balanceador en Windows

1. Crea el archivo `nginx.conf` en la carpeta raíz del proyecto con el siguiente contenido:

```nginx
events {}

http {
    upstream apigateway_cluster {
        server host.docker.internal:3005;
        server host.docker.internal:3006;
    }

    server {
        listen 3000;

        location / {
            proxy_pass http://apigateway_cluster;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
        }
    }
}
```

2. Desde PowerShell, ejecuta donde este la api gateway, aqui un ejemplo de mi caso:

```powershell
cd C:\Proyectos\taller2\api
$env:PORT=3005; npm run start
# En otro terminal:
$env:PORT=3006; npm run start
```

3. Luego corre NGINX con Docker, esto desde donde tengas el archivo ngix.conf en mi caso es C:\Proyectos\taller2:

```powershell
docker run --name nginx-taller2 -p 3000:3000 -v "${PWD}\nginx.conf:/etc/nginx/nginx.conf:ro" -d nginx
```

Ahora puedes acceder a [http://localhost:3000](http://localhost:3000) y el tráfico será balanceado entre las dos instancias.

---

## 📮 Endpoints disponibles

A través de la API Gateway:

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
- `GET /monitoreo/acciones` *(no implementado)*
- `GET /monitoreo/errores` *(no implementado)*

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
###  Seeder
Tener en consideracion este orden para ejecutar los endpoints de seeders
1. Usuarios
2. Videos
3. Facturas
4. Interacciones sociales

# Cada uno de estos tiene un endpoint de seeder si les da algun error es porque no ejecutaron bien el orden, ademas hay que tener corriendo todos los microservicios a excepcion de correo y monitoreo

---
### Consejo

Si mongo db no se conecta abrir cmd en administrador y usar este comando

net start MongoDB



## 🗄️ Bases de datos por microservicio

Las tablas/colecciones se crean automáticamente. **Debes crear manualmente la base de datos con el nombre indicado en el `.env` de cada servicio.**

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

### 📁 Archivos `.env` por microservicio

#### 🔐 auth `.env`
```env
DB_AUTH_HOST=localhost
DB_AUTH_PORT=5432
DB_AUTH_USERNAME=postgres
DB_AUTH_PASSWORD=123
DB_AUTH_NAME=authT2_db

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h
```

#### 📧 correo `.env`
```env
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_contraseña_de_aplicacion
```

#### 🧾 facturas `.env`
```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_FACTURAS_NAME=facturacion
```

#### 💬 interacciones `.env`
```env
MONGO_INTERACCIONES_URI=mongodb://localhost:27017/interacciones
```

#### 🎵 listas-reproduccion `.env`
```env
DB_LISTAS_HOST=localhost
DB_LISTAS_PORT=5432
DB_LISTAS_USERNAME=postgres
DB_LISTAS_PASSWORD=123
DB_LISTAS_NAME=listas_db
```

#### 📊 monitoreo `.env`
```env
MONGO_URI=mongodb://localhost:27017/micro_monitoreo
```

#### 👤 usuarios `.env`
```env
DB_USERS_HOST=localhost
DB_USERS_PORT=3306
DB_USERS_USERNAME=root
DB_USERS_PASSWORD=123
DB_USERS_NAME=usuarios_db
```

#### 🎞 videos `.env`
```env
MONGODB_URI=mongodb://localhost:27017/tallerMicro
```

---

## 🧼 Limpieza automática del Blacklist

El microservicio `auth` incluye un servicio que elimina tokens expirados automáticamente cada hora de la tabla `blacklist`. Esto se implementa mediante `@Cron` de `@nestjs/schedule`, y se ejecuta con:

```ts
@Cron('0 * * * *')
async limpiar() {
  const now = new Date();
  const result = await this.blacklistRepo.delete({ expiresAt: LessThan(now) });
  if ((result.affected ?? 0) > 0) {
    console.log(`[Blacklist] 🧹 Tokens expirados eliminados: ${result.affected}`);
  }
}
```

---

## ❌ Microservicios no implementados

Los siguientes microservicios están definidos pero **no han sido implementados**, por lo tanto:

- `correo`: No implementado. **No es necesario levantarlo.**
- `monitoreo`: No implementado. **No es necesario levantarlo.**

---

## 🔄 Prueba del Balanceador de Carga con NGINX

Para verificar que el balanceador de carga NGINX está funcionando correctamente, puedes exponer el siguiente endpoint dentro del controlador principal (`AppController`) del `api-gateway`:

```ts
// ✅ NUEVO ENDPOINT para probar el balanceo
@Get('ping')
getPing() {
  return {
    puerto: process.env.PORT,
  };
}
Una vez agregado, accede a http://localhost:3000/ping varias veces desde el navegador o Postman.

🔁 Si el balanceo está funcionando, verás que el valor de "puerto" alterna entre "3005" y "3006", lo que indica que NGINX está distribuyendo las solicitudes entre ambas instancias del API Gateway.
---

¿Dudas o preguntas?  
Contáctame o revisa los comentarios en el código.
