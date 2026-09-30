// Valida los CSV de public/data antes de publicarlos.
// Ejecutar con: npm run validate:data (sale con código 1 si hay errores)

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { ANIO_REFERENCIA } from '../../src/config/anio.js';
import { DATA_DIR, PROVINCIAS } from './lib/csv.js';

const MUNICIPIOS_POR_PROVINCIA = { huesca: 202, teruel: 236, zaragoza: 293 };
const PREFIJO = { huesca: '22', teruel: '44', zaragoza: '50' };

// Municipios creados después del inicio de la serie: no tienen datos antes de este año
const ALTAS = {
  '22909': 1940, // Vencillón, segregado de Esplús
  '50903': 2007 // Villamayor de Gállego, segregado de Zaragoza en 2006
};

// Cabecera esperada y tipo de cada columna: i = entero, d = decimal, t = texto
const TIPOS = {
  municipios: { fichero: p => `${p}-municipios.csv`, columnas: { year: 'i', cp: 't', name: 't', population: 'i' } },
  serie: { fichero: p => `${p}.csv`, columnas: { year: 'i', cp: 't', name: 't', population: 'i' } },
  tarjetas: { fichero: p => `${p}-tarjetas.csv`, columnas: { year: 'i', cp: 't', name: 't', population: 'i' } },
  densidad: { fichero: p => `${p}-densidad.csv`, columnas: { year: 'i', cp: 't', name: 't', population: 'i', superficie: 'd' } },
  edades: { fichero: p => `${p}-years-groups-total.csv`, columnas: { cp: 't', name: 't', age: 't', year: 'i', total: 'i' } },
  mayorMenor: { fichero: p => `${p}-mayor-menor.csv`, columnas: { year: 'i', cp: 't', name: 't', menor: 'd', mayor: 'd', population: 'i' } },
  total: { fichero: p => `${p}-total.csv`, columnas: { year: 'i', total: 'i' } },
  saldo: { fichero: p => `saldo-vegetativo-total-${p}.csv`, columnas: { year: 'i', saldo: 'i', nacidos: 'i', fallecidos: 'i' } }
};

const ARAGON_TOTAL = { year: 'i', teruel: 'i', huesca: 'i', zaragoza: 'i', aragon: 'i', teruelP: 'd', huescaP: 'd', zaragozaP: 'd' };
const ARAGON_MUNICIPIOS = { cp: 't', municipio: 't', 'población': 'i', superficie: 'd', densidad: 'd' };

const errores = new Map();
const nombresPorCodigo = new Map();

function error(fichero, mensaje) {
  if (!errores.has(fichero)) errores.set(fichero, []);
  errores.get(fichero).push(mensaje);
}

// Lee el fichero y comprueba cabecera, filas vacías y valores. Devuelve las filas válidas.
function cargar(rutaRelativa, columnas) {
  const ruta = path.join(DATA_DIR, rutaRelativa);
  if (!fs.existsSync(ruta)) {
    error(rutaRelativa, 'no existe');
    return null;
  }

  const texto = fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '');
  const lineas = texto.replace(/\n$/, '').split('\n');
  const esperada = Object.keys(columnas).join(',');
  if (lineas[0] !== esperada) {
    error(rutaRelativa, `cabecera "${lineas[0]}", se esperaba "${esperada}"`);
  }
  lineas.forEach((linea, i) => {
    if (linea.trim() === '') error(rutaRelativa, `línea ${i + 1} vacía`);
  });

  const filas = parse(texto, { columns: true, skip_empty_lines: true, relax_column_count: true });
  const validas = [];

  filas.forEach((fila, i) => {
    const linea = i + 2;
    let ok = true;
    for (const [columna, tipo] of Object.entries(columnas)) {
      const valor = fila[columna];
      if (valor === undefined || valor === '') {
        error(rutaRelativa, `línea ${linea}: "${columna}" vacío`);
        ok = false;
      } else if (tipo === 'i' && !/^-?\d+$/.test(valor)) {
        error(rutaRelativa, `línea ${linea}: "${columna}" = "${valor}" no es un entero`);
        ok = false;
      } else if (tipo === 'd' && !/^-?\d+(\.\d+)?$/.test(valor)) {
        error(rutaRelativa, `línea ${linea}: "${columna}" = "${valor}" no es un número`);
        ok = false;
      }
    }
    if (ok) validas.push(fila);
  });

  return validas;
}

function registrarNombre(cp, nombre, fichero) {
  if (!nombresPorCodigo.has(cp)) nombresPorCodigo.set(cp, new Map());
  const nombres = nombresPorCodigo.get(cp);
  if (!nombres.has(nombre)) nombres.set(nombre, fichero);
}

// Códigos, unicidad, nombres, número de municipios y años por municipio
function comprobarMunicipios(fichero, filas, provincia, columnaNombre = 'name') {
  if (!filas.length || !('cp' in filas[0])) {
    error(fichero, 'falta la columna cp: no se puede cruzar por código');
    return;
  }

  const claves = new Set();
  const aniosPorCodigo = new Map();

  for (const fila of filas) {
    const { cp } = fila;
    if (!/^\d{5}$/.test(cp) || !cp.startsWith(PREFIJO[provincia])) {
      error(fichero, `código "${cp}" (${fila[columnaNombre]}) no es de ${provincia}`);
      continue;
    }

    const clave = [fila.year, cp, fila.age].filter(Boolean).join('|');
    if (claves.has(clave)) error(fichero, `fila repetida para ${clave} (${fila[columnaNombre]})`);
    claves.add(clave);

    registrarNombre(cp, fila[columnaNombre], fichero);

    if (fila.year) {
      if (!aniosPorCodigo.has(cp)) aniosPorCodigo.set(cp, new Set());
      aniosPorCodigo.get(cp).add(fila.year);
    }
  }

  const codigos = new Set(filas.map(f => f.cp));
  if (codigos.size !== MUNICIPIOS_POR_PROVINCIA[provincia]) {
    error(fichero, `${codigos.size} municipios, se esperaban ${MUNICIPIOS_POR_PROVINCIA[provincia]}`);
  }

  const todos = new Set([...aniosPorCodigo.values()].flatMap(s => [...s]));
  for (const [cp, anios] of aniosPorCodigo) {
    const faltan = [...todos].filter(a => !anios.has(a) && !(ALTAS[cp] && +a < ALTAS[cp]));
    if (faltan.length) error(fichero, `${cp} no tiene los años ${faltan.join(', ')}`);
  }
}

function sumarPorAnio(filas, columna = 'population') {
  const sumas = new Map();
  for (const fila of filas) sumas.set(fila.year, (sumas.get(fila.year) || 0) + Number(fila[columna]));
  return sumas;
}

const totales = {};

for (const provincia of PROVINCIAS) {
  const datos = {};
  for (const [tipo, { fichero, columnas }] of Object.entries(TIPOS)) {
    const ruta = path.join(provincia, fichero(provincia));
    datos[tipo] = { ruta, filas: cargar(ruta, columnas) };
  }

  for (const tipo of ['municipios', 'serie', 'tarjetas', 'densidad', 'edades', 'mayorMenor']) {
    const { ruta, filas } = datos[tipo];
    if (filas) comprobarMunicipios(ruta, filas, provincia);
  }

  for (const tipo of ['municipios', 'mayorMenor']) {
    const { ruta, filas } = datos[tipo];
    if (filas?.some(f => f.year !== String(ANIO_REFERENCIA))) {
      error(ruta, `hay filas de años distintos de ${ANIO_REFERENCIA}`);
    }
  }

  const { ruta: rutaTotal, filas: filasTotal } = datos.total;
  if (filasTotal) {
    totales[provincia] = new Map(filasTotal.map(f => [f.year, Number(f.total)]));
    for (const tipo of ['serie', 'tarjetas', 'densidad', 'municipios']) {
      const { ruta, filas } = datos[tipo];
      if (!filas) continue;
      for (const [anio, suma] of sumarPorAnio(filas)) {
        const total = totales[provincia].get(anio);
        if (total === undefined) error(ruta, `el año ${anio} no está en ${rutaTotal}`);
        else if (total !== suma) error(ruta, `${anio}: la suma de municipios es ${suma} y ${rutaTotal} dice ${total}`);
      }
    }
  }

  const { ruta: rutaSaldo, filas: filasSaldo } = datos.saldo;
  for (const fila of filasSaldo || []) {
    if (Number(fila.nacidos) - Number(fila.fallecidos) !== Number(fila.saldo)) {
      error(rutaSaldo, `${fila.year}: ${fila.nacidos} nacidos − ${fila.fallecidos} fallecidos ≠ saldo ${fila.saldo}`);
    }
  }
}

const aragonTotal = cargar('aragon-total.csv', ARAGON_TOTAL);
for (const fila of aragonTotal || []) {
  const aragon = Number(fila.aragon);
  const suma = PROVINCIAS.reduce((s, p) => s + Number(fila[p]), 0);
  if (suma !== aragon) error('aragon-total.csv', `${fila.year}: la suma de provincias es ${suma} y aragon dice ${aragon}`);

  for (const provincia of PROVINCIAS) {
    const total = totales[provincia]?.get(fila.year);
    if (total !== undefined && total !== Number(fila[provincia])) {
      error('aragon-total.csv', `${fila.year}: ${provincia} vale ${fila[provincia]} y ${provincia}-total.csv dice ${total}`);
    }
    const porcentaje = (Number(fila[provincia]) / aragon) * 100;
    if (Math.abs(porcentaje - Number(fila[`${provincia}P`])) > 0.01) {
      error('aragon-total.csv', `${fila.year}: ${provincia}P = ${fila[`${provincia}P`]}, calculado ${porcentaje.toFixed(2)}`);
    }
  }
}

const aragonMunicipios = cargar('aragon-municipios.csv', ARAGON_MUNICIPIOS);
if (aragonMunicipios) {
  for (const provincia of PROVINCIAS) {
    const filas = aragonMunicipios.filter(f => f.cp.startsWith(PREFIJO[provincia]));
    comprobarMunicipios('aragon-municipios.csv', filas, provincia, 'municipio');
  }
}

for (const [cp, nombres] of nombresPorCodigo) {
  if (nombres.size > 1) {
    const detalle = [...nombres].map(([nombre, fichero]) => `"${nombre}" (${fichero})`).join(', ');
    error('nombres', `${cp} tiene varios nombres: ${detalle}`);
  }
}

if (errores.size === 0) {
  console.log('Datos válidos.');
  process.exit(0);
}

const MAXIMO = 15;
let total = 0;
for (const [fichero, mensajes] of errores) {
  total += mensajes.length;
  console.error(`\n${fichero} (${mensajes.length})`);
  for (const mensaje of mensajes.slice(0, MAXIMO)) console.error(`  - ${mensaje}`);
  if (mensajes.length > MAXIMO) console.error(`  … y ${mensajes.length - MAXIMO} más`);
}
console.error(`\n${total} errores.`);
process.exit(1);
