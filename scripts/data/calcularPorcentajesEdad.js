// Calcula el porcentaje de menores de 16 y de mayores de 65 años de cada municipio
// Ejecutar con: node scripts/data/calcularPorcentajesEdad.js

import { ANIO_REFERENCIA } from '../../src/config/anio.js';
import { PROVINCIAS, escribirCsv, leerCsv, rutaProvincia } from './lib/csv.js';

const TRAMOS = { '0-16': 'menores', '16-64': 'adultos', '65-100': 'mayores' };

for (const provincia of PROVINCIAS) {
  const filas = leerCsv(rutaProvincia(provincia, `${provincia}-years-groups-total.csv`))
    .filter(fila => fila.year === String(ANIO_REFERENCIA));

  const municipios = new Map();

  for (const { cp, name, age, total } of filas) {
    if (!municipios.has(cp)) {
      municipios.set(cp, { cp, name, menores: 0, adultos: 0, mayores: 0, total: 0 });
    }
    const municipio = municipios.get(cp);
    const valor = Number(total);
    if (TRAMOS[age]) municipio[TRAMOS[age]] = valor;
    municipio.total += valor;
  }

  const porcentaje = (parte, total) => (total > 0 ? (parte / total) * 100 : 0).toFixed(1);

  const resultado = [...municipios.values()].map(({ cp, name, menores, mayores, total }) => ({
    year: ANIO_REFERENCIA,
    cp,
    name,
    menor: porcentaje(menores, total),
    mayor: porcentaje(mayores, total),
    population: total
  }));

  escribirCsv(
    rutaProvincia(provincia, `${provincia}-mayor-menor.csv`),
    resultado,
    ['year', 'cp', 'name', 'menor', 'mayor', 'population']
  );

  console.log(`${provincia}-mayor-menor.csv: ${resultado.length} municipios`);
}
