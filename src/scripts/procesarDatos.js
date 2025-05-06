// scripts/procesarDatos.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Definir rutas de los archivos
const DATA_DIR = './public/data';
const OUTPUT_DIR = './src/data';
const PROVINCIAS = ['huesca', 'teruel', 'zaragoza'];
const CURRENT_YEAR = "2024"; // Año actual para filtrar datos de población

// Asegurarse de que los directorios existan
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función principal para procesar los datos
async function procesarDatos() {

  // Array para almacenar todos los municipios
  const todosLosMunicipios = [];

  // Map para almacenar temporalmente la información de población
  const poblacionPorMunicipio = new Map();

  // Procesar cada provincia
  for (const provincia of PROVINCIAS) {

    // Leer CSV simplificado
    const rutaCSV = path.join(DATA_DIR, provincia, `${provincia}-municipios.csv`);

    if (!fs.existsSync(rutaCSV)) {
      console.warn(`Archivo no encontrado: ${rutaCSV}`);
      continue;
    }

    const datosCSV = fs.readFileSync(rutaCSV, 'utf8');

    // Parsear CSV
    const datosMunicipios = parse(datosCSV, {
      columns: true,
      skip_empty_lines: true
    });

    // Primero, crear un mapa de la población por cada código INE
    // Esto es necesario porque el formato de datos requiere filtrar por año
    datosMunicipios.forEach(registro => {
      if (registro.year === CURRENT_YEAR) {
        poblacionPorMunicipio.set(registro.cp, parseInt(registro.population, 10) || 0);
      }
    });

    // Luego, procesar cada municipio único
    const municipiosUnicos = new Set();

    for (const municipio of datosMunicipios) {
      // Evitar duplicados (porque pueden haber múltiples años para el mismo municipio)
      if (municipiosUnicos.has(municipio.cp)) {
        continue;
      }

      municipiosUnicos.add(municipio.cp);

      // Crear slug para URL
      const slug = municipio.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');

      // Código de provincia basado en los primeros dos dígitos
      const codigoProvincia = municipio.cp.substring(0, 2);

      // Determinar la provincia basada en el código
      let provinciaMunicipio = provincia;
      if (codigoProvincia === '22') {
        provinciaMunicipio = 'huesca';
      } else if (codigoProvincia === '44') {
        provinciaMunicipio = 'teruel';
      } else if (codigoProvincia === '50') {
        provinciaMunicipio = 'zaragoza';
      }

      // Obtener la población del municipio del año actual
      const poblacionActual = poblacionPorMunicipio.get(municipio.cp) || 0;

      // Datos básicos del municipio
      const municipioData = {
        nombre: municipio.name,
        provincia: provinciaMunicipio,
        slug: slug,
        codigoINE: municipio.cp,
        poblacionActual: poblacionActual
      };

      // Agregar a la lista general
      todosLosMunicipios.push(municipioData);

    }
  }

  // Ordenar municipios por nombre
  todosLosMunicipios.sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Guardar la lista completa como un módulo JavaScript
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'municipios.js'),
    `export const municipios = ${JSON.stringify(todosLosMunicipios, null, 2)};`
  );

  // También guardar como JSON para acceso directo
  fs.writeFileSync(
    path.join(DATA_DIR, 'municipios.json'),
    JSON.stringify(todosLosMunicipios, null, 2)
  );

  // Generar archivos por provincia
  for (const provincia of PROVINCIAS) {
    const municipiosProvincia = todosLosMunicipios.filter(m => m.provincia === provincia);
    fs.writeFileSync(
      path.join(DATA_DIR, `${provincia}-municipios.json`),
      JSON.stringify(municipiosProvincia, null, 2)
    );
  }

  // Generar archivo con estadísticas básicas
  const estadisticas = {
    totalMunicipios: todosLosMunicipios.length,
    porProvincia: {
      huesca: todosLosMunicipios.filter(m => m.provincia === 'huesca').length,
      teruel: todosLosMunicipios.filter(m => m.provincia === 'teruel').length,
      zaragoza: todosLosMunicipios.filter(m => m.provincia === 'zaragoza').length
    },
    poblacionTotal: todosLosMunicipios.reduce((sum, m) => sum + (m.poblacionActual || 0), 0),
    poblacionPorProvincia: {
      huesca: todosLosMunicipios.filter(m => m.provincia === 'huesca').reduce((sum, m) => sum + (m.poblacionActual || 0), 0),
      teruel: todosLosMunicipios.filter(m => m.provincia === 'teruel').reduce((sum, m) => sum + (m.poblacionActual || 0), 0),
      zaragoza: todosLosMunicipios.filter(m => m.provincia === 'zaragoza').reduce((sum, m) => sum + (m.poblacionActual || 0), 0)
    },
    municipiosPorRango: {
      // Municipios en riesgo de despoblación (menos de 100 habitantes)
      riesgoAlto: todosLosMunicipios.filter(m => m.poblacionActual > 0 && m.poblacionActual < 100).length,
      // Entre 100 y 500 habitantes
      riesgoMedio: todosLosMunicipios.filter(m => m.poblacionActual >= 100 && m.poblacionActual < 500).length,
      // Entre 500 y 1000 habitantes
      pequenos: todosLosMunicipios.filter(m => m.poblacionActual >= 500 && m.poblacionActual < 1000).length,
      // Entre 1000 y 5000 habitantes
      medianos: todosLosMunicipios.filter(m => m.poblacionActual >= 1000 && m.poblacionActual < 5000).length,
      // Más de 5000 habitantes
      grandes: todosLosMunicipios.filter(m => m.poblacionActual >= 5000).length
    }
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'estadisticas.json'),
    JSON.stringify(estadisticas, null, 2)
  );

}

// Ejecutar el script
procesarDatos().catch(error => {
  console.error('Error al procesar datos:', error);
  process.exit(1);
});
