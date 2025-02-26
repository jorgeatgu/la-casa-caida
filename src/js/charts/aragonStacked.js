import { select, selectAll } from 'd3-selection';
import { min, max, bisector, extent } from 'd3-array';
import { curveCardinal, area, stack, stackOrderInsideOut } from 'd3-shape';
import { scaleTime, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { format } from 'd3-format';

const d3 = {
  select,
  selectAll,
  min,
  max,
  bisector,
  extent,
  curveCardinal,
  area,
  stack,
  stackOrderInsideOut,
  scaleTime,
  scaleLinear,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  csv,
  format
};

export function aragonStacked() {
  const margin = { top: 24, right: 8, bottom: 24, left: 32 };
  let width = 0;
  let height = 0;
  const chart = d3.select('.aragon-stack');
  const svg = chart.select('svg');
  const scales = {};
  let dataAragonStacked;
  const bisectDate = d3.bisector(d => d.year).left;
  const tooltipStack = chart
    .append('div')
    .attr('class', 'tooltip tooltip-stack')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain(d3.extent(dataAragonStacked, d => d.year));

    const countY = d3.scaleLinear().domain([0, 100]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select('.aragon-stack-container');

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', 'aragon-stack-container-bis');

    g.append('text')
      .attr('class', 'legend-aragon')
      .attr('y', '70%')
      .attr('x', '1%')
      .text('Zaragoza');

    g.append('text')
      .attr('class', 'legend-aragon')
      .attr('y', '5%')
      .attr('x', '1%')
      .text('Huesca');

    g.append('text')
      .attr('class', 'legend-aragon')
      .attr('y', '30%')
      .attr('x', '1%')
      .text('Teruel');
  }

  function updateScales(width, height) {
    const { count: { x, y } } = scales
    x.range([0, width]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const { count: { x, y } } = scales
    const axisX = d3
      .axisBottom(x)
      .tickFormat(d3.format('d'))
      .tickPadding(7)
      .ticks(9);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(y)
      .tickFormat(d => d + '%')
      .tickSizeInner(-width)
      .ticks(12);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataAragonStacked) {
    const w = chart.node().offsetWidth;
    const h = 600;

    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select('.aragon-stack-container');

    g.attr('transform', `translate(${left},${top})`);

    g.append('rect').attr('class', 'overlay-dos');

    g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0);

    const keys = dataAragonStacked.columns.slice(5);

    const area = d3
      .area()
      .x(d => scales.count.x(d.data.year))
      .y0(d => scales.count.y(d[0]))
      .y1(d => scales.count.y(d[1]))
      .curve(d3.curveCardinal.tension(0.6));

    const stack = d3.stack().keys(keys).order(d3.stackOrderInsideOut);

    const stackedData = stack(dataAragonStacked);

    const colors = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#F67460', '#C54073', '#5A1C7C']);

    updateScales(width, height);

    const container = chart.select('.aragon-stack-container-bis');

    container
      .selectAll('.area-stack')
      .data(stackedData)
      .join('path')
      .attr('fill', d => colors(d.key))
      .attr('d', area)
      .attr('class', 'area-stack');

    const focus = g.select('.focus');

    const overlay = g.select('.overlay-dos');

    focus.select('.x-hover-line').attr('y2', height);

    overlay
      .attr('width', width + left + right)
      .attr('height', height)
      .on('mouseover', function() {
        focus.style('display', null);
      })
      .on('mouseout', function() {
        focus.style('display', 'none');
        tooltipStack.style('opacity', 0);
      })
      .on('mousemove', mousemove);

    function mousemove(event) {
      const { layerX } = event;
      const w = chart.node().offsetWidth;
      var x0 = scales.count.x.invert(layerX),
        i = bisectDate(dataAragonStacked, x0, 1),
        d0 = dataAragonStacked[i - 1],
        d1 = dataAragonStacked[i],
        d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      const positionX = scales.count.x(d.year) + margin.left;
      const postionWidthTooltip = positionX + 200;
      const positionRightTooltip = w - positionX;

      tooltipStack
        .style('opacity', 1)
        .html(
          `
          <span class="tooltip-stack-number tooltip-stack-text">${d.year}</span>
          <span class="tooltip-stack-text">Huesca: <span class="tooltip-number">${d.huescaP}% - ${d.huesca} hab.</span></span>
          <span class="tooltip-stack-text">Teruel: <span class="tooltip-number">${d.teruelP}% - ${d.teruel} hab.</span></span>
          <span class="tooltip-stack-text">Zaragoza: <span class="tooltip-number">${d.zaragozaP}% - ${d.zaragoza} hab.</span></span>
          <span class="tooltip-stack-text">Total: <span class="tooltip-number">${d.aragon} hab.</span></span>
          `
        )
        .style('top', '35%')
        .style('left', postionWidthTooltip > w ? 'auto' : `${positionX}px`)
        .style(
          'right',
          postionWidthTooltip > w ? positionRightTooltip + 'px' : 'auto'
        );

      focus
        .select('.x-hover-line')
        .attr('transform', `translate(${scales.count.x(d.year)},0)`);
    }

    drawAxes(g);
  }

  function resize() {
    updateChart(dataAragonStacked);
  }

  function loadData() {
    d3.csv('data/aragon-total.csv').then(data => {
      dataAragonStacked = data;
      setupElements();
      setupScales();
      updateChart(dataAragonStacked);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
