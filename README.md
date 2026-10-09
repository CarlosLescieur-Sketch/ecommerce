# Sistema de Comercio Electrónico — Arquitectura Hexagonal

Proyecto de referencia: base de datos PostgreSQL, backend Node.js con
Arquitectura Hexagonal (Puertos y Adaptadores) y frontend React + Vite.

## Contenido

```
ecommerce-hexagonal/
├── backend/                    Node.js + Express + PostgreSQL (hexagonal)
│   ├── database/schema.sql     Modelo de datos (usuarios, productos, pedidos)
│   └── src/
│       ├── domain/             Entidades y reglas de negocio puras
│       ├── application/        Puertos y casos de uso
│       └── infrastructure/     Adaptadores (HTTP, PostgreSQL, bcrypt)
├── frontend/                   React + Vite, organizado por módulos
│   └── src/modules/            auth, catalog, orders
└── docs/
    ├── 01-diagrama-arquitectonico.md
    ├── 02-especificacion-endpoints.md
    ├── 03-guia-despliegue-wsl.md
    ├── 04-guia-despliegue-aws.md
    └── 05-subsistema-notificaciones.md
```

## Entidades

- **Usuario**: id, nombre, email, `password_hash` (bcrypt, nunca texto plano), rol.
- **Producto**: id, nombre, descripción, precio, stock.
- **Pedido**: cabecera (usuario, estado, total) + `pedido_items` (detalle producto/cantidad/precio unitario).

## Funcionalidades

- Roles: **administrador** (gestiona productos, ve todos los pedidos y el dashboard de analíticas) y **cliente** (ve el catálogo y crea/consulta sus propios pedidos).
- Pedidos por estados: `pendiente` → `pagado` → `enviado`, o `cancelado` (estados finales). Cancelar un pedido devuelve el stock al catálogo.
- Notificaciones por correo al crear un pedido: desglose + datos bancarios al cliente (estado "pendiente de pago") y aviso a los administradores, con Puertos y Adaptadores — Nodemailer queda aislado en un adaptador de infraestructura (`backend/src/infrastructure/adapters/output/notifications/`); sin SMTP configurado se usan adaptadores de consola. Ver `docs/05-subsistema-notificaciones.md`.
- Imágenes de producto (subida con multer, guardadas en `backend/uploads/`).
- Dashboard de analíticas solo para administrador: ingresos por rango, top de productos, estado de pedidos y ticket promedio.

## Crear un administrador

El registro público siempre crea clientes. Para convertir un usuario en administrador:

```sql
UPDATE usuarios SET rol = 'administrador' WHERE email = 'tu_correo@ejemplo.com';
```

## Arranque rápido

Ver `docs/03-guia-despliegue-wsl.md` para el paso a paso completo en WSL,
y `docs/04-guia-despliegue-aws.md` para el despliegue en AWS cuando el
laboratorio esté activo.

Resumen:

```bash
# Base de datos
psql -U <usuario> -d ecommerce_db -f backend/database/schema.sql

# Backend (edita .env con tus credenciales de PostgreSQL)
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Seguridad de credenciales

- Las contraseñas nunca se persisten ni se transmiten en las respuestas.
- `PasswordPolicy` (dominio) valida fortaleza antes de cifrar.
- `BcryptPasswordHasher` (infraestructura) es el único punto del sistema
  que conoce el algoritmo de hashing usado.
