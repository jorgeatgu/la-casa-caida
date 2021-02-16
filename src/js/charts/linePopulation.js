export function linePopulation(csvFile, cities) {
  margin = { top: 16, right: 8, bottom: 24, left: 62 };
  margin.left = widthMobile > 544 ? 62 : 32;

  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-population-${cities}`);
  const svg = chart.select('svg');
  let scales = {};
  let datos;
  const containerTooltip = d3.select(`.${cities}-line`);
  const tooltipOver = chart
    .append('div')
    .attr('class', 'tooltip tooltip-over');
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
      mes = datos[0].name;
      update(mes);
    });
  }

  window.addEventListener('resize', resize);

  loadData();
  menuMes();
}
