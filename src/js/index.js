function animation() {
    anime.timeline()
        .add({
            targets: '.header-title .letter',
            translateY: [0, "1.5rem"],
            translateZ: 0,
            duration: 750,
            delay: anime.stagger(500)
        }).add({
            targets: '.letter',
            translateY: ["1.5rem", "2rem"],
            translateZ: 0,
            rotate: 45,
            duration: 750,
            delay: anime.stagger(1000)
        });
}

animation();

csvTotal = ['data/huesca/huesca-total.csv', 'data/teruel/teruel-total.csv', 'data/zaragoza/zaragoza-total.csv'];

csvUnder = ['data/huesca/huesca-mayor-menor.csv', 'data/teruel/mayor-menor-teruel.csv', 'data/zaragoza/zaragoza-mayor-menor.csv'];

csvBalance = ['data/huesca/saldo-vegetativo-total-huesca.csv', 'data/teruel/saldo-vegetativo-total-teruel.csv'];

cities = ['huesca', 'teruel', 'zaragoza'];

const line = (csvFile, cities) => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 0, right: 24, bottom: 24, left: 72 };
    let width = 0;
    let height = 0;
    const chart = d3.select(`.line-${cities}`);
    const svg = chart.select('svg');
    const scales = {};
    let dataz;

    var locale = d3.formatDefaultLocale({
        decimal: ",",
        thousands: ".",
        grouping: [3]
    });

    var format = locale.format(",.3f");

    //Escala para los ejes X e Y
    const setupScales = () => {

        const countX = d3.scaleTime()
            .domain([d3.min(dataz, d => d.year),
                d3.max(dataz, d => d.year)
            ]);

        const countY = d3.scaleLinear()
            .domain([d3.min(dataz, d => d.total / 1.25), d3.max(dataz, d => d.total * 1.25)]);

        scales.count = { x: countX, y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select(`.line-${cities}-container`);

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', `line-${cities}-container-bis`);

    }

    //Actualizando escalas
    const updateScales = (width, height) => {
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 0]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .tickFormat(d3.format("d"))
            .ticks(13)

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX)

        const axisY = d3.axisLeft(scales.count.y)
            .tickFormat(locale.format(",.0f"))
            .ticks(6)
            .tickSizeInner(-width)

        g.select(".axis-y")
            .call(axisY)
    }

    const updateChart = (dataz) => {
        const w = chart.node().offsetWidth;
        const h = 550;

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg
            .attr('width', w)
            .attr('height', h);

        const translate = "translate(" + margin.left + "," + margin.top + ")";

        const g = svg.select(`.line-${cities}-container`);

        g.attr("transform", translate)

        const line = d3.line()
            .x(d => scales.count.x(d.year))
            .y(d => scales.count.y(d.total))
            .curve(d3.curveBasis);

        updateScales(width, height)

        const container = chart.select(`.line-${cities}-container-bis`);

        const layer = container.selectAll('.line')
            .data([dataz])

        const newLayer = layer.enter()
            .append('path')
            .attr('class', 'line')
            .attr('stroke-width', '1.5')

        /*const dots = container.selectAll('.circles')
            .data(dataz)

        const dotsLayer = dots.enter()
            .append("circle")
            .attr("class", "circles")
            .attr("fill", "#921d5d")*/

        layer.merge(newLayer)
            .attr('d', line)

        /* dots.merge(dotsLayer)
             .attr("cx", d => scales.count.x(d.year))
             .attr("cy", d => scales.count.y(d.total))
             .attr('r', 3)*/

        drawAxes(g)

    }

    const resize = () => {
        updateChart(dataz)
    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data
                dataz.forEach(d => {
                    d.year = d.year;
                    d.total = d.total;
                });
                setupElements()
                setupScales()
                updateChart(dataz)
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

const barscatter = (csvFile, cities) => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 24, right: 24, bottom: 62, left: 62 };
    let width = 0;
    let height = 0;
    let w = 0;
    let h = 0;
    const chart = d3.select(`.scatter-${cities}`);
    const svg = chart.select('svg');
    const scales = {};
    let dataz;
    let symbolP = "%";
    const tooltip = chart.append("div")
        .attr("class", "tooltip tooltip-under-over")
        .attr("id", "tooltip-scatter")
        .style("opacity", 0);

    //Escala para los ejes X e Y
    const setupScales = () => {

        const countX = d3.scaleLinear()
            .domain([0, 70]);


        const countY = d3.scaleLinear()
            .domain([0, d3.max(dataz, d => d.menor * 1.75)]);

        scales.count = { x: countX, y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select(`.scatter-${cities}-container`);

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', `scatter-${cities}-container-bis`);

        g.append("text")
            .attr("class", "legend")
            .attr("y", "94%")
            .attr("x", "35%")
            .style("text-anchor", "start")
            .text("Mayores de 65 años");

        g.append("text")
            .attr("class", "legend")
            .attr("x", "-350")
            .attr("y", "-50")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "start")
            .text("Menores de 18 años");
    }

    //Actualizando escalas
    const updateScales = (width, height) => {
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 20]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .tickFormat(d => d + symbolP)
            .tickPadding(11)
            .ticks(10);

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX);

        const axisY = d3.axisLeft(scales.count.y)
            .tickFormat(d => d + symbolP)
            .tickSize(-width)
            .ticks(5)

        g.select(".axis-y")
            .call(axisY)

    }

    const updateChart = (dataz) => {
        w = chart.node().offsetWidth;
        h = 600;

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg
            .attr('width', w)
            .attr('height', h);

        const translate = "translate(" + margin.left + "," + margin.top + ")";


        const g = svg.select(`.scatter-${cities}-container`);

        g.attr("transform", translate)

        updateScales(width, height)

        const container = chart.select(`.scatter-${cities}-container-bis`);

        const layer = container.selectAll('.scatter-circles')
            .data(dataz)

        const newLayer = layer.enter()
            .append('circle')
            .attr('class', 'scatter-circles')


        layer.merge(newLayer)
            .on("mouseover", function(d) {
                const tooltipWidth = document.getElementById("tooltip-scatter").offsetWidth;
                console.log(tooltipWidth)
                tooltip.transition()
                tooltip.style("opacity", 1)
                    .html(`<p class="tooltip-citi">${d.city}<p/>
                        <p class="tootlip-population">Habitantes: <span class="tooltip-number">${d.population}</span><p/>
                        <p class="tootlip-over">Mayores de 65: <span class="tooltip-number">${d.mayor}%</span><p/>
                        <p class="tootlip-under">Menores de 18: <span class="tooltip-number">${d.menor}%</span><p/>
                        `)
                    .style("left", (w / 2) - 150 + "px")
                    .style("top", 100 + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("cx", d => scales.count.x(d.mayor))
            .attr("cy", d => scales.count.y(d.menor))
            .attr("r", 6);

        drawAxes(g)

    }

    const resize = () => {
        updateChart(dataz)
    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data
                dataz.forEach(d => {
                    d.mayor = +d.mayor;
                    d.menor = +d.menor;
                    d.population = +d.population;
                    d.city = d.name;
                });
                setupElements()
                setupScales()
                updateChart(dataz)
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

const barNegative = (csvFile, cities) => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 24, right: 24, bottom: 24, left: 48 };
    let width = 0;
    let height = 0;
    let w = 0;
    let h = 0;
    const chart = d3.select(`.bar-negative-${cities}`)
    const svg = chart.select('svg');
    const scales = {};
    let dataz;
    const tooltip = chart.append("div")
        .attr("class", "tooltip tooltip-negative")
        .style("opacity", 0);

    //Escala para los ejes X e Y
    const setupScales = () => {

        const countX = d3.scaleBand()
            .domain(dataz.map(d => d.year));

        const countY = d3.scaleLinear()
            .domain([500, d3.max(dataz, d => d.saldo) * 1.25]);

        scales.count = { x: countX, y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select(`.bar-negative-${cities}-container`);

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', `bar-negative-${cities}-container-bis`);

    }

    //Actualizando escalas
    const updateScales = (width, height) => {
        scales.count.x.rangeRound([0, width]).paddingInner(0.1);
        scales.count.y.range([0, height]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .tickPadding(8)
            .tickFormat(d3.format("d"))

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX)

        const axisY = d3.axisLeft(scales.count.y)
            .tickFormat(d3.format("d"))
            .ticks(5)
            .tickSize(-width)
            .tickPadding(8)

        g.select(".axis-y")
            .call(axisY)

    }

    const updateChart = (dataz) => {
        w = chart.node().offsetWidth;
        h = 600;

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg
            .attr('width', w)
            .attr('height', h);

        const translate = "translate(" + margin.left + "," + margin.top + ")";

        const g = svg.select(`.bar-negative-${cities}-container`)

        g.attr("transform", translate)

        updateScales(width, height)

        const container = chart.select(`.bar-negative-${cities}-container-bis`)

        const layer = container.selectAll('.bar-vertical')
            .data(dataz)

        const newLayer = layer.enter()
            .append('rect')
            .attr("class", d => {
                if (d.saldo < 0) {
                    return "negative";
                } else {
                    return "positive";
                }
            })


        layer.merge(newLayer)
            .on("mouseover", function(d) {
                tooltip.transition()
                tooltip.style("opacity", 1)
                    .html(`
                        <p class="tooltip-year"><span class="tooltip-number">${d.year}</span><p/>
                        <p class="tooltip-born">Nacidos: <span class="tooltip-number">${d.nacidos}</span><p/>
                        <p class="tooltip-deceased">Fallecidos: <span class="tooltip-number">${d.fallecidos}</span><p/>
                        <p class="tooltip-deceased">Saldo: <span class="tooltip-number">${d.saldo}</span><p/>
                        `)
                    .style("left", (d3.event.pageX) - (w / 2) + "px")
                    .style("top", h - scales.count.y(d.saldo) + "px");

            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("width", scales.count.x.bandwidth())
            .attr("x", d => scales.count.x(d.year))
            .attr("y", d => {
                if (d.saldo > 0){
                    return scales.count.y(d.saldo);
                } else {
                    return scales.count.y(0);
                }
            })
            .attr("height", d => Math.abs(scales.count.y(d.saldo) - scales.count.y(0)))

        drawAxes(g)

    }

    const resize = () => {
        updateChart(dataz)
    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data
                dataz.forEach(d => {
                    d.year = d.year;
                    d.saldo = d.saldo;
                    d.nacidos = d.nacidos;
                    d.fallecidos = d.fallecidos;
                });
                setupElements()
                setupScales()
                updateChart(dataz)
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

const barNegativeZ = () => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 24, right: 24, bottom: 24, left: 48 };
    let width = 0;
    let height = 0;
    let w = 0;
    let h = 0;
    const chart = d3.select('.bar-negative-zaragoza')
    const svg = chart.select('svg');
    const scales = {};
    let dataz;
    const tooltip = chart.append("div")
        .attr("class", "tooltip tooltip-negative")
        .style("opacity", 0);

    //Escala para los ejes X e Y
    const setupScales = () => {

        const countX = d3.scaleBand()
            .domain(dataz.map(d => d.year));

        const countY = d3.scaleLinear()
            .domain([d3.min(dataz, d => d.saldo * 1.25), d3.max(dataz, d => d.saldo * 2.5)]);

        scales.count = { x: countX, y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select('.bar-negative-zaragoza-container');

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', 'bar-negative-zaragoza-container-bis');

    }

    //Actualizando escalas
    const updateScales = (width, height) => {
        scales.count.x.rangeRound([0, width]).paddingInner(0.1);
        scales.count.y.range([height, 0]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .tickPadding(8)
            .tickFormat(d3.format("d"))

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX)

        const axisY = d3.axisLeft(scales.count.y)
            .tickFormat(d3.format("d"))
            .ticks(5)
            .tickSize(-width)
            .tickPadding(8)

        g.select(".axis-y")
            .call(axisY)

    }

    const updateChart = (dataz) => {
        w = chart.node().offsetWidth;
        h = 600;

        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg
            .attr('width', w)
            .attr('height', h);

        const translate = "translate(" + margin.left + "," + margin.top + ")";

        const g = svg.select('.bar-negative-zaragoza-container')

        g.attr("transform", translate)

        updateScales(width, height)

        const container = chart.select('.bar-negative-zaragoza-container-bis')

        const layer = container.selectAll('.bar-vertical')
            .data(dataz)

        const newLayer = layer.enter()
            .append('rect')
            .attr("class", d => {
                if (d.saldo < 0) {
                    return "negative";
                } else {
                    return "positive";
                }
            })


        layer.merge(newLayer)
            .on("mouseover", function(d) {
                tooltip.transition()
                tooltip.style("opacity", 1)
                    .html(`
                        <p class="tooltip-year"><span class="tooltip-number">${d.year}</span><p/>
                        <p class="tooltip-born">Nacidos: <span class="tooltip-number">${d.nacidos}</span><p/>
                        <p class="tooltip-deceased">Fallecidos: <span class="tooltip-number">${d.fallecidos}</span><p/>
                        <p class="tooltip-deceased">Saldo: <span class="tooltip-number">${d.saldo}</span><p/>
                        `)
                    .style("left", (d3.event.pageX) - (w / 2) + "px")
                    .style("top", h - scales.count.y(d.saldo) + "px");

            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("width", scales.count.x.bandwidth())
            .attr("x", d => scales.count.x(d.year))
            .attr("y", d => {
                if (d.saldo > 0){
                    return scales.count.y(d.saldo);
                } else {
                    return scales.count.y(0);
                }
            })
            .attr("height", d => Math.abs(scales.count.y(d.saldo) - scales.count.y(0)))

        drawAxes(g)

    }

    const resize = () => {
        updateChart(dataz)
    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv('data/zaragoza/saldo-vegetativo-total-zaragoza.csv', (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data
                dataz.forEach(d => {
                    d.year = d.year;
                    d.saldo = d.saldo;
                });
                setupElements()
                setupScales()
                updateChart(dataz)
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

barNegativeZ()

line(csvTotal[0], cities[0]);
line(csvTotal[1], cities[1]);
line(csvTotal[2], cities[2]);

barscatter(csvUnder[0], cities[0]);
barscatter(csvUnder[1], cities[1]);
barscatter(csvUnder[2], cities[2]);

barNegative(csvBalance[0], cities[0]);
barNegative(csvBalance[1], cities[1]);
