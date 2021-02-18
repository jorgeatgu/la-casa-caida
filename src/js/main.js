import './../css/styles.css'
import SlimSelect from 'slim-select'
import {
  menu,
  widthMobile,
  changeLanguage,
  animation
} from './shared/index.js';

import { scatterDesert, aragonStacked, lineHistoric, barScatter, barVegetative, linePopulation } from './charts/index.js'

menu();
setTimeout(animation(), 200);
scatterDesert();
aragonStacked();
changeLanguage();

const cities = [{
    city: 'huesca',
    linePopulationCSV: 'data/huesca/huesca.csv',
    lineTotalCSV: 'data/huesca/huesca-total.csv',
    scatterUnderCSV: 'data/huesca/huesca-mayor-menor.csv',
    vegetativeCSV: 'data/huesca/saldo-vegetativo-total-huesca.csv'
  },
  {
    city: 'teruel',
    linePopulationCSV: 'data/teruel/teruel.csv',
    lineTotalCSV: 'data/teruel/teruel-total.csv',
    scatterUnderCSV: 'data/teruel/teruel-mayor-menor.csv',
    vegetativeCSV: 'data/teruel/saldo-vegetativo-total-teruel.csv'
  },
  {
    city: 'zaragoza',
    linePopulationCSV: 'data/zaragoza/zaragoza.csv',
    lineTotalCSV: 'data/zaragoza/zaragoza-total.csv',
    scatterUnderCSV: 'data/zaragoza/zaragoza-mayor-menor.csv',
    vegetativeCSV: 'data/zaragoza/saldo-vegetativo-total-zaragoza.csv'
  }
];

cities.map(element => {
  const {
    city,
    linePopulationCSV,
    lineTotalCSV,
    scatterUnderCSV,
    vegetativeCSV
  } = element;
  linePopulation(linePopulationCSV, city);
  lineHistoric(lineTotalCSV, city);
  barScatter(scatterUnderCSV, city);
  barVegetative(vegetativeCSV, city);
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
