# Actualizar los datos

Guía para la actualización anual de los datos de La casa caída. Todo sale de `data-raw/` mediante scripts: ningún CSV de `public/data/` ni fichero de `src/data/` se edita a mano.

Requisitos: Node 24 (`engines.node: "24.x"`) y `npm ci`.

## Cuándo actualizar

| Fuente | Qué alimenta en `public/data/` | Cuándo publica el INE |
|---|---|---|
| Cifras oficiales del Padrón (DPOP) | Población desde 2012 en `{p}.csv`, `{p}-tarjetas.csv`, `{p}-municipios.csv`, `{p}-densidad.csv`, `{p}-total.csv`, `aragon-total.csv` y `aragon-municipios.csv`, y de ahí los rankings | Diciembre, con la población a 1 de enero de ese año |
| Censo Anual de Población | Edades desde 2023 en `{p}-years-groups-total.csv` y `{p}-mayor-menor.csv` | Diciembre, con la población a 1 de enero de ese año |
| Movimiento Natural de la Población (MNP) | Saldo vegetativo definitivo en `saldo-vegetativo-total-{p}.csv` | Finales del año siguiente (el de 2025 salió en noviembre de 2026) |
| Estimación Mensual de Nacimientos (EMN) y de Defunciones (EDeS) | Saldo vegetativo provisional del último año, mismo fichero | Mensual |
| Superficie (gist) | Columna `superficie` de `{p}-densidad.csv` y `aragon-municipios.csv` | Estática |
| Censos 1900-2011 y edades 2003-2022 (congelados) | Años anteriores a 2012 de la población y anteriores a 2023 de las edades | No cambian |

La actualización anual se hace en diciembre, cuando el INE ha publicado DPOP y el Censo Anual a 1 de enero del año en curso. En ese momento el MNP del año anterior suele estar ya publicado, así que el saldo provisional pasa a definitivo y entra un nuevo año provisional.

`npm run data:build` avisa si DPOP ya trae un año posterior a `ANIO_REFERENCIA`.

## Fuentes

API: `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/<id>`. Web: `https://www.ine.es/jaxiT3/Tabla.htm?t=<id>`.

| Dato | Tabla | Acceso | Fichero en `data-raw/` |
|---|---|---|---|
| Población por municipio, Huesca (DPOP) | [2875](https://www.ine.es/jaxiT3/Tabla.htm?t=2875) | API `?tip=AM` | `ine/dpop-2875-huesca.json` |
| Población por municipio, Teruel (DPOP) | [2899](https://www.ine.es/jaxiT3/Tabla.htm?t=2899) | API `?tip=AM` | `ine/dpop-2899-teruel.json` |
| Población por municipio, Zaragoza (DPOP) | [2907](https://www.ine.es/jaxiT3/Tabla.htm?t=2907) | API `?tip=AM` | `ine/dpop-2907-zaragoza.json` |
| Población por municipio y grandes grupos de edad (Censo Anual) | [68540](https://www.ine.es/jaxiT3/Tabla.htm?t=68540) | CSV completo `https://www.ine.es/jaxiT3/files/t/es/csv_bdsc/68540.csv`, filtrado a Aragón | `ine/censo-68540-edad-grandes-grupos.csv` |
| Nacimientos por provincia (MNP) | [6506](https://www.ine.es/jaxiT3/Tabla.htm?t=6506) | API `?tip=A` | `ine/mnp-6506-nacimientos.json` |
| Defunciones por provincia (MNP) | [6545](https://www.ine.es/jaxiT3/Tabla.htm?t=6545) | API `?tip=A` | `ine/mnp-6545-defunciones.json` |
| Nacimientos mensuales por provincia (EMN, provisional) | [46682](https://www.ine.es/jaxiT3/Tabla.htm?t=46682) | API `?tip=A` | `ine/emn-46682-nacimientos-mensuales.json` |
| Defunciones mensuales por provincia (EDeS, provisional) | [62278](https://www.ine.es/jaxiT3/Tabla.htm?t=62278) | API `?tip=A` | `ine/edes-62278-defunciones-mensuales.json` |
| Superficie por municipio | [Gist `aragon.json`](https://gist.githubusercontent.com/jorgeatgu/40eaa471b02add6d9a7a9aca33fc8bd5/raw/ef7d384a0749df4f9b3594c76b432026344b0df9/aragon.json) | Descarga directa | `superficie.csv` |
| Censos 1900-2011 | Aragón Open Data / IAEST | Congelado, no se descarga | `historico/censos-1900-2011.csv` |
| Edades 2003-2022 (Padrón Continuo) | INE 33817, 33937, 33967 (serie terminada) | Congelado, no se descarga | `historico/edades-padron-2003-2022.csv` |

Detalle de cada tabla, comprobaciones y fuentes descartadas: [`sprints/01/fuentes.md`](sprints/01/fuentes.md). Origen de las series congeladas: [`data-raw/historico/README.md`](../data-raw/historico/README.md).

`data-raw/` se versiona: el diff de cada actualización muestra qué ha cambiado el INE.

## Pasos

1. **Rama.** Crea una rama desde `master`.
2. **Año de referencia.** En `src/config/anio.js`, sube `ANIO_REFERENCIA` al año del nuevo padrón y pon en `FECHA_ACTUALIZACION` el día de la carga (`AAAA-MM-DD`). Es el único sitio donde se escribe el año.
3. **Descarga.**

   ```sh
   npm run data:download
   ```

   Descarga las tablas a `data-raw/` (el CSV del censo pesa unos 335 MB y tarda varios minutos). Sale con código 1 si alguna falla.
4. **Generación.**

   ```sh
   npm run data:build
   ```

   Ejecuta en orden:

   | Script | Qué genera |
   |---|---|
   | `scripts/data/transformar.js` | Los CSV base de `public/data/` a partir de `data-raw/` |
   | `scripts/data/procesarDatos.js` | `src/data/municipios.js`, la lista de municipios y slugs de las páginas |
   | `scripts/data/calcularPorcentajesEdad.js` | `{p}-mayor-menor.csv` |
   | `scripts/data/generarRankingsCsv.js` | `public/data/rankings/*.csv` |
   | `scripts/data/cifras.js` | `src/data/cifras.json`, las cifras de la prosa |

   Es idempotente: ejecutarlo dos veces seguidas no cambia nada.
5. **Validación.**

   ```sh
   npm run validate:data
   ```

   Comprueba cabeceras, tipos, códigos INE, número de municipios por provincia, años por municipio, que las sumas municipales cuadran con los totales, el saldo vegetativo, los provisionales y que `cifras.json` cuadra con los CSV. Debe terminar con `Datos válidos.`
6. **Build.**

   ```sh
   npm run build
   ```

   Debe generar 731 páginas de municipio.
7. **Revisión a mano.** Revisa el diff de `data-raw/` y de `public/data/`, la prosa (ver abajo) y las gráficas con `npm run dev`.
8. **PR a `master`.** Revisa el preview de Vercel en escritorio y en móvil antes de mergear.

## Formato de los CSV de `public/data/`

`{p}` es `huesca`, `teruel` o `zaragoza`. `cp` es el código INE de 5 dígitos y es la clave de cruce; `name` es solo para mostrar. Las cabeceras no deben cambiar: las gráficas las leen por nombre (y `aragonStacked.js`, por posición).

| Fichero | Columnas | Contenido | Lo usa |
|---|---|---|---|
| `{p}/{p}.csv` | `year,cp,name,population` | Censos 1900-2011 y padrón anual desde 2012 | `GraficaPoblacion.astro` (municipio) |
| `{p}/{p}-tarjetas.csv` | `year,cp,name,population` | Igual que `{p}.csv` | `dataLoader.js` → `DatosMunicipio.astro`, rankings |
| `{p}/{p}-municipios.csv` | `year,cp,name,population` | Solo el año de referencia | `procesarDatos.js`, `transformar.js` |
| `{p}/{p}-densidad.csv` | `year,cp,name,population,superficie` | Serie de población con la superficie en km² | `GraficaDensidad.astro`, rankings |
| `{p}/{p}-total.csv` | `year,total` | Suma provincial por año | `GraficaHistoricaPoblacion.astro` (provincia), `cifras.js` |
| `{p}/{p}-years-groups-total.csv` | `cp,name,age,year,total` | Población por tramo (`0-16` = menos de 16, `16-64`, `65-100` = 65 y más), 2003 en adelante | `GraficaEdades.astro`, `cifras.js` |
| `{p}/{p}-mayor-menor.csv` | `year,cp,name,menor,mayor,population` | % de menores de 16 y de 65 y más en el año de referencia (población del Censo Anual) | `dataLoader.js` → `DatosMunicipio.astro`, rankings |
| `{p}/saldo-vegetativo-total-{p}.csv` | `year,saldo,nacidos,fallecidos,provisional` | Movimiento natural provincial; `provisional` = 1 en los años estimados | `GraficaSaldoVegetativo.astro`, `cifras.js` |
| `aragon-total.csv` | `year,teruel,huesca,zaragoza,aragon,teruelP,huescaP,zaragozaP` | Población por provincia y peso de cada una | `src/scripts/d3/aragonStacked.js` (home) |
| `aragon-municipios.csv` | `cp,municipio,población,superficie,densidad` | Foto de los 731 municipios en el año de referencia | `src/scripts/d3/scatterDesert.js` (home), `cifras.js` |
| `rankings/ranking-*.csv` | `nombre,provincia,slug,codigoINE,poblacion1900,poblacionActual,poblacionComparacion,variacion1900,perdidaAbsoluta,perdidaPorcentual,varUltimosAnios,porcentajeMayores,porcentajeMenores,densidad` | Seis rankings: `despoblacion`, `crecimiento`, `envejecidos`, `jovenes`, `densidad-alta`, `densidad-baja` | `RankingMunicipios.astro` (`/rankings`) |

Enteros sin separador de miles y decimales con punto. Las comprobaciones exactas de cada fichero están en `scripts/data/validar.js`.

## Superficie

`transformar.js` usa `sup_of_km2` del gist salvo cuando se aleja más de un 5 % del área del polígono, en cuyo caso usa el polígono. Argavieso, Jasa, Ansó y Fago conservan `sup_of_km2` (constante `CONSERVAN_SUP_OF`). La superficie de Aragón y de las provincias es la suma de la municipal. Explicación y lista de municipios afectados: [`sprints/01/fuentes.md`](sprints/01/fuentes.md#superficie-errores-del-gist).

## Qué revisar a mano

Las cifras de la prosa salen de `src/data/cifras.json`, pero algunas frases siguen escritas a mano. Comprueba que siguen siendo ciertas con los datos nuevos:

- `src/pages/index.astro`: la comparación de la densidad de Aragón con otras comunidades.
- `src/pages/provincia/huesca.astro`: la recuperación de población desde 2000.
- `src/pages/provincia/teruel.astro`: "casi la mitad" de la población perdida.
- `src/pages/provincia/zaragoza.astro`: "ha doblado la población" y "única con saldo positivo entre 2006 y 2011".
- `README.md`: población, % en Zaragoza capital, densidad y año del primer párrafo. Cópialos de `src/data/cifras.json`.
- `src/components/Metodologia.astro`: que las fuentes y el calendario siguen siendo los de esta guía.

## Datos provisionales

Solo el saldo vegetativo tiene datos provisionales. Para cada año, `transformar.js` usa el MNP (definitivo) si lo tiene y, si no, el acumulado de diciembre de EMN y EDeS, marcado con `provisional = 1`. La gráfica raya esas barras y Metodología muestra la sección "Datos provisionales" mientras haya alguno (`cifras.hayProvisionales`).

**Pasar de provisional a definitivo:** no hay que tocar nada. Cuando el INE publique el MNP del año, `npm run data:download` y `npm run data:build` sustituyen la estimación por el MNP. La columna pasa a 0 si el INE lo publica como definitivo; si lo publica como `Provisional` o `Avance` (`T3_TipoDato`), sigue en 1 hasta que salga el definitivo. Si el acumulado de diciembre del año siguiente ya existe, entra como nuevo año provisional. Ocurrió en noviembre de 2026 con el MNP de 2025: solo cambiaron los cuatro JSON del movimiento natural, los tres `saldo-vegetativo-total-{p}.csv` y `src/data/cifras.json`.

## Si cambia un municipio

Entre 2012 y 2025 no ha cambiado ningún código en Aragón, así que los scripts no están preparados para ello: un alta o una fusión obliga a tocar código. Lo que falla y dónde:

- `npm run data:download` falla si el censo o el gist no tienen 731 municipios (`TOTAL_MUNICIPIOS` en `scripts/data/descargar.js`).
- `npm run data:build` (`transformar.js`) falla si un municipio de DPOP no tiene todos los años desde 2012, si un código de `data-raw/historico/censos-1900-2011.csv` ya no está en DPOP o si un municipio no tiene superficie.
- `npm run validate:data` falla si cambia el número de municipios por provincia (`MUNICIPIOS_POR_PROVINCIA` en `scripts/data/validar.js`), si a un municipio le faltan años (salvo los de `ALTAS`) o si un código tiene varios nombres.

Qué hacer en cada caso:

- **Alta o segregación:** actualiza `TOTAL_MUNICIPIOS` y `MUNICIPIOS_POR_PROVINCIA`, y añade el código a `ALTAS` en `validar.js` con su primer año, como Vencillón (22909) y Villamayor de Gállego (50903). `transformar.js` no tiene excepción equivalente para los años del padrón anteriores al alta, así que hay que añadírsela. La superficie tampoco llega sola: el gist está fijado a un commit, así que hay que sacarla de otra fuente (IGN o IAEST) y cambiar cómo se genera `data-raw/superficie.csv`.
- **Fusión:** el código desaparecido sigue en los censos históricos. Hay que decidir si su serie se suma al municipio resultante o se deja de mostrar, y aplicarlo en `transformar.js`. El slug que desaparece necesita una redirección en `vercel.json`.
- **Cambio de nombre:** el nombre sale de DPOP, así que cambia solo. Si cambia el slug, añade una redirección 301 en `vercel.json` (con y sin barra final), como las de La Almolda o Las Pedrosas.
- Anota el caso y la decisión en esta guía.

## Si falla la descarga

`descargar.js` reintenta tres veces cada tabla, con un timeout de 10 minutos por descarga. Si sigue fallando:

- Comprueba que la tabla responde en la web del INE (`https://www.ine.es/jaxiT3/Tabla.htm?t=<id>`). El INE a veces cambia el ID de una tabla al rehacer una operación; si es así, actualiza `FUENTES` en `descargar.js` y la tabla de fuentes de esta guía.
- Si la API de una tabla deja de funcionar, descarga el fichero a mano desde la web del INE, guárdalo en `data-raw/` con el mismo nombre y formato que espera `transformar.js`, y deja apuntada aquí la URL.
- Como `data-raw/` se versiona, `npm run data:build` funciona sin red con lo último descargado.
