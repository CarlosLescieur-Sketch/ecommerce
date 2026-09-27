import httpClient from '../../../shared/api/httpClient';

export const authService = {
  registrar: (datos) => httpClient.post('/usuarios/registro', datos).then((r) => r.data),
  login: (credenciales) => httpClient.post('/usuarios/login', credenciales).then((r) => r.data),
};
