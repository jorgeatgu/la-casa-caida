import { select, selectAll } from 'd3-selection';
import { min, max, extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { easeQuad } from 'd3-ease';
import 'd3-transition';

const d3 = {
  select,
  selectAll,
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
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  let dataScatterPeople;
  const margin = { top: 0, right: 8, bottom: 64, left: 40 };
  const chart = d3.select(`.scatter-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  const symbolP = '%';

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
    const { count: { x, y } } = scales
    x.range([0, width]);
    y.range([height, 20]);
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

    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const g = svg.select(`.scatter-${cities}-container`);

    g.attr('transform', `translate(${left},${top})`);

    updateScales(width, height);

    const container = chart.select(`.scatter-${cities}-container-bis`);

    container
      .selectAll('.scatter-circles')
      .data(dataScatterPeople)
      .join(
        enter => enter
          .append("circle")
          .attr('cx', d => scales.count.x(d.mayor))
          .attr('cy', d => scales.count.y(d.menor))
          .attr('r', 0),
        update => update
          .attr('r', 6),
        exit => exit
          .attr('cx', d => scales.count.x(d.mayor))
          .attr('cy', d => scales.count.y(d.menor))
          .attr('r', 0)
      )
      .attr('class', `scatter-${cities}-circles scatter-circles`)
      .on('mouseover', function(_, d) {
        tooltip.transition();
        tooltip
          .style('opacity', 1)
          .html(
            `<p class="tooltip-citi">${d.city}<p/>
            <p class="tooltip-population-text">Habitantes: <span class="tooltip-number">${d.population}</span><p/>
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
      const nameSelect = data.map(({ name }) => name)

      const selectCity = d3.select(`#filter-city-${cities}`);

      selectCity
        .selectAll('option')
        .data(nameSelect)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

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

        updateSelectCity();
      });

      new TomSelect(`#filter-city-${cities}`,{
        create: false,
        maxOptions: null,
        placeholder: 'Filtra por municipio',
        sortField: {
          field: "text",
          direction: "asc"
        }
      });

      new TomSelect(`#percentage-over-city-${cities}`,{
        create: false,
        maxOptions: null,
        placeholder: 'Filtra tu municipio',
        sortField: {
          field: "text",
          direction: "asc"
        }
      });

      new TomSelect(`#percentage-under-city-${cities}`,{
        create: false,
        maxOptions: null,
        placeholder: 'Filtra tu municipio',
        sortField: {
          field: "text",
          direction: "asc"
        }
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

      const percentageCity = d3.select(this).property('value');

      d3.csv(csvFile).then(data => {

        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataScatterPeople = data.filter(({ mayor }) => mayor > percentageCity);

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage').remove().exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population-text"><span class="tooltip-number">En ${dataScatterPeople.length}</span> municipios el % de habitantes mayores de 65 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', `${margin.right}px`)
          .style('top', `${50}px`);

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

      const percentageCity = d3.select(this).property('value');

      d3.csv(csvFile).then(data => {
        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataScatterPeople = data.filter(({ menor }) => menor > percentageCity);

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage').remove().exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population-text"><span class="tooltip-number">En ${dataScatterPeople.length}</span> municipios el % de habitantes menores de 18 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', `${margin.right}px`)
          .style('top', `${50}px`);

        dataScatterPeople.forEach(d => {
          d.city = d.name;
        });

        updateChart(dataScatterPeople);
      });
    });
  }

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      const valueCity = d3.select(`#filter-city-${cities}`).property('value');
      if(!valueCity){
        return
      }

      d3.selectAll(`.scatter-${cities}-circles`)
        .transition()
        .duration(400)
        .attr('r', 0);

      dataScatterPeople = data
        .reduce((acc, { name, mayor, menor, population }) =>  name === valueCity
          ? acc.concat({
            "mayor": +(mayor),
            "menor": +(menor),
            "population": population,
            "city": name
          })
          : acc , []);

      updateChart(dataScatterPeople);
    });
  }

  function resize() {
    updateChart(dataScatterPeople);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataScatterPeople = data.map(d => {
        return {
          mayor: +(d.mayor),
          menor: +(d.menor),
          population: +(d.population),
          city: d.name,
          over: d.percentagemayor,
          under: d.percentagemenor
        }
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
