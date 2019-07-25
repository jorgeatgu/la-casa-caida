const widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

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
        elementBtn[i].addEventListener('click', function() {
            removeClass();
            console.log('click');
        });
    }

    function removeClass() {
        overlay.classList.remove('show');
        navigation.classList.remove('show');
        burger.classList.remove('clicked');
    }
}

const csvLB = [
    'data/2015-2018/huesca/huesca-total.csv',
    'data/2015-2018/teruel/teruel-total.csv',
    'data/2015-2018/zaragoza/zaragoza-total.csv'
]

const cities = ['huesca', 'teruel', 'zaragoza'];

const lineLB = (csvFile, cities) => {
    const margin = { top: 16, right: 16, bottom: 24, left: 62 };
    let width = 0;
    let height = 0;
    const chart = d3.select(`.line-lb-${cities}`);
    const svg = chart.select('svg');
    let scales = {};
    let datos;


    const setupScales = () => {
        const countX = d3
            .scaleTime()
            .domain([
                2011,
                2018,
            ]);

        const countY = d3
            .scaleLinear()
            .domain([d3.min(datos, (d) => (d.population * 1.5) - d.population), d3.max(datos, (d) => d.population) * 1.25]);

        scales.count = { x: countX, y: countY };
    };


    const setupElements = () => {
        const g = svg.select(`.line-lb-${cities}-container`);

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', `line-lb-${cities}-container-bis`);
    };

    const updateScales = (width, height) => {
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 0]);
    };

    const drawAxes = (g) => {
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
            .y((d) => scales.count.y(d.population));

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
                var previous = d3.select(this).attr('d');
                var current = line(d);
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
        d3.csv(csvFile, (error, data) => {
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
                    2018,
                ]);

            const countY = d3
                .scaleLinear()
                .domain([d3.min(datos, (d) => (d.population * 1.1) - d.population), d3.max(datos, (d) => d.population) * 1.25]);

            scales.count = { x: countX, y: countY };
            updateChart(datos);


        });
    }

    const resize = () => {
        updateChart(datos);
    };

    const menuMes = () => {
        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                datos = data;

                const nest = d3
                    .nest()
                    .key((d) => d.name)
                    .entries(datos);

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
            }
        });
    };

    const loadData = () => {
        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
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
            }
        });
    };

    window.addEventListener('resize', resize);

    loadData();
    menuMes();
};

lineLB();

lineLB(csvLB[0], cities[0]);
lineLB(csvLB[1], cities[1]);
lineLB(csvLB[2], cities[2]);


const scatterLB = () => {
    const margin = { top: 24, right: 24, bottom: 24, left: 32 };
    let width = 0;
    let height = 0;
    let w = 0;
    let h = 0;
    const chart = d3.select('.chart-lluvia-scatter');
    const svg = chart.select('svg');
    const scales = {};
    const temp = '%';
    let dataz;

    const setupScales = () => {
        const countX = d3.scaleLinear().domain(d3.extent(dataz, (d) => d.cp));

        const countY = d3.scaleLinear().domain([
            d3.min(dataz, function(d) {
                return d.diferencia;
            }),
            d3.max(dataz, function(d) {
                return d.diferencia;
            })
        ]);

        scales.count = { x: countX, y: countY };
    };

    const setupElements = () => {
        const g = svg.select('.chart-lluvia-scatter-container');

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', 'area-container-chart-scatter');
    };

    const updateScales = (width, height) => {
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 20]);
    };

    const drawAxes = (g) => {
        const axisX = d3
            .axisBottom(scales.count.x)
            .tickFormat(d3.format('d'))
            .ticks(20);

        g.select('.axis-x')
    .attr('transform', `translate(0,${height})`)
    .call(axisX);

        const axisY = d3
            .axisLeft(scales.count.y)
            .tickFormat(function(d) {
                return d + temp;
            })
            .tickSize(-width)
            .ticks(5);

        g.select('.axis-y').call(axisY);
    };

    const updateChart = (dataz) => {
        w = chart.node().offsetWidth;
        h = 600;

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg.attr('width', w).attr('height', h);

        const translate = `translate(${margin.left},${margin.top})`;

        const g = svg.select('.chart-lluvia-scatter-container');

        g.attr('transform', translate);

        updateScales(width, height);

        const container = chart.select('.area-container-chart-scatter');

        const layer = container.selectAll('.scatter-circles').data(dataz);

        const newLayer = layer
            .enter()
            .append('circle')
            .attr('class', 'scatter-circles');

        layer
            .merge(newLayer)
            .attr('cx', (d) => scales.count.x(d.cp))
            .attr('cy', (d) => scales.count.y(d.diferencia))
            .attr('r', 6)
            .attr('fill-opacity', 0.6)
            .attr('fill', (d) => {
                if (d.diferencia > 0) {
                    return '#000';
                } else if (d.diferencia === 0) {
                    return '#ccc';
                } else {

                    return '#9A312F';
                }
            });


        drawAxes(g);
    };

    const resize = () => {
        updateChart(dataz);
    };

    const loadData = () => {
        d3.csv('csv/teruel2015-2018.csv', (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data;
                dataz.forEach((d) => {
                    d.diferencia = +d.diferencia;
                    d.year15 = +d.year15;
                    d.year18 = +d.year18;
                });
                setupElements();
                setupScales();
                updateChart(dataz);
            }
        });
    };

    window.addEventListener('resize', resize);

    loadData();
};


new SlimSelect({
    select: '#select-lb-huesca',
    searchPlaceholder: 'Busca tu municipio',
});

new SlimSelect({
    select: '#select-lb-zaragoza',
    searchPlaceholder: 'Busca tu municipio',
});+

new SlimSelect({
    select: '#select-lb-teruel',
    searchPlaceholder: 'Busca tu municipio',
});

menu();
scatterLB();
