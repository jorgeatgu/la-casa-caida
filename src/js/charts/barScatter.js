import { select, selectAll } from 'd3-selection';
import { nest } from 'd3-collection';
import { min, max, extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { easeQuad } from 'd3-ease';
import 'd3-transition';

const d3 = {
  select,
  selectAll,
  nest,
  min,
  max,
  extent,
  scaleLinear,
  axisBottom,
  axisLeft,
  csv,
  easeQuad
};

export function barScatter(csvFile, cities) {
  const margin = { top: 0, right: 8, bottom: 64, left: 40 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.scatter-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataScatterPeople;
  let symbolP = '%';
  const tooltip = chart
    .append('div')
    .attr('class', 'tooltip tooltip-under-over')
    .attr('id', 'tooltip-scatter')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3.scaleLinear().domain([0, 75]);

    const countY = d3
      .scaleLinear()
      .domain([0, d3.max(dataScatterPeople, d => d.menor * 1.75)]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.scatter-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `scatter-${cities}-container-bis`);

    g.append('text')
      .attr('class', 'legend')
      .attr('y', '97%')
      .attr('x', '35%')
      .style('text-anchor', 'start')
      .text('Mayores de 65 años');

    g.append('text')
      .attr('class', 'legend')
      .attr('x', '-350')
      .attr('y', '-30')
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'start')
      .text('Menores de 18 años');
  }

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 20]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickFormat(d => d + symbolP)
      .tickPadding(11)
      .ticks(10);

    g.select('.axis-x').attr('transform', `translate(0,${height})`).call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => d + symbolP)
      .tickSize(-width)
      .ticks(5);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataScatterPeople) {
    w = chart.node().offsetWidth;
    h = 600;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.scatter-${cities}-container`);

    g.attr('transform', translate);

    updateScales(width, height);

    const container = chart.select(`.scatter-${cities}-container-bis`);

    const layer = container
      .selectAll('.scatter-circles')
      .data(dataScatterPeople);

    const newLayer = layer
      .enter()
      .append('circle')
      .attr('class', `scatter-${cities}-circles scatter-circles`);

    layer
      .merge(newLayer)
      .on('mouseover', function(_, d) {
        tooltip.transition();
        tooltip
          .style('opacity', 1)
          .html(
            `<p class="tooltip-citi">${d.city}<p/>
            <p class="tooltip-population">Habitantes: <span class="tooltip-number">${d.population}</span><p/>
            <p class="tooltip-over">Mayores de 65: <span class="tooltip-number">${d.mayor}%</span><p/>
            <p class="tooltip-under">Menores de 18: <span class="tooltip-number">${d.menor}%</span><p/>
            `
          )
          .style('left', w / 2 - 150 + 'px')
          .style('top', 100 + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition().duration(200).style('opacity', 0);
      })
      .attr('cx', d => scales.count.x(d.mayor))
      .attr('cy', d => scales.count.y(d.menor))
      .attr('r', 0)
      .transition()
      .duration(600)
      .ease(d3.easeQuad)
      .attr('cx', d => scales.count.x(d.mayor))
      .attr('cy', d => scales.count.y(d.menor))
      .attr('r', 6);

    drawAxes(g);
  }

  function clearFilter() {
    const selectButton = d3.select(`#clear-filter-${cities}`);

    selectButton.on('click', function() {
      d3.select(`#percentage-over-city-${cities} option`).property(
        'selected',
        '0'
      );
      d3.select(`#percentage-under-city-${cities} option`).property(
        'selected',
        '0'
      );
      d3.selectAll('.tooltip-percentage').remove().exit();

      new SlimSelect({
        select: `#percentage-over-city-${cities}`,
        searchPlaceholder: 'Filtra tu municipio'
      });

      new SlimSelect({
        select: `#percentage-under-city-${cities}`,
        searchPlaceholder: 'Filtra tu municipio'
      });

      new SlimSelect({
        select: `#select-city-${cities}`,
        searchPlaceholder: 'Busca tu municipio'
      });

      d3.csv(csvFile).then(data => {
        dataScatterPeople = data;
        dataScatterPeople.forEach(d => {
          d.mayor = +d.mayor;
          d.menor = +d.menor;
          d.city = d.name;
        });
        updateChart(dataScatterPeople);
      });
    });
  }

  clearFilter();

  function menuFilter() {
    d3.csv(csvFile).then(data => {
      const datos = data;

      const nest = d3
        .nest()
        .key(d => d.name)
        .entries(datos);

      const selectCity = d3.select(`#filter-city-${cities}`);

      selectCity
        .selectAll('option')
        .data(nest)
        .enter()
        .append('option')
        .attr('value', d => d.key)
        .text(d => d.key);

      selectCity.on('change', function() {
        d3.select(`#percentage-over-city-${cities} option`).property(
          'selected',
          '0'
        );
        d3.select(`#percentage-under-city-${cities} option`).property(
          'selected',
          '0'
        );
        d3.selectAll('.tooltip-percentage').remove().exit();

        new SlimSelect({
          select: `#percentage-over-city-${cities}`,
          searchPlaceholder: 'Filtra tu municipio'
        });

        new SlimSelect({
          select: `#percentage-under-city-${cities}`,
          searchPlaceholder: 'Filtra tu municipio'
        });

        updateSelectCity();
      });
    });
  }

  function percentageOlder() {
    const selectPercentage = d3.select(`#percentage-over-city-${cities}`);

    selectPercentage.on('change', function() {
      d3.select(`#percentage-under-city-${cities} option`).property(
        'selected',
        '0'
      );

      new SlimSelect({
        select: `#percentage-under-city-${cities}`,
        searchPlaceholder: 'Filtra tu municipio'
      });

      new SlimSelect({
        select: `#select-city-${cities}`,
        searchPlaceholder: 'Busca tu municipio'
      });

      let percentageCity = d3.select(this).property('value');

      d3.csv(csvFile).then(data => {
        dataScatterPeople = data;

        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataScatterPeople = dataScatterPeople.filter(
          d => d.mayor > percentageCity
        );

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage').remove().exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population"><span class="tooltip-number">En ${dataScatterPeople.length}</span> municipios el % de habitantes mayores de 65 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', margin.right + 'px')
          .style('top', 50 + 'px');

        dataScatterPeople.forEach(d => {
          d.city = d.name;
        });

        updateChart(dataScatterPeople);
      });
    });
  }

  function percentageUnder() {
    const selectPercentage = d3.select(`#percentage-under-city-${cities}`);

    selectPercentage.on('change', function() {
      d3.select(`#percentage-over-city-${cities} option`).property(
        'selected',
        '0'
      );

      new SlimSelect({
        select: `#percentage-over-city-${cities}`,
        searchPlaceholder: 'Filtra tu municipio'
      });

      new SlimSelect({
        select: `#select-city-${cities}`,
        searchPlaceholder: 'Busca tu municipio'
      });

      let percentageCity = d3.select(this).property('value');

      d3.csv(csvFile).then(data => {
        dataScatterPeople = data;

        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataScatterPeople = dataScatterPeople.filter(
          d => d.menor > percentageCity
        );

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage').remove().exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population"><span class="tooltip-number">En ${dataScatterPeople.length}</span> municipios el % de habitantes menores de 18 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', margin.right + 'px')
          .style('top', 50 + 'px');

        dataScatterPeople.forEach(d => {
          d.city = d.name;
        });

        updateChart(dataScatterPeople);
      });
    });
  }

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      dataScatterPeople = data;

      let valueCity = d3.select(`#filter-city-${cities}`).property('value');
      let revalueCity = new RegExp('^' + valueCity + '$');

      d3.selectAll(`.scatter-${cities}-circles`)
        .transition()
        .duration(400)
        .attr('r', 0);

      dataScatterPeople = dataScatterPeople.filter(d =>
        String(d.name).match(revalueCity)
      );

      dataScatterPeople.forEach(d => {
        d.mayor = +d.mayor;
        d.menor = +d.menor;
        d.city = d.name;
      });

      updateChart(dataScatterPeople);
    });
  }

  function resize() {
    updateChart(dataScatterPeople);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataScatterPeople = data;
      dataScatterPeople.forEach(d => {
        d.mayor = +d.mayor;
        d.menor = +d.menor;
        d.population = +d.population;
        d.city = d.name;
        d.over = d.percentagemayor;
        d.under = d.percentagemenor;
      });
      setupElements();
      setupScales();
      updateChart(dataScatterPeople);
      menuFilter();
      percentageOlder();
      percentageUnder();
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}
