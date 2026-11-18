# Series históricas congeladas

Estas dos series no tienen una fuente que se pueda descargar con `npm run data:download`, así que se guardan aquí tal cual estaban publicadas. `scripts/data/transformar.js` las lee igual que el resto de `data-raw/`. No cambian con las actualizaciones anuales.

Se extrajeron una sola vez, el 2026-09-30, de los CSV de `public/data/` del commit `8cd70c0` (fin de la fase 3 del sprint 01), ya corregidos.

| Fichero | Columnas | Contenido | Origen |
|---|---|---|---|
| `censos-1900-2011.csv` | `codigo_ine,anio,poblacion` | Población de hecho/de derecho de los censos de 1900 a 1970, 1981, 1991, 2001 y 2011, por municipio | Serie histórica de Aragón Open Data / IAEST. En 2001 y 2011 es el censo, no el padrón, y por eso no coincide con DPOP |
| `edades-padron-2003-2022.csv` | `codigo_ine,tramo,anio,poblacion` | Población por tramo de edad (`0-16` = menos de 16 años, `16-64`, `65-100` = 65 y más), 2003-2022 | Estadística del Padrón Continuo del INE (tablas 33817, 33937 y 33967), que termina el 1-ene-2022. Desde 2023 los tramos salen del Censo Anual (tabla 68540) |

Municipios sin datos en los primeros años porque aún no existían: Vencillón (22909) antes de 1940 y Villamayor de Gállego (50903) antes de 2007.

Qué es cada fuente y por qué se usa: `docs/sprints/01/fuentes.md`.
