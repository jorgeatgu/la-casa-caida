// scripts/data/descargar.js
// Descarga los datos fuente sin transformar a data-raw/.
// Ejecutar con: npm run data:download
// Qué es cada tabla y por qué se usa: docs/sprints/01/fuentes.md

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Readable } from 'stream';

const RAW_DIR = './data-raw';
const TEMPUS = 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA';
const JAXI_CSV = 'https://www.ine.es/jaxiT3/files/t/es/csv_bdsc';
const GIST_SUPERFICIE = 'https://gist.githubusercontent.com/jorgeatgu/40eaa471b02add6d9a7a9aca33fc8bd5/raw/ef7d384a0749df4f9b3594c76b432026344b0df9/aragon.json';
const PROVINCIAS_ARAGON = ['22', '44', '50'];
const TOTAL_MUNICIPIOS = 731;
const REINTENTOS = 3;
// Incluye la lectura del cuerpo: el CSV del censo pesa unos 335 MB.
const TIMEOUT_MS = 10 * 60 * 1000;

// El gist trae el código 22246 dos veces (Veracruz y Beranuy, misma geometría).
// Veracruz se llama Beranuy desde 2011.
const NOMBRE_DUPLICADOS = { 22246: 'Beranuy' };

const FUENTES = [
  { fuente: 'ine', tabla: 'dpop-2875-huesca', formato: 'json', url: `${TEMPUS}/2875?tip=AM` },
  { fuente: 'ine', tabla: 'dpop-2899-teruel', formato: 'json', url: `${TEMPUS}/2899?tip=AM` },
  { fuente: 'ine', tabla: 'dpop-2907-zaragoza', formato: 'json', url: `${TEMPUS}/2907?tip=AM` },
  { fuente: 'ine', tabla: 'censo-68540-edad-grandes-grupos', formato: 'censo', url: `${JAXI_CSV}/68540.csv` },
  { fuente: 'ine', tabla: 'mnp-6506-nacimientos', formato: 'json', url: `${TEMPUS}/6506?tip=A` },
  { fuente: 'ine', tabla: 'mnp-6545-defunciones', formato: 'json', url: `${TEMPUS}/6545?tip=A` },
  { fuente: 'ine', tabla: 'emn-46682-nacimientos-mensuales', formato: 'json', url: `${TEMPUS}/46682?tip=A` },
  { fuente: 'ine', tabla: 'edes-62278-defunciones-mensuales', formato: 'json', url: `${TEMPUS}/62278?tip=A` },
  { fuente: 'gist', tabla: 'superficie', formato: 'superficie', url: GIST_SUPERFICIE }
];

// Pide la URL y pasa la respuesta a `leer`. Si falla la petición o la lectura
// del cuerpo (corte a mitad del CSV del censo, timeout), se reintenta entera.
async function pedir(url, leer) {
  for (let intento = 1; ; intento++) {
    try {
      const respuesta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return await leer(respuesta);
    } catch (error) {
      if (intento >= REINTENTOS) throw new Error(`${url}: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * intento));
    }
  }
}

// Respuesta de la API Tempus, guardada byte a byte.
async function descargarJSON({ url }, destino) {
  const texto = await pedir(url, respuesta => respuesta.text());
  const datos = JSON.parse(texto);
  if (!Array.isArray(datos) || datos.length === 0) {
    throw new Error(`respuesta inesperada: ${texto.slice(0, 120)}`);
  }
  fs.writeFileSync(destino, texto);
  return `${datos.length} series`;
}

// La tabla 68540 es nacional y la API la rechaza por volumen, así que se lee
// el CSV completo en streaming y se copian tal cual la cabecera y las líneas de
// Aragón con Sexo = Total y Relación = Total.
// Columnas: Total Nacional;Provincias;Municipios;Sexo;Edad;Relacion...;Periodo;Total
async function descargarCenso({ url }, destino) {
  const { salida, municipios } = await pedir(url, async respuesta => {
    const lineas = readline.createInterface({ input: Readable.fromWeb(respuesta.body), crlfDelay: Infinity });
    const salida = [];
    const municipios = new Set();

    for await (const linea of lineas) {
      if (salida.length === 0) {
        salida.push(linea);
        continue;
      }
      const [, provincia = '', municipio, sexo, , relacion] = linea.split(';');
      if (!PROVINCIAS_ARAGON.includes(provincia.slice(0, 2))) continue;
      if (sexo !== 'Total' || relacion !== 'Total') continue;
      salida.push(linea);
      if (municipio) municipios.add(municipio.slice(0, 5));
    }
    return { salida, municipios };
  });

  if (municipios.size !== TOTAL_MUNICIPIOS) {
    throw new Error(`se esperaban ${TOTAL_MUNICIPIOS} municipios y hay ${municipios.size}`);
  }
  fs.writeFileSync(destino, salida.join('\n') + '\n');
  return `${salida.length - 1} filas, ${municipios.size} municipios`;
}

// Algunos nombres del gist vienen como UTF-8 leído en Latin-1 ("CastejÃ³n").
function repararNombre(nombre) {
  return /Ã|Â/.test(nombre) ? Buffer.from(nombre, 'latin1').toString('utf8') : nombre;
}

// Superficie oficial del gist (sup_of_km2) sin tocar, más el área del polígono
// para detectar los valores erróneos del gist.
async function descargarSuperficie({ url }, destino) {
  const { features } = await pedir(url, respuesta => respuesta.json());
  const porCodigo = new Map();

  for (const { properties: p } of features) {
    const codigo = String(p.c_muni_ine).padStart(5, '0');
    const fila = {
      codigo,
      nombre: NOMBRE_DUPLICADOS[codigo] ?? repararNombre(p.d_muni_ine),
      superficie: p.sup_of_km2,
      areaPoligono: (p.shape_area / 1e6).toFixed(2)
    };
    const previa = porCodigo.get(codigo);
    if (previa && !NOMBRE_DUPLICADOS[codigo]) throw new Error(`código ${codigo} duplicado`);
    if (previa && previa.superficie !== fila.superficie) {
      throw new Error(`código ${codigo} duplicado con superficies distintas`);
    }
    porCodigo.set(codigo, fila);
  }

  if (porCodigo.size !== TOTAL_MUNICIPIOS) {
    throw new Error(`se esperaban ${TOTAL_MUNICIPIOS} municipios y hay ${porCodigo.size}`);
  }

  const filas = [...porCodigo.values()]
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .map(f => [f.codigo, f.nombre.includes(',') ? `"${f.nombre}"` : f.nombre, f.superficie, f.areaPoligono].join(','));
  fs.writeFileSync(destino, ['codigo_ine,nombre,sup_of_km2,area_poligono_km2', ...filas].join('\n') + '\n');
  return `${filas.length} municipios`;
}

const DESCARGAS = { json: descargarJSON, censo: descargarCenso, superficie: descargarSuperficie };

function rutaDestino({ fuente, tabla, formato }) {
  if (formato === 'superficie') return path.join(RAW_DIR, `${tabla}.csv`);
  return path.join(RAW_DIR, fuente, `${tabla}.${formato === 'json' ? 'json' : 'csv'}`);
}

async function descargar() {
  let errores = 0;

  for (const origen of FUENTES) {
    const destino = rutaDestino(origen);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    try {
      const resumen = await DESCARGAS[origen.formato](origen, destino);
      console.log(`✓ ${destino} (${resumen})`);
    } catch (error) {
      errores++;
      console.error(`✗ ${destino}: ${error.message}`);
    }
  }

  if (errores > 0) {
    console.error(`\n${errores} descarga(s) fallida(s)`);
    process.exit(1);
  }
}

descargar();
