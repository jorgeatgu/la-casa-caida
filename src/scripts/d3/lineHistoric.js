import { select, selectAll } from 'd3-selection';
import { min, max } from 'd3-array';
import { line } from 'd3-shape';
import { scaleTime, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { format, formatDefaultLocale } from 'd3-format';
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
  format,
  formatDefaultLocale
};

export function lineHistoric(csvFile, cities) {
  const margin = { top: 8, right: 8, bottom: 24, left: 8 };

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataLineHistoric;
  const habitantes = 'hab';
  const containerTooltip = d3.select(`.line-province-${cities}`);
  const tooltipPopulation = containerTooltip
    .append('div')
    .attr('class', 'tooltip tooltip-population')
    .style('opacity', 0);

  const locale = d3.formatDefaultLocale({
    decimal: ',',
    thousands: '.',
    grouping: [3]
  });

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain([
        d3.min(dataLineHistoric, d => d.year),
        d3.max(dataLineHistoric, d => d.year)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataLineHistoric, d => d.total / 1.25),
        d3.max(dataLineHistoric, d => d.total * 1.25)
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.line-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-${cities}-container-bis`);
  }

  function updateScales(width, height) {
    const { count: { x, y } } = scales
    x.range([90, width]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickFormat(d3.format('d'))
      .ticks(9);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const localeFormat = locale.format(',.0f');
    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => `${localeFormat(d)} ${habitantes}`)
      .ticks(6)
      .tickSizeInner(-width);

    g.select('.axis-y').call(axisY);
    g.selectAll('.axis-y .tick text').attr('x', 80).attr('dy', -5);
  }

  function updateChart(dataLineHistoric) {
    const w = chart.node().offsetWidth;
    const h = 550;

    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.line-${cities}-container`);

    g.attr('transform', `translate(${left},${top})`);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.total));

    updateScales(width, height);

    const container = chart.select(`.line-${cities}-container-bis`);

    container
      .selectAll('.line')
      .data([dataLineHistoric])
      .join('path')
      .attr('class', 'line')
      .attr('stroke-width', '1.5')
      .attr('d', line);

    container
      .selectAll('.circles')
      .data(dataLineHistoric)
      .join('circle')
      .attr('class', 'circles')
      .attr('fill', '#531f4e')
      .on('mouseover', (event, d) => {
        const { pageX, pageY } = event;
        const postionWidthTooltip = scales.count.x(d.year) + 270;
        const tooltipWidth = 210;
        const positionleft = `${pageX}px`;
        const positionright = `${pageX - tooltipWidth}px`;
        tooltipPopulation.transition();
        tooltipPopulation
          .style('opacity', 1)
          .html(
            `<p class="tooltip-deceased">La población en <span class="tooltip-number">${d.year}</span> era de <span class="tooltip-number">${d.total}</span> habitantes<p/>`
          )
          .style('left', postionWidthTooltip > w ? positionright : positionleft)
          .style('top', `${pageY - 48}px`);
      })
      .on('mouseout', () => {
        tooltipPopulation.transition().duration(200).style('opacity', 0);
      })
      .attr('cx', d => scales.count.x(d.year))
      .attr('cy', d => scales.count.y(d.total))
      .attr('r', 3);

    drawAxes(g);
  }

  function resize() {
    updateChart(dataLineHistoric);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataLineHistoric = data;
      setupElements();
      setupScales();
      updateChart(dataLineHistoric);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
