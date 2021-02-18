import {
  menu,
  widthMobile,
  changeLanguage,
  animation
} from './shared/index.js';

changeLanguage();

setTimeout(animation(), 1000);

function scatterDesert() {
  const margin = { top: 24, right: 24, bottom: 48, left: 72 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select('.scatter-desert');
  const svg = chart.select('svg');
  const scales = {};
  const habitantes = ' hab/km2';
  let dataz;

  function setupScales() {
    const countX = d3
      .scaleLinear()
      .domain([d3.min(dataz, d => d.densidad), d3.max(dataz, d => d.densidad)]);

    const countY = d3
      .scaleLinear()
      .domain([d3.min(dataz, d => d.densidad), d3.max(dataz, d => d.densidad)]);

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

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select('.scatter-desert-container');

    g.attr('transform', translate);

    updateScales(width, height);

    const container = chart.select('.scatter-desert-container-bis');

    const layer = container.selectAll('.circle-desert').data(dataz);

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
    updateChart(dataz);
  }

  function loadData() {
    d3.csv('data/aragon-municipios.csv').then(data => {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}

function aragonStack() {
  const margin = { top: 24, right: 8, bottom: 24, left: 32 };
  let width = 0;
  let height = 0;
  const chart = d3.select('.aragon-stack');
  const svg = chart.select('svg');
  const scales = {};
  let dataz;
  const bisectDate = d3.bisector(d => d.year).left;
  const tooltipStack = chart
    .append('div')
    .attr('class', 'tooltip tooltip-stack')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3.scaleTime().domain(d3.extent(dataz, d => d.year));

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
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickFormat(d3.format('d'))
      .tickPadding(7)
      .ticks(9);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => d + '%')
      .tickSizeInner(-width)
      .ticks(12);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataz) {
    const w = chart.node().offsetWidth;
    const h = 600;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select('.aragon-stack-container');

    g.attr('transform', translate);

    g.append('rect').attr('class', 'overlay-dos');

    g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')
      .append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0);

    const keys = dataz.columns.slice(5);

    const area = d3
      .area()
      .x(d => scales.count.x(d.data.year))
      .y0(d => scales.count.y(d[0]))
      .y1(d => scales.count.y(d[1]))
      .curve(d3.curveCardinal.tension(0.6));

    const stack = d3
      .stack()
      .keys(keys)
      .order(d3.stackOrderInsideOut);

    const stackedData = stack(dataz);

    const colors = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#F67460', '#C54073', '#5A1C7C']);

    updateScales(width, height);

    const container = chart.select('.aragon-stack-container-bis');

    const layer = container.selectAll('.area-stack').data(stackedData);

    const newLayer = layer
      .enter()
      .append('path')
      .attr('class', 'area-stack');

    layer
      .merge(newLayer)
      .transition()
      .duration(600)
      .ease(d3.easeLinear)
      .attr('fill', d => colors(d.key))
      .attr('d', area);

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

    function mousemove() {
      const w = chart.node().offsetWidth;
      var x0 = scales.count.x.invert(d3.mouse(this)[0]),
        i = bisectDate(dataz, x0, 1),
        d0 = dataz[i - 1],
        d1 = dataz[i],
        d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      const positionX = scales.count.x(d.year) + 33;
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

  function resize() {
    updateChart(dataz);
  }

  function loadData() {
    d3.csv('data/aragon-total.csv').then(data => {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}

function line(csvFile, cities) {
  const margin = { top: 8, right: 8, bottom: 24, left: 8 };

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataz;
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
      .domain([d3.min(dataz, d => d.year), d3.max(dataz, d => d.year)]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataz, d => d.total / 1.25),
        d3.max(dataz, d => d.total * 1.25)
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
    scales.count.x.range([90, width]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickFormat(d3.format('d'))
      .ticks(9);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const localeFormat = locale.format(',.0f');
    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => `${localeFormat(d)} ${habitantes}`)
      .ticks(6)
      .tickSizeInner(-width);

    g.select('.axis-y').call(axisY);
    g.selectAll('.axis-y .tick text')
      .attr('x', 80)
      .attr('dy', -5);
  }

  function updateChart(dataz) {
    const w = chart.node().offsetWidth;
    const h = 550;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.line-${cities}-container`);

    g.attr('transform', translate);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.total));

    updateScales(width, height);

    const container = chart.select(`.line-${cities}-container-bis`);

    const layer = container.selectAll('.line').data([dataz]);

    const newLayer = layer
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('stroke-width', '1.5');

    const dots = container.selectAll('.circles').data(dataz);

    const dotsLayer = dots
      .enter()
      .append('circle')
      .attr('class', 'circles')
      .attr('fill', '#531f4e');

    layer.merge(newLayer).attr('d', line);

    dots
      .merge(dotsLayer)
      .on('mouseover', d => {
        const positionX = scales.count.x(d.year);
        const postionWidthTooltip = positionX + 270;
        const tooltipWidth = 210;
        const positionleft = `${d3.event.pageX}px`;
        const positionright = `${d3.event.pageX - tooltipWidth}px`;
        tooltipPopulation.transition();
        tooltipPopulation
          .style('opacity', 1)
          .html(
            `<p class="tooltip-deceased">La población en <span class="tooltip-number">${d.year}</span> era de <span class="tooltip-number">${d.total}</span> habitantes<p/>`
          )
          .style('left', postionWidthTooltip > w ? positionright : positionleft)
          .style('top', `${d3.event.pageY - 48}px`);
      })
      .on('mouseout', () => {
        tooltipPopulation
          .transition()
          .duration(200)
          .style('opacity', 0);
      })
      .attr('cx', d => scales.count.x(d.year))
      .attr('cy', d => scales.count.y(d.total))
      .attr('r', 4);

    drawAxes(g);
  }

  function resize() {
    updateChart(dataz);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}

function barScatter(csvFile, cities) {
  const margin = { top: 0, right: 8, bottom: 64, left: 40 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.scatter-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataz;
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
      .domain([0, d3.max(dataz, d => d.menor * 1.75)]);

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

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d => d + symbolP)
      .tickSize(-width)
      .ticks(5);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataz) {
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

    const layer = container.selectAll('.scatter-circles').data(dataz);

    const newLayer = layer
      .enter()
      .append('circle')
      .attr('class', `scatter-${cities}-circles scatter-circles`);

    layer
      .merge(newLayer)
      .on('mouseover', function(d) {
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
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
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
      d3.selectAll('.tooltip-percentage')
        .remove()
        .exit();

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
        dataz = data;
        dataz.forEach(d => {
          d.mayor = +d.mayor;
          d.menor = +d.menor;
          d.city = d.name;
        });
        updateChart(dataz);
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
        let filterCity = d3.select(this).property('value');

        d3.select(`#percentage-over-city-${cities} option`).property(
          'selected',
          '0'
        );
        d3.select(`#percentage-under-city-${cities} option`).property(
          'selected',
          '0'
        );
        d3.selectAll('.tooltip-percentage')
          .remove()
          .exit();

        new SlimSelect({
          select: `#percentage-over-city-${cities}`,
          searchPlaceholder: 'Filtra tu municipio'
        });

        new SlimSelect({
          select: `#percentage-under-city-${cities}`,
          searchPlaceholder: 'Filtra tu municipio'
        });

        update(filterCity);
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
        dataz = data;

        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataz = dataz.filter(d => d.mayor > percentageCity);

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage')
          .remove()
          .exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population"><span class="tooltip-number">En ${dataz.length}</span> municipios el % de habitantes mayores de 65 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', margin.right + 'px')
          .style('top', 50 + 'px');

        dataz.forEach(d => {
          d.city = d.name;
        });

        updateChart(dataz);
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
        dataz = data;

        d3.selectAll(`.scatter-${cities}-circles`)
          .transition()
          .duration(400)
          .attr('r', 0);

        dataz = dataz.filter(d => d.menor > percentageCity);

        const container = chart.select(`.scatter-${cities}-container-bis`);

        d3.selectAll('.tooltip-percentage')
          .remove()
          .exit();

        chart
          .append('div')
          .attr('class', 'tooltip tooltip-percentage')
          .html(
            `
            <p class="tooltip-population"><span class="tooltip-number">En ${dataz.length}</span> municipios el % de habitantes menores de 18 años es superior al <span class="tooltip-number">${percentageCity}%</span>. <p/>
            `
          )
          .style('right', margin.right + 'px')
          .style('top', 50 + 'px');

        dataz.forEach(d => {
          d.city = d.name;
        });

        updateChart(dataz);
      });
    });
  }

  function update(filterCity) {
    d3.csv(csvFile).then(data => {
      dataz = data;

      let valueCity = d3.select(`#filter-city-${cities}`).property('value');
      let revalueCity = new RegExp('^' + valueCity + '$');

      d3.selectAll(`.scatter-${cities}-circles`)
        .transition()
        .duration(400)
        .attr('r', 0);

      dataz = dataz.filter(d => String(d.name).match(revalueCity));

      dataz.forEach(d => {
        d.mayor = +d.mayor;
        d.menor = +d.menor;
        d.city = d.name;
      });

      updateChart(dataz);
    });
  }

  function resize() {
    updateChart(dataz);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataz = data;
      dataz.forEach(d => {
        d.mayor = +d.mayor;
        d.menor = +d.menor;
        d.population = +d.population;
        d.city = d.name;
        d.over = d.percentagemayor;
        d.under = d.percentagemenor;
      });
      setupElements();
      setupScales();
      updateChart(dataz);
      menuFilter();
      percentageOlder();
      percentageUnder();
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}

function barNegative(csvFile, cities) {
  const margin = { top: 24, right: 8, bottom: 24, left: 40 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.bar-negative-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  let dataz;
  const tooltip = chart
    .append('div')
    .attr('class', 'tooltip tooltip-negative')
    .style('opacity', 0);

  function setupScales() {
    const saldoMin = d3.min(dataz, d => d.saldo);
    const saldoMax = d3.max(dataz, d => d.saldo);

    const saldoMaxMin = -500;
    const saldoMaxMax = 300;

    const countX = d3.scaleBand().domain(dataz.map(d => d.year));

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataz, d => d.saldo * 2),
        d3.max(dataz, d =>
          saldoMax < saldoMaxMax
            ? d3.max(dataz, d => d.saldo * 6)
            : d3.max(dataz, d => d.saldo * 2.5)
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
    scales.count.x.rangeRound([0, width]).paddingInner(0.2);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3.axisBottom(scales.count.x).tickValues(
      scales.count.x.domain().filter((d, i) => {
        return !(i % 6);
      })
    );

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickFormat(d3.format('d'))
      .ticks(5)
      .tickSize(-width)
      .tickPadding(8);

    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.bar-negative-${cities}-container`);

    g.attr('transform', translate);

    updateScales(width, height);

    const container = chart.select(`.bar-negative-${cities}-container-bis`);

    const layer = container.selectAll('.bar-vertical').data(dataz);

    const newLayer = layer
      .enter()
      .append('rect')
      .attr('class', d => (d.saldo < 0 ? 'negative' : 'positive'));

    layer
      .merge(newLayer)
      .on('mouseover', function(d) {
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
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
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
    updateChart(dataz);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
}

function linePopulation(csvFile, cities) {
  const margin = { top: 16, right: 8, bottom: 24 };
  margin.left = widthMobile > 544 ? 62 : 32;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-population-${cities}`);
  const svg = chart.select('svg');
  let scales = {};
  let datos;
  const containerTooltip = d3.select(`.${cities}-line`);
  const tooltipOver = chart.append('div').attr('class', 'tooltip tooltip-over');
  const tooltipPopulation = containerTooltip
    .append('div')
    .attr('class', 'tooltip tooltip-population')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain([d3.min(datos, d => d.year), d3.max(datos, d => d.year)]);

    const countY = d3
      .scaleLinear()
      .domain([0, d3.max(datos, d => d.population) * 1.25]);

    scales.count = { x: countX, y: countY };
  }

  function tooltips(data) {
    datos = data;
    const w = chart.node().offsetWidth;

    const totalLose = datos[0].population - datos.slice(-1)[0].population;
    const totalWin = datos.slice(-1)[0].population - datos[0].population;
    let percentageL = ((totalLose * 100) / datos[0].population).toFixed(2);
    let percentageW = ((totalWin * 100) / datos[0].population).toFixed(2);
    const tooltipHeader =
      datos[0].population > datos.slice(-1)[0].population
        ? `<p class="tooltip-deceased">Desde 1900 su población ha disminuido en un <span class="tooltip-number">${percentageL}%</span><p/>`
        : `<p class="tooltip-deceased">Desde 1900 su población ha aumentado en un <span class="tooltip-number">${percentageW}%</span><p/>`;
    const topPosition =
      datos[0].population > datos.slice(-1)[0].population ? '20px' : '90%';
    tooltipOver
      .data(datos)
      .html(
        d => `
        ${tooltipHeader}
        <p class="tooltip-deceased">Mayores de 65 años en 2018: <span class="tooltip-number">${d.mayor}%</span><p/>
        <p class="tooltip-deceased">Menores de 18 años en 2018: <span class="tooltip-number">${d.menor}%</span><p/>
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
    scales.count.x.range([0, width - margin.right]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickPadding(4)
      .tickFormat(d3.format('d'))
      .ticks(13);

    g.select('.axis-x')
      .attr('transform', `translate(0,${height})`)
      .transition()
      .duration(300)
      .ease(d3.easeLinear)
      .call(axisX);

    const axisY = d3
      .axisLeft(scales.count.y)
      .tickPadding(5)
      .tickFormat(d3.format('d'))
      .tickSize(-width)
      .ticks(6);

    g.select('.axis-y')
      .transition()
      .duration(300)
      .ease(d3.easeLinear)
      .call(axisY);
  }

  function updateChart(data) {
    const w = chart.node().offsetWidth;
    const h = 500;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.line-population-${cities}-container`);

    g.attr('transform', translate);

    const line = d3
      .line()
      .x(d => scales.count.x(d.year))
      .y(d => scales.count.y(d.population));

    updateScales(width, height);

    const container = chart.select(`.line-population-${cities}-container-bis`);

    const lines = container.selectAll('.lines').data([datos]);

    const dots = container
      .selectAll('.circles-population')
      .remove()
      .exit()
      .data(datos);

    const newLines = lines
      .enter()
      .append('path')
      .attr('class', 'lines');

    lines
      .merge(newLines)
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attrTween('d', function(d) {
        var previous = d3.select(this).attr('d');
        var current = line(d);
        return d3.interpolatePath(previous, current);
      });

    const dotsLayer = dots
      .enter()
      .append('circle')
      .attr('class', 'circles-population')
      .attr('fill', '#531f4e');

    dots
      .merge(dotsLayer)
      .on('mouseover', d => {
        const positionX = scales.count.x(d.year);
        const postionWidthTooltip = positionX + 270;
        const tooltipWidth = 210;
        const positionleft = `${d3.event.pageX}px`;
        const positionright = `${d3.event.pageX - tooltipWidth}px`;
        tooltipPopulation.transition();
        tooltipPopulation
          .style('opacity', 1)
          .html(
            `<p class="tooltip-deceased">La población en <span class="tooltip-number">${d.year}</span> era de <span class="tooltip-number">${d.population}</span> habitantes<p/>`
          )
          .style('left', postionWidthTooltip > w ? positionright : positionleft)
          .style('top', `${d3.event.pageY - 48}px`);
      })
      .on('mouseout', () => {
        tooltipPopulation
          .transition()
          .duration(200)
          .style('opacity', 0);
      })
      .attr('cx', d => scales.count.x(d.year))
      .attr('cy', d => scales.count.y(d.population))
      .attr('r', 0)
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr('cx', d => scales.count.x(d.year))
      .attr('cy', d => scales.count.y(d.population))
      .attr('r', 4);

    drawAxes(g);
  }

  function update(mes) {
    d3.csv(csvFile).then(data => {
      datos = data;

      let valueCity = d3.select(`#select-city-${cities}`).property('value');
      let revalueCity = new RegExp('^' + valueCity + '$');

      datos = datos.filter(d => String(d.name).match(revalueCity));

      datos.forEach(d => {
        d.population = +d.population;
        d.year = +d.year;
      });

      scales.count.x.range([0, width]);
      scales.count.y.range([height, 0]);

      const countX = d3
        .scaleTime()
        .domain([d3.min(datos, d => d.year), d3.max(datos, d => d.year)]);

      const countY = d3
        .scaleLinear()
        .domain([0, d3.max(datos, d => d.population) * 1.25]);

      scales.count = { x: countX, y: countY };
      updateChart(datos);
      tooltips(datos);
    });
  }

  function menuMes() {
    d3.csv(csvFile).then(data => {
      datos = data;

      const nest = d3
        .nest()
        .key(d => d.select)
        .entries(datos);

      const selectCity = d3.select(`#select-city-${cities}`);

      selectCity
        .selectAll('option')
        .data(nest)
        .enter()
        .append('option')
        .attr('value', d => d.key)
        .text(d => d.key);

      selectCity.on('change', function() {
        let mes = d3.select(this).property('value');

        update(mes);
      });
    });
  }

  function resize() {
    updateChart(datos);
  }

  function loadData() {
    d3.csv(csvFile).then(data => {
      datos = data;
      datos.forEach(d => {
        d.year = +d.year;
        d.population = +d.population;
      });
      setupElements();
      setupScales();
      updateChart(datos);
      const mes = datos[0].name;
      update(mes);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
  menuMes();
}

menu();

scatterDesert();

aragonStack();

const cities = [
  {
    city: 'huesca',
    linePopulationCSV: 'data/huesca/huesca.csv',
    lineTotalCSV: 'data/huesca/huesca-total.csv',
    scatterUnderCSV: 'data/huesca/huesca-mayor-menor.csv',
    vegetativeCSV: 'data/huesca/saldo-vegetativo-total-huesca.csv'
  },
  {
    city: 'teruel',
    linePopulationCSV: 'data/teruel/teruel.csv',
    lineTotalCSV: 'data/teruel/teruel-total.csv',
    scatterUnderCSV: 'data/teruel/teruel-mayor-menor.csv',
    vegetativeCSV: 'data/teruel/saldo-vegetativo-total-teruel.csv'
  },
  {
    city: 'zaragoza',
    linePopulationCSV: 'data/zaragoza/zaragoza.csv',
    lineTotalCSV: 'data/zaragoza/zaragoza-total.csv',
    scatterUnderCSV: 'data/zaragoza/zaragoza-mayor-menor.csv',
    vegetativeCSV: 'data/zaragoza/saldo-vegetativo-total-zaragoza.csv'
  }
];

cities.map(element => {
  const {
    city,
    linePopulationCSV,
    lineTotalCSV,
    scatterUnderCSV,
    vegetativeCSV
  } = element;
  linePopulation(linePopulationCSV, city);
  line(lineTotalCSV, city);
  barScatter(scatterUnderCSV, city);
  barNegative(vegetativeCSV, city);
});

new SlimSelect({
  select: '#select-city-teruel',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-teruel',
  searchPlaceholder: 'Filtra por municipio'
});

new SlimSelect({
  select: '#percentage-over-city-teruel',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-teruel',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#select-city-huesca',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-over-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-huesca',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#select-city-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});

new SlimSelect({
  select: '#filter-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-over-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});

new SlimSelect({
  select: '#percentage-under-city-zaragoza',
  searchPlaceholder: 'Filtra tu municipio'
});
