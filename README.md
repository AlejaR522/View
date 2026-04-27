# 📱 View App — Mini Red Social

Aplicación web híbrida tipo red social profesional, desarrollada con React en el frontend y Node.js/Express en el backend. Utiliza un modelo de base de datos híbrido: **PostgreSQL** para autenticación de usuarios y **MongoDB Atlas** para el registro de clientes con operaciones CRUD.

---

## 🏗️ Arquitectura del Proyecto
03-View/
├── Frontend/         ← App React + Vite + Tailwind
└── Backend/          ← API REST con Node.js + Express

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

## 📸 Vista previa

### Pantalla de Login
![Login](./Frontend/screenshots/Login.png)

### Home — Directorio de usuarios
![Home](./Frontend/screenshots/Home.png)

### Mi Perfil
![MyProfile](./Frontend/screenshots/MyProfile.png)

### Panel Admin — Usuarios
![Panel Admin Usuarios](./Frontend/screenshots/Admin-Users.png)

### Panel Admin — Clientes (MongoDB)
![Panel Admin Clientes](./Frontend/screenshots/Admin-Clients.png)

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

- [Node.js LTS](https://nodejs.org) instalado
- [PostgreSQL](https://www.postgresql.org) instalado y corriendo localmente
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)
- Git instalado

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/AlejaR522/View.git
cd 03-View
```

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crear `.env` en `Backend/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://ViewApp:TU_PASSWORD@cluster0.iejmew7.mongodb.net/viewapp?appName=Cluster0
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=nombre_de_tu_base_de_datos
PG_USER=postgres
PG_PASSWORD=tu_password_postgres
JWT_SECRET=miAppView2024SuperSecreta
```

> ⚠️ El archivo `.env` nunca se sube a Git.

### 3. Crear la tabla en PostgreSQL

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

### 4. Configurar el Frontend

```bash
cd ../Frontend
npm install
```

Crear `.env` en `Frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Ejecutar el proyecto

**Terminal 1 — Backend:**
```bash
cd Backend
nodemon server
```

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```

Abre: **http://localhost:5173**

---

## 👤 Crear usuario administrador

1. Regístrate desde la app
2. Ejecuta en pgAdmin:
```sql
UPDATE users SET rol = 'admin' WHERE email = 'tu-correo@ejemplo.com';
```
3. Vuelve a hacer login

---

## 📁 Estructura del Proyecto
Frontend/src/
├── components/     ← AuthForm, Navbar, ProtectedRoute, UserCard
├── lib/            ← api.js, auth.js
├── pages/          ← Login, Register, Home, Profile, MyProfile, Admin
└── services/       ← userService.jsx
Backend/
├── config/         ← mongodb.js, postgres.js
├── middleware/     ← authMiddleware.js
├── models/         ← Cliente.js (Mongoose)
├── routes/         ← auth.js, clientes.js
└── server.js

---

## 🔌 Endpoints del Backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/usuarios` | Listar usuarios |
| GET | `/api/auth/usuarios/:id` | Ver usuario por ID |
| PUT | `/api/auth/usuarios/:id` | Editar usuario |
| DELETE | `/api/auth/usuarios/:id` | Eliminar usuario |
| GET | `/api/clientes` | Listar clientes (MongoDB) |
| POST | `/api/clientes` | Crear cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |

---

## 🔒 Seguridad

- Contraseñas encriptadas con **bcrypt**
- Tokens **JWT** con expiración de 8 horas
- `.env` en `.gitignore`
- MongoDB Atlas con IP `0.0.0.0/0` para desarrollo

---

## 👩‍💻 Desarrollado por

Alejandra Ruiz y Raquel Martinez — Proyecto académico
