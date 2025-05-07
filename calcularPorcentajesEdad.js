// calcularPorcentajesEdad.js
// Script para calcular correctamente los porcentajes de población por edad
// Ejecutar con: node calcularPorcentajesEdad.js

import fs from 'fs';
import path from 'path';

// Provincias a procesar
const provincias = ['teruel', 'huesca', 'zaragoza'];

// Año a procesar
const year = '2024';

// Función para parsear CSV
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
}

// Función para convertir array a CSV
function arrayToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');

  const rows = data.map(obj => {
    return headers.map(header => {
      const value = obj[header];
      if (value === null || value === undefined) return '';

      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }

      if (typeof value === 'number') {
        return value.toString().replace(',', '.');
      }

      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

// Procesar cada provincia
for (const provincia of provincias) {
  console.log(`Procesando provincia: ${provincia}`);

  try {
    // Ruta al CSV de datos de edad
    const csvPath = path.join(process.cwd(), 'public', 'data', provincia, `${provincia}-years-groups-total.csv`);

    if (!fs.existsSync(csvPath)) {
      console.error(`No se encontró el archivo: ${csvPath}`);
      continue;
    }

    // Leer y parsear el CSV
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rawData = parseCSV(csvContent);

    // Filtrar por el año especificado
    const dataForYear = rawData.filter(d => d.year === year);

    // Agrupar datos por municipio
    const municipiosData = {};

    for (const row of dataForYear) {
      const { name, age, total } = row;

      if (!municipiosData[name]) {
        municipiosData[name] = {
          menores: 0,
          adultos: 0,
          mayores: 0,
          total: 0
        };
      }

      const totalNum = parseInt(total, 10) || 0;

      if (age === '0-16') {
        municipiosData[name].menores = totalNum;
      } else if (age === '16-64') {
        municipiosData[name].adultos = totalNum;
      } else if (age === '65-100') {
        municipiosData[name].mayores = totalNum;
      }

      municipiosData[name].total += totalNum;
    }

    // Calcular porcentajes y crear el resultado final
    const resultData = Object.entries(municipiosData).map(([name, data]) => {
      const { menores, mayores, total } = data;

      // Calcular porcentajes (ya multiplicados por 100)
      const porcentajeMenores = total > 0 ? (menores / total) * 100 : 0;
      const porcentajeMayores = total > 0 ? (mayores / total) * 100 : 0;

      return {
        year,
        name,
        menor: porcentajeMenores,
        mayor: porcentajeMayores,
        population: total
      };
    });

    // Crear directorio de salida si no existe
    const outputDir = path.join(process.cwd(), 'public', 'data', provincia);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Guardar el CSV
    const outputPath = path.join(outputDir, `${provincia}-mayor-menor.csv`);

    // Crear la primera línea del CSV con los encabezados
    const headerLine = 'year,name,menor,mayor,population\n';

    // Crear el CSV con datos
    const csvOutput = headerLine + resultData.map(item =>
      `${item.year},${item.name},${item.menor.toFixed(1)},${item.mayor.toFixed(1)},${item.population}`
    ).join('\n');

    fs.writeFileSync(outputPath, csvOutput, 'utf8');

    console.log(`Se han generado correctamente los porcentajes para ${resultData.length} municipios de ${provincia}`);

    // Mostrar algunos ejemplos para verificación
    const examples = resultData.slice(0, 5);
    console.log('\nEjemplos de resultados:');
    for (const example of examples) {
      console.log(`${example.name}: ${example.menor.toFixed(1)}% menores, ${example.mayor.toFixed(1)}% mayores, población total: ${example.population}`);
    }

  } catch (error) {
    console.error(`Error al procesar la provincia ${provincia}:`, error);
  }
}

console.log('\nProcesamiento completado. Los archivos CSV generados tienen:');
console.log('- Porcentajes de población menor (menor) y mayor (mayor) ya expresados como porcentajes (0-100)');
console.log('- Valores redondeados a un decimal para mejor visualización');
console.log('- No es necesario multiplicar estos valores en el script de generación de rankings');
