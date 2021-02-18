import { select, selectAll } from 'd3-selection';
import { min, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { format } from 'd3-format';

const d3 = {
  select,
  selectAll,
  min,
  max,
  scaleLinear,
  axisBottom,
  axisLeft,
  csv,
  format
};

export function scatterDesert() {
  const margin = { top: 24, right: 24, bottom: 48, left: 72 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select('.scatter-desert');
  const svg = chart.select('svg');
  const scales = {};
  const habitantes = ' hab/km2';
  let dataMunicipalities;

  function setupScales() {
    const countX = d3
      .scaleLinear()
      .domain([
        d3.min(dataMunicipalities, d => d.densidad),
        d3.max(dataMunicipalities, d => d.densidad)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataMunicipalities, d => d.densidad),
        d3.max(dataMunicipalities, d => d.densidad)
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select('.scatter-desert-container');

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', 'scatter-desert-container-bis');

    g.append('circle')
      .attr('r', 3)
      .attr('fill', '#B41248')
      .attr('cy', '94%')
      .attr('cx', '4%');

    g.append('text')
      .text('Municipios con una densidad inferior a 10hab/km2')
      .attr('y', '95%')
      .attr('x', '5%');
  }

  function updateScales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const {
      count: { x, y }
    } = scales;
    const axisX = d3.axisBottom(x).tickFormat(d3.format('d')).ticks(0);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(y)
      .tickFormat(d => d + habitantes)
      .tickSize(-width)
      .ticks(10);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataMunicipalities) {
    w = chart.node().offsetWidth;
    h = 600;

    const { left, right, top, bottom } = margin;

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${left},${top})`;

    const g = svg.select('.scatter-desert-container');

    g.attr('transform', translate);

    updateScales(width, height);

    const container = chart.select('.scatter-desert-container-bis');

    const layer = container
      .selectAll('.circle-desert')
      .data(dataMunicipalities);

    const newLayer = layer
      .enter()
      .append('circle')
      .attr('class', 'circle-desert');

    layer
      .merge(newLayer)
      .attr('cx', d => Math.random() * width)
      .attr('cy', d => scales.count.y(d.densidad))
      .attr('r', 3)
      .attr('fill', d => (d.densidad >= 10 ? '#3b2462' : '#B41248'))
      .attr('fill-opacity', 0.8);

    drawAxes(g);
  }

  function resize() {
    updateChart(dataMunicipalities);
  }

  function loadData() {
    d3.csv('data/aragon-municipios.csv').then(data => {
      dataMunicipalities = data;
      setupElements();
      setupScales();
      updateChart(dataMunicipalities);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
