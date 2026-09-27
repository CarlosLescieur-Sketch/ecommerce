/**
 * Puertos de SALIDA (output ports).
 * Son contratos que la capa de Aplicación necesita y que la capa de
 * Infraestructura debe implementar (adaptadores de salida: Postgres, etc).
 * En JS los expresamos como "interfaces" documentadas — cualquier adaptador
 * que implemente estos mismos métodos es válido (duck typing).
 *
 * IUsuarioRepository:
 *   crear(usuario) -> Usuario
 *   buscarPorId(id) -> Usuario | null
 *   buscarPorEmail(email) -> Usuario | null
 *   listar() -> Usuario[]
 *   actualizar(id, cambios) -> Usuario
 *   eliminar(id) -> boolean
 *
 * IProductoRepository:
 *   crear(producto) -> Producto
 *   buscarPorId(id) -> Producto | null
 *   listar() -> Producto[]
 *   actualizar(id, cambios) -> Producto
 *   eliminar(id) -> boolean
 *   actualizarStock(id, nuevoStock) -> Producto
 *
 * IPedidoRepository:
 *   crear(pedido) -> Pedido
 *   buscarPorId(id) -> Pedido | null
 *   listarPorUsuario(usuarioId) -> Pedido[]
 *   listar() -> Pedido[]
 *   actualizarEstado(id, estado) -> Pedido
 *   eliminar(id) -> boolean
 *
 * IPasswordHasher (puerto de salida, adaptador = bcrypt):
 *   hash(passwordPlano) -> string
 *   comparar(passwordPlano, passwordHash) -> boolean
 */
module.exports = {};
