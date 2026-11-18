// Mayor crecimiento y mayor decrecimiento entre décadas consecutivas de una serie de población.
// Lo usan DatosMunicipio.astro (por municipio) y scripts/data/cifras.js (por provincia).

// `serie`: Map de año (número) a población. Un punto por década: el primer año con dato
// de cada una. Los censos no siempre caen en año redondo (1981, 1991, 2011) y desde 2012
// la serie es anual.
export function variacionesPorDecada(serie, anioFin) {
  const anios = [...serie.keys()];
  const puntosDecada = [];
  for (let decada = 1900; decada <= anioFin; decada += 10) {
    const anio = Math.min(...anios.filter(a => a >= decada && a < decada + 10));
    if (Number.isFinite(anio)) puntosDecada.push(anio);
  }

  let mayorCrecimiento = { valor: 0, periodo: '' };
  let mayorDecrecimiento = { valor: 0, periodo: '' };

  puntosDecada.slice(1).forEach((fin, i) => {
    const inicio = puntosDecada[i];
    const poblacionInicio = serie.get(inicio);
    const poblacionFin = serie.get(fin);
    if (!poblacionInicio || !poblacionFin) return;

    const cambio = ((poblacionFin - poblacionInicio) / poblacionInicio) * 100;
    if (cambio > mayorCrecimiento.valor) mayorCrecimiento = { valor: cambio, periodo: `${inicio}-${fin}` };
    if (cambio < mayorDecrecimiento.valor) mayorDecrecimiento = { valor: cambio, periodo: `${inicio}-${fin}` };
  });

  return { mayorCrecimiento, mayorDecrecimiento };
}
