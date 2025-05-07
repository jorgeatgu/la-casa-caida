import fs from 'fs';
import path from 'path';

function parseCSV(content) {
  const lines = content.split('\n');
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',');
      return values;
    });
}

export function cargarDatosEdadSync(provincia, name) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', provincia, `${provincia}-mayor-menor.csv`);
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const data = parseCSV(csvContent)
      .map(values => ({
        year: values[0],
        name: values[1],
        menor: parseFloat(values[2]),
        mayor: parseFloat(values[3]),
        population: parseInt(values[4])
      }));

    return data.find(d => d.name === name && d.year === '2024') || null;
  } catch (error) {
    console.error('Error al cargar datos de edad:', error);
    return null;
  }
}

export function cargarDatosHistoricosSync(provincia, cp) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', provincia, `${provincia}-tarjetas.csv`);

    if (!fs.existsSync(csvPath)) {
      console.error('Archivo no encontrado:', csvPath);
      return [];
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');

    const data = parseCSV(csvContent)
      .map(values => ({
        year: values[0],
        cp: values[1],
        name: values[2],
        population: parseInt(values[3]) || 0
      }));

    const filtered = data.filter(d => d.cp === cp);

    return filtered;
  } catch (error) {
    console.error('Error al cargar datos históricos:', error);
    return [];
  }
}
