// scripts/procesarDatos.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Definir rutas de los archivos
const DATA_DIR = './public/data';
const OUTPUT_DIR = './src/data';
const PROVINCIAS = ['huesca', 'teruel', 'zaragoza'];

// Asegurarse de que los directorios existan
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función principal para procesar los datos
async function procesarDatos() {
  console.log('Procesando datos de municipios...');

  // Array para almacenar todos los municipios
  const todosLosMunicipios = [];

  // Procesar cada provincia
  for (const provincia of PROVINCIAS) {
    console.log(`Procesando provincia: ${provincia}`);

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

    // Procesar cada municipio
    for (const municipio of datosMunicipios) {
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

      // Datos básicos del municipio
      const municipioData = {
        nombre: municipio.name,
        provincia: provinciaMunicipio,
        slug: slug,
        codigoINE: municipio.cp
      };

      // Agregar a la lista general
      todosLosMunicipios.push(municipioData);

      console.log(`Procesado municipio: ${municipio.name} (${municipio.cp})`);
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

  console.log(`Proceso completado. Se han procesado ${todosLosMunicipios.length} municipios.`);
}

// Ejecutar el script
procesarDatos().catch(error => {
  console.error('Error al procesar datos:', error);
  process.exit(1);
});
