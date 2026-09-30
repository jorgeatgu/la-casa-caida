import { ticks } from 'd3-array';

// Años que se rotulan en un eje temporal: los que caben en el ancho y siempre el último,
// para que se vea hasta qué año llegan los datos.
export function marcasAnio(inicio, fin, ancho, separacion = 60) {
  const cuantas = Math.min(12, Math.max(2, Math.floor(ancho / separacion)));
  // Se quita la marca que quedaría pegada al último año, que va alineado a la derecha
  const pixelesPorAnio = ancho / (fin - inicio);
  const marcas = ticks(inicio, fin, cuantas)
    .filter(anio => Number.isInteger(anio) && (fin - anio) * pixelesPorAnio >= separacion * 0.75);
  return [...marcas, fin];
}

// Radio de cada punto de una serie que mezcla años censales (cada diez años) y anuales.
// Los anuales se encogen para no taparse entre sí, salvo el último, que es el dato más reciente.
export function radioPunto(datos, i, pixelesPorAnio, radio = 4) {
  const anual = i > 0 && datos[i].year - datos[i - 1].year === 1;
  if (!anual || i === datos.length - 1) return radio;
  return Math.max(1.5, Math.min(radio, pixelesPorAnio / 2));
}

// El último año cae en el borde derecho del gráfico: se alinea a la derecha para que no se corte.
export function alinearUltimaMarca(eje) {
  eje.selectAll('.tick:last-of-type text').attr('text-anchor', 'end');
}
