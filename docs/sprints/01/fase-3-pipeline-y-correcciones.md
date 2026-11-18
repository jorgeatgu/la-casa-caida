# Fase 3 — Pipeline y correcciones

## Objetivo

Dejar el pipeline de datos con el año centralizado, los cruces por código INE y un script de validación, y corregir los errores que ya existen en los datos. Todo sobre los datos actuales, sin añadir años nuevos. Al acabar, el sitio debe mostrar lo mismo que hoy, con los errores arreglados.

## Dependencias

Depende de la fase 2. No necesita la fase 1.

## Lo que hay hoy

Scripts, todos Node ESM y sin entrada en `package.json`:

| Script | Entrada | Salida | Año fijo |
|---|---|---|---|
| `src/scripts/procesarDatos.js` | `{p}/{p}-municipios.csv` | `src/data/municipios.js`, `public/data/municipios.json`, `{p}-municipios.json`, `estadisticas.json` | l.10 |
| `calcularPorcentajesEdad.js` | `{p}/{p}-years-groups-total.csv` | `{p}/{p}-mayor-menor.csv` | l.12 |
| `generarRankingsCsv.js` | `municipios.js`, `{p}-tarjetas.csv`, `{p}-mayor-menor.csv` | `rankings/ranking-*.csv`, `datos-municipios.json` | l.31-37 |
| `src/scripts/dataLoader.js` | lectura en build | — | l.28 |

Problemas conocidos:
- **Almudévar.** En `huesca/huesca-municipios.csv`, Alfántega lleva el código 22021, que es el de Almudévar. `procesarDatos.js:58` deduplica por código y Almudévar desaparece. El total de Huesca en `estadisticas.json` sale 129 habitantes por debajo de `huesca-total.csv`.
- **Teruel, saldo vegetativo.** La fila de 2023 tiene nacidos y fallecidos intercambiados, y el orden de columnas del fichero difiere del de Huesca y Zaragoza.
- **Vencillón** falta en `huesca/huesca-densidad.csv`.
- **Cruces por nombre.** `dataLoader.js:54` filtra por nombre, y `generarRankingsCsv.js:26` le pasa el código INE. Unos 7 municipios por provincia no casan entre ficheros, por ejemplo "Hoz y Costean" frente a "Hoz y Costeán".
- `{p}-years-groups-total.csv` y `{p}-mayor-menor.csv` no tienen columna de código.
- **Rankings.** `poblacion2014`, `varUltimosAnios` y `densidad` valen siempre 0. `densidad` se lee de `datosEdad.density`, que no existe.
- `teruel-years-groups-total.csv` tiene 3 filas vacías. La cabecera de `teruel.csv` acaba en coma.
- `aragon-total.csv` guarda los números como texto con punto de miles.
- Varios JSON se generan y nada los lee: `municipios.json`, `{p}-municipios.json`, `estadisticas.json`, `rankings/datos-municipios.json`.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Año | Una constante única, en un módulo que importan scripts y componentes |
| Cruces | Por código INE. El nombre es solo para mostrar |
| Errores | Se corrigen todos en esta fase |
| Validación | `npm run validate:data`, sin CI |
| Rankings de densidad | Se generan los CSV. La publicación en la página es de la fase 5 |

## Alcance

1. Crear el módulo del año de referencia y usarlo en los cuatro scripts. Incluir también el año de comparación a 10 años, calculado a partir del primero.
2. Mover los scripts de datos a `scripts/data/` y registrar en `package.json`: `data:build` (ejecuta todo en orden) y `validate:data`.
3. Añadir la columna de código INE a los CSV que no la tienen, y cambiar todos los cruces a código.
4. Unificar los nombres de municipio entre ficheros, tomando el nombre oficial del INE.
5. Corregir Almudévar, Teruel 2023, Vencillón, las filas vacías y la cabecera de Teruel.
6. Corregir el cálculo de `densidad` en los rankings, con la superficie de `{p}-densidad.csv`.
7. Renombrar las columnas de rankings que llevan el año en el nombre (`poblacion2024`, `poblacion2014`) a nombres sin año, y adaptar `RankingMunicipios.astro`.
8. Generar `ranking-densidad-alta.csv` y `ranking-densidad-baja.csv`.
9. Dejar de generar los JSON que nada lee, salvo que la fase 5 los vaya a necesitar.
10. Escribir `scripts/data/validar.js` con estas comprobaciones:
    - 731 municipios: 202 en Huesca, 236 en Teruel y 293 en Zaragoza.
    - Códigos INE únicos y con el prefijo de su provincia.
    - La suma de municipios coincide con `{p}-total.csv`, y la de provincias con `aragon-total.csv`.
    - Sin filas vacías ni campos numéricos vacíos.
    - Mismos años en todos los municipios de un fichero.
    - nacidos − fallecidos = saldo.
11. Ejecutar `data:build` y `validate:data`.

## Fuera de alcance

- Añadir años nuevos o rellenar 2012-2019. Es la fase 4. Por eso `varUltimosAnios` puede seguir a 0 al acabar esta fase.
- Cambiar textos o cifras de la prosa.
- Publicar los rankings de densidad en la página.
- Aviso de datos provisionales.

## Tareas

- [x] Crear la rama `fase-3-pipeline-y-correcciones`
- [x] Módulo del año de referencia
- [x] Scripts en `scripts/data/` y entradas en `package.json`
- [x] Columna de código INE y cruces por código
- [x] Nombres unificados
- [x] Correcciones de datos
- [x] Densidad y columnas sin año en rankings
- [x] CSV de rankings de densidad
- [x] `scripts/data/validar.js`
- [x] `npm run data:build` y `npm run validate:data` en verde
- [x] Build en verde
- [ ] Revisar el preview de Vercel
- [ ] PR

## Criterios de aceptación

- `npm run validate:data` termina con código 0.
- `npm run data:build` lanzado dos veces seguidas no cambia nada: `git status` limpio tras la segunda.
- `grep -rn "'2024'\|\"2024\"" scripts src/scripts` solo devuelve el módulo del año.
- `npm run build` genera 731 páginas de municipio: `ls dist/municipio | wc -l`.
- Existe `dist/municipio/almudevar/index.html`.
- En `teruel/saldo-vegetativo-total-teruel.csv`, la fila de 2023 tiene 860 nacidos y 1665 fallecidos, y la cabecera coincide con la de Huesca.
- Ningún ranking tiene la columna de densidad a 0 en todas sus filas.
- Existen `ranking-densidad-alta.csv` y `ranking-densidad-baja.csv`.
- En el preview, las gráficas de un municipio que antes no casaba por nombre muestran datos.

## Skills recomendados

- `run`: para comprobar en el sitio las páginas de Almudévar, Vencillón y La Almolda.
- `simplify`: tras el refactor de los scripts, antes de la revisión.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 3 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-3-pipeline-y-correcciones.md

Antes de escribir nada, lee enteros:
- src/scripts/procesarDatos.js
- calcularPorcentajesEdad.js
- generarRankingsCsv.js
- src/scripts/dataLoader.js
- src/components/DatosMunicipio.astro
- src/components/RankingMunicipios.astro
- src/components/GraficaPoblacion.astro, GraficaEdades.astro, GraficaDensidad.astro
  y GraficaSaldoVegetativo.astro
- src/pages/municipio/[slug].astro y src/pages/rankings.astro
- la cabecera y varias filas de cada CSV de public/data/huesca/ y public/data/teruel/

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. Escribe primero scripts/data/validar.js y ejecútalo sobre los datos actuales. Debe
   fallar en los errores conocidos. Eso confirma que la validación funciona.
2. Módulo del año y traslado de scripts.
3. Código INE en todos los CSV y cruces por código.
4. Correcciones de datos.
5. Rankings: densidad, columnas sin año y los dos CSV nuevos.
6. npm run data:build, npm run validate:data y npm run build.

En esta fase no se añaden años nuevos. Si validar.js detecta un error que no está en la
lista de la fase, corrígelo si es evidente y, si no, anótalo en la PR.

Crea la rama fase-3-pipeline-y-correcciones desde update-2025 actualizada, abre la PR contra update-2025 (no
contra master) y ejecuta el alcance completo. Antes de abrir
la PR, lanza /code-review y atiende sus hallazgos.
```
