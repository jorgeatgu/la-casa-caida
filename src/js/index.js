function animation() {
    $('.header-title .letters').each(function(){
      $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

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


const line = () => {
    //Estructura similar a la que utilizan en algunos proyectos de pudding.cool
    const margin = { top: 0, right: 24, bottom: 24, left: 72 };
    let width = 0;
    let height = 0;
    const chart = d3.select('.line-teruel');
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
            .domain([d3.min(dataz, d => d.year
                ),
                d3.max(dataz, d => d.year )
            ]);

        const countY = d3.scaleLinear()
            .domain([d3.min(dataz, d => d.total / 1.25), d3.max(dataz, d => d.total * 1.25)]);

        scales.count = { x: countX,  y: countY };

    }

    //Seleccionamos el contenedor donde irán las escalas y en este caso el area donde se pirntara nuestra gráfica
    const setupElements = () => {

        const g = svg.select('.line-teruel-container');

        g.append('g').attr('class', 'axis axis-x');

        g.append('g').attr('class', 'axis axis-y');

        g.append('g').attr('class', 'line-teruel-container-bis');

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

        const g = svg.select('.line-teruel-container')

        g.attr("transform", translate)

        const line = d3.line()
            .x(d => scales.count.x(d.year))
            .y(d => scales.count.y(d.total))
            .curve(d3.curveBasis);

        updateScales(width, height)

        const container = chart.select('.line-teruel-container-bis')

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

        d3.csv('data/teruel/teruel-total.csv', (error, data) => {
                if (error) {
                      console.log(error);
                } else {
                      dataz = data
                      dataz.forEach(d => {
                          d.year = d.year;
                          d.total = d.total;

                      });
                      console.log(dataz)
                      setupElements()
                      setupScales()
                      updateChart(dataz)
                }

        });
    }

    window.addEventListener('resize', resize)

    loadData()

}

line();
