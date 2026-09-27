# Especificación de Endpoints REST

Base URL: `http://localhost:3000/api`

## Usuarios (`/api/usuarios`)

| Método | Ruta                  | Descripción                                   | Body / Params                                      | Respuesta                        |
|--------|-----------------------|------------------------------------------------|-----------------------------------------------------|-----------------------------------|
| POST   | `/usuarios/registro`  | Registra un nuevo usuario (hashea password)    | `{ nombre, email, password, rol? }`                 | 201 — Usuario (sin password)     |
| POST   | `/usuarios/login`     | Autentica credenciales                         | `{ email, password }`                                | 200 — Usuario (sin password)     |
| GET    | `/usuarios`           | Lista todos los usuarios                       | —                                                     | 200 — Usuario[]                  |
| GET    | `/usuarios/:id`       | Obtiene un usuario por id                      | —                                                     | 200 — Usuario                    |
| PUT    | `/usuarios/:id`       | Actualiza datos (opcionalmente password)       | `{ nombre?, email?, password?, rol? }`               | 200 — Usuario                    |
| DELETE | `/usuarios/:id`       | Elimina un usuario                             | —                                                     | 204 — Sin contenido               |

## Productos (`/api/productos`)

`POST` y `PUT` aceptan `multipart/form-data` (para poder incluir el archivo
de imagen); si no se envía imagen, los mismos campos funcionan igual sin
el archivo.

| Método | Ruta               | Descripción                     | Body / Params                                                          | Respuesta            |
|--------|--------------------|-----------------------------------|--------------------------------------------------------------------------|------------------------|
| POST   | `/productos`       | Crea un producto                  | form-data: `nombre, descripcion?, precio, stock, imagen?(archivo)`        | 201 — Producto        |
| GET    | `/productos`       | Lista el catálogo completo        | —                                                                          | 200 — Producto[]      |
| GET    | `/productos/:id`   | Obtiene un producto por id        | —                                                                          | 200 — Producto        |
| PUT    | `/productos/:id`   | Actualiza un producto             | form-data: `nombre?, descripcion?, precio?, stock?, imagen?(archivo)`      | 200 — Producto        |
| DELETE | `/productos/:id`   | Elimina un producto               | —                                                                          | 204 — Sin contenido    |

El campo `imagenUrl` de la respuesta es una ruta relativa
(`/uploads/producto-xxxx.jpg`) servida como estática por el backend en
`http://localhost:3000/uploads/...`. Formatos aceptados: `jpg, jpeg, png,
webp, gif`; tamaño máximo 5 MB.

## Pedidos (`/api/pedidos`)

| Método | Ruta                            | Descripción                                          | Body / Params                                          | Respuesta          |
|--------|----------------------------------|--------------------------------------------------------|-----------------------------------------------------------|----------------------|
| POST   | `/pedidos`                      | Crea un pedido (valida stock, calcula total)            | `{ usuarioId, items: [{ productoId, cantidad }] }`         | 201 — Pedido        |
| GET    | `/pedidos`                      | Lista todos los pedidos                                 | —                                                           | 200 — Pedido[]      |
| GET    | `/pedidos/:id`                  | Obtiene un pedido por id (con items)                     | —                                                           | 200 — Pedido        |
| GET    | `/pedidos/usuario/:usuarioId`   | Lista los pedidos de un usuario                          | —                                                           | 200 — Pedido[]      |
| PATCH  | `/pedidos/:id/estado`           | Cambia el estado del pedido                              | `{ estado: "pendiente"\|"pagado"\|"enviado"\|"cancelado" }` | 200 — Pedido        |
| DELETE | `/pedidos/:id`                  | Elimina un pedido                                        | —                                                           | 204 — Sin contenido  |

## Salud del servicio

| Método | Ruta          | Descripción            |
|--------|---------------|--------------------------|
| GET    | `/health`     | Verifica que el API responde |

## Convenciones

- Todas las respuestas son JSON.
- Los errores de validación devuelven `400` con `{ error: "mensaje" }`.
- Credenciales inválidas devuelven `401`.
- Recurso no encontrado devuelve `404`.
- Ningún endpoint expone `password_hash`; el objeto Usuario serializado
  (`toPublicJSON()`) solo incluye `id`, `nombre`, `email`, `rol`.
