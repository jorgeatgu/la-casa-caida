import './../css/styles.css';
import { cities } from './shared/cities.js';
import './shared/select-multiselect.js';
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
  municipalitiesStacked
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
    groupByAgeCSV
  } = element;
  linePopulation(linePopulationCSV, city);
  lineHistoric(lineTotalCSV, city);
  barScatter(scatterUnderCSV, city);
  barVegetative(vegetativeCSV, city);
  lineEvolution(evolutionCSV, city);
  scatterEvolution(evolutionCSV, city);
  municipalitiesStacked(groupByAgeCSV, city);
});
