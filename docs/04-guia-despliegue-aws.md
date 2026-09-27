# Guía de Despliegue en AWS (para cuando el laboratorio esté activo)

Esta guía describe la ruta más directa: una instancia **EC2** para el
backend Node.js, **RDS PostgreSQL** para la base de datos, y el
frontend compilado servido como estáticos (S3 o el mismo EC2/Nginx).

## 1. Base de datos: Amazon RDS (PostgreSQL)

1. Consola AWS → RDS → **Create database**.
2. Motor: PostgreSQL. Plantilla: Free tier (si el laboratorio lo permite).
3. Configurar usuario maestro y contraseña.
4. En "Connectivity", habilitar acceso público solo si es estrictamente
   necesario para pruebas; de lo contrario, dejarlo dentro de la misma VPC
   que la instancia EC2.
5. Security Group de RDS: permitir el puerto `5432` únicamente desde el
   Security Group de la instancia EC2 del backend.
6. Una vez creada, copiar el **endpoint** (host) de la instancia.
7. Conectarse y cargar el esquema:
   ```bash
   psql -h <endpoint-rds> -U <usuario> -d postgres -c "CREATE DATABASE ecommerce_db;"
   psql -h <endpoint-rds> -U <usuario> -d ecommerce_db -f backend/database/schema.sql
   ```

## 2. Backend: Amazon EC2

1. Lanzar una instancia EC2 (Ubuntu Server, tipo `t2.micro`/`t3.micro`
   según el laboratorio).
2. Security Group: abrir el puerto `22` (SSH, restringido a tu IP) y el
   puerto `3000` (o el que use el backend) para el tráfico HTTP.
3. Conectarse por SSH e instalar Node.js:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   ```
4. Clonar/subir el proyecto y configurar variables de entorno apuntando
   al endpoint de RDS:
   ```bash
   cd backend
   cp .env.example .env
   # DB_HOST=<endpoint-rds>, DB_USER, DB_PASSWORD, DB_NAME=ecommerce_db
   npm install --production
   ```
5. Mantener el proceso vivo con **PM2**:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name ecommerce-backend
   pm2 save
   pm2 startup
   ```
6. (Recomendado) Colocar Nginx como proxy inverso en el puerto `80` hacia
   `localhost:3000`, y habilitar HTTPS con Let's Encrypt si el laboratorio
   asigna un dominio.

## 3. Frontend: build estático

En local o en la misma instancia:

```bash
cd frontend
# Apuntar al backend público de EC2
echo "VITE_API_URL=http://<ip-o-dominio-ec2>:3000/api" > .env.production
npm install
npm run build
```

Esto genera `frontend/dist/`. Dos opciones para servirlo:

**Opción A — Amazon S3 + hosting estático**
1. Crear un bucket S3, habilitar "Static website hosting".
2. Subir el contenido de `dist/`.
3. Configurar el bucket como público (solo lectura) o usar CloudFront
   delante para HTTPS y caché.

**Opción B — Servir desde el mismo EC2 con Nginx**
1. Copiar `dist/` a `/var/www/ecommerce-frontend`.
2. Configurar un `server block` de Nginx que sirva esos archivos
   estáticos y redirija `/api` al backend en `localhost:3000`.

## 4. Variables y seguridad a verificar antes de entregar

- [ ] `.env` del backend nunca se sube al repositorio (agregar a `.gitignore`).
- [ ] Security Group de RDS solo acepta conexiones desde el SG del backend.
- [ ] CORS del backend restringido al dominio real del frontend en producción
      (ajustar `cors()` en `app.js`).
- [ ] Contraseñas de usuarios siempre viajan sobre HTTPS en producción.

## 5. Checklist de verificación final

1. `curl http://<ip-ec2>:3000/api/health` → `{ "status": "ok" }`
2. Frontend público carga y el login contra el backend responde `200`.
3. Un pedido de prueba se refleja correctamente en la tabla `pedidos` de RDS.
