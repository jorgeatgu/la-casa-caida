// Año de referencia de los datos de población (padrón a 1 de enero).
// Es el único sitio donde se escribe: scripts de datos y componentes lo importan.
export const ANIO_REFERENCIA = 2025;

// Día en que se cargaron en la web los datos de ANIO_REFERENCIA (AAAA-MM-DD).
// Se cambia a mano en cada actualización; la home y Metodología lo leen de src/data/cifras.json.
export const FECHA_ACTUALIZACION = '2026-09-30';

// Año con el que se comparan las variaciones de los últimos diez años.
export const ANIO_COMPARACION = ANIO_REFERENCIA - 10;
