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

export function linePopulation(csvFile, cities) {
  const margin = { top: 16, right: 8, bottom: 24, left: 62 };
  margin.left = widthMobile > 544 ? 62 : 32;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-population-${cities}`);
  const svg = chart.select('svg');
  let scales = {};
  let dataLinePopulation;
  const containerTooltip = d3.select(`.${cities}-line`);
  const tooltipOver = chart.append('div').attr('class', 'tooltip tooltip-over');
  const tooltipPopulation = containerTooltip
    .append('div')
    .attr('class', 'tooltip tooltip-population')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain([
        d3.min(dataLinePopulation, d => d.year),
        d3.max(dataLinePopulation, d => d.year)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([0, d3.max(dataLinePopulation, d => d.population) * 1.25]);

    scales.count = { x: countX, y: countY };
  }

  function tooltips(data) {
    const firstYear = data[0].population;
    const lastYear = data.slice(-1)[0].population;
    const w = chart.node().offsetWidth;

    const totalLose = firstYear - lastYear;
    const totalWin = lastYear - firstYear;
    let percentageLose = ((totalLose * 100) / firstYear).toFixed(2);
    let percentageWin = ((totalWin * 100) / firstYear).toFixed(2);
    const tooltipHeader =
      firstYear > lastYear
        ? `<p class="tooltip-deceased">Desde 1900 su población ha disminuido en un <span class="tooltip-number">${percentageLose}%</span><p/>`
        : `<p class="tooltip-deceased">Desde 1900 su población ha aumentado en un <span class="tooltip-number">${percentageWin}%</span><p/>`;
    const topPosition = firstYear > lastYear ? '20px' : '73%';
    tooltipOver
      .data(dataLinePopulation)
      .html(
        d => `
        ${tooltipHeader}
        <p class="tooltip-deceased">Mayores de 65 años en 2020: <span class="tooltip-number">${d.mayor}%</span><p/>
        <p class="tooltip-deceased">Menores de 18 años en 2020: <span class="tooltip-number">${d.menor}%</span><p/>
        `
      )
      .transition()
      .duration(300)
      .style('top', `${topPosition}`);
  }

  function setupElements() {
    const g = svg.select(`.line-population-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-population-${cities}-container-bis`);
  }

  function updateScales(width, height) {
    const {
      count: { x, y }
    } = scales;
    x.range([0, width - margin.right]);
    y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickPadding(4)
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

    const { left, right, top, bottom } = margin;

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.line-population-${cities}-container`);

    g.attr('transform', `translate(${left},${top})`);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.population));

    updateScales(width, height);

    const container = chart.select(`.line-population-${cities}-container-bis`);

    container
      .selectAll('.lines')
      .data([dataLinePopulation])
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

    container
      .selectAll('.circles-population')
      .data(dataLinePopulation)
      .join(
        enter => enter
          .append("circle")
          .attr('cx', d => scales.count.x(d.year))
          .attr('cy', d => scales.count.y(d.population))
          .attr('r', 0),
        update => update
          .attr('r', 3),
        exit => exit
          .attr('cx', d => scales.count.x(d.year))
          .attr('cy', d => scales.count.y(d.population))
          .attr('r', 0)
      )
      .attr('class', 'circles-population')
      .attr('fill', '#531f4e')
      .on('mouseover', (event, d) => {
        const { year, population } = d
        const { pageX, pageY } = event;
        const postionWidthTooltip = scales.count.x(year) + 270;
        const tooltipWidth = 210;
        const positionLeft = `${pageX}px`;
        const positionRight = `${pageX - tooltipWidth}px`;
        tooltipPopulation.transition();
        tooltipPopulation
          .style('opacity', 1)
          .html(
            `<p class="tooltip-deceased">La población en <span class="tooltip-number">${year}</span> era de <span class="tooltip-number">${population}</span> habitantes<p/>`
          )
          .style('left', postionWidthTooltip > w ? positionRight : positionLeft)
          .style('top', `${pageY - 48}px`);
      })
      .on('mouseout', () => {
        tooltipPopulation.transition().duration(200).style('opacity', 0);
      })
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr('cx', d => scales.count.x(d.year))
      .attr('cy', d => scales.count.y(d.population))
      .attr('r', 3);

    drawAxes(g);
  }

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      const valueCity = d3.select(`#select-city-${cities}`).property('value');
      if(!valueCity){
        return
      }

      dataLinePopulation = data.filter(({ name }) => name === valueCity);

      dataLinePopulation.forEach(d => {
        d.population = +d.population;
        d.year = +d.year;
      });

      setupScales();
      updateChart(dataLinePopulation);
      tooltips(dataLinePopulation);
    });
  }

  function menuSelectCity() {
    d3.csv(csvFile).then(data => {
      const citiesName = [...new Set(data.map(({ name }) => name))];
      const selectCity = d3.select(`#select-city-${cities}`);

      selectCity
        .selectAll('option')
        .data(citiesName)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

      selectCity.on('change', function(event) {
        console.log("event", event);
        updateSelectCity();
      });

      new TomSelect(`#select-city-${cities}`,{
        create: false,
        maxOptions: null,
        placeholder: 'Busca tu municipio',
        sortField: {
          field: "text",
          direction: "asc"
        }
      });
    });
  }

  function resize() {
    updateChart(dataLinePopulation);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataLinePopulation = data.map(d => {
        return {
          year: (+d.year),
          population: (+d.population)
        }
      });
      setupElements();
      setupScales();
      menuSelectCity();
      updateSelectCity();
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
