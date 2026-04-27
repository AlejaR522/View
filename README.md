# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 📱 View App — Mini Red Social

Aplicación web híbrida tipo red social profesional, desarrollada con React en el frontend y Node.js/Express en el backend. Utiliza un modelo de base de datos híbrido: **PostgreSQL** para autenticación de usuarios y **MongoDB Atlas** para el registro de clientes con operaciones CRUD.

---

## 🏗️ Arquitectura del Proyecto

```
03-View/
├── Frontend/         ← App React + Vite + Tailwind
└── Backend/          ← API REST con Node.js + Express
```

### Tecnologías usadas

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| BD Relacional | PostgreSQL (login y usuarios) |
| BD NoSQL | MongoDB Atlas (clientes CRUD) |
| Autenticación | JWT (JSON Web Tokens) |
| PDF Export | jsPDF |

---

## 📋 Funcionalidades

- 🔐 **Login y Registro** de usuarios con contraseña encriptada (bcrypt)
- 👤 **Perfil editable** — nombre, correo, descripción y foto de perfil
- 🏠 **Home / Directorio** — lista de todos los usuarios registrados
- 👁️ **Perfil público** — vista pública de cada usuario
- 🛡️ **Panel Admin** — gestión de usuarios y generación de PDF por usuario
- 📄 **Exportación a PDF** desde el panel admin
- 🗂️ **CRUD de Clientes** en MongoDB Atlas (colección NoSQL)
- 🔒 **Rutas protegidas** — solo usuarios autenticados pueden acceder

---

## ⚙️ Requisitos previos

Antes de instalar, asegúrate de tener:

- [Node.js LTS](https://nodejs.org) instalado
- [PostgreSQL](https://www.postgresql.org) instalado y corriendo localmente
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)
- Git instalado

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd 03-View
```

---

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crear el archivo **`.env`** dentro de la carpeta `Backend/` con el siguiente contenido:

```env
PORT=5000

# MongoDB Atlas (pide la URL a tu compañera)
MONGODB_URI=mongodb+srv://ViewApp:TU_PASSWORD@cluster0.iejmew7.mongodb.net/viewapp?appName=Cluster0

# PostgreSQL local
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=nombre_de_tu_base_de_datos
PG_USER=postgres
PG_PASSWORD=tu_password_postgres

# JWT Secret (puede ser cualquier texto largo)
JWT_SECRET=miAppView2024SuperSecreta
```

> ⚠️ **Importante:** El archivo `.env` nunca se sube a Git. Debes crearlo manualmente.

---

### 3. Crear la tabla en PostgreSQL

Abre **pgAdmin** o cualquier cliente de PostgreSQL y ejecuta:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT,
    rol VARCHAR(20) DEFAULT 'user',
    avatar_url TEXT,
    descripcion TEXT,
    create_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4. Configurar el Frontend

```bash
cd ../Frontend
npm install
```

Crear el archivo **`.env`** dentro de la carpeta `Frontend/` con:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Ejecutar el proyecto

Necesitas **dos terminales abiertas al mismo tiempo**:

### Terminal 1 — Backend

```bash
cd Backend
nodemon server
# o si no tienes nodemon:
node server
```

Deberías ver:
```
🚀 Servidor en http://localhost:5000
✅ PostgreSQL conectado
✅ MongoDB Atlas conectado
```

### Terminal 2 — Frontend

```bash
cd Frontend
npm run dev
```

Abre el navegador en: **http://localhost:5173**

---

## 👤 Crear usuario administrador

1. Regístrate normalmente desde la app
2. Abre **pgAdmin** y ejecuta:

```sql
UPDATE users SET rol = 'admin' WHERE email = 'tu-correo@ejemplo.com';
```

3. Cierra sesión y vuelve a hacer login — serás redirigido al panel admin

---

## 📁 Estructura del Frontend

```
Frontend/src/
├── components/
│   ├── AuthForm.jsx       ← Formulario de login/registro
│   ├── AuthLayout.jsx     ← Layout de autenticación
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx ← Protección de rutas
│   └── UserCard.jsx
├── lib/
│   ├── api.js             ← Cliente HTTP (fetch al backend)
│   └── auth.js            ← Login, register, logout, sesión
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Home.jsx           ← Directorio de usuarios
│   ├── Profile.jsx        ← Perfil público
│   ├── MyProfile.jsx      ← Perfil editable
│   └── Admin.jsx          ← Panel administrador
└── services/
    └── userService.jsx    ← Servicios de usuarios
```

## 📁 Estructura del Backend

```
Backend/
├── config/
│   ├── mongodb.js         ← Conexión MongoDB Atlas
│   └── postgres.js        ← Conexión PostgreSQL
├── middleware/
│   └── authMiddleware.js  ← Verificación JWT
├── models/
│   └── Cliente.js         ← Modelo Mongoose (MongoDB)
├── routes/
│   ├── auth.js            ← Rutas de autenticación y usuarios
│   └── clientes.js        ← CRUD clientes (MongoDB)
└── server.js              ← Entrada principal
```

---

## 🔌 Endpoints del Backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/usuarios` | Listar todos los usuarios |
| GET | `/api/auth/usuarios/:id` | Ver usuario por ID |
| PUT | `/api/auth/usuarios/:id` | Editar usuario |
| DELETE | `/api/auth/usuarios/:id` | Eliminar usuario |
| GET | `/api/clientes` | Listar clientes (MongoDB) |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |

---

## 🛠️ Comandos útiles

```bash
# Instalar nodemon globalmente (reinicio automático del servidor)
npm install -g nodemon

# Correr backend con recarga automática
nodemon server

# Ver logs del backend
node server

# Construir frontend para producción
npm run build
```

---

## 🔒 Seguridad

- Las contraseñas se encriptan con **bcrypt** antes de guardarse
- La autenticación usa tokens **JWT** con expiración de 8 horas
- El archivo `.env` está en `.gitignore` y nunca se sube al repositorio
- MongoDB Atlas tiene configurada la IP `0.0.0.0/0` para desarrollo

---

## 👩‍💻 Desarrollado por

Alejandra Ruiz — Proyecto académico segundo corte
