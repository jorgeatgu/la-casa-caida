# Fase 5 — Cifras, textos y rankings

## Objetivo

Que ninguna cifra de la web esté escrita a mano: las cifras destacadas salen de un JSON generado, los años de los textos salen del módulo central, los datos provisionales se avisan, y los rankings de densidad se publican.

## Dependencias

Depende de la fase 4. No puede ir en paralelo con ninguna.

## Lo que hay hoy

Cifras escritas a mano:

| Fichero | Qué hay |
|---|---|
| `src/pages/index.astro:29` | Total de Aragón y % en Zaragoza, de 2023. Densidad de Aragón |
| `src/pages/index.astro:31-32` | "Actualizado el 6 de mayo de 2025" y "1 de enero de 2025" |
| `src/pages/index.astro:50-131` | Población, densidad, nº de municipios y superficie por provincia. Mezcla 2019 y 2020. Dice 202 municipios en Huesca |
| `src/pages/provincia/*.astro:15-31` | Arrays `datos*` con porcentajes |
| `src/pages/provincia/huesca.astro:54` | "141 de estos tienen densidad inferior a 10" |
| `src/pages/provincia/teruel.astro`, intro | "28 municipios sin menores de 16" y "85 municipios con menos de 5 menores de 18" |
| `src/pages/provincia/zaragoza.astro`, intro | "entre 2006 y 2011 saldo positivo", "serie (1996-2017)" |
| `src/pages/provincia/*.astro:64-66` | "desde 1900 hasta 2024", "Los datos de 2024 son del INE" |
| `src/pages/municipio/[slug].astro:63` | "desde 1900 hasta 2024" |
| `src/components/DatosMunicipio.astro:25,33,87` | Año 2024. En l.101 pone "Menores de 18 años" y el dato es 0-16 |
| `src/components/RankingMunicipios.astro:61-80,132,140` | Títulos y cabeceras con años |
| `src/components/Metodologia.astro:18,47,59` | "2012-2024", "Última actualización: Mayo 2025", "(1900-2024)" |
| `src/layouts/Layout.astro:40`, `src/components/Footer.astro:7` | "2019 - 2025" |

Rankings:
- `src/pages/rankings.astro` muestra 4 tipos.
- `src/components/RankingMunicipios.astro:84-93` ya define los de densidad alta y baja.
- Los CSV de densidad existen desde la fase 3.

Provisionales:
- Los ficheros afectados llevan una columna `provisional` desde la fase 4.
- Ninguna gráfica la lee todavía.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Cifras | Se calculan en build desde un JSON generado |
| Provisionales | Aviso en la gráfica y en Metodología |
| Rankings de densidad | Se publican en `/rankings` |
| Prosa cualitativa | Se revisa a mano contra los datos nuevos |

## Alcance

1. Escribir `scripts/data/cifras.js`, que genera `src/data/cifras.json` con: totales y porcentajes de Aragón y de cada provincia, densidades, número de municipios, municipios bajo 10 hab/km², municipios sin menores, y los valores de los arrays `datos*`. Añadirlo a `data:build`.
2. Sustituir las cifras escritas a mano de `index.astro` y de `provincia/*.astro` por lecturas de `cifras.json`.
3. Sustituir los años escritos a mano por el módulo central en páginas y componentes.
4. La fecha de "última actualización" se toma de un campo de `cifras.json`, no del día del build.
5. Corregir la etiqueta "Menores de 18 años" de `DatosMunicipio.astro:101`.
6. Revisar a mano la prosa cualitativa de las tres provincias contra los datos nuevos y reescribir lo que ya no sea cierto.
7. Aviso de provisional: distinguir visualmente el dato en la gráfica y en el tooltip, y añadir una nota en `Metodologia.astro`.
8. Publicar los dos rankings de densidad en `rankings.astro`.
9. Año del copyright en `Layout.astro` y `Footer.astro` calculado.
10. Ampliar `validar.js` para comprobar que `cifras.json` es coherente con los CSV.

## Fuera de alcance

- Rediseño de páginas o de gráficas.
- Nuevas métricas o nuevas gráficas.
- README y guía de actualización. Son de la fase 6.

## Tareas

- [ ] Crear la rama `fase-5-cifras-textos-y-rankings`
- [ ] `scripts/data/cifras.js` y `src/data/cifras.json`
- [ ] Cifras de `index.astro`
- [ ] Cifras de `provincia/*.astro`
- [ ] Años desde el módulo central
- [ ] Etiqueta de menores corregida
- [ ] Revisión de la prosa cualitativa
- [ ] Aviso de provisional en gráficas y Metodología
- [ ] Rankings de densidad publicados
- [ ] Copyright calculado
- [ ] `npm run validate:data` en verde
- [ ] Build en verde
- [ ] Revisar el preview de Vercel
- [ ] PR

## Criterios de aceptación

- `grep -rnE "\b20(1[0-9]|2[0-9])\b" src/pages src/components src/layouts` solo devuelve años de contexto histórico. Cada resultado que quede se justifica en la PR.
- `grep -rnE "[0-9]{1,3}\.[0-9]{3}" src/pages` no devuelve cifras de población escritas a mano.
- La población de Aragón de la home coincide con la última fila de `aragon-total.csv`.
- El número de municipios de Huesca en la home es 202.
- `/rankings` muestra 6 rankings, y los de densidad tienen valores distintos de 0.
- Si hay algún dato provisional, se distingue en la gráfica y en el tooltip, y Metodología lo explica. Si no hay ninguno, no aparece ningún aviso.
- El aviso de provisional no depende solo del color.
- `npm run validate:data` y `npm run build` terminan sin errores.
- En el preview, a 375 px y a 1280 px, la home, las tres provincias y `/rankings` se leen sin desbordes.

## Skills recomendados

- `dataviz`: para el tratamiento visual del dato provisional en las gráficas.
- `ux-designer`: para la colocación y el texto del aviso. Pregunta antes de decidir.
- `run`: para revisar las páginas en el sitio.
- `claude-in-chrome` o `agent-browser`: para recorrer el preview en los dos anchos.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 5 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-5-cifras-textos-y-rankings.md
- docs/sprints/01/fuentes.md

Antes de escribir nada, lee enteros:
- src/pages/index.astro
- src/pages/provincia/huesca.astro, teruel.astro y zaragoza.astro
- src/pages/municipio/[slug].astro
- src/pages/rankings.astro
- src/components/DatosMunicipio.astro, RankingMunicipios.astro, Metodologia.astro,
  DatosDestacados.astro, Footer.astro y GraficaSaldoVegetativo.astro
- src/layouts/Layout.astro
- todos los scripts de scripts/data/ y el módulo del año de referencia

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. scripts/data/cifras.js. Antes de sustituir nada, enséñame una tabla con cada cifra
   actual de la web y su valor nuevo.
2. Sustitución de cifras y de años.
3. Prosa cualitativa: enséñame cada frase que ya no sea cierta con tu propuesta, y espera
   mi visto bueno. El texto es mío y no se reescribe sin que lo vea.
4. Aviso de provisional.
5. Rankings de densidad.
6. npm run validate:data y npm run build.

Crea la rama fase-5-cifras-textos-y-rankings desde update-2025 actualizada, abre la PR contra update-2025 (no
contra master) y ejecuta el alcance completo. Antes de abrir
la PR, lanza /code-review y atiende sus hallazgos.
```
