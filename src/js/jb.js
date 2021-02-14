import { menu, widthMobile } from "./shared/index.js";

const lineLB = (csvFile, cities) => {
  const margin = { top: 16, right: 16, bottom: 24, left: 62 };
  let width = 0;
  let height = 0;
  const chart = d3.select(`.line-lb-${cities}`);
  const svg = chart.select('svg');
  let scales = {};
  let datos;

  function setupScales() {
    const countX = d3
      .scaleTime()
      .domain([2011,2019]);

    const countY = d3
      .scaleLinear()
      .domain([d3.min(datos, (d) => (d.population * 1.75) - d.population), d3.max(datos, (d) => d.population) * 1.25]);

    scales.count = { x: countX, y: countY };
  };

  function setupElements() {
    const g = svg.select(`.line-lb-${cities}-container`);

    g.append('g').attr('class', 'axis axis-x');

    g.append('g').attr('class', 'axis axis-y');

    g.append('g').attr('class', `line-lb-${cities}-container-bis`);
  };

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  };

  function drawAxes(g) {
    const axisX = d3
      .axisBottom(scales.count.x)
      .tickPadding(5)
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
  };

  function updateChart(data) {
    const w = chart.node().offsetWidth;
    const h = 500;

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;

    svg.attr('width', w).attr('height', h);

    const translate = `translate(${margin.left},${margin.top})`;

    const g = svg.select(`.line-lb-${cities}-container`);

    g.attr('transform', translate);

    const line = d3
      .line()
      .x((d) => scales.count.x(d.year))
      .y((d) => scales.count.y(d.population))
      .curve(d3.curveCardinal.tension(0.6));

    updateScales(width, height);

    const container = chart.select(
      `.line-lb-${cities}-container-bis`
    );

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
        let previous = d3.select(this).attr('d');
        let current = line(d);
        return d3.interpolatePath(previous, current);
      });

    const dotsLayer = dots
      .enter()
      .append('circle')
      .attr('class', 'circles-population')
      .attr('fill', '#531f4e');

    dots.merge(dotsLayer)
      .attr('cx', (d) => scales.count.x(d.year))
      .attr('cy', (d) => scales.count.y(d.population))
      .attr('r', 0)
      .transition()
      .duration(400)
      .ease(d3.easeLinear)
      .attr('cx', (d) => scales.count.x(d.year))
      .attr('cy', (d) => scales.count.y(d.population))
      .attr('r', 4);

    drawAxes(g);
  }

  function update(mes) {
    d3.csv(csvFile).then(data => {
      datos = data;

      let valueCity = d3
        .select(`#select-lb-${cities}`)
        .property('value');
      let revalueCity = new RegExp('^' + valueCity + '$');

      datos = datos.filter((d) => String(d.name).match(revalueCity));

      datos.forEach((d) => {
        d.population = +d.population;
        d.year = +d.year;
      });

      scales.count.x.range([0, width]);
      scales.count.y.range([height, 0]);

      const countX = d3
        .scaleTime()
        .domain([
          2011,
          2019,
        ]);

      const countY = d3
        .scaleLinear()
        .domain([d3.min(datos, (d) => (d.population * 1.75) - d.population), d3.max(datos, (d) => d.population) * 1.25]);

      scales.count = { x: countX, y: countY };
      updateChart(datos);
    });
  }

  function resize() {
    updateChart(datos);
  };

  function menuMes() {
    d3.csv(csvFile).then(data => {
      const nest = d3
        .nest()
        .key((d) => d.name)
        .entries(data);

      const selectCity = d3.select(`#select-lb-${cities}`);

      selectCity
        .selectAll('option')
        .data(nest)
        .enter()
        .append('option')
        .attr('value', (d) => d.key)
        .text((d) => d.key);

      selectCity.on('change', function() {
        let mes = d3.select(this).property('value');
        update(mes);
      });
    });
  };

  function loadData() {
    d3.csv(csvFile).then(data => {
      datos = data;
      datos.forEach((d) => {
        d.year = +d.year;
        d.population = +d.population;
        d.cp = +d.cp;
      });
      setupElements();
      setupScales();
      updateChart(datos);
      const mes = datos[0].name;
      update(mes);
    });
  };

  window.addEventListener('resize', resize);

  loadData();
  menuMes();
};

new SlimSelect({
  select: '#select-lb-huesca',
  searchPlaceholder: 'Busca tu municipio',
});

new SlimSelect({
  select: '#select-lb-zaragoza',
  searchPlaceholder: 'Busca tu municipio',
});

new SlimSelect({
  select: '#select-lb-teruel',
  searchPlaceholder: 'Busca tu municipio',
});

menu();

const scatterLB = (csvFile, cities) => {
  const margin = { top: 24, right: 24, bottom: 48, left: 72 };
  let width = 0;
  let height = 0;
  let w = 0;
  let h = 0;
  const chart = d3.select(`.scatter-lb-${cities}`);
  const svg = chart.select('svg');
  const scales = {};
  const habitantes = '%';
  let dataz;
  let lossP;
  let winP;
  const tooltip = d3
    .select(`.scatter-lb-${cities}`)
    .append('div')
    .attr('class', 'tooltip tooltip-scatter-lb')
    .style('opacity', 0);

  function setupScales() {
    const countX = d3
      .scaleLinear()
      .domain([
        d3.min(dataz, (d) => d.percentage),
        d3.max(dataz, (d) => d.percentage)
      ]);

    const countY = d3
      .scaleLinear()
      .domain([
        d3.min(dataz, (d) => d.percentage * 1.25),
        d3.max(dataz, (d) => d.percentage)
      ]);

    scales.count = { x: countX, y: countY };
  };

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

    g.append('text')
      .text(`Municipios que han perdido población. Total: ${lossP.length}`)
      .attr('y', '95%')
      .attr('x', '5%');

    g.append('text')
      .text(`Municipios que han ganado población. Total: ${winP.length}`)
      .attr('y', '91%')
      .attr('x', '5%');
  };

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  };

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
      .tickFormat((d) => d + habitantes)
      .tickSize(-width)
      .ticks(10);

    g.select('.axis-y').call(axisY);
  };

  function updateChart(dataz) {
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

    const layer = container.selectAll('.circle-desert').data(dataz);

    const newLayer = layer
      .enter()
      .append('circle')
      .attr('class', 'circle-desert');

    layer
      .merge(newLayer)
      .attr('cx', (d) => Math.random() * width)
      .attr('cy', (d) => scales.count.y(d.percentage))
      .attr('r', 4)
      .on('mouseover', (d) => {
        const positionX = scales.count.x(d.cp);
        const postionWidthTooltip = positionX + 270;
        const tooltipWidth = 210;
        const positionleft = `${d3.event.pageX}px`;
        const positionright = `${d3.event.pageX - tooltipWidth}px`;
        tooltip.transition()
        const tooltipHeader = d.percentage > 0
          ? `<p class="tooltip-scatter-text"><strong>${d.name}</strong> ha aumentado su población un <strong>${d.percentage}%</strong>.<p/>`
          : d.percentage === 0
            ? `<p class="tooltip-scatter-text"><strong>${d.name}</strong> no ha aumentado ni disminuido su población.<p/>`
            : `<p class="tooltip-scatter-text"><strong>${d.name}</strong> ha disminuido su población un <strong>${d.percentage}%</strong>.<p/>`
        tooltip
          .style('opacity', 1)
          .html(
            `${tooltipHeader}
            <p class="tooltip-scatter-text">Población en 2018: <strong>${d.dosmildieciocho}</strong><p/>
            <p class="tooltip-scatter-text">Población en 2019: <strong>${d.dosmildiecinueve}</strong><p/>`
          )
          .style(
            'left',
            postionWidthTooltip > w ? positionright : positionleft
          )
          .style('top', `${d3.event.pageY - 100}px`);
      })
      .on('mouseout', () => {
        tooltip
          .transition()
          .duration(200)
          .style('opacity', 0);
      })
      .attr('fill', d => d.percentage >= 0
        ? '#3b2462'
        : d.percentage === 0
          ? '#111'
          : '#B41248'
      )
      .attr('fill-opacity', 0.8);

    drawAxes(g);
  };

  function resize() {
    updateChart(dataz);
  };

  function loadData() {
    d3.csv(csvFile).then(data => {
      dataz = data;

      lossP = dataz.filter((d) => d.percentage < 0);
      winP = dataz.filter((d) => d.percentage > 0);

      setupElements();
      setupScales();
      updateChart(dataz);
    });
  };

  window.addEventListener('resize', resize);

  loadData();
};

const cities = [
  {
    city: 'huesca',
    comparatorCSV: 'data/evolucion/huesca/huesca-total.csv',
    evolutionCSV: 'data/huesca/2018-2019-huesca.csv'
  },
  {
    city: 'teruel',
    comparatorCSV: 'data/evolucion/teruel/teruel-total.csv',
    evolutionCSV: 'data/teruel/2018-2019-teruel.csv'
  },
  {
    city: 'zaragoza',
    comparatorCSV: 'data/evolucion/zaragoza/zaragoza-total.csv',
    evolutionCSV: 'data/zaragoza/2018-2019-zaragoza.csv'
  }
]

cities.map(element => {
  const { comparatorCSV, city, evolutionCSV } = element
  lineLB(comparatorCSV, city)
  scatterLB(evolutionCSV, city)
})
