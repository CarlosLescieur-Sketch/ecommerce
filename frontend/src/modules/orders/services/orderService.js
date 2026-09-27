import httpClient from '../../../shared/api/httpClient';

export const orderService = {
  crear: (pedido) => httpClient.post('/pedidos', pedido).then((r) => r.data),
  listarPorUsuario: (usuarioId) =>
    httpClient.get(`/pedidos/usuario/${usuarioId}`).then((r) => r.data),
  listarTodos: () => httpClient.get('/pedidos').then((r) => r.data),
  obtener: (id) => httpClient.get(`/pedidos/${id}`).then((r) => r.data),
  actualizarEstado: (id, estado) =>
    httpClient.patch(`/pedidos/${id}/estado`, { estado }).then((r) => r.data),
};