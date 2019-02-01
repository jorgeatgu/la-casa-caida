const widthMobile = (window.innerWidth > 0) ? window.innerWidth : screen.width;

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
        elementBtn[i].addEventListener("click", function() {
            removeClass();
            console.log('click')
        });
    }

    function removeClass() {
        overlay.classList.remove("show");
        navigation.classList.remove("show");
        burger.classList.remove("clicked");

    }
}

menu();

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

csvCities = ['data/huesca/huesca.csv', 'data/teruel/teruel.csv', 'data/zaragoza/zaragoza.csv']

cities = ['huesca', 'teruel', 'zaragoza'];

const scatterDesert = () => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 24, right: 24, bottom: 24, left: 64 };
    let width = 0;
    let height = 0;
    let w = 0;
    let h = 0;
    const chart = d3.select('.scatter-desert');
    const svg = chart.select('svg');
    const scales = {};
    const habitantes = " hab/km2";
    let dataz;
    const tooltipDesert = chart.append("div")
        .attr('class', 'tooltip-desert');

    //Escala para los ejes X e Y
    const setupScales = () => {

        const countX = d3.scaleLinear()
            .domain([d3.min(dataz, d => d.densidad), d3.max(dataz, d => d.densidad)]);

        const countY = d3.scaleLinear()
            .domain([d3.min(dataz, d => d.densidad), d3.max(dataz, d => d.densidad)]);

        scales.count = { x: countX, y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select('.scatter-desert-container');

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', 'scatter-desert-container-bis');

        g.append('rect').attr('class', 'pantano')
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
            .ticks(0);

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(axisX);

        const axisY = d3.axisLeft(scales.count.y)
            .tickFormat(d => d + habitantes)
            .tickSize(-width)
            .ticks(10)

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

        const g = svg.select('.scatter-desert-container')

        g.attr("transform", translate)

        g.select('.pantano')
            .attr('width', w - (margin.left + margin.right) + "px")
            .attr('height', (h - (margin.top + margin.bottom)) / 10)
            .attr('y', height - (margin.bottom + margin.top + 7))
            .style('fill', "#436b73")
            .style('fill-opacity', 0.8);

        updateScales(width, height)

        const container = chart.select('.scatter-desert-container-bis')

        const layer = container.selectAll('.circle-desert')
            .data(dataz)

        const newLayer = layer.enter()
            .append('circle')
            .attr('class', 'circle-desert')

        tooltipDesert.html(`
                <p class="tootlip-population">DESIERTO DEMÓGRAFICO<p/>
                `)
            .style("left", (margin.left * 1.25) + "px")
            .style("top", (h - (margin.top + margin.bottom * 2.25)) + "px");

        layer.merge(newLayer)
            .attr("cx", d => Math.random() * width)
            .attr("cy", d => scales.count.y(d.densidad))
            .attr("r", 3)
            .attr('fill-opacity', 0.6);

        drawAxes(g)

    }

    const resize = () => {
        updateChart(dataz)
    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv('data/aragon-municipios.csv', (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data
                dataz.forEach(d => {
                    d.densidad = d.densidad;
                    d.municipio = d.municipio;
                    d.posicion = d.posicion;
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

scatterDesert()


const line = (csvFile, cities) => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 0, right: 8, bottom: 24, left: 56 };

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
            .ticks(9)

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

        updateScales(width, height)

        const container = chart.select(`.line-${cities}-container-bis`);

        const layer = container.selectAll('.line')
            .data([dataz])

        const newLayer = layer.enter()
            .append('path')
            .attr('class', 'line')
            .attr('stroke-width', '1.5')

        const dots = container.selectAll('.circles')
            .data(dataz)

        const dotsLayer = dots.enter()
            .append("circle")
            .attr("class", "circles")
            .attr("fill", "#531f4e")

        layer.merge(newLayer)
            .attr('d', line)

         dots.merge(dotsLayer)
             .attr("cx", d => scales.count.x(d.year))
             .attr("cy", d => scales.count.y(d.total))
             .attr('r', 4)

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
    const margin = { top: 0, right: 8, bottom: 64, left: 40 };
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
            .domain([0, 75]);


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
            .attr("y", "97%")
            .attr("x", "35%")
            .style("text-anchor", "start")
            .text("Mayores de 65 años");

        g.append("text")
            .attr("class", "legend")
            .attr("x", "-350")
            .attr("y", "-30")
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
            .attr('class', `scatter-${cities}-circles scatter-circles`)


        layer.merge(newLayer)
            .on("mouseover", function(d) {
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
            .attr("r", 0)
            .transition()
            .duration(600)
            .ease(d3.easeLinear)
            .attr("cx", d => scales.count.x(d.mayor))
            .attr("cy", d => scales.count.y(d.menor))
            .attr("r", 6);

        drawAxes(g)

    }

    const clearFilter = () => {

        const selectButton = d3.select(`#clear-filter-${cities}`);

        selectButton.on('click', function() {

            d3.select(`#percentage-over-city-${cities} option`).property("selected", "0");
            d3.select(`#percentage-under-city-${cities} option`).property("selected", "0");
            d3.selectAll('.tooltip-percentage').remove().exit();

            new SlimSelect({
                select: `#percentage-over-city-${cities}`,
                searchPlaceholder: 'Filtra tu municipio'
            })

            new SlimSelect({
                select: `#percentage-under-city-${cities}`,
                searchPlaceholder: 'Filtra tu municipio'
            })

            new SlimSelect({
                select: `#select-city-${cities}`,
                searchPlaceholder: 'Busca tu municipio'
            })


            d3.csv(csvFile, (error, data) => {

                dataz = data
                dataz.forEach(d => {
                    d.mayor = +d.mayor;
                    d.menor = +d.menor;
                    d.city = d.name;
                });
                updateChart(dataz)
            });

        })

    }

    clearFilter()

    const menuFilter = () => {
        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {

                datos = data;

                const nest = d3.nest()
                    .key(d => d.name)
                    .entries(datos);

                const selectCity = d3.select(`#filter-city-${cities}`);

                selectCity
                    .selectAll("option")
                    .data(nest)
                    .enter()
                    .append("option")
                    .attr("value", d => d.key)
                    .text(d => d.key)

                selectCity.on('change', function() {

                    let filterCity = d3.select(this)
                        .property("value")

                    d3.select(`#percentage-over-city-${cities} option`).property("selected", "0");
                    d3.select(`#percentage-under-city-${cities} option`).property("selected", "0");
                    d3.selectAll('.tooltip-percentage').remove().exit();

                    new SlimSelect({
                        select: `#percentage-over-city-${cities}`,
                        searchPlaceholder: 'Filtra tu municipio'
                    })

                    new SlimSelect({
                        select: `#percentage-under-city-${cities}`,
                        searchPlaceholder: 'Filtra tu municipio'
                    })

                    update(filterCity)

                });


            }

        });

    }

    const percentageOlder = () => {

        const selectPercentage = d3.select(`#percentage-over-city-${cities}`);

        selectPercentage.on('change', function() {

            d3.select(`#percentage-under-city-${cities} option`).property("selected", "0");

            new SlimSelect({
                select: `#percentage-under-city-${cities}`,
                searchPlaceholder: 'Filtra tu municipio'
            })

            new SlimSelect({
                select: `#select-city-${cities}`,
                searchPlaceholder: 'Busca tu municipio'
            })

            d3.csv(csvFile, (error, data) => {

                dataz = data;

                let percentageCity = d3.select(this)
                    .property("value")

                d3.selectAll(`.scatter-${cities}-circles`)
                    .transition()
                    .duration(400)
                    .attr("r", 0)

                dataz = dataz.filter(d => d.mayor > percentageCity);

                const container = chart.select(`.scatter-${cities}-container-bis`);

                d3.selectAll('.tooltip-percentage').remove().exit()

                chart.append("div")
                    .attr("class", "tooltip tooltip-percentage")
                    .html(`
                        <p class="tootlip-population"><span class="tooltip-number">En ${dataz.length}</span> municipios  al menos el <span class="tooltip-number">${percentageCity}%</span> de habitantes <span class="bold">es mayor de 65 años</span>. <p/>
                        `)
                    .style("right", margin.right + "px")
                    .style("top", 50 + "px");

                dataz.forEach(d => {
                    d.mayor = d.mayor;
                    d.menor = d.menor;
                    d.city = d.name;
                });

                updateChart(dataz)

            });

        });

    }

    const percentageUnder = () => {

        const selectPercentage = d3.select(`#percentage-under-city-${cities}`);

        selectPercentage.on('change', function() {

            d3.select(`#percentage-over-city-${cities} option`).property("selected", "0");

            new SlimSelect({
                select: `#percentage-over-city-${cities}`,
                searchPlaceholder: 'Filtra tu municipio'
            })

            new SlimSelect({
                select: `#select-city-${cities}`,
                searchPlaceholder: 'Busca tu municipio'
            })

            d3.csv(csvFile, (error, data) => {

                dataz = data;

                let percentageCity = d3.select(this)
                    .property("value")


                d3.selectAll(`.scatter-${cities}-circles`)
                    .transition()
                    .duration(400)
                    .attr("r", 0)

                dataz = dataz.filter(d => d.menor > percentageCity);

                const container = chart.select(`.scatter-${cities}-container-bis`);

                d3.selectAll('.tooltip-percentage').remove().exit()

                chart.append("div")
                    .attr("class", "tooltip tooltip-percentage")
                    .html(`
                        <p class="tootlip-population"><span class="tooltip-number">En ${dataz.length}</span> municipios al menos el <span class="bold">${percentageCity}%</span> de habitantes <span class="bold">es menor de 18 años</span>.<p/>
                        `)
                    .style("right", margin.right + "px")
                    .style("top", 50 + "px");


                dataz.forEach(d => {
                    d.mayor = d.mayor;
                    d.menor = d.menor;
                    d.city = d.name;
                });

                updateChart(dataz)

            });

        });

    }

    function update(filterCity) {

        d3.csv(csvFile, (error, data) => {

            dataz = data;

            let valueCity = d3.select(`#filter-city-${cities}`).property("value");
            let revalueCity = new RegExp("^" + valueCity + "$");

            d3.selectAll(`.scatter-${cities}-circles`)
                .transition()
                .duration(400)
                .attr("r", 0)

            dataz = dataz.filter(d => String(d.name).match(revalueCity));

            dataz.forEach(d => {
                d.mayor = +d.mayor;
                d.menor = +d.menor;
                d.city = d.name;
            });

            updateChart(dataz)

        });
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
                    d.over = d.percentagemayor;
                    d.under = d.percentagemenor;

                });
                setupElements()
                setupScales()
                updateChart(dataz)
                menuFilter()
                percentageOlder()
                percentageUnder()
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

const barNegative = (csvFile, cities) => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 24, right: 8, bottom: 24, left: 40 };
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
        scales.count.x.rangeRound([0, width]).paddingInner(0.2);
        scales.count.y.range([0, height]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .ticks(3)
            .tickPadding(4)
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
                    .style("left", (w / 2) - 100 + "px")
                    .style("top", 50 + "px");

            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("width", d => scales.count.x.bandwidth())
            .attr("x", d => scales.count.x(d.year))
            .attr("y", d => {
                if (d.saldo > 0) {
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
    const margin = { top: 24, right: 8, bottom: 24, left: 40 };
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
            .tickPadding(4)
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
                    .style("left", (w / 2) - 100 + "px")
                    .style("top", 50 + "px");

            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .attr("width", scales.count.x.bandwidth())
            .attr("x", d => scales.count.x(d.year))
            .attr("y", d => {
                if (d.saldo > 0) {
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

const linePopulation = (csvFile, cities) => {

    if (widthMobile > 544) {
        margin = { top: 16, right: 8, bottom: 24, left: 62 };
    } else {
        margin = { top: 16, right: 8, bottom: 24, left: 32 };
    }

    let width = 0;
    let height = 0;
    const chart = d3.select(`.line-population-${cities}`);
    const svg = chart.select('svg');
    let scales = {};
    let datos;
    let tooltipUnder;
    let tooltipOver;

    const setupScales = () => {

        const countX = d3.scaleTime()
            .domain([d3.min(datos, d => d.year), d3.max(datos, d => d.year)]);

        const countY = d3.scaleLinear()
            .domain([0, d3.max(datos, d => d.population) * 1.25]);

        scales.count = { x: countX, y: countY };

    }

    const tooltips = (data) => {

        const w = chart.node().offsetWidth;

        tooltipOver = chart.append("div")
            .attr("class", "tooltip tooltip-over");

        const totalLose = datos[0].population - datos.slice(-1)[0].population;
        const totalWin = datos.slice(-1)[0].population - datos[0].population;
        let percentageL = ((totalLose * 100) / datos[0].population).toFixed(2);
        let percentageW = ((totalWin * 100) / datos[0].population).toFixed(2);
        if (datos[0].population > datos.slice(-1)[0].population) {
            tooltipOver.data(datos)
                .html(d =>
                    `
                    <p class="tooltip-deceased">Desde 1900 su población ha disminuido en un <span class="tooltip-number">${percentageL}%</span><p/>
                    <p class="tooltip-deceased">Mayores de 65 años en 2018: <span class="tooltip-number">${d.mayor}%</span><p/>
                    <p class="tooltip-deceased">Menores de 18 años en 2018: <span class="tooltip-number">${d.menor}%</span><p/>
                    `)
                .transition()
                .duration(300)
                .style("right", 0)
                .style("top", 20 + "px");
        } else {
            tooltipOver.data(datos)
                .html(d =>
                    `
                        <p class="tooltip-deceased">Desde 1900 su población ha aumentado en un <span class="tooltip-number">${percentageW}%</span><p/>
                        <p class="tooltip-deceased">Mayores de 65 años en 2018: <span class="tooltip-number">${d.mayor}%</span><p/>
                        <p class="tooltip-deceased">Menores de 18 años en 2018: <span class="tooltip-number">${d.menor}%</span><p/>
                        `)
                .transition()
                .duration(300)
                .style("right", 0)
                .style("top", 90 + "%");
        }

    }


    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select(`.line-population-${cities}-container`);

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', `line-population-${cities}-container-bis`);
    }

    //Actualizando escalas
    const updateScales = (width, height) => {
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 0]);
    }

    //Dibujando ejes
    const drawAxes = (g) => {

        const axisX = d3.axisBottom(scales.count.x)
            .tickPadding(5)
            .tickFormat(d3.format("d"))
            .ticks(13)

        g.select(".axis-x")
            .attr("transform", "translate(0," + height + ")")
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .call(axisX);

        const axisY = d3.axisLeft(scales.count.y)
            .tickPadding(5)
            .tickFormat(d3.format("d"))
            .tickSize(-width)
            .ticks(6);

        g.select(".axis-y")
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .call(axisY)

    }

    function updateChart(data) {
        const w = chart.node().offsetWidth;
        const h = 500;


        width = w - margin.left - margin.right;
        height = h - margin.top - margin.bottom;

        svg
            .attr('width', w)
            .attr('height', h);

        const translate = "translate(" + margin.left + "," + margin.top + ")";

        const g = svg.select(`.line-population-${cities}-container`);

        g.attr("transform", translate)

        const line = d3.line()
            .x(d => scales.count.x(d.year))
            .y(d => scales.count.y(d.population))

        updateScales(width, height)

        const container = chart.select(`.line-population-${cities}-container-bis`)

        const lines = container.selectAll('.lines')
            .data([datos])

        const newLines = lines.enter()
            .append('path')
            .attr('class', 'lines');

        lines.merge(newLines)
            .transition()
            .duration(400)
            .ease(d3.easeLinear)
            .attrTween('d', function(d) {
                var previous = d3.select(this).attr('d');
                var current = line(d);
                return d3.interpolatePath(previous, current);
            });

        drawAxes(g)

    }

    function update(mes) {

        d3.csv(csvFile, (error, data) => {

            datos = data;

            let valueCity = d3.select(`#select-city-${cities}`).property("value");
            let revalueCity = new RegExp("^" + valueCity + "$");

            datos = datos.filter(d => String(d.name).match(revalueCity));

            datos.forEach(d => {
                d.population = +d.population;
                d.year = +d.year;
            });

            scales.count.x.range([0, width]);
            scales.count.y.range([height, 0]);

            const countX = d3.scaleTime()
                .domain([d3.min(datos, d => d.year), d3.max(datos, d => d.year)]);

            const countY = d3.scaleLinear()
                .domain([0, d3.max(datos, d => d.population) * 1.25]);


            scales.count = { x: countX, y: countY };
            updateChart(datos)

            const totalLose = datos[0].population - datos.slice(-1)[0].population;
            const totalWin = datos.slice(-1)[0].population - datos[0].population;
            let percentageL = ((totalLose * 100) / datos[0].population).toFixed(2);
            let percentageW = ((totalWin * 100) / datos[0].population).toFixed(2);
            if (datos[0].population > datos.slice(-1)[0].population) {
                tooltipOver.data(datos)
                    .html(d =>
                        `
                                <p class="tooltip-deceased">Desde 1900 su población ha disminuido en un <span class="tooltip-number">${percentageL}%</span><p/>
                                <p class="tooltip-deceased">Mayores de 65 años en 2018: <span class="tooltip-number">${d.mayor}%</span><p/>
                                <p class="tooltip-deceased">Menores de 18 años en 2018: <span class="tooltip-number">${d.menor}%</span><p/>
                                `)
                    .transition()
                    .duration(300)
                    .style("right", 0)
                    .style("top", 20 + "px");
            } else {
                tooltipOver.data(datos)
                    .html(d =>
                        `
                                    <p class="tooltip-deceased">Desde 1900 su población ha aumentado en un <span class="tooltip-number">${percentageW}%</span><p/>
                                    <p class="tooltip-deceased">Mayores de 65 años en 2018: <span class="tooltip-number">${d.mayor}%</span><p/>
                                    <p class="tooltip-deceased">Menores de 18 años en 2018: <span class="tooltip-number">${d.menor}%</span><p/>
                                    `)
                    .transition()
                    .duration(300)
                    .style("right", 0)
                    .style("top", 75 + "%");
            }
        });
    }

    const resize = () => {

        updateChart(datos)

    }

    const menuMes = () => {
        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {

                datos = data;

                const nest = d3.nest()
                    .key(d => d.select)
                    .entries(datos);

                const selectCity = d3.select(`#select-city-${cities}`);

                selectCity
                    .selectAll("option")
                    .data(nest)
                    .enter()
                    .append("option")
                    .attr("value", d => d.key)
                    .text(d => d.key)

                selectCity.on('change', function() {

                    let mes = d3.select(this)
                        .property("value")


                    update(mes)

                });


            }

        });

    }

    // LOAD THE DATA
    const loadData = () => {

        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {

                datos = data;
                datos.forEach(d => {
                    d.year = +d.year;
                    d.name = d.name;
                    d.population = +d.population;
                });
                setupElements()
                setupScales()
                updateChart(datos)
                tooltips(datos)
                mes = datos[0].name;
                update(mes)
            }

        });
    }

    window.addEventListener('resize', resize)

    loadData()
    menuMes()

}

linePopulation(csvCities[0], cities[0]);
linePopulation(csvCities[1], cities[1]);
linePopulation(csvCities[2], cities[2]);

new SlimSelect({
    select: '#select-city-teruel',
    searchPlaceholder: 'Busca tu municipio'
})

new SlimSelect({
    select: '#filter-city-teruel',
    searchPlaceholder: 'Filtra por municipio'
})

new SlimSelect({
    select: '#percentage-over-city-teruel',
    searchPlaceholder: 'Filtra tu municipio'
})

new SlimSelect({
    select: '#percentage-under-city-teruel',
    searchPlaceholder: 'Filtra tu municipio'
})


new SlimSelect({
    select: '#select-city-huesca',
    searchPlaceholder: 'Busca tu municipio'
})

new SlimSelect({
    select: '#filter-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
})

new SlimSelect({
    select: '#percentage-over-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
})

new SlimSelect({
    select: '#percentage-under-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
})


new SlimSelect({
    select: '#select-city-zaragoza',
    searchPlaceholder: 'Busca tu municipio'
})

new SlimSelect({
    select: '#filter-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
})

new SlimSelect({
    select: '#percentage-over-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
})

new SlimSelect({
    select: '#percentage-under-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
})
