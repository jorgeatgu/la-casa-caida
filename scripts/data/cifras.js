// Genera src/data/cifras.json, las cifras que la prosa de la web muestra (home y provincias).
// Ejecutar con: node scripts/data/cifras.js (último paso de npm run data:build)

import fs from 'node:fs';
import path from 'node:path';
import { ANIO_REFERENCIA, FECHA_ACTUALIZACION } from '../../src/config/anio.js';
import { variacionesPorDecada } from '../../src/scripts/decadas.js';
import { DATA_DIR, PROVINCIAS, leerCsv, rutaProvincia } from './lib/csv.js';

const SALIDA = path.join(process.cwd(), 'src', 'data', 'cifras.json');
const PREFIJO = { huesca: '22', teruel: '44', zaragoza: '50' };
const CODIGO_ZARAGOZA_CAPITAL = '50297';
const DENSIDAD_BAJA = 10;
const POCOS_MENORES = 5;

const redondear = (valor, decimales = 2) => Number(valor.toFixed(decimales));
const porcentaje = (parte, total) => redondear((parte / total) * 100);

const aragonTotal = leerCsv(path.join(DATA_DIR, 'aragon-total.csv'));
const ultimaFila = aragonTotal.at(-1);
if (Number(ultimaFila.year) !== ANIO_REFERENCIA) {
  console.error(`aragon-total.csv acaba en ${ultimaFila.year} y ANIO_REFERENCIA es ${ANIO_REFERENCIA}`);
  process.exit(1);
}

const municipiosAragon = leerCsv(path.join(DATA_DIR, 'aragon-municipios.csv'));
const poblacionAragon = Number(ultimaFila.aragon);
const superficieDe = filas => filas.reduce((suma, f) => suma + Number(f.superficie), 0);
const poblacionCapital = Number(municipiosAragon.find(f => f.cp === CODIGO_ZARAGOZA_CAPITAL)['población']);
const superficieAragon = superficieDe(municipiosAragon);

const provincias = {};
for (const provincia of PROVINCIAS) {
  const serie = new Map(
    leerCsv(rutaProvincia(provincia, `${provincia}-total.csv`)).map(f => [Number(f.year), Number(f.total)])
  );
  const poblacion = serie.get(ANIO_REFERENCIA);
  const municipios = municipiosAragon.filter(f => f.cp.startsWith(PREFIJO[provincia]));
  const superficie = superficieDe(municipios);
  const edades = leerCsv(rutaProvincia(provincia, `${provincia}-mayor-menor.csv`));
  const { mayorCrecimiento, mayorDecrecimiento } = variacionesPorDecada(serie, ANIO_REFERENCIA);
  const [anioMaximo, poblacionMaxima] = [...serie].reduce((max, par) => (par[1] > max[1] ? par : max));
  const menores = leerCsv(rutaProvincia(provincia, `${provincia}-years-groups-total.csv`))
    .filter(f => f.age === '0-16' && Number(f.year) === ANIO_REFERENCIA);

  // Extremos del saldo vegetativo, solo con años definitivos
  const saldo = leerCsv(rutaProvincia(provincia, `saldo-vegetativo-total-${provincia}.csv`))
    .filter(f => f.provisional === '0')
    .map(f => ({ anio: Number(f.year), nacidos: Number(f.nacidos), fallecidos: Number(f.fallecidos) }));
  const extremo = (columna, esMejor) =>
    saldo.reduce((mejor, f) => (esMejor(f[columna], mejor[columna]) ? f : mejor));
  const maxFallecidos = extremo('fallecidos', (a, b) => a > b);
  const minNacidos = extremo('nacidos', (a, b) => a < b);

  provincias[provincia] = {
    poblacion,
    superficie: Math.round(superficie),
    densidad: redondear(poblacion / superficie),
    municipios: municipios.length,
    municipiosDensidadBaja: municipios.filter(f => Number(f.densidad) < DENSIDAD_BAJA).length,
    municipiosSinMenores: edades.filter(f => Number(f.menor) === 0).length,
    municipiosPocosMenores: menores.filter(f => Number(f.total) < POCOS_MENORES).length,
    maximo: { anio: anioMaximo, poblacion: poblacionMaxima },
    variacion1900: porcentaje(poblacion - serie.get(1900), serie.get(1900)),
    mayorCrecimiento: { valor: redondear(mayorCrecimiento.valor), periodo: mayorCrecimiento.periodo },
    mayorDecrecimiento: { valor: redondear(mayorDecrecimiento.valor), periodo: mayorDecrecimiento.periodo },
    saldo: {
      desde: saldo[0].anio,
      hasta: saldo.at(-1).anio,
      maxFallecidos: { anio: maxFallecidos.anio, valor: maxFallecidos.fallecidos },
      minNacidos: { anio: minNacidos.anio, valor: minNacidos.nacidos }
    }
  };
}
provincias.zaragoza.porcentajeCapital = porcentaje(poblacionCapital, provincias.zaragoza.poblacion);

// Solo el saldo vegetativo tiene datos provisionales (columna provisional)
const hayProvisionales = PROVINCIAS.some(provincia =>
  leerCsv(rutaProvincia(provincia, `saldo-vegetativo-total-${provincia}.csv`)).some(f => f.provisional === '1')
);

const cifras = {
  anio: ANIO_REFERENCIA,
  actualizado: FECHA_ACTUALIZACION,
  hayProvisionales,
  aragon: {
    poblacion: poblacionAragon,
    superficie: Math.round(superficieAragon),
    densidad: redondear(poblacionAragon / superficieAragon),
    porcentajeZaragozaCapital: porcentaje(poblacionCapital, poblacionAragon)
  },
  provincias
};

fs.writeFileSync(SALIDA, JSON.stringify(cifras, null, 2) + '\n');
console.log(`src/data/cifras.json: Aragón ${poblacionAragon} habitantes en ${ANIO_REFERENCIA}`);
