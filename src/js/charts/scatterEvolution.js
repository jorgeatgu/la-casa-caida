import { select, selectAll } from 'd3-selection';
import { min, max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { easeLinear } from 'd3-ease';
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
  format,
  easeLinear
}

export const scatterEvolution = (csvFile, cities) => {
  const margin = { top: 24, right: 24, bottom: 48, left: 72 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.scatter-lb-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  const habitantes = '%';
  let dataScatterEvolution;
  let secondYear = 2020;
  let firstYear = 2010;
  let lossPopulation;
  let winPopulation;
  let filteredData;
  let initChart = false;
  const tooltip = d3
    .select(`.scatter-lb-${cities}`)
    .append('div')
    .attr('class', 'tooltip tooltip-scatter-lb')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, d => d.percentage),
        d3.max(filteredData, d => d.percentage)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, d => d.percentage * 1.25),
        d3.max(filteredData, d => d.percentage)
      ]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.scatter-lb-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `scatter-lb-${cities}-container-bis`);

    g.append('circle')
      .attr('r', 3)
      .attr('fill', '#B41248')
      .attr('cy', '94%')
      .attr('cx', '4%');

    g.append('circle')
      .attr('r', 3)
      .attr('fill', '#3b2462')
      .attr('cy', '90%')
      .attr('cx', '4%');
  }

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickFormat(d3.format('d'))
      .ticks(0);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => d + habitantes)
      .tickSize(-width)
      .ticks(10);

    g.select('.axis-y')
      .transition()
      .duration(450)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function updateChart(dataScatterEvolution) {
    w = chart.node().offsetWidth;
    h = 600;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.scatter-lb-${cities}-container`);

    g.attr('transform', translate);

    updateScales(width, height);

    const container = chart.select(`.scatter-lb-${cities}-container-bis`);

    const layer = container
      .selectAll('.circle-desert')
      .remove()
      .exit()
      .data(dataScatterEvolution);

    const newLayer = layer
      .enter()
      .append('circle')
      .attr('class', 'circle-desert');

    layer
      .merge(newLayer)
      .attr('cx', d => Math.random() * width)
      .attr('cy', d => scales.count.y(d.percentage / 2))
      .attr('r', 2)
      .on('mouseover', d => {
        const positionX = scales.count.x(d.cp);
        const postionWidthTooltip = positionX + 270;
        const tooltipWidth = 210;
        const positionleft = `${d3.event.pageX}px`;
        const positionright = `${d3.event.pageX - tooltipWidth}px`;
        tooltip.transition();
        const tooltipHeader =
          d.percentage > 0
            ? `<p class="tooltip-scatter-text"><strong>${d.name}</strong> ha aumentado su población un <strong>${d.percentage}%</strong>.<p/>`
            : d.percentage === 0
            ? `<p class="tooltip-scatter-text"><strong>${d.name}</strong> no ha aumentado ni disminuido su población.<p/>`
            : `<p class="tooltip-scatter-text"><strong>${d.name}</strong> ha disminuido su población un <strong>${d.percentage}%</strong>.<p/>`;
        tooltip
          .style('opacity', 1)
          .html(
            `${tooltipHeader}
            <p class="tooltip-scatter-text">Población en ${firstYear}: <strong>${d.populationFirstYear}</strong><p/>
            <p class="tooltip-scatter-text">Población en ${secondYear}: <strong>${d.populationSecondYear}</strong><p/>`
          )
          .style('left', postionWidthTooltip > w ? positionright : positionleft)
          .style('top', `${d3.event.pageY - 100}px`);
      })
      .on('mouseout', () => {
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
      })
      .attr('fill-opacity', 0.8)
      .transition()
      .duration(450)
      .ease(d3.easeLinear)
      .attr('cy', d => scales.count.y(d.percentage))
      .attr('fill', d =>
        d.percentage >= 0 ? '#3b2462' : d.percentage === 0 ? '#111' : '#B41248'
      )
      .attr('r', 4);

    drawAxes(g);
  }

  function resize() {
    updateChart(filteredData);
  }

  const years = [
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020'
  ];
  function menuFirstYear() {
    const selectFirstYear = d3.select(`#select-first-year-${cities}`);

    selectFirstYear
      .selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);

    selectFirstYear.on('change', function() {
      firstYear = d3.select(this).property('value');
    });
  }

  function menuSecondYear() {
    const selectSecondYear = d3.select(`#select-second-year-${cities}`);
    selectSecondYear
      .selectAll('option')
      .data(years)
      .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d);

    selectSecondYear.on('change', function() {
      secondYear = d3.select(this).property('value');
    });
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataScatterEvolution = data;

      dataScatterEvolution.forEach(d => {
        d.year = +d.year;
        d.population = +d.population;
      });

      setupElements();
      menuFirstYear();
      menuSecondYear();
      d3.select(`#select-second-year-${cities}`).property('value', secondYear);
      updateYearData();
    });
  }

  function updateYearData() {
    let mergeYears = [];
    let dataFirstYear = filterDataByYear(+firstYear, 'populationFirstYear');
    let dataSecondYear = filterDataByYear(+secondYear, 'populationSecondYear');

    mergeYears = dataFirstYear.map((item, i) =>
      Object.assign({}, item, dataSecondYear[i])
    );
    filteredData = mergeYears.map(
      ({ populationFirstYear, populationSecondYear, name, cp }) => {
        let difference = populationSecondYear - populationFirstYear;
        return {
          percentage: +((difference * 100) / populationFirstYear).toFixed(2),
          populationFirstYear,
          populationSecondYear,
          cp,
          name
        };
      }
    );

    lossPopulation = filteredData.filter(({ percentage }) => percentage < 0)
      .length;
    winPopulation = filteredData.filter(({ percentage }) => percentage > 0)
      .length;

    d3.select(`.municipios-lost-${cities}`).remove();

    d3.select(`.municipios-wins-${cities}`).remove();

    svg
      .select(`.scatter-lb-${cities}-container`)
      .append('text')
      .attr('class', `municipios-lost-${cities}`)
      .attr('y', '95%')
      .attr('x', '5%')
      .text(`Un total de ${lossPopulation} municipios han perdido población.`);

    svg
      .select(`.scatter-lb-${cities}-container`)
      .append('text')
      .attr('class', `municipios-wins-${cities}`)
      .attr('y', '91%')
      .attr('x', '5%')
      .text(`Un total de ${winPopulation} municipios han ganado población.`);

    if (!initChart) {
      setupScales();
    }
    updateChart(filteredData);
  }

  function filterDataByYear(yearFilter, position) {
    let dataYearsFiltered = dataScatterEvolution.filter(({ year }) => year === yearFilter);
    return dataYearsFiltered.map(({ population, municipio, cp }) => {
      return {
        [position]: population,
        name: municipio,
        cp
      };
    });
  }

  d3.select(`#select-compare-${cities}`).on('click', dataScatterEvolution => {
    updateYearData();
  });

  window.addEventListener('resize', resize);

  loadData();
};
