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

var lineLB = function lineLB(csvFile, cities) {
  var margin = {
    top: 16,
    right: 16,
    bottom: 24,
    left: 62
  };
  var width = 0;
  var height = 0;
  var chart = d3.select(".line-lb-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var datos;

  function setupScales() {
    var countX = d3.scaleTime().domain([2011, 2019]);
    var countY = d3.scaleLinear().domain([d3.min(datos, function (d) {
      return d.population * 1.75 - d.population;
    }), d3.max(datos, function (d) {
      return d.population;
    }) * 1.25]);
    scales.count = {
      x: countX,
      y: countY
    };
  }

  function setupElements() {
    var g = svg.select(".line-lb-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "line-lb-".concat(cities, "-container-bis"));
  }

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickPadding(5).tickFormat(d3.format('d')).ticks(13);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).transition().duration(300).ease(d3.easeLinear).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickPadding(5).tickFormat(d3.format('d')).tickSize(-width).ticks(6);
    g.select('.axis-y').transition().duration(300).ease(d3.easeLinear).call(axisY);
  }

  function updateChart(data) {
    var w = chart.node().offsetWidth;
    var h = 500;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".line-lb-".concat(cities, "-container"));
    g.attr('transform', translate);
    var line = d3.line().x(function (d) {
      return scales.count.x(d.year);
    }).y(function (d) {
      return scales.count.y(d.population);
    }).curve(d3.curveCardinal.tension(0.6));
    updateScales(width, height);
    var container = chart.select(".line-lb-".concat(cities, "-container-bis"));
    var lines = container.selectAll('.lines').data([datos]);
    var dots = container.selectAll('.circles-population').remove().exit().data(datos);
    var newLines = lines.enter().append('path').attr('class', 'lines');
    lines.merge(newLines).transition().duration(400).ease(d3.easeLinear).attrTween('d', function (d) {
      var previous = d3.select(this).attr('d');
      var current = line(d);
      return d3.interpolatePath(previous, current);
    });
    var dotsLayer = dots.enter().append('circle').attr('class', 'circles-population').attr('fill', '#531f4e');
    dots.merge(dotsLayer).attr('cx', function (d) {
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
      var valueCity = d3.select("#select-lb-".concat(cities)).property('value');
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
      var countX = d3.scaleTime().domain([2011, 2019]);
      var countY = d3.scaleLinear().domain([d3.min(datos, function (d) {
        return d.population * 1.75 - d.population;
      }), d3.max(datos, function (d) {
        return d.population;
      }) * 1.25]);
      scales.count = {
        x: countX,
        y: countY
      };
      updateChart();
    });
  }

  function resize() {
    updateChart();
  }

  function menuMes() {
    d3.csv(csvFile).then(function (data) {
      var nest = d3.nest().key(function (d) {
        return d.name;
      }).entries(data);
      var selectCity = d3.select("#select-lb-".concat(cities));
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
  }

  function loadData() {
    d3.csv(csvFile).then(function (data) {
      datos = data;
      datos.forEach(function (d) {
        d.year = +d.year;
        d.population = +d.population;
        d.cp = +d.cp;
      });
      setupElements();
      setupScales();
      updateChart();
      var mes = datos[0].name;
      update();
    });
  }
  window.addEventListener('resize', resize);
  loadData();
  menuMes();
};

new SlimSelect({
  select: '#select-lb-huesca',
  searchPlaceholder: 'Busca tu municipio'
});
new SlimSelect({
  select: '#select-lb-zaragoza',
  searchPlaceholder: 'Busca tu municipio'
});
new SlimSelect({
  select: '#select-lb-teruel',
  searchPlaceholder: 'Busca tu municipio'
});
menu();

var scatterLB = function scatterLB(csvFile, cities) {
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
  var chart = d3.select(".scatter-lb-".concat(cities));
  var svg = chart.select('svg');
  var scales = {};
  var habitantes = '%';
  var dataz;
  var lossP;
  var winP;
  var tooltip = d3.select(".scatter-lb-".concat(cities)).append('div').attr('class', 'tooltip tooltip-scatter-lb').style('opacity', 0);

  function setupScales() {
    var countX = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.percentage;
    }), d3.max(dataz, function (d) {
      return d.percentage;
    })]);
    var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
      return d.percentage * 1.25;
    }), d3.max(dataz, function (d) {
      return d.percentage;
    })]);
    scales.count = {
      x: countX,
      y: countY
    };
  }

  function setupElements() {
    var g = svg.select(".scatter-lb-".concat(cities, "-container"));
    g.append('g').attr('class', 'axis axis-x');
    g.append('g').attr('class', 'axis axis-y');
    g.append('g').attr('class', "scatter-lb-".concat(cities, "-container-bis"));
    g.append('circle').attr('r', 3).attr('fill', '#B41248').attr('cy', '94%').attr('cx', '4%');
    g.append('circle').attr('r', 3).attr('fill', '#3b2462').attr('cy', '90%').attr('cx', '4%');
    g.append('text').text("Municipios que han perdido poblaci\xF3n. Total: ".concat(lossP.length)).attr('y', '95%').attr('x', '5%');
    g.append('text').text("Municipios que han ganado poblaci\xF3n. Total: ".concat(winP.length)).attr('y', '91%').attr('x', '5%');
  }

  function updateScales(width, height) {
    scales.count.x.range([0, width]);
    scales.count.y.range([height, 0]);
  }

  function drawAxes(g) {
    var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).ticks(0);
    g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
    var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
      return d + habitantes;
    }).tickSize(-width).ticks(10);
    g.select('.axis-y').call(axisY);
  }

  function updateChart(dataz) {
    w = chart.node().offsetWidth;
    h = 600;
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    svg.attr('width', w).attr('height', h);
    var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
    var g = svg.select(".scatter-lb-".concat(cities, "-container"));
    g.attr('transform', translate);
    updateScales(width, height);
    var container = chart.select(".scatter-lb-".concat(cities, "-container-bis"));
    var layer = container.selectAll('.circle-desert').data(dataz);
    var newLayer = layer.enter().append('circle').attr('class', 'circle-desert');
    layer.merge(newLayer).attr('cx', function (d) {
      return Math.random() * width;
    }).attr('cy', function (d) {
      return scales.count.y(d.percentage);
    }).attr('r', 4).on('mouseover', function (d) {
      var positionX = scales.count.x(d.cp);
      var postionWidthTooltip = positionX + 270;
      var tooltipWidth = 210;
      var positionleft = "".concat(d3.event.pageX, "px");
      var positionright = "".concat(d3.event.pageX - tooltipWidth, "px");
      tooltip.transition();
      var tooltipHeader = d.percentage > 0 ? "<p class=\"tooltip-scatter-text\"><strong>".concat(d.name, "</strong> ha aumentado su poblaci\xF3n un <strong>").concat(d.percentage, "%</strong>.<p/>") : d.percentage === 0 ? "<p class=\"tooltip-scatter-text\"><strong>".concat(d.name, "</strong> no ha aumentado ni disminuido su poblaci\xF3n.<p/>") : "<p class=\"tooltip-scatter-text\"><strong>".concat(d.name, "</strong> ha disminuido su poblaci\xF3n un <strong>").concat(d.percentage, "%</strong>.<p/>");
      tooltip.style('opacity', 1).html("".concat(tooltipHeader, "\n            <p class=\"tooltip-scatter-text\">Poblaci\xF3n en 2018: <strong>").concat(d.dosmildieciocho, "</strong><p/>\n            <p class=\"tooltip-scatter-text\">Poblaci\xF3n en 2019: <strong>").concat(d.dosmildiecinueve, "</strong><p/>")).style('left', postionWidthTooltip > w ? positionright : positionleft).style('top', "".concat(d3.event.pageY - 100, "px"));
    }).on('mouseout', function () {
      tooltip.transition().duration(200).style('opacity', 0);
    }).attr('fill', function (d) {
      return d.percentage >= 0 ? '#3b2462' : d.percentage === 0 ? '#111' : '#B41248';
    }).attr('fill-opacity', 0.8);
    drawAxes(g);
  }

  function resize() {
    updateChart(dataz);
  }

  function loadData() {
    d3.csv(csvFile).then(function (data) {
      dataz = data;
      lossP = dataz.filter(function (d) {
        return d.percentage < 0;
      });
      winP = dataz.filter(function (d) {
        return d.percentage > 0;
      });
      setupElements();
      setupScales();
      updateChart(dataz);
    });
  }
  window.addEventListener('resize', resize);
  loadData();
};

var cities = [{
  city: 'huesca',
  comparatorCSV: 'data/evolucion/huesca/huesca-total.csv',
  evolutionCSV: 'data/huesca/2018-2019-huesca.csv'
}, {
  city: 'teruel',
  comparatorCSV: 'data/evolucion/teruel/teruel-total.csv',
  evolutionCSV: 'data/teruel/2018-2019-teruel.csv'
}, {
  city: 'zaragoza',
  comparatorCSV: 'data/evolucion/zaragoza/zaragoza-total.csv',
  evolutionCSV: 'data/zaragoza/2018-2019-zaragoza.csv'
}];
cities.map(function (element) {
  var comparatorCSV = element.comparatorCSV,
      city = element.city,
      evolutionCSV = element.evolutionCSV;
  lineLB(comparatorCSV, city);
  scatterLB(evolutionCSV, city);
});
