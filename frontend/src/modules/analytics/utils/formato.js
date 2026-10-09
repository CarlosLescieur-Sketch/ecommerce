export const dinero = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Fecha local en formato YYYY-MM-DD (sin pasar por UTC, para no correr el día)
export const aISO = (fecha) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// "2026-10-07" -> etiqueta corta según la agrupación
export const etiquetaPeriodo = (iso, agrupacion) => {
  const [y, m, d] = iso.split('-');
  if (agrupacion === 'month') return `${m}/${y}`;
  if (agrupacion === 'week') return `Sem ${d}/${m}`;
  return `${d}/${m}`;
};

// Rangos predefinidos del filtro
export const calcularRango = (preset) => {
  const hoy = new Date();
  if (preset === '7d') {
    const ini = new Date(hoy);
    ini.setDate(hoy.getDate() - 6);
    return { desde: aISO(ini), hasta: aISO(hoy) };
  }
  if (preset === '30d') {
    const ini = new Date(hoy);
    ini.setDate(hoy.getDate() - 29);
    return { desde: aISO(ini), hasta: aISO(hoy) };
  }
  if (preset === 'mes') {
    const ini = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { desde: aISO(ini), hasta: aISO(hoy) };
  }
  return null;
};
