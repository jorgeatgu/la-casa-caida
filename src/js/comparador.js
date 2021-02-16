import { menu, widthMobile } from './shared/index.js';

menu();

function grid() {
  let ciudad;
  const chart = d3.select('.grid-chart-element');
  const gridCharts = d3.select('.container-chart');
  let layout;
  let diferencia;

  function res() {
    if (widthMobile > 544) {
      gridWidth = 12;
      layout = d3_iconarray
        .layout()
        .width(12)
        .height(8);
      w = gridCharts.node().offsetWidth / 3;
      return {
        gridWidth: gridWidth,
        w: w
      };
    } else {
      gridWidth = 20;
      w = gridCharts.node().offsetWidth;
      layout = d3_iconarray
        .layout()
        .width(14)
        .height(8);
      return {
        gridWidth: gridWidth,
        w: w
      };
    }
  }
  res();
  const radius = 8;
  const margin = {
    top: radius,
    right: radius,
    bottom: radius,
    left: radius
  };
  const h = 480;
  const scale = d3
    .scaleLinear()
    .range([0, w - (margin.left + margin.right)])
    .domain([0, gridWidth]);

  function updateChart(dataz) {
    chart
      .selectAll('.temas')
      .remove()
      .exit()
      .data(dataz)
      .enter()
      .append('div')
      .attr('class', 'temas')
      .call(arrayBars, true);

    function arrayBars(parent, widthFirst) {
      layout.widthFirst(widthFirst);
      parent
        .append('h3')
        .attr('class', 'title-m')
        .html(
          d =>
            `<p class="habitantes">Número de habitantes en <span class="numero-habitantes">${d.name}</span>: ${d.population}`
        );

      parent
        .append('svg')
        .attr('width', w)
        .attr('height', d => (d.population / 12) * 32)
        .append('g')
        .attr('class', 'container')
        .selectAll('rect')
        .data(d => layout(d3.range(0, d.population, 1)))
        .enter()
        .append('rect')
        .attr('x', d => scale(d.position.x))
        .attr('y', d => scale(d.position.y))
        .attr('rx', 1.5)
        .attr('ry', 1.5)
        .attr('width', 0)
        .attr('height', 0)
        .transition()
        .delay((d, i) => i * 5)
        .duration(250)
        .attr('width', radius * 2.5)
        .attr('height', radius * 2.5)
        .attr('fill', '#1d7351');
    }
  }

  const menuCity = () => {
    d3.csv('data/teruel/vox-municipios-teruel.csv', (error, data) => {
      if (error) {
        console.log(error);
      } else {
        datos = data;

        const nest = d3
          .nest()
          .key(d => d.name)
          .entries(datos);

        const selectCity = d3.select('#municipios-teruel');

        selectCity
          .selectAll('option')
          .data(nest)
          .enter()
          .append('option')
          .attr('value', d => d.key)
          .text(d => d.key);

        selectCity.on('change', function() {
          let city = d3.select(this).property('value');

          loadData(city);
        });
      }
    });
  };

  function loadData(city) {
    ciudad = city === undefined ? 'Ababuj' : city;
    d3.csv('data/teruel/vox-municipios-teruel.csv', (error, data) => {
      if (error) {
        console.log(error);
      } else {
        dataz = data;
        dataz.forEach(d => {
          d.name = d.name;
          d.population = d.population;
        });

        dataz = dataz.filter(d => d.name === ciudad);

        if (dataz[0].population > 100) {
          conffetiTroll();
        }

        diferencia = dataz[0].population - 100;

        if (diferencia > 0) {
          d3.select('.grid-chart-diferencia').html(
            d =>
              `<p class="diferencia-habitantes"><span class="numero-diferencia">${dataz[0].name}</span> tiene <span class="numero-diferencia">${diferencia}</span> habitantes más que la manifestación de Vox. `
          );
        } else {
          d3.select('.grid-chart-diferencia').html(
            d =>
              `<p class="diferencia-habitantes"><span class="numero-diferencia">${dataz[0].name}</span> tiene menos habitantes más que la manifestación de Vox. `
          );
        }

        updateChart(dataz);
      }
    });
  }

  const resize = () => {
    loadData(ciudad);
  };

  ciudad = 'Arens de Lledó';

  window.addEventListener('resize', resize);
  menuCity();
  loadData(ciudad);
}

grid();

function gridVox() {
  const chart = d3.select('.grid-chart-element-vox');
  const gridCharts = d3.select('.container-chart');
  let layout;

  function res() {
    if (widthMobile > 544) {
      gridWidth = 12;
      layout = d3_iconarray
        .layout()
        .width(12)
        .height(8);
      w = gridCharts.node().offsetWidth / 3;
      return {
        gridWidth: gridWidth,
        w: w
      };
    } else {
      gridWidth = 20;
      w = gridCharts.node().offsetWidth;
      layout = d3_iconarray
        .layout()
        .width(14)
        .height(8);
      return {
        gridWidth: gridWidth,
        w: w
      };
    }
  }
  res();
  const radius = 8;
  const margin = {
    top: radius,
    right: radius,
    bottom: radius,
    left: radius
  };
  const h = 480;
  const scale = d3
    .scaleLinear()
    .range([0, w - (margin.left + margin.right)])
    .domain([0, gridWidth]);

  function updateChart(dataz) {
    chart
      .selectAll('.temas')
      .data(dataz)
      .enter()
      .append('div')
      .attr('class', 'temas')
      .call(arrayBars, true);

    function arrayBars(parent, widthFirst) {
      layout.widthFirst(widthFirst);
      parent
        .append('h3')
        .attr('class', 'title-m')
        .html(
          d =>
            `<p class="habitantes">Asistentes a la manifestación de <span class="numero-habitantes">${d.name}</span> en Teruel: ${d.population}`
        );

      parent
        .append('svg')
        .attr('width', w)
        .attr('height', d => (d.population / 12) * 32)
        .append('g')
        .attr('class', 'container')
        .selectAll('span')
        .data(d => layout(d3.range(0, d.population, 1)))
        .enter()
        .append('rect')
        .attr('x', d => scale(d.position.x))
        .attr('y', d => scale(d.position.y))
        .attr('rx', 1.5)
        .attr('ry', 1.5)
        .attr('width', radius * 2.5)
        .attr('height', radius * 2.5)
        .attr('fill', '#75BD4C');
    }
  }

  function loadData() {
    d3.csv('data/teruel/vox-municipios-teruel.csv', (error, data) => {
      if (error) {
        console.log(error);
      } else {
        dataz = data;
        dataz.forEach(d => {
          d.name = d.name;
          d.population = d.population;
        });

        dataz = dataz.filter(d => d.name === 'Vox');

        updateChart(dataz);
      }
    });
  }

  const resize = () => {
    updateChart();
  };

  window.addEventListener('resize', resize);

  loadData();
}

gridVox();

new SlimSelect({
  select: '#municipios-teruel',
  searchPlaceholder: 'Selecciona un municipio'
});

function conffetiTroll() {
  function r(min, max) {
    return Math.random() * (max - min) + min;
  }

  confetti({
    angle: r(55, 125),
    spread: r(50, 70),
    particleCount: r(50, 100),
    origin: {
      y: 0.6
    }
  });
}
