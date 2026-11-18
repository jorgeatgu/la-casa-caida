import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export const PROVINCIAS = ['huesca', 'teruel', 'zaragoza'];
export const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export function rutaProvincia(provincia, fichero) {
  return path.join(DATA_DIR, provincia, fichero);
}

export function leerCsv(ruta) {
  return parse(fs.readFileSync(ruta, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });
}

function celda(valor) {
  const texto = String(valor ?? '');
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

// Escribe siempre la misma salida para la misma entrada: columnas en orden fijo y salto de línea final
export function escribirCsv(ruta, filas, columnas) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const lineas = [columnas.join(','), ...filas.map(fila => columnas.map(c => celda(fila[c])).join(','))];
  fs.writeFileSync(ruta, lineas.join('\n') + '\n', 'utf8');
}
