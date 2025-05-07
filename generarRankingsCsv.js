// generarRankingsCsv.js
// Script para generar archivos CSV con los rankings precalculados
// Ejecutar con: node generarRankingsCsv.js

import fs from 'fs';
import path from 'path';
import { municipios } from './src/data/municipios.js';
import { cargarDatosEdadSync, cargarDatosHistoricosSync } from './src/scripts/dataLoader.js';

// Directorio donde se guardarán los CSV
const outputDir = './public/data/rankings';

// Asegurarse de que el directorio exista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generando rankings CSV...');

// Cargar todos los datos necesarios para todos los municipios
const datosMunicipios = [];

// Procesamos los datos de todos los municipios de las tres provincias
for (const municipio of municipios) {
  try {
    const datosHistoricos = cargarDatosHistoricosSync(municipio.provincia, municipio.codigoINE);
    const datosEdad = cargarDatosEdadSync(municipio.provincia, municipio.nombre);

    if (datosHistoricos && datosHistoricos.length > 0 && datosEdad) {
      // Datos básicos
      const poblacion1900 = datosHistoricos.find(d => d.year === '1900')?.population || 0;
      const poblacion2024 = datosHistoricos.find(d => d.year === '2024')?.population || 0;
      const poblacion2014 = datosHistoricos.find(d => d.year === '2014')?.population || 0;

      // Métricas calculadas
      const variacion1900 = poblacion1900 > 0 ? ((poblacion2024 - poblacion1900) / poblacion1900) * 100 : 0;
      const varUltimosAnios = poblacion2014 > 0 ? ((poblacion2024 - poblacion2014) / poblacion2014) * 100 : 0;
      const perdidaAbsoluta = poblacion1900 - poblacion2024;

      datosMunicipios.push({
        nombre: municipio.nombre,
        provincia: municipio.provincia,
        slug: municipio.slug,
        codigoINE: municipio.codigoINE,
        poblacion1900,
        poblacion2024,
        poblacion2014,
        variacion1900,
        perdidaAbsoluta,
        perdidaPorcentual: poblacion1900 > 0 ? (perdidaAbsoluta / poblacion1900) * 100 : 0,
        varUltimosAnios,
        porcentajeMayores: datosEdad.mayor || 0,
        porcentajeMenores: datosEdad.menor || 0,
        densidad: datosEdad.density || 0
      });
    }
  } catch (error) {
    console.error(`Error al procesar datos para ${municipio.nombre}: ${error.message}`);
  }
}

// Función para convertir array a CSV
function arrayToCSV(data) {
  // Si no hay datos, devolver un string vacío
  if (!data || data.length === 0) return '';

  // Obtener las cabeceras del CSV
  const headers = Object.keys(data[0]);

  // Crear la línea de cabeceras
  const headerRow = headers.join(',');

  // Crear las filas de datos
  const rows = data.map(obj => {
    return headers.map(header => {
      // Asegurarse de que los valores con comas se pongan entre comillas
      const value = obj[header];
      if (value === null || value === undefined) return '';

      // Si es un string con comas, ponerlo entre comillas
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }

      // Asegurarse de que los números con decimales usen punto como separador
      if (typeof value === 'number') {
        return value.toString().replace(',', '.');
      }

      return value;
    }).join(',');
  });

  // Combinar cabeceras y filas
  return [headerRow, ...rows].join('\n');
}

// Generar CSV para cada tipo de ranking
const tiposRanking = [
  { nombre: 'despoblacion', filtro: (m) => m.poblacion1900 > 100, orden: (a, b) => b.perdidaPorcentual - a.perdidaPorcentual },
  { nombre: 'crecimiento', filtro: (m) => true, orden: (a, b) => b.variacion1900 - a.variacion1900 },
  { nombre: 'envejecidos', filtro: (m) => m.poblacion2024 > 50, orden: (a, b) => b.porcentajeMayores - a.porcentajeMayores },
  { nombre: 'jovenes', filtro: (m) => m.poblacion2024 > 50, orden: (a, b) => b.porcentajeMenores - a.porcentajeMenores },
  { nombre: 'densidad-alta', filtro: (m) => true, orden: (a, b) => b.densidad - a.densidad },
  { nombre: 'densidad-baja', filtro: (m) => m.poblacion2024 > 10, orden: (a, b) => a.densidad - b.densidad }
];

// Generar cada ranking y guardarlo como CSV
for (const tipo of tiposRanking) {
  // Filtrar y ordenar los datos
  const datosFiltrados = datosMunicipios
    .filter(tipo.filtro)
    .sort(tipo.orden);

  // Generar el CSV
  const csv = arrayToCSV(datosFiltrados);

  // Guardar el archivo
  const filePath = path.join(outputDir, `ranking-${tipo.nombre}.csv`);
  fs.writeFileSync(filePath, csv, 'utf8');

  console.log(`Ranking "${tipo.nombre}" generado: ${datosFiltrados.length} municipios`);
}

// Generar un JSON con todos los datos (para usar en gráficas más complejas)
const jsonFilePath = path.join(outputDir, 'datos-municipios.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(datosMunicipios, null, 2), 'utf8');

console.log(`\nTodos los rankings han sido generados en: ${outputDir}`);
console.log(`Total de municipios procesados: ${datosMunicipios.length}`);
