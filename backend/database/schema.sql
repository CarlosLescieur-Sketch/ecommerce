-- =========================================================
-- Esquema de base de datos: Sistema de Comercio Electrónico
-- PostgreSQL
-- =========================================================

CREATE TYPE rol_usuario AS ENUM ('cliente', 'administrador');
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'pagado', 'enviado', 'cancelado');

-- ---------------------------------------------------------
-- Tabla: usuarios
-- La contraseña NUNCA se guarda en texto plano. Se guarda
-- el hash (bcrypt) en password_hash.
-- ---------------------------------------------------------
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             rol_usuario NOT NULL DEFAULT 'cliente',
    creado_en       TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------
CREATE TABLE productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    imagen_url      VARCHAR(255),
    creado_en       TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Tabla: pedidos (cabecera)
-- Vincula un usuario con la transacción de compra.
-- ---------------------------------------------------------
CREATE TABLE pedidos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    estado          estado_pedido NOT NULL DEFAULT 'pendiente',
    total           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    creado_en       TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- Tabla: pedido_items (detalle)
-- Relación N:M entre pedidos y productos, con la cantidad
-- y el precio unitario congelado al momento de la compra.
-- ---------------------------------------------------------
CREATE TABLE pedido_items (
    id              SERIAL PRIMARY KEY,
    pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_producto_id ON pedido_items(producto_id);
