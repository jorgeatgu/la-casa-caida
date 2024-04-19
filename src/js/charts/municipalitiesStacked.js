import { select, selectAll } from 'd3-selection';
import { min, max, bisector, extent, group, rollup, sum } from 'd3-array';
import { area, stack, stackOrderInsideOut } from 'd3-shape';
import { scaleTime, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { csv } from 'd3-fetch';
import { format } from 'd3-format';
import { easeLinear } from 'd3-ease';
import { interpolatePath } from 'd3-interpolate-path';

const d3 = {
  select,
  selectAll,
  min,
  max,
  bisector,
  extent,
  area,
  stack,
  easeLinear,
  stackOrderInsideOut,
  scaleTime,
  scaleLinear,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  csv,
  format,
  group,
  rollup,
  sum,
  interpolatePath
};

export function municipalitiesStacked(csvFile, cities) {
  const margin = { top: 40, right: 8, bottom: 24, left: 32 };
  let width = 0;
  let height = 0;
  let dataMunicipalitiesStacked;
  let dataTable;
  const chart = d3.select(`.municipalities-stack-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  const bisectDate = d3.bisector(d => d.year).left;
  const tooltipStack = chart
    .append('div')
    .attr('class', 'tooltip tooltip-stack')
    .style('opacity', 0);

  function setupScales(dataTable) {
    const countX = d3
      .scaleTime()
      .domain(d3.extent(dataMunicipalitiesStacked, d => d.year));

    let stackKeys = Array.from(new Set(dataMunicipalitiesStacked.map(d => d.age)).values())
    const stackedData = d3.stack().keys(stackKeys)(dataTable)
    const countY = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))]);

    scales.count = { x: countX, y: countY };
  }

  function setupElements() {
    const g = svg.select(`.municipalities-stack-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `municipalities-stack-container-${cities}-bis`);

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
      .tickFormat(d => d)
      .tickSizeInner(-width)
      .ticks(12);

    g.select('.axis-y')
      .transition()
      .duration(450)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function updateChart(dataTable) {
    const w = chart.node().offsetWidth;
    const h = 600;
    const { left, right, top, bottom } = margin

    width = w - left - right;
    height = h - top - bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${left},${top})`;

    const g = svg.select(`.municipalities-stack-${cities}-container`);

    g.attr('transform', translate);

    g.append('rect').attr('class', 'overlay-dos');

    g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0);

    let stackKeys = Array.from(new Set(dataMunicipalitiesStacked.map(d => d.age)).values())
    const stackedData = d3.stack().keys(stackKeys)(dataTable)
    let keys = [...new Set(dataMunicipalitiesStacked.map(({ age }) => age))];

    const area = d3
      .area()
      .x(d => scales.count.x(d.data.year))
      .y0(d => scales.count.y(d[0]))
      .y1(d => scales.count.y(d[1]))

    const colors = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#9db7c5", "#18857f", "#1f4196"]);

    const legend = svg
      .selectAll('.label')
      .data(colors.domain())
      .enter()
      .append('g')
      .attr('class', 'label')
      .attr('transform', (d, i) => `translate(${i * 54}, 10)`);

    legend
      .append('rect')
      .attr('x', (d, i) => `${margin.left+(i * 34)}`)
      .attr('y', 0)
      .attr('width', 16)
      .attr('height', 16)
      .style('fill', colors);

    legend
      .append('text')
      .attr('class', 'legend-text')
      .attr('x', (d, i) => `${margin.left+20+(i * 34)}`)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text((d) => `${d} años`);

    updateScales(width, height);

    const container = chart.select(`.municipalities-stack-container-${cities}-bis`);

    const layer = container
      .selectAll('.area-stack-municipalities')
      .data(stackedData);

    const newLayer = layer.enter()
      .append('path')
      .attr('class', 'area-stack-municipalities');

    layer
      .merge(newLayer)
      .transition()
      .duration(600)
      .ease(d3.easeLinear)
      .attrTween('d', function(d) {
        let previous = d3.select(this).attr('d');
        let current = area(d);
        return d3.interpolatePath(previous, current);
      })
      .attr('fill', d => colors(d.key))

    const focus = g.select('.focus');

    const overlay = g.select('.overlay-dos');

    focus.select('.x-hover-line').attr('y2', height);

    overlay
      .attr('width', width + margin.left + margin.right)
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
      var x0 = scales.count.x.invert(layerX);
      var i = bisectDate(dataMunicipalitiesStacked, x0, 1);
      var d0 = dataMunicipalitiesStacked[i - 1];
      var d1 = dataMunicipalitiesStacked[i];
      var d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      const positionX = scales.count.x(d.year) + margin.left;
      const postionWidthTooltip = positionX + 200;
      const positionRightTooltip = w - positionX;
      const selectedYear = d.year
      const dataStackedFilterYear = dataMunicipalitiesStacked.filter(({ year }) => year === selectedYear)

      const tooltipHTML = dataStackedFilterYear
        .reduce((acc, group) => {
          acc.push(createTooltipText(group))
          return acc
        }, [])

      function createTooltipText(group) {
        const { age, total } = group
        const habitantes = total === 1 ? 'habitante' : 'habitantes'
        return `<span class="tooltip-stack-text"><b>${age} años:</b> ${total} ${habitantes}</span>`
      }

      tooltipStack
        .style('opacity', 1)
        .html(() => {
          return `
            <span class="tooltip-stack-year">${selectedYear}</span>
            ${tooltipHTML.join('')}
          `
        })
        .style('top', '35%')
        .style('left', postionWidthTooltip > w ? 'auto' : positionX + 'px')
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

  function updateSelectCity() {
    d3.csv(csvFile).then(data => {
      const valueCity = d3.select(`#select-municipalities-stack-${cities}`).property('value');

      dataMunicipalitiesStacked = data.filter(({ name }) => name === valueCity);
      dataTable = createStackedData()

      setupScales(dataTable);
      updateChart(dataTable);
    });
  }

  function menuSelectCity() {
    d3.csv(csvFile).then(data => {
      const citiesName = [...new Set(data.map(({ name }) => name))];
      const selectCity = d3.select(`#select-municipalities-stack-${cities}`);

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

  function resize() {
    const dataTable = createStackedData()
    updateChart(dataTable);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      const [{ name: municipality }] = data
      dataMunicipalitiesStacked = data.filter(({ name }) => name === municipality)
      dataTable = createStackedData()
      setupElements();
      menuSelectCity()
      setupScales(dataTable);
      updateChart(dataTable);
    });
  }

  function createStackedData() {
    //Stack with groups: https://observablehq.com/@john-guerra/d3-stack-with-d3-group GG!!
    let groupedMap = d3.group(
      dataMunicipalitiesStacked,
      d => d.year,
      d => d.age
    )

    let stackKeys = Array.from(new Set(dataMunicipalitiesStacked.map(d => d.age)).values())

    const reducer = v => d3.sum(v, d => d.total);

    return Array.from(groupedMap.entries())
      .map(g => {
        const obj = {};
        obj.year = g[0];
        for (let col of stackKeys) {
          const vals = g[1].get(col);
          obj[col] = !vals ? 0 : reducer(Array.from(vals.values()));
        }
        return obj;
      })
      .sort((a, b) => a.year - b.year);
  }

  window.addEventListener('resize', resize);

  loadData();
}
