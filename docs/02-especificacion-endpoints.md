# Especificación de Endpoints REST

Base URL: `http://localhost:3000/api`

## Usuarios (`/api/usuarios`)

| Método | Ruta                  | Descripción                                   | Body / Params                                      | Respuesta                        |
|--------|-----------------------|------------------------------------------------|-----------------------------------------------------|-----------------------------------|
| POST   | `/usuarios/registro`  | Registra un cliente (hashea password; el rol siempre es `cliente`) | `{ nombre, email, password }`        | 201 — Usuario (sin password)     |
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
| PATCH  | `/pedidos/:id/estado`           | Cambia el estado del pedido (con reglas de transición)     | `{ estado: "pagado"\|"enviado"\|"cancelado" }` | 200 — Pedido; 404 si no existe; 400 si la transición no es válida |
| DELETE | `/pedidos/:id`                  | Elimina un pedido                                        | —                                                           | 204 — Sin contenido  |

Al crear un pedido se disparan dos notificaciones por correo (ver
`05-subsistema-notificaciones.md`): al cliente con el desglose de la
compra y los datos bancarios para completar el pago, y a los
administradores con el aviso del nuevo pedido. Si el envío falla, el
pedido se conserva igualmente.

### Transiciones de estado

El pedido se crea en `pendiente`. Las transiciones válidas son:

- `pendiente` → `pagado` (procesar el pago) o `cancelado` (anular).
- `pagado` → `enviado` (despachar) o `cancelado` (anular).
- `enviado` y `cancelado` son estados finales: no admiten más cambios.

Al cancelar un pedido, el stock de sus productos vuelve a la
cantidad anterior (se deshace el descuento hecho al crear el
pedido).

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

## Analíticas (`/api/analytics`) — solo administrador

Todas las rutas exigen el header `x-usuario-id`; el backend consulta el rol real
del usuario en la base de datos y responde `401` si falta o no es válido, y
`403` si el usuario no es `administrador`. Todos los parámetros son opcionales
y las fechas usan el formato `YYYY-MM-DD` (el día `hasta` queda incluido). Las
métricas de ventas excluyen los pedidos cancelados; la distribución de estados
sí los cuenta. Las agregaciones (SUM, COUNT, AVG, GROUP BY) se ejecutan en
PostgreSQL.

| Método | Ruta                          | Parámetros (query)                          | Respuesta                                                                 |
|--------|-------------------------------|----------------------------------------------|----------------------------------------------------------------------------|
| GET    | `/analytics/top-productos`    | `limite` (1-50, def. 10), `desde`, `hasta`   | `[{ productoId, nombre, unidadesVendidas, montoRecaudado }]`              |
| GET    | `/analytics/ingresos`         | `agrupacion` (`day`/`week`/`month`), `desde`, `hasta` | `{ agrupacion, ingresosTotales, serie: [{ periodo, ingresos, pedidos }] }` |
| GET    | `/analytics/estados`          | `desde`, `hasta`                             | `{ totalPedidos, distribucion: [{ estado, cantidad, porcentaje }] }`      |
| GET    | `/analytics/ticket-promedio`  | `desde`, `hasta`                             | `{ ticketPromedioPedido, ticketPromedioUsuario, totalPedidos, ingresosTotales }` |
