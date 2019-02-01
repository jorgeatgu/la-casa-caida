# La casa caída

La casa caída es una bonita y triste canción de la [Ronda de Boltaña](http://www.rondadors.com/d2/18/d2_18.php), trata sobre la despoblación del Alto Aragón. Si se nos cae la casa se vuelve a levantar, canta la Ronda. El problema al que nos enfrentamos en Aragón(y en otras partes de España) es que cada día esta más cerca el momento donde no haya nadie para levantar la casa.

Según el INE el número total de habitantes en Aragón es de 1.308.728. El 50.95% de ellos reside en Zaragoza. Estas cifras dejan la densidad de población en 27,42 hab/km2, solo por delante de Castilla y León, Castilla-La Mancha y Extremadura.

Según el informe “Las tres SESPAs de Aragón en el marco de los Fondos de Cohesión 2021-2027” el 75.92% de los municipios de Aragón tienen una densidad de 4,37 hab/km2. Hay que tener en cuenta que una densidad inferior a 10 hab/km2 se considera desierto demográfico.

# Metodología

El dataset principal es la serie histórica de población por municipios de 1900 a 2011. Está disponible en [Aragón Open Data](https://opendata.aragon.es/datos/catalogo/dataset/serie-historica-de-poblacion-municipios). He actualizado este dataset con los datos oficiales del INE de 2018. A partir de este he ido generando más datasets gracias a la poderosa combinación de [csvkit](https://csvkit.readthedocs.io/en/1.0.3/) + [jq](https://stedolan.github.io/jq/) + Bash. He ido documentado todo el proceso, esta disponible [aquí](https://github.com/jorgeatgu/la-casa-caida/blob/master/data/readme.md).

La horquilla de edad del porcentaje de mayores va desde los 65 años hasta 100 años o más. Lo horquilla para el de menores de 18 años va desde los 0 años hasta los 18 años inclusive. Estas dos series de datos provienen del INE a fecha de 2018.

El saldo vegetativo entre 1996 y 2017 proviene del IAEST pero los datos están mal. Un ejemplo, en Ansó en el año 2011 no nacio nadie pero murieron 8 personas, el saldo vegetativo de ese año debería de ser -8, en lugar de esta cifra el IAEST da un saldo vegetativo de 0. Así que he tenido que rehacer este dataset volviendo a calcular el saldo vegetativo de todos los años en todos los municipios.

La densidad de población es igual al número de habitantes dividido por la superficie en kilometros cuadrados del municipio. La superficie de cada municipio de Aragón esta en este [dataset](https://gist.githubusercontent.com/jorgeatgu/40eaa471b02add6d9a7a9aca33fc8bd5/raw/ef7d384a0749df4f9b3594c76b432026344b0df9/aragon.json). Los datos de población perfetenecen al INE del 2018.

Todos los datos los he dividido por provincia. Y están disponibles [aquí](https://github.com/jorgeatgu/la-casa-caida/tree/master/data).

Veracruz desde 2011 se llama Beranuy que es el nombre por el que siempre se ha conocido. [Noticia](https://www.elperiodicodearagon.com/noticias/aragon/el-municipio-de-veracruz-se-llama-desde-ayer-beranuy_679601.html)
