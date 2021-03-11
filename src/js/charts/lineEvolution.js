import { widthMobile } from './../shared/index.js';
import { select, selectAll } from 'd3-selection';
import { min, max } from 'd3-array';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { easeLinear } from 'd3-ease';
import { format } from 'd3-format';
import { interpolatePath } from 'd3-interpolate-path';
import 'd3-transition';

const d3 = {
  select,
  selectAll,
  min,
  max,
  line,
  scaleTime,
  scaleLinear,
  axisBottom,
  axisLeft,
  csv,
  easeLinear,
  format,
  interpolatePath
};

export function lineEvolution(csvFile, cities) {
  const margin = { top: 16, right: 16, bottom: 24, left: 62 };
  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-lb-${cities}`);
  const svg = chart.select('svg');
  let scales = {};
  let dataLineEvolution;

  function setupScales() {
    const countX = d3.scaleTime().domain([2010, 2020]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataLineEvolution, d => d.population * 1.75 - d.population),
        d3.max(dataLineEvolution, d => d.population) * 1.25
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.line-lb-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-lb-${cities}-container-bis`);
  }

  function updateScales(width, height) {
    const { count: { x, y } } = scales
    x.range([0, width]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickPadding(5)
      .tickFormat(d3.format('d'))
      .ticks(13);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickPadding(5)
      .tickFormat(d3.format('d'))
      .tickSize(-width)
      .ticks(6);

    g.select('.axis-y')
      .transition()
      .duration(450)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function updateChart(data) {
    const w = chart.node().offsetWidth;
    const h = 500;

    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${left},${top})`;

    const g = svg.select(`.line-lb-${cities}-container`);

    g.attr('transform', translate);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.population));

    updateScales(width, height);

    const container = chart.select(`.line-lb-${cities}-container-bis`);

    const lines = container.selectAll('.lines').data([dataLineEvolution]);

    const dots = container
      .selectAll('.circles-population')
      .remove()
      .exit()
      .data(dataLineEvolution);

    const newLines = lines.enter().append('path').attr('class', 'lines');

    lines
      .merge(newLines)
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attrTween('d', function(d) {
        let previous = d3.select(this).attr('d');
        let current = line(d);
        return d3.interpolatePath(previous, current);
      });

    drawAxes(g);
  }

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      const valueCity = d3.select(`#select-lb-${cities}`).property('value');

      dataLineEvolution = data.filter(({ municipio }) => municipio === valueCity);

      dataLineEvolution.forEach(d => {
        d.population = +d.population;
        d.year = +d.year;
      });

      setupScales();
      updateChart(dataLineEvolution);
    });
  }

  function resize() {
    updateChart(dataLineEvolution);
  }

  function menuSelectCity() {
    d3.csv(csvFile).then(data => {
      const citiesName = [...new Set(data.map(({ municipio }) => municipio))];
      const selectCity = d3.select(`#select-lb-${cities}`);

      selectCity
        .selectAll('option')
        .data(citiesName)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

      selectCity.on('change', function() {
        updateSelectCity();
      });
    });
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      const [{ name: municipality }] = data
      dataLineEvolution = data.reduce((acc, current) => {
        if (current.municipio === municipality) {
          current.year = +(current.year)
          current.population = +(current.population)
          acc.push(current)
        }
        return acc
      }, [])
      setupElements();
      setupScales();
      updateChart(dataLineEvolution);
      updateSelectCity();
    });
  }

  window.addEventListener('resize', resize);

  loadData();
  menuSelectCity();
}
