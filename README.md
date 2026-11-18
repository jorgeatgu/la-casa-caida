# La casa caída

La casa caída es una bonita y triste canción de la [Ronda de Boltaña](http://www.rondadors.com/d2/18/d2_18.php), trata sobre la despoblación del Alto Aragón. Si se nos cae la casa se vuelve a levantar, canta la Ronda. El problema al que nos enfrentamos en Aragón(y en otras partes de España) es que cada día esta más cerca el momento donde no haya nadie para levantar la casa.

Según el padrón del INE a 1 de enero de 2025, Aragón tiene 1.358.812 habitantes. El 51,01 % de ellos reside en la ciudad de Zaragoza. Estas cifras dejan la densidad de población en 28,50 hab/km², solo por delante de Castilla y León, Castilla-La Mancha y Extremadura.

Según el informe “Las tres SESPAs de Aragón en el marco de los Fondos de Cohesión 2021-2027” el 75,92 % de los municipios de Aragón tienen una densidad de 4,37 hab/km². Hay que tener en cuenta que una densidad inferior a 10 hab/km2 se considera desierto demográfico.

# Metodología

- **Población 1900-2011:** censos de población, de la serie histórica de [Aragón Open Data](https://opendata.aragon.es/datos/catalogo/dataset/serie-historica-de-poblacion-municipios) / IAEST.
- **Población desde 2012:** cifras oficiales del padrón municipal (INE), a 1 de enero de cada año.
- **Grupos de edad:** Estadística del Padrón Continuo del INE hasta 2022 y Censo Anual de Población del INE desde 2023. Los tramos son menos de 16 años, de 16 a 64 y 65 y más.
- **Saldo vegetativo:** Movimiento Natural de la Población del INE. El último año, mientras no hay dato definitivo, sale de las estimaciones mensuales de nacimientos y defunciones y se marca como provisional.
- **Densidad:** habitantes entre la superficie del municipio en km², tomada de este [dataset](https://gist.githubusercontent.com/jorgeatgu/40eaa471b02add6d9a7a9aca33fc8bd5/raw/ef7d384a0749df4f9b3594c76b432026344b0df9/aragon.json) con las correcciones descritas en la guía.

Todos los datos se cruzan por código INE y están divididos por provincia en [`public/data/`](public/data/). Se generan con scripts a partir de los datos fuente de [`data-raw/`](data-raw/); ningún CSV se edita a mano.

Cómo se actualizan cada año: [docs/actualizar-datos.md](docs/actualizar-datos.md).

## Desarrollo

Requiere Node 24.

```sh
npm ci
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run data:download` | Descarga los datos fuente a `data-raw/` |
| `npm run data:build` | Genera `public/data/`, `src/data/municipios.js` y `src/data/cifras.json` |
| `npm run validate:data` | Valida los datos generados |
| `npm run build` | Genera la web en `dist/` |

Veracruz desde 2011 se llama Beranuy que es el nombre por el que siempre se ha conocido. [Noticia](https://www.elperiodicodearagon.com/noticias/aragon/el-municipio-de-veracruz-se-llama-desde-ayer-beranuy_679601.html)
