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

export function lineDensidad(csvFile, cities) {
  let width = 0;
  let height = 0;
  let scales = {};
  let dataLineDensidad;
  const margin = { top: 16, right: 16, bottom: 24, left: 96 };
  const chart = d3.select(`.line-densidad-${cities}`);
  const svg = chart.select('svg');
  const labelDesert = ' hab/km2';

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain([
        d3.min(dataLineDensidad, d => d.year),
        d3.max(dataLineDensidad, d => d.year)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataLineDensidad, d => d.densidad * 1.5)
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.line-densidad-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-densidad-${cities}-container-bis`);
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
      .tickFormat(d => d + labelDesert)
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

    const g = svg.select(`.line-densidad-${cities}-container`);

    g.attr('transform', `translate(${left},${top})`);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.densidad));

    updateScales(width, height);

    const container = chart.select(`.line-densidad-${cities}-container-bis`);

    container
      .selectAll('.lines')
      .data([dataLineDensidad])
      .join('path')
      .attr('class', 'lines')
      .transition()
      .duration(300)
      .ease(d3.easeLinear)
      .attrTween('d', function (d) {
        let previous = d3.select(this).attr('d');
        let current = line(d);
        return d3.interpolatePath(previous, current);
      });

    drawAxes(g);
  }

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      const valueCity = d3.select(`#select-densidad-${cities}`).property('value');

      dataLineDensidad = data.filter(({ name }) => name === valueCity);

      dataLineDensidad.forEach(d => {
        d.population = +d.population;
        d.year = +d.year;
        d.superficie = +d.superficie;
        d.densidad = (d.population / d.superficie)
      });

      setupScales();
      updateChart(dataLineDensidad);
      rectDesertDemographic(dataLineDensidad);
    });
  }

  function resize() {
    updateChart(dataLineDensidad);
  }

  function menuSelectCity() {
    d3.csv(csvFile).then(data => {
      const citiesName = [...new Set(data.map(({ name }) => name))];
      const selectCity = d3.select(`#select-densidad-${cities}`);

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
      dataLineDensidad = data.reduce((acc, current) => {
        if (current.name === municipality) {
          current.year = +(current.year)
          current.population = +(current.population)
          current.superficie = +(current.superficie)
          current.densidad = +(current.population / current.superficie)
          acc.push(current)
        }
        return acc
      }, [])
      setupElements();
      setupScales();
      updateChart(dataLineDensidad);
      updateSelectCity();
      rectDesertDemographic(dataLineDensidad);
    });
  }

  function rectDesertDemographic(dataLineDensidad) {
    const desertDemographic = dataLineDensidad.map(({ densidad }) => densidad)
    if(desertDemographic.some(d => d < 10) && desertDemographic[desertDemographic.length - 1] < 10) {
      chart.selectAll('.rect-desert-demographic')
        .remove()
        .exit()

      chart.append('div')
        .attr('class', 'rect-desert-demographic')
        .html(`<span>Una densidad inferior a 10hab/km convierte al municipio en un desierto demógrafico.</span>`)
        .style('position', 'absolute')
        .style('top', '50px')
        .style('left', '70%')
    } else {
      chart.selectAll('.rect-desert-demographic')
        .remove()
        .exit()
    }
  }

  window.addEventListener('resize', resize);

  loadData();
  menuSelectCity();
}
