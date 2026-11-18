// Genera src/data/municipios.js, la lista de municipios que usan las páginas
// Ejecutar con: node scripts/data/procesarDatos.js

import fs from 'node:fs';
import path from 'node:path';
import { ANIO_REFERENCIA } from '../../src/config/anio.js';
import { PROVINCIAS, leerCsv, rutaProvincia } from './lib/csv.js';

const SALIDA = path.join(process.cwd(), 'src', 'data', 'municipios.js');

function crearSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
}

const municipios = [];

for (const provincia of PROVINCIAS) {
  const filas = leerCsv(rutaProvincia(provincia, `${provincia}-municipios.csv`))
    .filter(fila => fila.year === String(ANIO_REFERENCIA));

  for (const fila of filas) {
    municipios.push({
      nombre: fila.name,
      provincia,
      slug: crearSlug(fila.name),
      codigoINE: fila.cp,
      poblacionActual: Number(fila.population)
    });
  }
}

municipios.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.codigoINE.localeCompare(b.codigoINE));

const slugs = new Set(municipios.map(m => m.slug));
if (slugs.size !== municipios.length) {
  console.error('Hay slugs repetidos en src/data/municipios.js');
  process.exit(1);
}

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, `export const municipios = ${JSON.stringify(municipios, null, 2)};\n`);

console.log(`src/data/municipios.js: ${municipios.length} municipios`);
