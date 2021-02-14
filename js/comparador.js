function menu() {
  var overlay = document.querySelector('.overlay');
  var navigation = document.querySelector('.navegacion');
  var body = document.querySelector('body');
  var elementBtn = document.querySelectorAll('.navegacion-btn');
  var burger = document.querySelector('.burger');

  function classToggle() {
    burger.classList.toggle('clicked');
    overlay.classList.toggle('show');
    navigation.classList.toggle('show');
    body.classList.toggle('overflow');
  }

  document.querySelector('.burger').addEventListener('click', classToggle);
  document.querySelector('.overlay').addEventListener('click', classToggle);

  for (i = 0; i < elementBtn.length; i++) {
    elementBtn[i].addEventListener('click', function () {
      removeClass();
    });
  }

  function removeClass() {
    overlay.classList.remove('show');
    navigation.classList.remove('show');
    burger.classList.remove('clicked');
  }
}

var widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

menu();

function grid() {
  var ciudad;
  var chart = d3.select('.grid-chart-element');
  var gridCharts = d3.select('.container-chart');
  var layout;
  var diferencia;

  function res() {
    if (widthMobile > 544) {
      gridWidth = 12;
      layout = d3_iconarray.layout().width(12).height(8);
      w = gridCharts.node().offsetWidth / 3;
      return {
        gridWidth: gridWidth,
        w: w
      };
    } else {
      gridWidth = 20;
      w = gridCharts.node().offsetWidth;
      layout = d3_iconarray.layout().width(14).height(8);
      return {
        gridWidth: gridWidth,
        w: w
      };
    }
  }

  res();
  var radius = 8;
  var margin = {
    top: radius,
    right: radius,
    bottom: radius,
    left: radius
  };
  var scale = d3.scaleLinear().range([0, w - (margin.left + margin.right)]).domain([0, gridWidth]);

  function updateChart(dataz) {
    chart.selectAll('.temas').remove().exit().data(dataz).enter().append('div').attr('class', 'temas').call(arrayBars, true);

    function arrayBars(parent, widthFirst) {
      layout.widthFirst(widthFirst);
      parent.append('h3').attr('class', 'title-m').html(function (d) {
        return "<p class=\"habitantes\">N\xFAmero de habitantes en <span class=\"numero-habitantes\">".concat(d.name, "</span>: ").concat(d.population);
      });
      parent.append('svg').attr('width', w).attr('height', function (d) {
        return d.population / 12 * 32;
      }).append('g').attr('class', 'container').selectAll('rect').data(function (d) {
        return layout(d3.range(0, d.population, 1));
      }).enter().append('rect').attr('x', function (d) {
        return scale(d.position.x);
      }).attr('y', function (d) {
        return scale(d.position.y);
      }).attr('rx', 1.5).attr('ry', 1.5).attr('width', 0).attr('height', 0).transition().delay(function (d, i) {
        return i * 5;
      }).duration(250).attr('width', radius * 2.5).attr('height', radius * 2.5).attr('fill', '#1d7351');
    }
  }

  var menuCity = function menuCity() {
    d3.csv('data/teruel/vox-municipios-teruel.csv', function (error, data) {
      if (error) {
        console.log(error);
      } else {
        datos = data;
        var nest = d3.nest().key(function (d) {
          return d.name;
        }).entries(datos);
        var selectCity = d3.select('#municipios-teruel');
        selectCity.selectAll('option').data(nest).enter().append('option').attr('value', function (d) {
          return d.key;
        }).text(function (d) {
          return d.key;
        });
        selectCity.on('change', function () {
          var city = d3.select(this).property('value');
          loadData(city);
        });
      }
    });
  };

  function loadData(city) {
    ciudad = city === undefined ? 'Ababuj' : city;
    d3.csv('data/teruel/vox-municipios-teruel.csv', function (error, data) {
      if (error) {
        console.log(error);
      } else {
        dataz = data;
        dataz.forEach(function (d) {
          d.name = d.name;
          d.population = d.population;
        });
        dataz = dataz.filter(function (d) {
          return d.name === ciudad;
        });

        if (dataz[0].population > 100) {
          conffetiTroll();
        }

        diferencia = dataz[0].population - 100;

        if (diferencia > 0) {
          d3.select('.grid-chart-diferencia').html(function (d) {
            return "<p class=\"diferencia-habitantes\"><span class=\"numero-diferencia\">".concat(dataz[0].name, "</span> tiene <span class=\"numero-diferencia\">").concat(diferencia, "</span> habitantes m\xE1s que la manifestaci\xF3n de Vox. ");
          });
        } else {
          d3.select('.grid-chart-diferencia').html(function (d) {
            return "<p class=\"diferencia-habitantes\"><span class=\"numero-diferencia\">".concat(dataz[0].name, "</span> tiene menos habitantes m\xE1s que la manifestaci\xF3n de Vox. ");
          });
        }

        updateChart(dataz);
      }
    });
  }

  var resize = function resize() {
    loadData(ciudad);
  };

  ciudad = 'Arens de Lledó';
  window.addEventListener('resize', resize);
  menuCity();
  loadData(ciudad);
}

grid();

function gridVox() {
  var chart = d3.select('.grid-chart-element-vox');
  var gridCharts = d3.select('.container-chart');
  var layout;

  function res() {
    if (widthMobile > 544) {
      gridWidth = 12;
      layout = d3_iconarray.layout().width(12).height(8);
      w = gridCharts.node().offsetWidth / 3;
      return {
        gridWidth: gridWidth,
        w: w
      };
    } else {
      gridWidth = 20;
      w = gridCharts.node().offsetWidth;
      layout = d3_iconarray.layout().width(14).height(8);
      return {
        gridWidth: gridWidth,
        w: w
      };
    }
  }

  res();
  var radius = 8;
  var margin = {
    top: radius,
    right: radius,
    bottom: radius,
    left: radius
  };
  var scale = d3.scaleLinear().range([0, w - (margin.left + margin.right)]).domain([0, gridWidth]);

  function updateChart(dataz) {
    chart.selectAll('.temas').data(dataz).enter().append('div').attr('class', 'temas').call(arrayBars, true);

    function arrayBars(parent, widthFirst) {
      layout.widthFirst(widthFirst);
      parent.append('h3').attr('class', 'title-m').html(function (d) {
        return "<p class=\"habitantes\">Asistentes a la manifestaci\xF3n de <span class=\"numero-habitantes\">".concat(d.name, "</span> en Teruel: ").concat(d.population);
      });
      parent.append('svg').attr('width', w).attr('height', function (d) {
        return d.population / 12 * 32;
      }).append('g').attr('class', 'container').selectAll('span').data(function (d) {
        return layout(d3.range(0, d.population, 1));
      }).enter().append('rect').attr('x', function (d) {
        return scale(d.position.x);
      }).attr('y', function (d) {
        return scale(d.position.y);
      }).attr('rx', 1.5).attr('ry', 1.5).attr('width', radius * 2.5).attr('height', radius * 2.5).attr('fill', '#75BD4C');
    }
  }

  function loadData() {
    d3.csv('data/teruel/vox-municipios-teruel.csv', function (error, data) {
      if (error) {
        console.log(error);
      } else {
        dataz = data;
        dataz.forEach(function (d) {
          d.name = d.name;
          d.population = d.population;
        });
        dataz = dataz.filter(function (d) {
          return d.name === 'Vox';
        });
        updateChart(dataz);
      }
    });
  }

  var resize = function resize() {
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
