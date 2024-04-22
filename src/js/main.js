import './../css/styles.css';
import { cities } from './shared/cities.js';
import TomSelect from 'tom-select';
window.TomSelect = TomSelect;

import { menu, changeLanguage, animation } from './shared/index.js';

import {
  scatterDesert,
  aragonStacked,
  lineHistoric,
  barScatter,
  barVegetative,
  linePopulation,
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
    groupByAgeCSV,
    densityCSV
  } = element;
  linePopulation(linePopulationCSV, city);
  lineHistoric(lineTotalCSV, city);
  barScatter(scatterUnderCSV, city);
  barVegetative(vegetativeCSV, city);
  municipalitiesStacked(groupByAgeCSV, city);
  lineDensidad(densityCSV, city);
});
