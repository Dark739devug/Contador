# Aplicación de Registro y Visitas

Proyecto dividido en:

- `backend/`: API REST con NestJS + TypeORM.
- `frontend/`: interfaz con Vue 3 + Vite.
- `database/`: script SQL para PostgreSQL/Supabase.

## Endpoints

### Registrar usuario

`POST /usuarios`

Body:

```json
{
  "nombre": "Esdras Perez",
  "correo": "esdras@gmail.com"
}
```

### Sumar una visita

`PATCH /usuarios/:id/visitas`

Ejemplo:

`PATCH /usuarios/1/visitas`

---

## 1. Crear base de datos en Supabase

En Supabase abre **SQL Editor** y ejecuta:

`database/schema.sql`

Luego copia los datos de conexión PostgreSQL del proyecto.

---

## 2. Ejecutar backend

```bash
cd backend
npm install
```

Copia `.env.example` como `.env` y coloca tus credenciales:

```env
DB_HOST=...
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=...
DB_DATABASE=postgres
DB_SSL=true
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Después:

```bash
npm run start:dev
```

API local:

`http://localhost:3000`

---

## 3. Ejecutar frontend

```bash
cd frontend
npm install
```

Copia `.env.example` como `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Después:

```bash
npm run dev
```

Normalmente Vite abrirá:

`http://localhost:5173`

---

## 4. Publicar backend en Render

Sube el backend a GitHub.

Configuración típica:

- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

Configura las variables de entorno del archivo `.env` directamente en Render.

En producción cambia:

`FRONTEND_URL=https://tu-frontend.vercel.app`

---

## 5. Publicar frontend en Vercel

Sube el frontend a GitHub e impórtalo en Vercel.

Variable de entorno:

`VITE_API_URL=https://tu-backend.onrender.com`

Luego vuelve a desplegar.

---

## Nota

No subas archivos `.env` a GitHub.
