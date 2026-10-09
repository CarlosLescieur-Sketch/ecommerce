# Entregables Solicitados

Este documento reúne los 5 entregables pedidos para el proyecto de
Sistema de Comercio Electrónico. Cada uno remite al archivo completo
correspondiente dentro de `docs/`, salvo el punto 5, que se explica
aquí paso a paso porque aún no se ha activado el laboratorio de AWS.

---

## 1. Diagrama Arquitectónico

Representación visual de la estructura del backend (Dominio, Casos de
Uso, Puertos y Adaptadores), incluyendo el flujo de una petición
completa (ejemplo: crear un pedido) y la estructura de carpetas.

📄 Ver archivo completo: **`01-diagrama-arquitectonico.md`**

Resumen de la regla de dependencia:

```
Infraestructura  →  Aplicación  →  Dominio
```

- **Dominio**: entidades (`Usuario`, `Producto`, `Pedido`) y reglas de
  negocio puras, sin depender de Express, PostgreSQL ni bcrypt.
- **Aplicación**: casos de uso (`UsuarioUseCases`, `ProductoUseCases`,
  `PedidoUseCases`) y los puertos (interfaces) que necesitan.
- **Infraestructura**: adaptadores concretos — controladores REST,
  repositorios PostgreSQL, cifrado con bcrypt, subida de imágenes.

---

## 2. Especificación de Endpoints

Listado ordenado de las rutas HTTP para las operaciones CRUD de
Usuarios, Productos y Pedidos, con método, body esperado y respuesta.

📄 Ver archivo completo: **`02-especificacion-endpoints.md`**

Resumen rápido:

| Recurso   | Base URL          | Operaciones                                                             |
|-----------|--------------------|--------------------------------------------------------------------------|
| Usuarios  | `/api/usuarios`   | registro, login, listar, obtener, actualizar, eliminar                    |
| Productos | `/api/productos`  | crear (con imagen), listar, obtener, actualizar, eliminar                 |
| Pedidos   | `/api/pedidos`    | crear, listar todos, listar por usuario, obtener, cambiar estado, eliminar |

---

## 3. Repositorio del Código

Estructura de carpetas del servidor Node.js (arquitectura hexagonal) y
de la aplicación React con Vite (organizada por módulos).

```
ecommerce-hexagonal/
├── backend/
│   ├── database/            schema.sql, migration_add_imagen.sql
│   └── src/
│       ├── domain/          entities/, services/
│       ├── application/     ports/, usecases/
│       └── infrastructure/  adapters/ (input: http; output: postgres, security)
│                             config/ (db.js, container.js, app.js)
└── frontend/
    └── src/
        ├── modules/
        │   ├── auth/        components/, services/
        │   ├── catalog/     components/, services/
        │   └── orders/      components/, services/
        └── shared/
            └── api/         httpClient.js
```

Cada módulo del frontend (`auth`, `catalog`, `orders`) tiene su propio
`services/` que aísla las llamadas de red mediante `httpClient.js`, y
cada capa del backend solo depende de la capa inmediatamente interior
(ver diagrama del punto 1).

---

## 4. Guía de Despliegue en WSL

Pasos para levantar PostgreSQL, el backend y el frontend en un entorno
Linux (WSL2) y consumir la aplicación desde el navegador de Windows.

📄 Ver archivo completo: **`03-guia-despliegue-wsl.md`**

Resumen de arranque:

```bash
sudo service postgresql start
cd backend  && npm install && npm run dev    # http://localhost:3000
cd frontend && npm install && npm run dev    # http://localhost:5173
```

Abrir `http://localhost:5173` en el navegador de Windows — WSL2 expone
`localhost` de forma transparente hacia Windows.

---

## 5. Despliegue en AWS (cuando se active el laboratorio)

Guía completa y detallada: **`04-guia-despliegue-aws.md`**. Aquí va la
versión explicada en simple, pensada para hacerlo por primera vez.

La idea general es mover 3 piezas que hoy tienes en tu máquina (WSL)
hacia 3 servicios de AWS equivalentes:

| Hoy tienes (WSL)              | Se convierte en (AWS)                          |
|--------------------------------|--------------------------------------------------|
| PostgreSQL instalado localmente | **RDS** (PostgreSQL administrado por AWS)        |
| `npm run dev` del backend       | **EC2** (una máquina virtual encendida 24/7)     |
| `npm run dev` del frontend      | Build estático (`npm run build`) subido a **S3** |

### Paso a paso, en orden

**A. Base de datos (RDS)**
1. En la consola de AWS, busca "RDS" → **Create database**.
2. Motor: PostgreSQL, plantilla Free tier.
3. Anota el usuario, contraseña y el **endpoint** (host) que te da AWS
   al terminar — lo vas a necesitar como si fuera tu `DB_HOST` local.
4. Con ese endpoint, corre tu `schema.sql` igual que lo hiciste en WSL,
   pero apuntando a esa dirección en vez de `localhost`.

**B. Backend (EC2)**
1. Lanza una instancia EC2 (Ubuntu, la más pequeña que ofrezca el
   laboratorio).
2. Conéctate por SSH y instala Node.js igual que en WSL (`nvm install --lts`).
3. Sube tu carpeta `backend/` a esa instancia (o clónala desde un repo).
4. Crea el `.env` ahí dentro, pero con los datos de RDS del paso A en
   vez de tus datos locales.
5. Instala `pm2` (`npm install -g pm2`) para que el servidor siga
   corriendo aunque cierres la sesión SSH: `pm2 start src/server.js`.

**C. Frontend (S3)**
1. En tu máquina, dentro de `frontend/`, corre:
   ```bash
   echo "VITE_API_URL=http://<ip-de-tu-ec2>:3000/api" > .env.production
   npm run build
   ```
2. Esto genera una carpeta `dist/` con archivos estáticos (HTML, CSS,
   JS ya compilados — no es código que "corra", solo se muestra).
3. Crea un bucket S3, activa "Static website hosting", y sube el
   contenido de `dist/` ahí.

### Qué revisar antes de dar por terminado

- [ ] El Security Group de RDS solo deja entrar al Security Group de tu
      EC2 (no lo dejes abierto a todo internet).
- [ ] El puerto 3000 de tu EC2 está abierto para que el frontend pueda
      llamarlo.
- [ ] Probar `http://<ip-ec2>:3000/api/health` desde tu navegador antes
      de conectar el frontend — si eso responde, el backend está listo.

No necesitas hacer esto todavía: solo actívalo cuando el laboratorio de
AWS esté disponible. Cuando llegue ese momento, sigue esta sección en
orden (A → B → C) y, si algo falla, comparte el mensaje de error tal
cual aparece para revisarlo puntualmente.
