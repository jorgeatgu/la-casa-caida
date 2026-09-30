# Fase 6 — Documentación, QA y cierre

## Objetivo

Dejar escrita la guía para que la próxima actualización anual se haga sin redescubrir nada, corregir el README, hacer el QA completo de producción y cerrar el sprint con su retrospectiva.

## Dependencias

Depende de la fase 5. Es la última.

## Lo que hay hoy

- `README.md` habla de datos de 2018 (1.308.728 habitantes, 50,95 %, 27,42 hab/km²) y enlaza a `data/readme.md`, que no existe.
- No hay `docs/` fuera de `docs/sprints/01/`.
- `docs/sprints/01/fuentes.md` tiene las tablas, y `docs/sprints/01/referencia/` la documentación antigua recuperada.
- Pipeline tras la fase 5: `data:download`, `data:build` y `validate:data`, con los scripts en `scripts/data/`.
- `src/components/Metodologia.astro` describe fuentes y periodicidad para el lector.
- No hay `CLAUDE.md`. Se descartó crearlo en este sprint.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Guía | `docs/actualizar-datos.md` |
| README | Corrige el enlace y las cifras, y apunta a la guía |
| CI | No se añade |
| QA | Preview por fase y revisión final en producción |

## Alcance

1. Escribir `docs/actualizar-datos.md` con:
   - Cuándo actualizar: calendario de publicación de cada fuente.
   - Fuentes: tabla con ID, URL y qué fichero alimenta. Se traslada desde `fuentes.md`.
   - Pasos en orden, con el comando de cada uno.
   - Formato de cada CSV de `public/data/`: columnas, tipos y qué gráfica lo usa.
   - Dónde se cambia el año de referencia.
   - Qué revisar a mano: prosa cualitativa de las provincias.
   - Qué hacer si cambia un municipio, y qué hacer si la API falla.
   - Cómo pasar un dato de provisional a definitivo.
2. Corregir `README.md`: cifras, fuentes, enlace a la guía.
3. Revisar que `Metodologia.astro` coincide con la guía.
4. Probar la guía: seguirla desde cero en un clon limpio y comprobar que el resultado es idéntico.
5. QA de producción tras el merge.
6. Escribir `retro.md`.

## Fuera de alcance

- Cambios en datos, scripts o componentes, salvo errores que encuentre el QA.
- `CLAUDE.md` y GitHub Actions.

## Tareas

- [ ] Crear la rama `fase-6-documentacion-y-cierre`
- [ ] `docs/actualizar-datos.md`
- [ ] `README.md` corregido
- [ ] `Metodologia.astro` revisada
- [ ] Guía probada en un clon limpio
- [ ] Build en verde
- [ ] PR
- [ ] QA de producción en escritorio y en móvil
- [ ] `retro.md`

## Criterios de aceptación

- Existe `docs/actualizar-datos.md` y `README.md` enlaza a ella.
- `grep -n "data/readme.md\|2018" README.md` no devuelve el enlace roto ni cifras de 2018.
- En un clon limpio, `npm ci && npm run data:download && npm run data:build && npm run validate:data && npm run build` termina sin errores y `git status` queda limpio.
- Todos los comandos y rutas que cita la guía existen.
- QA de producción en casacaida.co, en escritorio y en un móvil real:
  - Home: las dos gráficas cargan y muestran el último año.
  - Las tres provincias: gráfica histórica y saldo vegetativo con el último año.
  - Municipios: Zaragoza, Almudévar, Vencillón, La Almolda y uno de menos de 50 habitantes.
  - `/rankings`: 6 rankings con datos.
  - Sin errores en la consola del navegador.
- `retro.md` tiene contenido en sus tres secciones.

## Skills recomendados

- `vercel:verification`: para comprobar el despliegue de producción.
- `claude-in-chrome` o `agent-browser`: para el recorrido de QA y la consola.
- `/code-review` antes de la PR, y `/create-commit` y `/create-pr` para el commit y la PR.

## PROMPT

```
Vamos a ejecutar la Fase 6 del Sprint 01 de "La casa caída".

Lee primero, enteros:
- docs/sprints/01/README.md
- docs/sprints/01/fase-6-documentacion-y-cierre.md
- docs/sprints/01/fuentes.md
- el resto de documentos de fase del sprint, para saber qué se hizo

Antes de escribir nada, lee enteros:
- README.md
- package.json
- todos los scripts de scripts/data/ y el módulo del año de referencia
- src/components/Metodologia.astro
- las descripciones de las PR de las fases 1 a 5

Las decisiones están cerradas en esos documentos y no se vuelven a preguntar.

Orden de trabajo:
1. docs/actualizar-datos.md, escrita a partir de lo que hacen los scripts hoy, no de lo
   que decían los documentos de fase.
2. README.md y revisión de Metodologia.astro.
3. Prueba de la guía en un clon limpio, en el directorio temporal de la sesión.
4. PR.
5. Tras el merge, QA de producción.
6. retro.md: prepárame un borrador con lo que viste en las PR y lo completo yo.

El QA en móvil real lo hago yo a mano. Dame la lista de páginas y qué mirar en cada una.

Crea la rama fase-6-documentacion-y-cierre y ejecuta el alcance completo. Antes de abrir la
PR, lanza /code-review y atiende sus hallazgos.
```
