import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { ANIO_REFERENCIA } from '../config/anio.js';

// Cada CSV se lee una sola vez por build, no una vez por municipio
const cache = new Map();

function leerCsvProvincia(provincia, fichero) {
  const csvPath = path.join(process.cwd(), 'public', 'data', provincia, fichero);
  if (!cache.has(csvPath)) {
    cache.set(csvPath, parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true, bom: true }));
  }
  return cache.get(csvPath);
}

export function cargarDatosEdadSync(provincia, codigo) {
  try {
    const fila = leerCsvProvincia(provincia, `${provincia}-mayor-menor.csv`)
      .find(d => d.cp === codigo && d.year === String(ANIO_REFERENCIA));

    return fila ? {
      year: fila.year,
      name: fila.name,
      menor: parseFloat(fila.menor),
      mayor: parseFloat(fila.mayor),
      population: parseInt(fila.population, 10)
    } : null;
  } catch (error) {
    console.error('Error al cargar datos de edad:', error);
    return null;
  }
}

export function cargarDatosHistoricosSync(provincia, codigo) {
  try {
    return leerCsvProvincia(provincia, `${provincia}-tarjetas.csv`)
      .filter(d => d.cp === codigo)
      .map(d => ({
        year: d.year,
        cp: d.cp,
        name: d.name,
        population: parseInt(d.population, 10) || 0
      }));
  } catch (error) {
    console.error('Error al cargar datos históricos:', error);
    return [];
  }
}
