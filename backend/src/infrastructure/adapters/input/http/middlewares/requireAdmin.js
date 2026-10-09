/**
 * Middleware (adaptador de entrada): permite el paso solo a usuarios con rol
 * "administrador". El frontend envía el id del usuario en el header
 * x-usuario-id y aquí se consulta SU rol real en la base de datos, de modo que
 * no se confía en un rol enviado por el cliente.
 * Nota: sin JWT/sesiones esto es una protección básica (el id podría
 * adivinarse); para producción conviene reemplazarlo por tokens firmados.
 */
function requireAdmin(usuarioUseCases) {
  return async (req, res, next) => {
    const usuarioId = req.header('x-usuario-id');
    if (!usuarioId) {
      return res.status(401).json({ error: 'Falta identificar al usuario (header x-usuario-id)' });
    }
    try {
      const usuario = await usuarioUseCases.obtenerPorId(usuarioId);
      if (usuario.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso exclusivo para administradores' });
      }
      req.usuario = usuario;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Usuario no válido' });
    }
  };
}

module.exports = requireAdmin;
