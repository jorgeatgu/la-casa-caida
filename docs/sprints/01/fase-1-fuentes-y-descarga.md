# Fase 1 — Fuentes y descarga

## Objetivo

Saber exactamente qué datos hay publicados, de qué tabla sale cada uno, y tener un script que los descargue sin transformar a `data-raw/`. Esta fase no toca ningún CSV de `public/data/`.

## Dependencias

Ninguna. Puede ir en paralelo con la fase 2.

## Lo que hay hoy

- No hay ningún ID de tabla ni código de operación estadística en el repo.
- Fuentes citadas en los textos:
  - Serie 1900-2011: Aragón Open Data, "serie histórica de población municipios" (`README.md`).
  - Población desde 2012: INE (`src/components/Metodologia.astro:14-19`).
  - Saldo vegetativo: IAEST (`src/pages/provincia/*.astro`, l.77).
  - Superficie: gist `aragon.json`, campos `c_muni_ine` y `sup_of_km2` (`README.md`).
- Últimos años disponibles en el repo: población y edades "2024", saldo vegetativo 2023, densidad 2023.
- `src/pages/index.astro:31-32` dice "padrón del INE a fecha 1 de enero de 2025", pero los CSV y el código usan 2024.
- La documentación antigua y los scripts bash se borraron. Hay dos commits candidatos: `8a9f4d1` y `d0a3bfd`.
- Dependencias útiles ya instaladas: `csv-parse`.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Descarga | Script Node contra API. Descarga manual solo como plan B |
| Provisionales | Se descargan y se marcan como tales |
| Huecos | Se descarga la serie anual desde 2012 |
| Alcance | Solo datos que alimentan gráficas visibles |

## Alcance

1. Recuperar del historial de git la documentación y los scripts borrados, y guardarlos como referencia en `docs/sprints/01/referencia/`.
2. Determinar la fecha de referencia real del "2024" de los CSV, comparando con cifras oficiales del INE.
3. Identificar las tablas y anotar ID, URL, periodicidad, último periodo y si es definitivo o provisional:
   - Población por municipio, anual desde 2012, las tres provincias.
   - Población por municipio y edad, que permita los grupos 0-16, 16-64 y 65+.
   - Nacimientos y defunciones por provincia.
4. Escribir `docs/sprints/01/fuentes.md` con esa tabla y con la respuesta del punto 2.
5. Crear `scripts/data/descargar.js`, que guarda las respuestas en `data-raw/<fuente>/<tabla>.json` o `.csv`, sin transformar.
6. Añadir el script `data:download` a `package.json`.
7. Guardar la superficie por municipio en `data-raw/superficie.csv`, con código INE, a partir del gist.
8. Decidir si `data-raw/` se versiona. Recomendación: sí, porque hace reproducible el pipeline.

## Fuera de alcance

- Transformar los datos o tocar `public/data/`.
- Cambiar los scripts de procesado existentes.
- Cualquier cambio en componentes o páginas.

## Tareas

- [ ] Crear la rama `fase-1-fuentes-y-descarga`
- [ ] Recuperar documentación y scripts borrados a `docs/sprints/01/referencia/`
- [ ] Resolver la fecha de referencia del "2024"
- [ ] Identificar tablas del INE y del IAEST
- [ ] Escribir `docs/sprints/01/fuentes.md`
- [ ] Escribir `scripts/data/descargar.js`
- [ ] Añadir `data:download` a `package.json`
- [ ] Generar `data-raw/superficie.csv`
- [ ] Ejecutar la descarga y revisar lo descargado
- [ ] Build en verde
- [ ] PR

## Criterios de aceptación

- `npm run data:download` termina con código 0 y deja ficheros en `data-raw/`.
- Lanzarlo dos veces seguidas da los mismos ficheros: `git status data-raw/` no muestra cambios tras la segunda.
- `docs/sprints/01/fuentes.md` tiene una fila por tabla con ID, URL, último periodo y estado definitivo o provisional.
- `fuentes.md` responde de forma explícita a qué fecha corresponde el "2024" actual.
- `data-raw/superficie.csv` tiene 731 filas de datos: `tail -n +2 data-raw/superficie.csv | wc -l`.
- `git diff master -- public/data src` no muestra cambios.
- `npm run build` termina sin errores.

## Skills recomendados

- `claude-in-chrome` o `agent-browser`: para localizar las tablas en las webs del INE y del IAEST cuando la API no las liste con claridad.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 1 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-1-fuentes-y-descarga.md

Antes de escribir nada, lee enteros también:
- README.md
- package.json
- src/components/Metodologia.astro
- src/scripts/procesarDatos.js
- calcularPorcentajesEdad.js
- la cabecera y las últimas 20 líneas de un CSV de cada tipo en public/data/zaragoza/

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. Recupera del historial de git la documentación y los scripts bash borrados. Hay dos
   commits candidatos, 8a9f4d1 y d0a3bfd. Comprueba cuál es.
2. Resuelve a qué fecha de referencia corresponde el "2024" de los CSV.
3. Identifica las tablas del INE y del IAEST y escribe docs/sprints/01/fuentes.md.
4. Escribe scripts/data/descargar.js y el script data:download.
5. Genera data-raw/superficie.csv.

No toques nada en public/data/ ni en src/.

Si una tabla no está disponible por API, no lo fuerces: aplica el plan B del README
(descarga manual documentada) y déjalo anotado en fuentes.md. Si la descarga manual
necesita que yo descargue algo desde el navegador, dime exactamente qué URL y dónde
guardarlo.

Crea la rama fase-1-fuentes-y-descarga y ejecuta el alcance completo. Antes de abrir la PR,
lanza /code-review y atiende sus hallazgos.
```
