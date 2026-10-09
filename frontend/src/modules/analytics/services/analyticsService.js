import httpClient from '../../../shared/api/httpClient';

// El backend valida el rol real del usuario a partir de este header.
const conAdmin = (usuarioId, params) => ({
  headers: { 'x-usuario-id': usuarioId },
  params,
});

export const analyticsService = {
  topProductos: (usuarioId, params) =>
    httpClient.get('/analytics/top-productos', conAdmin(usuarioId, params)).then((r) => r.data),
  ingresos: (usuarioId, params) =>
    httpClient.get('/analytics/ingresos', conAdmin(usuarioId, params)).then((r) => r.data),
  estados: (usuarioId, params) =>
    httpClient.get('/analytics/estados', conAdmin(usuarioId, params)).then((r) => r.data),
  ticketPromedio: (usuarioId, params) =>
    httpClient.get('/analytics/ticket-promedio', conAdmin(usuarioId, params)).then((r) => r.data),
};
