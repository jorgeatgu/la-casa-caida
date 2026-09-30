// Genera los CSV de public/data/rankings con los rankings precalculados
// Ejecutar con: node scripts/data/generarRankingsCsv.js (después de procesarDatos.js y calcularPorcentajesEdad.js)

import path from 'node:path';
import { ANIO_COMPARACION, ANIO_REFERENCIA } from '../../src/config/anio.js';
import { municipios } from '../../src/data/municipios.js';
import { cargarDatosEdadSync, cargarDatosHistoricosSync } from '../../src/scripts/dataLoader.js';
import { DATA_DIR, PROVINCIAS, escribirCsv, leerCsv, rutaProvincia } from './lib/csv.js';

const SALIDA = path.join(DATA_DIR, 'rankings');

const COLUMNAS = [
  'nombre', 'provincia', 'slug', 'codigoINE',
  'poblacion1900', 'poblacionActual', 'poblacionComparacion',
  'variacion1900', 'perdidaAbsoluta', 'perdidaPorcentual', 'varUltimosAnios',
  'porcentajeMayores', 'porcentajeMenores', 'densidad'
];

// La superficie no cambia con los años: se toma la de cualquier fila del municipio
const superficies = new Map();
for (const provincia of PROVINCIAS) {
  for (const fila of leerCsv(rutaProvincia(provincia, `${provincia}-densidad.csv`))) {
    superficies.set(fila.cp, Number(fila.superficie));
  }
}

const datosMunicipios = [];

for (const municipio of municipios) {
  const datosHistoricos = cargarDatosHistoricosSync(municipio.provincia, municipio.codigoINE);
  const datosEdad = cargarDatosEdadSync(municipio.provincia, municipio.codigoINE);

  if (!datosHistoricos.length || !datosEdad) {
    console.error(`Sin datos para ${municipio.nombre} (${municipio.codigoINE})`);
    process.exit(1);
  }

  const poblacionEn = anio => datosHistoricos.find(d => d.year === String(anio))?.population || 0;
  const poblacion1900 = poblacionEn(1900);
  const poblacionActual = poblacionEn(ANIO_REFERENCIA);
  const poblacionComparacion = poblacionEn(ANIO_COMPARACION);
  const superficie = superficies.get(municipio.codigoINE);

  const perdidaAbsoluta = poblacion1900 - poblacionActual;

  datosMunicipios.push({
    nombre: municipio.nombre,
    provincia: municipio.provincia,
    slug: municipio.slug,
    codigoINE: municipio.codigoINE,
    poblacion1900,
    poblacionActual,
    poblacionComparacion,
    variacion1900: poblacion1900 > 0 ? ((poblacionActual - poblacion1900) / poblacion1900) * 100 : 0,
    perdidaAbsoluta,
    perdidaPorcentual: poblacion1900 > 0 ? (perdidaAbsoluta / poblacion1900) * 100 : 0,
    varUltimosAnios: poblacionComparacion > 0 ? ((poblacionActual - poblacionComparacion) / poblacionComparacion) * 100 : 0,
    porcentajeMayores: datosEdad.mayor || 0,
    porcentajeMenores: datosEdad.menor || 0,
    densidad: superficie > 0 ? poblacionActual / superficie : 0
  });
}

const tiposRanking = [
  { nombre: 'despoblacion', filtro: m => m.poblacion1900 > 100, orden: (a, b) => b.perdidaPorcentual - a.perdidaPorcentual },
  { nombre: 'crecimiento', filtro: () => true, orden: (a, b) => b.variacion1900 - a.variacion1900 },
  { nombre: 'envejecidos', filtro: m => m.poblacionActual > 50, orden: (a, b) => b.porcentajeMayores - a.porcentajeMayores },
  { nombre: 'jovenes', filtro: m => m.poblacionActual > 50, orden: (a, b) => b.porcentajeMenores - a.porcentajeMenores },
  { nombre: 'densidad-alta', filtro: () => true, orden: (a, b) => b.densidad - a.densidad },
  { nombre: 'densidad-baja', filtro: m => m.poblacionActual > 10, orden: (a, b) => a.densidad - b.densidad }
];

for (const tipo of tiposRanking) {
  // A igualdad de valor, el orden alfabético de municipios.js se mantiene (sort es estable)
  const filas = datosMunicipios.filter(tipo.filtro).sort(tipo.orden);
  escribirCsv(path.join(SALIDA, `ranking-${tipo.nombre}.csv`), filas, COLUMNAS);
  console.log(`ranking-${tipo.nombre}.csv: ${filas.length} municipios`);
}
