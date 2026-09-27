/**
 * Regla de negocio pura: valida la fortaleza de una contraseña en claro
 * ANTES de que sea enviada al adaptador de cifrado.
 * No importa bcrypt aquí: el dominio no sabe cómo se cifra, solo qué reglas cumplir.
 */
function validarPassword(passwordPlano) {
  if (typeof passwordPlano !== 'string' || passwordPlano.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(passwordPlano)) {
    throw new Error('La contraseña debe contener al menos una letra mayúscula');
  }
  if (!/[0-9]/.test(passwordPlano)) {
    throw new Error('La contraseña debe contener al menos un número');
  }
  return true;
}

module.exports = { validarPassword };
