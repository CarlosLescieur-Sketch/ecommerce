# Guía de Despliegue en WSL (Desarrollo Local)

## 1. Requisitos previos en WSL (Ubuntu)

```bash
sudo apt update && sudo apt upgrade -y

# Node.js (vía nvm, recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

## 2. Configurar la base de datos

```bash
sudo -u postgres psql

-- Dentro de psql:
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'una_password_segura';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
\q
```

Cargar el esquema:

```bash
psql -U ecommerce_user -d ecommerce_db -h localhost -f backend/database/schema.sql
```

## 3. Levantar el backend

```bash
cd ecommerce-hexagonal/backend
cp .env.example .env
# Editar .env con las credenciales creadas en el paso 2
npm install
npm run dev
```

El backend queda escuchando en `http://localhost:3000`. Verificar con:

```bash
curl http://localhost:3000/api/health
```

## 4. Levantar el frontend

En una segunda terminal WSL:

```bash
cd ecommerce-hexagonal/frontend
npm install
npm run dev
```

Vite mostrará una URL similar a `http://localhost:5173`.

## 5. Consumo desde el navegador de Windows

WSL2 expone `localhost` de forma transparente hacia Windows, así que
basta con abrir en el navegador de Windows:

```
http://localhost:5173
```

Si el navegador no conecta, verificar:
- Que `vite.config.js` tenga `server.host: true` (ya incluido en este proyecto).
- Que el firewall de Windows no esté bloqueando el puerto.
- Ejecutar `ip addr show eth0` dentro de WSL y, si `localhost` no funciona,
  usar esa IP directamente: `http://<ip-de-wsl>:5173`.

## 6. Variables de entorno del frontend (opcional)

Crear `frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

## 7. Checklist rápido

1. `sudo service postgresql status` → activo
2. `npm run dev` en `backend/` → `Servidor backend escuchando en http://localhost:3000`
3. `npm run dev` en `frontend/` → Vite sirviendo en `5173`
4. Navegador Windows → `http://localhost:5173` → formulario de login visible
