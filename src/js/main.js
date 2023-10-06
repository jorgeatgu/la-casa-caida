import './../css/styles.css';
import { cities } from './shared/cities.js';
import SlimSelect from 'slim-select';

import {
  menu,
  widthMobile,
  changeLanguage,
  animation
} from './shared/index.js';

import {
  scatterDesert,
  aragonStacked,
  lineHistoric,
  barScatter,
  barVegetative,
  linePopulation,
  lineEvolution,
  scatterEvolution,
  municipalitiesStacked,
  lineDensidad
} from './charts/index.js';

menu();
setTimeout(animation(), 200);
scatterDesert();
aragonStacked();
changeLanguage();

cities.map(element => {
  const {
    city,
    linePopulationCSV,
    lineTotalCSV,
    scatterUnderCSV,
    vegetativeCSV,
    comparatorCSV,
    evolutionCSV,
    groupByAgeCSV,
    densityCSV
  } = element;
  linePopulation(linePopulationCSV, city);
  lineHistoric(lineTotalCSV, city);
  barScatter(scatterUnderCSV, city);
  barVegetative(vegetativeCSV, city);
  lineEvolution(evolutionCSV, city);
  scatterEvolution(evolutionCSV, city);
  municipalitiesStacked(groupByAgeCSV, city);
  lineDensidad(densityCSV, city);
});

new SlimSelect({
  select: '#select-lb-huesca',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-lb-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-lb-teruel',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-city-teruel',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-teruel',
  searchPlaceholder: 'Filtra por municipio'
});

new SlimSelect({
  select: '#percentage-over-city-teruel',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-teruel',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#select-city-huesca',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-over-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#select-city-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-over-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#select-first-year-zaragoza',
  searchPlaceholder: 'Selecciona el primer año'
});

new SlimSelect({
  select: '#select-second-year-zaragoza',
  searchPlaceholder: 'Selecciona el segundo año'
});

new SlimSelect({
  select: '#select-first-year-teruel',
  searchPlaceholder: 'Selecciona el primer año'
});

new SlimSelect({
  select: '#select-second-year-teruel',
  searchPlaceholder: 'Selecciona el segundo año'
});

new SlimSelect({
  select: '#select-first-year-huesca',
  searchPlaceholder: 'Selecciona el primer año'
});

new SlimSelect({
  select: '#select-second-year-huesca',
  searchPlaceholder: 'Selecciona el segundo año'
});

new SlimSelect({
  select: '#select-municipalities-stack-huesca',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-municipalities-stack-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-municipalities-stack-teruel',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-densidad-huesca',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-densidad-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#select-densidad-teruel',
  searchPlaceholder: 'Busca tu municipio'
});
