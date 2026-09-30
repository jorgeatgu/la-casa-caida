// Formato de las cifras de src/data/cifras.json para la prosa (en build).

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// useGrouping 'always': en es-ES los números de 4 cifras no llevan punto de miles por defecto
export function numero(valor, decimales = 0) {
  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
    useGrouping: 'always'
  });
}

export function porcentaje(valor) {
  return `${numero(valor, 2)} %`;
}

// "2026-09-30" → "30 de septiembre de 2026"
export function fechaLarga(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

// "septiembre de 2026"
export function mesAnio(iso) {
  const [anio, mes] = iso.split('-').map(Number);
  return `${MESES[mes - 1]} de ${anio}`;
}
