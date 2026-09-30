// Lee data-raw/ y escribe los CSV base de public/data/. Primer paso de npm run data:build.
// Ejecutar con: node scripts/data/transformar.js
// Qué es cada fuente: docs/sprints/01/fuentes.md y data-raw/historico/README.md

import fs from 'node:fs';
import path from 'node:path';
import { ANIO_REFERENCIA } from '../../src/config/anio.js';
import { DATA_DIR, PROVINCIAS, escribirCsv, leerCsv, rutaProvincia } from './lib/csv.js';

const RAW_DIR = path.join(process.cwd(), 'data-raw');

// Primer año de la serie anual del padrón. Antes solo hay años censales.
const ANIO_INICIO_ANUAL = 2012;

const PROVINCIA = {
  huesca: { codigo: '22', nombre: 'Huesca', dpop: 'dpop-2875-huesca' },
  teruel: { codigo: '44', nombre: 'Teruel', dpop: 'dpop-2899-teruel' },
  zaragoza: { codigo: '50', nombre: 'Zaragoza', dpop: 'dpop-2907-zaragoza' }
};

// Tramos del Censo Anual (68540) con la etiqueta que usan los CSV
const TRAMOS = {
  'Menos de 16 años': '0-16',
  'De 16 a 64 años': '16-64',
  '65 y más años': '65-100'
};

// Superficie: sup_of_km2 salvo cuando se aleja más de un 5 % del polígono.
// Excepciones que conservan sup_of_km2: Argavieso y Jasa (redondeo), Ansó y Fago (polígono compartido).
const DESVIACION_SUPERFICIE = 0.05;
const CONSERVAN_SUP_OF = new Set(['22036', '22131', '22028', '22106']);

// T3_TipoDato que marcan un dato como provisional. El MNP trae "Nulo" en las defunciones
// de 2011 aunque el valor es el definitivo, así que no basta con comparar con "Definitivo".
const TIPOS_PROVISIONALES = new Set(['Provisional', 'Avance', 'Estimados']);

const errores = [];

function leerJson(tabla) {
  return JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'ine', `${tabla}.json`), 'utf8'));
}

// El INE pospone el artículo ("Fueva, La"). En la web se muestra delante ("La Fueva").
function nombreParaMostrar(nombre) {
  const [, resto, articulo] = nombre.match(/^(.+), (La|El|Los|Las)$/) ?? [];
  return articulo ? `${articulo} ${resto}` : nombre;
}

// DPOP, sexo = Total: población a 1 de enero por municipio y total provincial
function leerPadron(provincia) {
  const municipios = new Map();
  const total = new Map();

  for (const serie of leerJson(PROVINCIA[provincia].dpop)) {
    const [ambito, sexo] = serie.MetaData;
    if (sexo.Codigo !== '0') continue;
    const valores = new Map(serie.Data.map(d => [d.Anyo, d.Valor]));

    if (ambito.T3_Variable === 'Provincias') {
      for (const [anio, valor] of valores) total.set(anio, valor);
    } else {
      municipios.set(ambito.Codigo, { nombre: nombreParaMostrar(ambito.Nombre), valores });
    }
  }
  return { municipios, total };
}

// Censo Anual 68540: "Total Nacional;Provincias;Municipios;Sexo;Edad;Relación;Periodo;Total", con punto de miles
function leerCensoEdades() {
  const texto = fs.readFileSync(path.join(RAW_DIR, 'ine', 'censo-68540-edad-grandes-grupos.csv'), 'utf8');
  const filas = [];

  for (const linea of texto.replace(/^﻿/, '').trim().split('\n').slice(1)) {
    const [, , municipio, , edad, , periodo, total] = linea.split(';');
    if (!municipio || !TRAMOS[edad]) continue;
    const valor = total.replace(/\./g, '');
    if (!/^\d+$/.test(valor)) {
      errores.push(`censo 68540: valor "${total}" para ${municipio}, ${edad}, ${periodo}`);
      continue;
    }
    filas.push({ cp: municipio.slice(0, 5), age: TRAMOS[edad], year: Number(periodo), total: Number(valor) });
  }
  return filas;
}

function leerSuperficies() {
  const superficies = new Map();
  for (const fila of leerCsv(path.join(RAW_DIR, 'superficie.csv'))) {
    const oficial = Number(fila.sup_of_km2);
    const poligono = Number(fila.area_poligono_km2);
    const seAleja = Math.abs(oficial - poligono) / poligono > DESVIACION_SUPERFICIE;
    superficies.set(fila.codigo_ine, seAleja && !CONSERVAN_SUP_OF.has(fila.codigo_ine) ? poligono.toFixed(2) : fila.sup_of_km2);
  }
  return superficies;
}

// Nacimientos y defunciones anuales de la provincia. El MNP es definitivo; para los años
// que aún no tiene se usa el acumulado de diciembre de las estimaciones mensuales
// (EMN y EDeS), marcado como provisional.
function leerMovimientoNatural(provincia) {
  const { nombre } = PROVINCIA[provincia];
  const serie = (tabla, inicioNombre, filtro = () => true) => {
    const encontrada = leerJson(tabla).find(s => s.Nombre.startsWith(`${nombre}. ${inicioNombre}`));
    if (!encontrada) throw new Error(`${tabla}: no hay serie "${nombre}. ${inicioNombre}"`);
    return new Map(encontrada.Data.filter(filtro).map(d => [d.Anyo, d]));
  };
  const diciembre = d => d.T3_Periodo === 'M12';

  const fuentes = [
    {
      nacidos: serie('mnp-6506-nacimientos', 'Nacimiento. Total.'),
      fallecidos: serie('mnp-6545-defunciones', 'Defunción. Total.')
    },
    {
      nacidos: serie('emn-46682-nacimientos-mensuales', 'Total. Todas las edades. Acumulado', diciembre),
      fallecidos: serie('edes-62278-defunciones-mensuales', 'Total. Todas las edades. Acumulado', diciembre)
    }
  ];

  const filas = new Map();
  for (const { nacidos, fallecidos } of fuentes) {
    for (const [anio, nacido] of nacidos) {
      const fallecido = fallecidos.get(anio);
      if (!fallecido || filas.has(anio)) continue;
      filas.set(anio, {
        year: anio,
        saldo: nacido.Valor - fallecido.Valor,
        nacidos: nacido.Valor,
        fallecidos: fallecido.Valor,
        provisional: TIPOS_PROVISIONALES.has(nacido.T3_TipoDato) || TIPOS_PROVISIONALES.has(fallecido.T3_TipoDato) ? 1 : 0
      });
    }
  }
  return [...filas.values()].sort((a, b) => a.year - b.year);
}

const porAnioYCodigo = (a, b) => a.year - b.year || a.cp.localeCompare(b.cp);

const censos = leerCsv(path.join(RAW_DIR, 'historico', 'censos-1900-2011.csv'));
const edadesPadron = leerCsv(path.join(RAW_DIR, 'historico', 'edades-padron-2003-2022.csv'));
const censoEdades = leerCensoEdades();
const superficies = leerSuperficies();
const ultimoAnioEdadesPadron = Math.max(...edadesPadron.map(f => Number(f.anio)));

const aniosAnuales = [];
for (let anio = ANIO_INICIO_ANUAL; anio <= ANIO_REFERENCIA; anio++) aniosAnuales.push(anio);

const totalesAragon = new Map();
const aniosPosteriores = new Set();

for (const provincia of PROVINCIAS) {
  const { codigo } = PROVINCIA[provincia];
  const padron = leerPadron(provincia);
  const nombre = cp => padron.municipios.get(cp)?.nombre;

  // Población: censos históricos + padrón anual
  const poblacion = censos
    .filter(f => f.codigo_ine.startsWith(codigo))
    .map(f => ({ year: Number(f.anio), cp: f.codigo_ine, population: Number(f.poblacion) }));

  for (const [cp, { valores }] of padron.municipios) {
    for (const anio of aniosAnuales) {
      if (valores.has(anio)) poblacion.push({ year: anio, cp, population: valores.get(anio) });
      else errores.push(`${provincia}: DPOP no tiene ${anio} para ${cp} (${nombre(cp)})`);
    }
  }

  for (const fila of poblacion) {
    fila.name = nombre(fila.cp);
    if (!fila.name) errores.push(`${provincia}: el código ${fila.cp} de los censos no está en DPOP`);
  }
  poblacion.sort(porAnioYCodigo);

  const columnasPoblacion = ['year', 'cp', 'name', 'population'];
  escribirCsv(rutaProvincia(provincia, `${provincia}.csv`), poblacion, columnasPoblacion);
  escribirCsv(rutaProvincia(provincia, `${provincia}-tarjetas.csv`), poblacion, columnasPoblacion);
  escribirCsv(
    rutaProvincia(provincia, `${provincia}-municipios.csv`),
    poblacion.filter(f => f.year === ANIO_REFERENCIA),
    columnasPoblacion
  );

  const densidad = poblacion.map(f => ({ ...f, superficie: superficies.get(f.cp) }));
  for (const fila of densidad) {
    if (fila.superficie === undefined) errores.push(`${provincia}: sin superficie para ${fila.cp} (${fila.name})`);
  }
  escribirCsv(rutaProvincia(provincia, `${provincia}-densidad.csv`), densidad, [...columnasPoblacion, 'superficie']);

  // Totales: suma de municipios, que en los años del padrón debe coincidir con la cifra provincial
  const totales = new Map();
  for (const { year, population } of poblacion) totales.set(year, (totales.get(year) || 0) + population);
  for (const anio of aniosAnuales) {
    if (padron.total.get(anio) !== totales.get(anio)) {
      errores.push(`${provincia} ${anio}: la suma de municipios es ${totales.get(anio)} y DPOP dice ${padron.total.get(anio)}`);
    }
  }
  const filasTotal = [...totales].sort(([a], [b]) => a - b).map(([year, total]) => ({ year, total }));
  escribirCsv(rutaProvincia(provincia, `${provincia}-total.csv`), filasTotal, ['year', 'total']);
  for (const { year, total } of filasTotal) {
    if (!totalesAragon.has(year)) totalesAragon.set(year, {});
    totalesAragon.get(year)[provincia] = total;
  }

  // Edades: padrón continuo hasta 2022 y Censo Anual después
  const edades = [
    ...edadesPadron
      .filter(f => f.codigo_ine.startsWith(codigo))
      .map(f => ({ cp: f.codigo_ine, age: f.tramo, year: Number(f.anio), total: Number(f.poblacion) })),
    ...censoEdades.filter(f => f.cp.startsWith(codigo) && f.year > ultimoAnioEdadesPadron && f.year <= ANIO_REFERENCIA)
  ].map(f => ({ ...f, name: nombre(f.cp) }));
  if (!edades.some(f => f.year === ANIO_REFERENCIA)) {
    errores.push(`${provincia}: el Censo Anual no tiene edades de ${ANIO_REFERENCIA}`);
  }
  edades.sort((a, b) => a.cp.localeCompare(b.cp) || a.year - b.year || a.age.localeCompare(b.age));
  escribirCsv(rutaProvincia(provincia, `${provincia}-years-groups-total.csv`), edades, ['cp', 'name', 'age', 'year', 'total']);

  // Saldo vegetativo provincial
  const saldo = leerMovimientoNatural(provincia);
  escribirCsv(
    rutaProvincia(provincia, `saldo-vegetativo-total-${provincia}.csv`),
    saldo,
    ['year', 'saldo', 'nacidos', 'fallecidos', 'provisional']
  );

  for (const anio of padron.total.keys()) {
    if (anio > ANIO_REFERENCIA) aniosPosteriores.add(anio);
  }

  console.log(`${provincia}: ${padron.municipios.size} municipios, ${poblacion.length} filas de población, ${edades.length} de edades, saldo ${saldo[0].year}-${saldo.at(-1).year}`);
}

// Aragón: totales provinciales y peso de cada provincia
const porcentaje = (parte, total) => ((parte / total) * 100).toFixed(2);
const aragonTotal = [...totalesAragon]
  .sort(([a], [b]) => a - b)
  .map(([year, { huesca, teruel, zaragoza }]) => {
    const aragon = huesca + teruel + zaragoza;
    return {
      year, teruel, huesca, zaragoza, aragon,
      teruelP: porcentaje(teruel, aragon),
      huescaP: porcentaje(huesca, aragon),
      zaragozaP: porcentaje(zaragoza, aragon)
    };
  });
escribirCsv(path.join(DATA_DIR, 'aragon-total.csv'), aragonTotal, [
  'year', 'teruel', 'huesca', 'zaragoza', 'aragon', 'teruelP', 'huescaP', 'zaragozaP'
]);

// Aragón: foto por municipio del año de referencia
const aragonMunicipios = PROVINCIAS
  .flatMap(provincia => leerCsv(rutaProvincia(provincia, `${provincia}-municipios.csv`)))
  .map(f => ({
    cp: f.cp,
    municipio: f.name,
    'población': f.population,
    superficie: superficies.get(f.cp),
    densidad: (Number(f.population) / Number(superficies.get(f.cp))).toFixed(2)
  }))
  .sort((a, b) => a.cp.localeCompare(b.cp));
escribirCsv(path.join(DATA_DIR, 'aragon-municipios.csv'), aragonMunicipios, [
  'cp', 'municipio', 'población', 'superficie', 'densidad'
]);

if (aniosPosteriores.size) {
  console.warn(`Aviso: DPOP ya tiene ${[...aniosPosteriores].join(', ')}. Actualiza ANIO_REFERENCIA en src/config/anio.js`);
}

if (errores.length) {
  console.error(`\n${errores.length} errores:`);
  for (const mensaje of errores.slice(0, 30)) console.error(`  - ${mensaje}`);
  process.exit(1);
}
console.log(`aragon-total.csv: ${aragonTotal.length} años; aragon-municipios.csv: ${aragonMunicipios.length} municipios`);
