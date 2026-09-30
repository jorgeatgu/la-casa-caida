# Fase 4 — Carga de datos nuevos

## Objetivo

Transformar lo descargado en la fase 1 y cargarlo en los CSV de `public/data/`: los años nuevos hasta el último publicado, y la serie anual 2012-2019 que hoy falta. Al acabar, todas las gráficas muestran el último dato disponible.

## Dependencias

Depende de las fases 1 y 3. No puede ir en paralelo con ninguna.

## Lo que hay hoy

Estado tras la fase 3:
- `data-raw/` con las descargas sin transformar, y `docs/sprints/01/fuentes.md` con las tablas y el estado de cada dato.
- `npm run data:build` y `npm run validate:data` funcionando sobre los datos antiguos.
- Año de referencia en un único módulo.

Series a ampliar, en `public/data/`:

| Fichero | Años que tiene | Qué falta |
|---|---|---|
| `{p}/{p}.csv` | censales 1900-2011, 2020-2024 | 2012-2019 y años nuevos |
| `{p}/{p}-tarjetas.csv` | censales 1900-2011, 2020-2024 | 2012-2019 y años nuevos |
| `{p}/{p}-total.csv` | censales 1900-2011, 2020-2024 | 2012-2019 y años nuevos |
| `aragon-total.csv` | censales, 2018, 2020-2024 | 2012-2017, 2019 y años nuevos |
| `{p}/{p}-densidad.csv` | censales 1900-2011, 2020-2023 | 2012-2019, 2024 y años nuevos |
| `aragon-municipios.csv` | foto de 2023 | regenerar con el último año |
| `{p}/{p}-years-groups-total.csv` | 2003-2024 | años nuevos |
| `{p}/{p}-municipios.csv` | foto de 2024 | regenerar con el último año |
| `{p}/saldo-vegetativo-total-{p}.csv` | 1975-2023 | 2024 y siguientes |

A tener en cuenta:
- `aragon-total.csv` usa 1981 y 1991 en lugar de 1980 y 1990.
- `src/components/DatosMunicipio.astro:48` recorre décadas con años múltiplos de 10, así que 1981 y 1991 no casan.
- `src/components/GraficaSaldoVegetativo.astro:37-38` tiene umbrales fijos de -500 y 300.
- Las gráficas de línea de población se diseñaron con puntos censales cada 10 años y unos pocos anuales al final.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Huecos | Se rellenan 2012-2019 |
| Provisionales | Se cargan y se marcan |
| Origen | Todo sale de `data-raw/` mediante script. No se edita ningún CSV a mano |
| Superficie | No cambia. Se usa `data-raw/superficie.csv` |

## Alcance

1. Escribir `scripts/data/transformar.js`, que lee `data-raw/` y escribe los CSV base de `public/data/`. Registrarlo como primer paso de `data:build`.
2. Si la fase 1 concluyó que el "2024" actual está mal etiquetado, corregir la etiqueta de esos años.
3. Cargar la serie anual 2012-2019 en los ficheros de población y de densidad.
4. Cargar los años nuevos de población, edades y saldo vegetativo.
5. Marcar los datos provisionales con una columna `provisional` en los ficheros afectados.
6. Regenerar `aragon-municipios.csv` y `{p}-municipios.csv` con el último año.
7. Actualizar el año de referencia en el módulo central.
8. Resolver los cambios de municipios que detecte la validación.
9. Ejecutar `data:build` y `validate:data`.
10. Revisar cada gráfica con la serie nueva y ajustar ejes o dominios donde la mezcla de años censales y anuales se vea mal. Corregir el bucle de décadas de `DatosMunicipio.astro:48`.

## Fuera de alcance

- Cifras y textos de la prosa.
- Mostrar el aviso de provisional en la interfaz. Esta fase solo deja el dato marcado.
- Publicar los rankings de densidad en la página.

## Tareas

- [ ] Crear la rama `fase-4-carga-de-datos`
- [ ] `scripts/data/transformar.js` e integración en `data:build`
- [ ] Corrección de etiqueta de año, si aplica
- [ ] Serie 2012-2019
- [ ] Años nuevos de población, edades y saldo vegetativo
- [ ] Columna `provisional`
- [ ] Ficheros de último año regenerados
- [ ] Año de referencia actualizado
- [ ] `npm run data:build` y `npm run validate:data` en verde
- [ ] Revisión de todas las gráficas y ajustes de ejes
- [ ] Build en verde
- [ ] Revisar el preview de Vercel
- [ ] PR

## Criterios de aceptación

- `npm run validate:data` termina con código 0.
- El último año de cada CSV coincide con el último periodo de su tabla en `docs/sprints/01/fuentes.md`. Comprobación: `tail -n 1` de cada fichero.
- `{p}/{p}-tarjetas.csv` tiene todos los años desde 2012 sin huecos.
- La población de Zaragoza capital del último año coincide con la cifra oficial del INE.
- Los rankings tienen la variación a 10 años distinta de 0 en la mayoría de filas.
- `git diff --stat` no muestra cambios en CSV de `public/data/` que no vengan de ejecutar `data:build`.
- `npm run build` genera 731 páginas de municipio.
- En el preview, a 375 px y a 1280 px de ancho, las gráficas de la home, de una provincia y de tres municipios muestran el último año en el eje y en el tooltip, sin etiquetas solapadas.

## Skills recomendados

- `dataviz`: para los ajustes de ejes y dominios al mezclar años censales y anuales.
- `run`: para revisar las gráficas en el sitio.
- `claude-in-chrome` o `agent-browser`: para recorrer el preview en los dos anchos.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 4 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-4-carga-de-datos.md
- docs/sprints/01/fuentes.md

Antes de escribir nada, lee enteros:
- todos los scripts de scripts/data/
- el módulo del año de referencia
- src/scripts/d3/aragonStacked.js y src/scripts/d3/scatterDesert.js
- src/components/GraficaPoblacion.astro, GraficaHistoricaPoblacion.astro,
  GraficaEdades.astro, GraficaDensidad.astro y GraficaSaldoVegetativo.astro
- src/components/DatosMunicipio.astro
- una muestra de cada fichero de data-raw/

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. scripts/data/transformar.js, primero reproduciendo los datos actuales. Si con los años
   que ya existen no genera los mismos valores que hay en public/data/, para y explica
   la diferencia antes de seguir.
2. Serie 2012-2019.
3. Años nuevos y columna provisional.
4. Año de referencia, data:build y validate:data.
5. Revisión de gráficas y ajustes.

Ningún CSV de public/data/ se edita a mano. Todo sale de los scripts.

Si la validación detecta municipios nuevos, desaparecidos o renombrados, no lo resuelvas
por tu cuenta: enséñame la lista y lo decidimos.

Crea la rama fase-4-carga-de-datos y ejecuta el alcance completo. Antes de abrir la PR,
lanza /code-review y atiende sus hallazgos.
```
