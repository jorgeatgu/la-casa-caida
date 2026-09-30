# Fase 2 — Limpieza

## Objetivo

Borrar los datasets huérfanos y el código que ninguna página usa, y subir la versión de Node del proyecto. Así las fases siguientes solo trabajan sobre lo que de verdad se publica.

## Dependencias

Ninguna. Puede ir en paralelo con la fase 1. La fase 3 depende de esta.

## Lo que hay hoy

Datasets sin ninguna gráfica en uso, en `public/data/`:
- `aragon-desierto-demografico.csv`
- `{p}/{p}-2010-2020.csv`
- `{p}/{p}-evolucion.csv`
- `public/data/public/data/`, que solo contiene `.DS_Store`

Componentes que no se importan en ninguna página, en `src/components/`:
- `ComparadorMunicipios.astro` (pide `/data/{p}/{codigo}.csv`, que no existe)
- `ComparativaMunicipios.astro`
- `GraficaDesiertoDemografico.astro`
- `GraficaDistribucion.astro`
- `GraficaEvolucionPoblacion.astro`
- `MapaRankings.astro`
- `ResumenAragon.astro`

Scripts d3 antiguos que no se importan, en `src/scripts/d3/`:
- `barScatter`, `barVegetative`, `lineHistoric`, `linePopulation`, `lineEvolution`, `lineDensidad`, `scatterEvolution`, `municipalitiesStacked` e `index.js`

Siguen en uso y no se tocan: `src/scripts/d3/scatterDesert.js` y `src/scripts/d3/aragonStacked.js`, que se cargan desde `src/pages/index.astro:145,156`.

Otros:
- `src/content/blog/primer-post.md` es un post de relleno con autor inventado.
- `.vercel/project.json` fija `nodeVersion: "16.x"`. Este fichero está en `.gitignore`, así que el cambio se hace en el panel de Vercel.
- `package.json` pide Astro `^5.15.9`, pero el `node_modules` local tiene la 5.5.4.
- `.DS_Store` aparece dentro de `public/data/`.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Huérfanos | Se borran. Quedan recuperables en git |
| Código muerto | Se borra |
| Node | Se sube la versión en Vercel y se declara en `package.json` |

## Alcance

1. Confirmar con `grep` que cada fichero de la lista no se importa ni se referencia en ningún sitio.
2. Borrar los datasets huérfanos.
3. Borrar los componentes y los scripts d3 no usados.
4. Borrar el post de relleno. Si el blog se queda sin posts, comprobar que `src/pages/blog/index.astro` y `[slug].astro` siguen construyendo, o quitarlos del menú.
5. Añadir `.DS_Store` a `.gitignore` y borrar los que estén versionados.
6. Declarar `engines.node` en `package.json` y reinstalar dependencias.
7. Anotar en la PR que hay que cambiar la versión de Node en el panel de Vercel.

## Fuera de alcance

- Modificar cualquier dataset que sí se usa.
- Refactorizar componentes en uso.
- Cambiar los scripts de procesado de datos.

## Tareas

- [ ] Crear la rama `fase-2-limpieza`
- [ ] Verificar con `grep` cada fichero candidato
- [ ] Borrar datasets huérfanos
- [ ] Borrar componentes y scripts d3 muertos
- [ ] Resolver el post de relleno y el estado del blog
- [ ] `.DS_Store` fuera del repo
- [ ] `engines.node` y reinstalación
- [ ] Build en verde
- [ ] Revisar el preview de Vercel
- [ ] PR

## Criterios de aceptación

- `npm run build` termina sin errores.
- El número de páginas generadas es el mismo que en `master`, salvo las del post borrado: comparar `find dist -name "*.html" | wc -l` antes y después.
- `grep -rE "evolucion\.csv|2010-2020\.csv|desierto-demografico" src` no devuelve nada.
- `ls src/scripts/d3` devuelve solo `aragonStacked.js` y `scatterDesert.js`.
- `git ls-files | grep DS_Store` no devuelve nada.
- En el preview de Vercel, la home, una provincia, un municipio y `/rankings` se ven igual que en producción.

## Skills recomendados

- `run`: para levantar el sitio y comprobar que las páginas siguen funcionando tras los borrados.
- `vercel:deployments-cicd`: para el cambio de versión de Node y la revisión del preview.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 2 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-2-limpieza.md

Antes de borrar nada, lee enteros:
- src/pages/index.astro
- src/pages/rankings.astro
- src/pages/provincia/huesca.astro
- src/pages/municipio/[slug].astro
- src/pages/blog/index.astro y src/pages/blog/[slug].astro
- src/layouts/Layout.astro
- package.json y astro.config.mjs

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. Guarda el número de páginas que genera master con npm run build.
2. Para cada fichero de la lista de la fase, confirma con grep que no se usa. Si alguno
   sí se usa, no lo borres y anótalo en la PR.
3. Borra datasets, componentes y scripts.
4. Resuelve el post de relleno y comprueba que el blog sigue construyendo.
5. Limpia los .DS_Store y declara engines.node.
6. npm run build y comparación de páginas.

El cambio de versión de Node en el panel de Vercel lo hago yo a mano. Recuérdamelo en la
descripción de la PR.

Crea la rama fase-2-limpieza y ejecuta el alcance completo. Antes de abrir la PR, lanza
/code-review y atiende sus hallazgos.
```
