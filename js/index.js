var widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

function text() {
  var ara = document.querySelector('#aragones');
  var cas = document.querySelector('#castellano');
  var araDiv = document.querySelector('.aragones');
  var casDiv = document.querySelector('.castellano');

  ara.onclick = function () {
    casDiv.classList.remove('active');
    araDiv.classList.remove('hidden');
    araDiv.classList.toggle('active');
    casDiv.classList.toggle('hidden');
    ara.classList.remove('active');
    cas.classList.remove('hidden');
    ara.classList.toggle('hidden');
    cas.classList.toggle('active');
  };

  cas.onclick = function () {
    araDiv.classList.remove('active');
    casDiv.classList.remove('hidden');
    casDiv.classList.toggle('active');
    araDiv.classList.toggle('hidden');
    cas.classList.remove('active');
    ara.classList.remove('hidden');
    cas.classList.toggle('hidden');
    ara.classList.toggle('active');
  };
}

text();

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

setTimeout(function animation() {
  anime.timeline().add({
    targets: '.header-title .letter',
    translateY: [0, '1.5rem'],
    translateZ: 0,
    duration: 750,
    delay: anime.stagger(500)
  }).add({
    targets: '.letter',
    translateY: ['1.5rem', '2rem'],
    translateZ: 0,
    rotate: 45,
    duration: 750,
    delay: anime.stagger(1000)
  });
}, 1000);

var scatterDesert = function scatterDesert() {
  var margin = {
    top: 24,
    right: 24,
    bottom: 48,
    left: 72
  };
  var width = 0;
  var height = 0;
  var w = 0;
  var h = 0;
  var chart = d3.select('.scatter-desert');
  var svg = chart.select('svg');
  var scales = {};
  var habitantes = ' hab/km2';
  var dataz;

  var setupScales = function setupScales() {
    var countX = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.densidad;
    }), d3.max(dataz, function (d) {
      return d.densidad;
    })]);
    var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.densidad;
    }), d3.max(dataz, function (d) {
      return d.densidad;
    })]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var setupElements = function setupElements() {
    var g = svg.select('.scatter-desert-container');
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', 'scatter-desert-container-bis');
    g.append('circle').attr('r', 3).attr('fill', '#B41248').attr('cy', '94%').attr('cx', '4%');
    g.append('text').text('Municipios con una densidad inferior a 10hab/km2').attr('y', '95%').attr('x', '5%');
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).ticks(0);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
      return d + habitantes;
    }).tickSize(-width).ticks(10);
    g.select('.axis-y').call(axisY);
  };

  var updateChart = function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select('.scatter-desert-container');
    g.attr('transform', translate);
    updateScales(width, height);
    var container = chart.select('.scatter-desert-container-bis');
    var layer = container.selectAll('.circle-desert').data(dataz);
    var newLayer = layer.enter().append('circle').attr('class', 'circle-desert');
    layer.merge(newLayer).attr('cx', function (d) {
      return Math.random() * width;
    }).attr('cy', function (d) {
      return scales.count.y(d.densidad);
    }).attr('r', 3).attr('fill', function (d) {
      if (d.densidad >= 10) {
        return '#3b2462';
      } else {
        return '#B41248';
      }
    }).attr('fill-opacity', 0.8);
    drawAxes(g);
  };

  var resize = function resize() {
    updateChart(dataz);
  };

  var loadData = function loadData() {
    d3.csv('data/aragon-municipios.csv').then(function (data) {
      dataz = data;
      dataz.forEach(function (d) {
        d.densidad = d.densidad;
        d.municipio = d.municipio;
        d.posicion = d.posicion;
        d.year = d.year;
      });
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  };

  window.addEventListener('resize', resize);
  loadData();
};

var aragonStack = function aragonStack() {
  var margin = {
    top: 24,
    right: 8,
    bottom: 24,
    left: 32
  };
  var width = 0;
  var height = 0;
  var chart = d3.select('.aragon-stack');
  var svg = chart.select('svg');
  var scales = {};
  var dataz;
  var bisectDate = d3.bisector(function (d) {
    return d.year;
  }).left;
  var tooltipStack = chart.append('div').attr('class', 'tooltip tooltip-stack').style('opacity', 0);

  var setupScales = function setupScales() {
    var countX = d3.scaleTime().domain(d3.extent(dataz, function (d) {
      return d.year;
    }));
    var countY = d3.scaleLinear().domain([0, 100]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var setupElements = function setupElements() {
    var g = svg.select('.aragon-stack-container');
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', 'aragon-stack-container-bis');
    g.append('text').attr('class', 'legend-aragon').attr('y', '70%').attr('x', '1%').text('Zaragoza');
    g.append('text').attr('class', 'legend-aragon').attr('y', '5%').attr('x', '1%').text('Huesca');
    g.append('text').attr('class', 'legend-aragon').attr('y', '30%').attr('x', '1%').text('Teruel');
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).tickPadding(7).ticks(9);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
      return d + '%';
    }).tickSizeInner(-width).ticks(12);
    g.select('.axis-y').call(axisY);
  };

  var updateChart = function updateChart(dataz) {
    var w = chart.node().offsetWidth;
    var h = 600;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select('.aragon-stack-container');
    g.attr('transform', translate);
    g.append('rect').attr('class', 'overlay-dos');
    g.append('g').attr('class', 'focus').style('display', 'none').append('line').attr('class', 'x-hover-line hover-line').attr('y1', 0);
    var keys = dataz.columns.slice(5);
    var area = d3.area().x(function (d) {
      return scales.count.x(d.data.year);
    }).y0(function (d) {
      return scales.count.y(d[0]);
    }).y1(function (d) {
      return scales.count.y(d[1]);
    }).curve(d3.curveCardinal.tension(0.6));
    var stack = d3.stack().keys(keys).order(d3.stackOrderInsideOut);
    var stackedData = stack(dataz);
    var colors = d3.scaleOrdinal().domain(keys).range(['#F67460', '#C54073', '#5A1C7C']);
    updateScales(width, height);
    var container = chart.select('.aragon-stack-container-bis');
    var layer = container.selectAll('.area-stack').data(stackedData);
    var newLayer = layer.enter().append('path').attr('class', 'area-stack');
    layer.merge(newLayer).transition().duration(600).ease(d3.easeLinear).attr('fill', function (d) {
      return colors(d.key);
    }).attr('d', area);
    var focus = g.select('.focus');
    var overlay = g.select('.overlay-dos');
    focus.select('.x-hover-line').attr('y2', height);
    overlay.attr('width', width + margin.left + margin.right).attr('height', height).on('mouseover', function () {
      focus.style('display', null);
    }).on('mouseout', function () {
      focus.style('display', 'none');
      tooltipStack.style('opacity', 0);
    }).on('mousemove', mousemove);

    function mousemove() {
      var w = chart.node().offsetWidth;
      var x0 = scales.count.x.invert(d3.mouse(this)[0]),
          i = bisectDate(dataz, x0, 1),
          d0 = dataz[i - 1],
          d1 = dataz[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      var positionX = scales.count.x(d.year) + 33;
      var postionWidthTooltip = positionX + 200;
      var positionRightTooltip = w - positionX;
      tooltipStack.style('opacity', 1).html("\n                          <span class=\"tooltip-stack-number tooltip-stack-text\">".concat(d.year, "</span>\n                          <span class=\"tooltip-stack-text\">Huesca: <span class=\"tooltip-number\">").concat(d.huescaP, "% - ").concat(d.huesca, " hab.</span></span>\n                          <span class=\"tooltip-stack-text\">Teruel: <span class=\"tooltip-number\">").concat(d.teruelP, "% - ").concat(d.teruel, " hab.</span></span>\n                          <span class=\"tooltip-stack-text\">Zaragoza: <span class=\"tooltip-number\">").concat(d.zaragozaP, "% - ").concat(d.zaragoza, " hab.</span></span>\n                          <span class=\"tooltip-stack-text\">Total: <span class=\"tooltip-number\">").concat(d.aragon, " hab.</span></span>\n                          ")).style('top', '35%').style('left', postionWidthTooltip > w ? 'auto' : positionX + 'px').style('right', postionWidthTooltip > w ? positionRightTooltip + 'px' : 'auto');
      focus.select('.x-hover-line').attr('transform', "translate(".concat(scales.count.x(d.year), ",0)"));
    }

    drawAxes(g);
  };

  var resize = function resize() {
    updateChart(dataz);
  };

  var loadData = function loadData() {
    d3.csv('data/aragon-total.csv').then(function (data) {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  };

  window.addEventListener('resize', resize);
  loadData();
};

var line = function line(csvFile, cities) {
  var margin = {
    top: 8,
    right: 8,
    bottom: 24,
    left: 8
  };
  var width = 0;
  var height = 0;
  var chart = d3.select(".line-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var dataz;
  var habitantes = 'hab';
  var containerTooltip = d3.select(".line-province-".concat(cities));
  var tooltipPopulation = containerTooltip.append('div').attr('class', 'tooltip tooltip-population').style('opacity', 0);
  var locale = d3.formatDefaultLocale({
    decimal: ',',
    thousands: '.',
    grouping: [3]
  });

  var setupScales = function setupScales() {
    var countX = d3.scaleTime().domain([d3.min(dataz, function (d) {
      return d.year;
    }), d3.max(dataz, function (d) {
      return d.year;
    })]);
    var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.total / 1.25;
    }), d3.max(dataz, function (d) {
      return d.total * 1.25;
    })]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var setupElements = function setupElements() {
    var g = svg.select(".line-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "line-".concat(cities, "-container-bis"));
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.range([90, width]);
    scales.count.y.range([height, 0]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).ticks(9);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var localeFormat = locale.format(',.0f');
    var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
      return "".concat(localeFormat(d), " ").concat(habitantes);
    }).ticks(6).tickSizeInner(-width);
    g.select('.axis-y').call(axisY);
    g.selectAll('.axis-y .tick text').attr('x', 80).attr('dy', -5);
  };

  var updateChart = function updateChart(dataz) {
    var w = chart.node().offsetWidth;
    var h = 550;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".line-".concat(cities, "-container"));
    g.attr('transform', translate);
    var line = d3.line().x(function (d) {
      return scales.count.x(d.year);
    }).y(function (d) {
      return scales.count.y(d.total);
    });
    updateScales(width, height);
    var container = chart.select(".line-".concat(cities, "-container-bis"));
    var layer = container.selectAll('.line').data([dataz]);
    var newLayer = layer.enter().append('path').attr('class', 'line').attr('stroke-width', '1.5');
    var dots = container.selectAll('.circles').data(dataz);
    var dotsLayer = dots.enter().append('circle').attr('class', 'circles').attr('fill', '#531f4e');
    layer.merge(newLayer).attr('d', line);
    dots.merge(dotsLayer).on('mouseover', function (d) {
      var positionX = scales.count.x(d.year);
      var postionWidthTooltip = positionX + 270;
      var tooltipWidth = 210;
      var positionleft = "".concat(d3.event.pageX, "px");
      var positionright = "".concat(d3.event.pageX - tooltipWidth, "px");
      tooltipPopulation.transition();
      tooltipPopulation.style('opacity', 1).html("<p class=\"tooltip-deceased\">La poblaci\xF3n en <span class=\"tooltip-number\">".concat(d.year, "</span> era de <span class=\"tooltip-number\">").concat(d.total, "</span> habitantes<p/>")).style('left', postionWidthTooltip > w ? positionright : positionleft).style('top', "".concat(d3.event.pageY - 48, "px"));
    }).on('mouseout', function () {
      tooltipPopulation.transition().duration(200).style('opacity', 0);
    }).attr('cx', function (d) {
      return scales.count.x(d.year);
    }).attr('cy', function (d) {
      return scales.count.y(d.total);
    }).attr('r', 4);
    drawAxes(g);
  };

  var resize = function resize() {
    updateChart(dataz);
  };

  var loadData = function loadData() {
    d3.csv(csvFile).then(function (data) {
      dataz = data;
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  };

  window.addEventListener('resize', resize);
  loadData();
};

var barscatter = function barscatter(csvFile, cities) {
  var margin = {
    top: 0,
    right: 8,
    bottom: 64,
    left: 40
  };
  var width = 0;
  var height = 0;
  var w = 0;
  var h = 0;
  var chart = d3.select(".scatter-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var dataz;
  var symbolP = '%';
  var tooltip = chart.append('div').attr('class', 'tooltip tooltip-under-over').attr('id', 'tooltip-scatter').style('opacity', 0);

  var setupScales = function setupScales() {
    var countX = d3.scaleLinear().domain([0, 75]);
    var countY = d3.scaleLinear().domain([0, d3.max(dataz, function (d) {
      return d.menor * 1.75;
    })]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var setupElements = function setupElements() {
    var g = svg.select(".scatter-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "scatter-".concat(cities, "-container-bis"));
    g.append('text').attr('class', 'legend').attr('y', '97%').attr('x', '35%').style('text-anchor', 'start').text('Mayores de 65 años');
    g.append('text').attr('class', 'legend').attr('x', '-350').attr('y', '-30').attr('transform', 'rotate(-90)').style('text-anchor', 'start').text('Menores de 18 años');
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 20]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickFormat(function (d) {
      return d + symbolP;
    }).tickPadding(11).ticks(10);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
      return d + symbolP;
    }).tickSize(-width).ticks(5);
    g.select('.axis-y').call(axisY);
  };

  var updateChart = function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".scatter-".concat(cities, "-container"));
    g.attr('transform', translate);
    updateScales(width, height);
    var container = chart.select(".scatter-".concat(cities, "-container-bis"));
    var layer = container.selectAll('.scatter-circles').data(dataz);
    var newLayer = layer.enter().append('circle').attr('class', "scatter-".concat(cities, "-circles scatter-circles"));
    layer.merge(newLayer).on('mouseover', function (d) {
      tooltip.transition();
      tooltip.style('opacity', 1).html("<p class=\"tooltip-citi\">".concat(d.city, "<p/>\n                        <p class=\"tootlip-population\">Habitantes: <span class=\"tooltip-number\">").concat(d.population, "</span><p/>\n                        <p class=\"tootlip-over\">Mayores de 65: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n                        <p class=\"tootlip-under\">Menores de 18: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n                        ")).style('left', w / 2 - 150 + 'px').style('top', 100 + 'px');
    }).on('mouseout', function (d) {
      tooltip.transition().duration(200).style('opacity', 0);
    }).attr('cx', function (d) {
      return scales.count.x(d.mayor);
    }).attr('cy', function (d) {
      return scales.count.y(d.menor);
    }).attr('r', 0).transition().duration(600).ease(d3.easeQuad).attr('cx', function (d) {
      return scales.count.x(d.mayor);
    }).attr('cy', function (d) {
      return scales.count.y(d.menor);
    }).attr('r', 6);
    drawAxes(g);
  };

  var clearFilter = function clearFilter() {
    var selectButton = d3.select("#clear-filter-".concat(cities));
    selectButton.on('click', function () {
      d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
      d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
      d3.selectAll('.tooltip-percentage').remove().exit();
      new SlimSelect({
        select: "#percentage-over-city-".concat(cities),
        searchPlaceholder: 'Filtra tu municipio'
      });
      new SlimSelect({
        select: "#percentage-under-city-".concat(cities),
        searchPlaceholder: 'Filtra tu municipio'
      });
      new SlimSelect({
        select: "#select-city-".concat(cities),
        searchPlaceholder: 'Busca tu municipio'
      });
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        dataz.forEach(function (d) {
          d.mayor = +d.mayor;
          d.menor = +d.menor;
          d.city = d.name;
        });
        updateChart(dataz);
      });
    });
  };

  clearFilter();

  var menuFilter = function menuFilter() {
    d3.csv(csvFile).then(function (data) {
      datos = data;
      var nest = d3.nest().key(function (d) {
        return d.name;
      }).entries(datos);
      var selectCity = d3.select("#filter-city-".concat(cities));
      selectCity.selectAll('option').data(nest).enter().append('option').attr('value', function (d) {
        return d.key;
      }).text(function (d) {
        return d.key;
      });
      selectCity.on('change', function () {
        var filterCity = d3.select(this).property('value');
        d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
        d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
        d3.selectAll('.tooltip-percentage').remove().exit();
        new SlimSelect({
          select: "#percentage-over-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        new SlimSelect({
          select: "#percentage-under-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        update();
      });
    });
  };

  var percentageOlder = function percentageOlder() {
    var selectPercentage = d3.select("#percentage-over-city-".concat(cities));
    selectPercentage.on('change', function () {
      d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
      new SlimSelect({
        select: "#percentage-under-city-".concat(cities),
        searchPlaceholder: 'Filtra tu municipio'
      });
      new SlimSelect({
        select: "#select-city-".concat(cities),
        searchPlaceholder: 'Busca tu municipio'
      });
      var percentageCity = d3.select(this).property('value');
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
        dataz = dataz.filter(function (d) {
          return d.mayor > percentageCity;
        });
        var container = chart.select(".scatter-".concat(cities, "-container-bis"));
        d3.selectAll('.tooltip-percentage').remove().exit();
        chart.append('div').attr('class', 'tooltip tooltip-percentage').html("\n                        <p class=\"tootlip-population\"><span class=\"tooltip-number\">En ".concat(dataz.length, "</span> municipios el % de habitantes mayores de 65 a\xF1os es superior al <span class=\"tooltip-number\">").concat(percentageCity, "%</span>. <p/>\n                        ")).style('right', margin.right + 'px').style('top', 50 + 'px');
        dataz.forEach(function (d) {
          d.mayor = d.mayor;
          d.menor = d.menor;
          d.city = d.name;
        });
        updateChart(dataz);
      });
    });
  };

  var percentageUnder = function percentageUnder() {
    var selectPercentage = d3.select("#percentage-under-city-".concat(cities));
    selectPercentage.on('change', function () {
      d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
      new SlimSelect({
        select: "#percentage-over-city-".concat(cities),
        searchPlaceholder: 'Filtra tu municipio'
      });
      new SlimSelect({
        select: "#select-city-".concat(cities),
        searchPlaceholder: 'Busca tu municipio'
      });
      var percentageCity = d3.select(this).property('value');
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
        dataz = dataz.filter(function (d) {
          return d.menor > percentageCity;
        });
        var container = chart.select(".scatter-".concat(cities, "-container-bis"));
        d3.selectAll('.tooltip-percentage').remove().exit();
        chart.append('div').attr('class', 'tooltip tooltip-percentage').html("\n                        <p class=\"tootlip-population\"><span class=\"tooltip-number\">En ".concat(dataz.length, "</span> municipios el % de habitantes menores de 18 a\xF1os es superior al <span class=\"tooltip-number\">").concat(percentageCity, "%</span>. <p/>\n                        ")).style('right', margin.right + 'px').style('top', 50 + 'px');
        dataz.forEach(function (d) {
          d.mayor = d.mayor;
          d.menor = d.menor;
          d.city = d.name;
        });
        updateChart(dataz);
      });
    });
  };

  function update(filterCity) {
    d3.csv(csvFile).then(function (data) {
      dataz = data;
      var valueCity = d3.select("#filter-city-".concat(cities)).property('value');
      var revalueCity = new RegExp('^' + valueCity + '$');
      d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
      dataz = dataz.filter(function (d) {
        return String(d.name).match(revalueCity);
      });
      dataz.forEach(function (d) {
        d.mayor = +d.mayor;
        d.menor = +d.menor;
        d.city = d.name;
      });
      updateChart(dataz);
    });
  }

  var resize = function resize() {
    updateChart(dataz);
  };

  var loadData = function loadData() {
    d3.csv(csvFile).then(function (data) {
      dataz = data;
      dataz.forEach(function (d) {
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
  };

  window.addEventListener('resize', resize);
  loadData();
};

var barNegative = function barNegative(csvFile, cities) {
  var margin = {
    top: 24,
    right: 8,
    bottom: 24,
    left: 40
  };
  var width = 0;
  var height = 0;
  var w = 0;
  var h = 0;
  var chart = d3.select(".bar-negative-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var dataz;
  var tooltip = chart.append('div').attr('class', 'tooltip tooltip-negative').style('opacity', 0);

  var setupScales = function setupScales() {
    var saldoMin = d3.min(dataz, function (d) {
      return d.saldo;
    });
    var saldoMax = d3.max(dataz, function (d) {
      return d.saldo;
    });
    var saldoMaxMax = 300;
    var countX = d3.scaleBand().domain(dataz.map(function (d) {
      return d.year;
    }));
    var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.saldo * 2;
    }), d3.max(dataz, function (d) {
      if (saldoMax < saldoMaxMax) {
        return d3.max(dataz, function (d) {
          return d.saldo * 6;
        });
      } else {
        return d3.max(dataz, function (d) {
          return d.saldo * 2.5;
        });
      }
    })]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var setupElements = function setupElements() {
    var g = svg.select(".bar-negative-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "bar-negative-".concat(cities, "-container-bis"));
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.rangeRound([0, width]).paddingInner(0.2);
    scales.count.y.range([height, 0]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickValues(scales.count.x.domain().filter(function (d, i) {
      return !(i % 6);
    }));
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickFormat(d3.format('d')).ticks(5).tickSize(-width).tickPadding(8);
    g.select('.axis-y').call(axisY);
  };

  var updateChart = function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".bar-negative-".concat(cities, "-container"));
    g.attr('transform', translate);
    updateScales(width, height);
    var container = chart.select(".bar-negative-".concat(cities, "-container-bis"));
    var layer = container.selectAll('.bar-vertical').data(dataz);
    var newLayer = layer.enter().append('rect').attr('class', function (d) {
      if (d.saldo < 0) {
        return 'negative';
      } else {
        return 'positive';
      }
    });
    layer.merge(newLayer).on('mouseover', function (d) {
      tooltip.transition();
      tooltip.style('opacity', 1).html("\n                        <p class=\"tooltip-year\"><span class=\"tooltip-number\">".concat(d.year, "</span><p/>\n                        <p class=\"tooltip-born\">Nacidos: <span class=\"tooltip-number\">").concat(d.nacidos, "</span><p/>\n                        <p class=\"tooltip-deceased\">Fallecidos: <span class=\"tooltip-number\">").concat(d.fallecidos, "</span><p/>\n                        <p class=\"tooltip-deceased\">Saldo: <span class=\"tooltip-number\">").concat(d.saldo, "</span><p/>\n                        ")).style('left', w / 2 - 100 + 'px').style('top', 50 + 'px');
    }).on('mouseout', function (d) {
      tooltip.transition().duration(200).style('opacity', 0);
    }).attr('width', scales.count.x.bandwidth()).attr('x', function (d) {
      return scales.count.x(d.year);
    }).attr('y', function (d) {
      if (d.saldo > 0) {
        return scales.count.y(d.saldo);
      } else {
        return scales.count.y(0);
      }
    }).attr('height', function (d) {
      return Math.abs(scales.count.y(d.saldo) - scales.count.y(0));
    });
    drawAxes(g);
  };

  var resize = function resize() {
    updateChart(dataz);
  };

  var loadData = function loadData() {
    d3.csv(csvFile).then(function (data) {
      dataz = data;
      dataz.forEach(function (d) {
        d.year = d.year;
        d.saldo = d.saldo;
        d.nacidos = d.nacidos;
        d.fallecidos = d.fallecidos;
      });
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  };

  window.addEventListener('resize', resize);
  loadData();
};

var linePopulation = function linePopulation(csvFile, cities) {
  if (widthMobile > 544) {
    margin = {
      top: 16,
      right: 8,
      bottom: 24,
      left: 62
    };
  } else {
    margin = {
      top: 16,
      right: 8,
      bottom: 24,
      left: 32
    };
  }

  var width = 0;
  var height = 0;
  var chart = d3.select(".line-population-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var datos;
  var tooltipOver;
  var containerTooltip = d3.select(".".concat(cities, "-line"));
  var tooltipPopulation = containerTooltip.append('div').attr('class', 'tooltip tooltip-population').style('opacity', 0);

  var setupScales = function setupScales() {
    var countX = d3.scaleTime().domain([d3.min(datos, function (d) {
      return d.year;
    }), d3.max(datos, function (d) {
      return d.year;
    })]);
    var countY = d3.scaleLinear().domain([0, d3.max(datos, function (d) {
      return d.population;
    }) * 1.25]);
    scales.count = {
      x: countX,
      y: countY
    };
  };

  var tooltips = function tooltips(data) {
    var w = chart.node().offsetWidth;
    tooltipOver = chart.append('div').attr('class', 'tooltip tooltip-over');
    var totalLose = datos[0].population - datos.slice(-1)[0].population;
    var totalWin = datos.slice(-1)[0].population - datos[0].population;
    var percentageL = (totalLose * 100 / datos[0].population).toFixed(2);
    var percentageW = (totalWin * 100 / datos[0].population).toFixed(2);

    if (datos[0].population > datos.slice(-1)[0].population) {
      tooltipOver.data(datos).html(function (d) {
        return "\n                    <p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha disminuido en un <span class=\"tooltip-number\">".concat(percentageL, "%</span><p/>\n                    <p class=\"tooltip-deceased\">Mayores de 65 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n                    <p class=\"tooltip-deceased\">Menores de 18 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n                    ");
      }).transition().duration(300).style('top', 20 + 'px');
    } else {
      tooltipOver.data(datos).html(function (d) {
        return "\n                        <p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha aumentado en un <span class=\"tooltip-number\">".concat(percentageW, "%</span><p/>\n                        <p class=\"tooltip-deceased\">Mayores de 65 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n                        <p class=\"tooltip-deceased\">Menores de 18 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n                        ");
      }).transition().duration(300).style('top', 90 + '%');
    }
  };

  var setupElements = function setupElements() {
    var g = svg.select(".line-population-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "line-population-".concat(cities, "-container-bis"));
  };

  var updateScales = function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  };

  var drawAxes = function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickPadding(5).tickFormat(d3.format('d')).ticks(13);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).transition().duration(300).ease(d3.easeLinear).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickPadding(5).tickFormat(d3.format('d')).tickSize(-width).ticks(6);
    g.select('.axis-y').transition().duration(300).ease(d3.easeLinear).call(axisY);
  };

  function updateChart(data) {
    var w = chart.node().offsetWidth;
    var h = 500;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".line-population-".concat(cities, "-container"));
    g.attr('transform', translate);
    var line = d3.line().x(function (d) {
      return scales.count.x(d.year);
    }).y(function (d) {
      return scales.count.y(d.population);
    });
    updateScales(width, height);
    var container = chart.select(".line-population-".concat(cities, "-container-bis"));
    var lines = container.selectAll('.lines').data([datos]);
    var dots = container.selectAll('.circles-population').remove().exit().data(datos);
    var newLines = lines.enter().append('path').attr('class', 'lines');
    lines.merge(newLines).transition().duration(400).ease(d3.easeLinear).attrTween('d', function (d) {
      var previous = d3.select(this).attr('d');
      var current = line(d);
      return d3.interpolatePath(previous, current);
    });
    var dotsLayer = dots.enter().append('circle').attr('class', 'circles-population').attr('fill', '#531f4e');
    dots.merge(dotsLayer).on('mouseover', function (d) {
      var positionX = scales.count.x(d.year);
      var postionWidthTooltip = positionX + 270;
      var tooltipWidth = 210;
      var positionleft = "".concat(d3.event.pageX, "px");
      var positionright = "".concat(d3.event.pageX - tooltipWidth, "px");
      tooltipPopulation.transition();
      tooltipPopulation.style('opacity', 1).html("<p class=\"tooltip-deceased\">La poblaci\xF3n en <span class=\"tooltip-number\">".concat(d.year, "</span> era de <span class=\"tooltip-number\">").concat(d.population, "</span> habitantes<p/>")).style('left', postionWidthTooltip > w ? positionright : positionleft).style('top', "".concat(d3.event.pageY - 48, "px"));
    }).on('mouseout', function () {
      tooltipPopulation.transition().duration(200).style('opacity', 0);
    }).attr('cx', function (d) {
      return scales.count.x(d.year);
    }).attr('cy', function (d) {
      return scales.count.y(d.population);
    }).attr('r', 0).transition().duration(400).ease(d3.easeLinear).attr('cx', function (d) {
      return scales.count.x(d.year);
    }).attr('cy', function (d) {
      return scales.count.y(d.population);
    }).attr('r', 4);
    drawAxes(g);
  }

  function update(mes) {
    d3.csv(csvFile).then(function (data) {
      datos = data;
      var valueCity = d3.select("#select-city-".concat(cities)).property('value');
      var revalueCity = new RegExp('^' + valueCity + '$');
      datos = datos.filter(function (d) {
        return String(d.name).match(revalueCity);
      });
      datos.forEach(function (d) {
        d.population = +d.population;
        d.year = +d.year;
      });
      scales.count.x.range([0, width]);
      scales.count.y.range([height, 0]);
      var countX = d3.scaleTime().domain([d3.min(datos, function (d) {
        return d.year;
      }), d3.max(datos, function (d) {
        return d.year;
      })]);
      var countY = d3.scaleLinear().domain([0, d3.max(datos, function (d) {
        return d.population;
      }) * 1.25]);
      scales.count = {
        x: countX,
        y: countY
      };
      updateChart();
      var totalLose = datos[0].population - datos.slice(-1)[0].population;
      var totalWin = datos.slice(-1)[0].population - datos[0].population;
      var percentageL = (totalLose * 100 / datos[0].population).toFixed(2);
      var percentageW = (totalWin * 100 / datos[0].population).toFixed(2);

      if (datos[0].population > datos.slice(-1)[0].population) {
        tooltipOver.data(datos).html(function (d) {
          return "\n                                  <p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha disminuido en un <span class=\"tooltip-number\">".concat(percentageL, "%</span><p/>\n                                  <p class=\"tooltip-deceased\">Mayores de 65 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n                                  <p class=\"tooltip-deceased\">Menores de 18 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n                                  ");
        }).transition().duration(300).style('top', 20 + 'px');
      } else {
        tooltipOver.data(datos).html(function (d) {
          return "\n                                      <p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha aumentado en un <span class=\"tooltip-number\">".concat(percentageW, "%</span><p/>\n                                      <p class=\"tooltip-deceased\">Mayores de 65 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n                                      <p class=\"tooltip-deceased\">Menores de 18 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n                                      ");
        }).transition().duration(300).style('top', 75 + '%');
      }
    });
  }

  var resize = function resize() {
    updateChart();
  };

  var menuMes = function menuMes() {
    d3.csv(csvFile).then(function (data) {
      datos = data;
      var nest = d3.nest().key(function (d) {
        return d.select;
      }).entries(datos);
      var selectCity = d3.select("#select-city-".concat(cities));
      selectCity.selectAll('option').data(nest).enter().append('option').attr('value', function (d) {
        return d.key;
      }).text(function (d) {
        return d.key;
      });
      selectCity.on('change', function () {
        var mes = d3.select(this).property('value');
        update();
      });
    });
  };

  var loadData = function loadData() {
    d3.csv(csvFile).then(function (data) {
      datos = data;
      datos.forEach(function (d) {
        d.year = +d.year;
        d.name = d.name;
        d.population = +d.population;
      });
      setupElements();
      setupScales();
      updateChart();
      tooltips();
      mes = datos[0].name;
      update(mes);
    });
  };

  window.addEventListener('resize', resize);
  loadData();
  menuMes();
};

menu();
scatterDesert();
aragonStack();
csvTotal = ['data/huesca/huesca-total.csv', 'data/teruel/teruel-total.csv', 'data/zaragoza/zaragoza-total.csv'];
csvUnder = ['data/huesca/huesca-mayor-menor.csv', 'data/teruel/mayor-menor-teruel.csv', 'data/zaragoza/zaragoza-mayor-menor.csv'];
csvBalance = ['data/huesca/saldo-vegetativo-total-huesca.csv', 'data/teruel/saldo-vegetativo-total-teruel.csv', 'data/zaragoza/saldo-vegetativo-total-zaragoza.csv'];
csvCities = ['data/huesca/huesca.csv', 'data/teruel/teruel.csv', 'data/zaragoza/zaragoza.csv'];
csvLB = ['data/2015-2018/huesca/huesca-total.csv', 'data/2015-2018/teruel/teruel-total.csv', 'data/2015-2018/zaragoza/zaragoza-total.csv'];
cities = ['huesca', 'teruel', 'zaragoza'];
linePopulation(csvCities[0], cities[0]);
linePopulation(csvCities[1], cities[1]);
linePopulation(csvCities[2], cities[2]);
line(csvTotal[0], cities[0]);
line(csvTotal[1], cities[1]);
line(csvTotal[2], cities[2]);
barscatter(csvUnder[0], cities[0]);
barscatter(csvUnder[1], cities[1]);
barscatter(csvUnder[2], cities[2]);
barNegative(csvBalance[0], cities[0]);
barNegative(csvBalance[1], cities[1]);
barNegative(csvBalance[2], cities[2]);
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
