import { select, selectAll } from 'd3-selection';
import { nest } from 'd3-collection';
import { min, max } from 'd3-array';
import { scaleLinear, scaleBand } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { format } from 'd3-format';
import 'd3-transition';

const d3 = {
  select,
  selectAll,
  nest,
  min,
  max,
  scaleLinear,
  scaleBand,
  axisBottom,
  axisLeft,
  csv,
  format
};

export function barVegetative(csvFile, cities) {
  const margin = { top: 24, right: 8, bottom: 24, left: 40 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.bar-negative-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataVegetative;
  const tooltip = chart
    .append('div')
    .attr('class', 'tooltip tooltip-negative')
    .style('opacity', 0);

  function setupScales() {
    const saldoMin = d3.min(dataVegetative, d => d.saldo);
    const saldoMax = d3.max(dataVegetative, d => d.saldo);

    const saldoMaxMin = -500;
    const saldoMaxMax = 300;

    const countX = d3.scaleBand().domain(dataVegetative.map(d => d.year));

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataVegetative, d => d.saldo * 2),
        d3.max(dataVegetative, d =>
          saldoMax < saldoMaxMax
            ? d3.max(dataVegetative, d => d.saldo * 6)
            : d3.max(dataVegetative, d => d.saldo * 2.5)
        )
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.bar-negative-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `bar-negative-${cities}-container-bis`);
  }

  function updateScales(width, height) {
    const { count: { x, y } } = scales
    x.rangeRound([0, width]).paddingInner(0.2);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3.axisBottom(scales.count.x).tickValues(
      scales.count.x.domain().filter((d, i) => {
        return !(i % 6);
      })
    );

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d3.format('d'))
      .ticks(5)
      .tickSize(-width)
      .tickPadding(8);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataVegetative) {
    w = chart.node().offsetWidth;
    h = 600;

    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.bar-negative-${cities}-container`);

    g.attr('transform', `translate(${left},${top})`);

    updateScales(width, height);

    const container = chart.select(`.bar-negative-${cities}-container-bis`);

    container
      .selectAll('.bar-vertical')
      .data(dataVegetative)
      .join('rect')
      .attr('class', d => (d.saldo < 0 ? 'negative bar-vertical' : 'positive bar-vertical'))
      .on('mouseover', function(_, d) {
        tooltip.transition();
        tooltip
          .style('opacity', 1)
          .html(
            `
            <p class="tooltip-year"><span class="tooltip-number">${d.year}</span><p/>
            <p class="tooltip-born">Nacidos: <span class="tooltip-number">${d.nacidos}</span><p/>
            <p class="tooltip-deceased">Fallecidos: <span class="tooltip-number">${d.fallecidos}</span><p/>
            <p class="tooltip-deceased">Saldo: <span class="tooltip-number">${d.saldo}</span><p/>
            `
          )
          .style('left', w / 2 - 100 + 'px')
          .style('top', 50 + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition().duration(200).style('opacity', 0);
      })
      .attr('width', scales.count.x.bandwidth())
      .attr('x', d => scales.count.x(d.year))
      .attr('y', d =>
        d.saldo > 0 ? scales.count.y(d.saldo) : scales.count.y(0)
      )
      .attr('height', d =>
        Math.abs(scales.count.y(d.saldo) - scales.count.y(0))
      );

    drawAxes(g);
  }

  function resize() {
    updateChart(dataVegetative);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataVegetative = data;
      setupElements();
      setupScales();
      updateChart(dataVegetative);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
