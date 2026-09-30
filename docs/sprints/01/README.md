# Sprint 01 — Actualización de datos

## Visión

La última actualización de datos de La casa caída es de mayo de 2025. La población llega a "2024", y el saldo vegetativo y la densidad a 2023. La documentación que explicaba cómo actualizar se borró del repo y el proceso real son tres scripts Node sin documentar, con el año fijado a mano en cuatro sitios.

Este sprint pone los datos al día con todo lo publicado, corrige los errores que ya había en los datos y deja la actualización anual reducida a unos pocos comandos documentados.

Todas las decisiones salen de la entrevista `/create-feature` del 2026-09-29.

## Prerrequisito

- `master` limpio y desplegando en Vercel.
- Node 22 o superior en local.

## Decisiones cerradas

| Tema | Decisión | Descartado y motivo |
|---|---|---|
| Alcance de datasets | Solo los que alimentan gráficas visibles. Se borran huérfanos y código muerto | Actualizar todo: trabajo para datos que nadie ve |
| Errores existentes | Se corrigen en este sprint | Sprint aparte: los errores se propagarían a los datos nuevos |
| Datos provisionales | Se usan, con aviso en la gráfica y en Metodología | Solo definitivos: la web quedaría un año por detrás |
| Scripts | Año en una constante única y cruces por código INE | Cambio mínimo: repetiría la búsqueda manual cada año |
| Descarga | Script Node contra la API del INE y del IAEST | Descarga manual: pasos a mano cada año |
| Cifras de la prosa | Se calculan en build desde un JSON generado | A mano: vuelven a desfasarse |
| Validación | `npm run validate:data`, sin CI | GitHub Action: mantenimiento que el proyecto no tiene hoy |
| Documentación | `docs/actualizar-datos.md` y README corregido | Todo en el README: crece demasiado |
| Huecos de la serie | Se rellenan 2012-2019 con datos anuales | Un año suelto: habría que repetirlo cada año |
| Rankings de densidad | Se generan y se publican en `/rankings` | Eliminarlos: salen casi gratis al arreglar la densidad |
| Despliegue | PR por fase con preview de Vercel. Se sube la versión de Node | Rama única: PR final difícil de revisar |

## Principios técnicos

- El código INE de 5 dígitos es la clave de cruce. El nombre solo se usa para mostrar.
- El año de referencia vive en un único módulo y nada más lo escribe a mano.
- Los datos fuente se guardan sin transformar en `data-raw/`. Los CSV de `public/data/` son siempre salida de un script.
- Ningún dato se publica sin pasar `npm run validate:data`.
- Las cabeceras y el orden de columnas de los CSV que ya consumen las gráficas no cambian, salvo donde una fase lo diga.

## Fases

| # | Fase | Documento | Depende de |
|---|---|---|---|
| 1 | Fuentes y descarga | [fase-1-fuentes-y-descarga.md](fase-1-fuentes-y-descarga.md) | — |
| 2 | Limpieza | [fase-2-limpieza.md](fase-2-limpieza.md) | — |
| 3 | Pipeline y correcciones | [fase-3-pipeline-y-correcciones.md](fase-3-pipeline-y-correcciones.md) | 2 |
| 4 | Carga de datos nuevos | [fase-4-carga-de-datos.md](fase-4-carga-de-datos.md) | 1 y 3 |
| 5 | Cifras, textos y rankings | [fase-5-cifras-textos-y-rankings.md](fase-5-cifras-textos-y-rankings.md) | 4 |
| 6 | Documentación, QA y cierre | [fase-6-documentacion-y-cierre.md](fase-6-documentacion-y-cierre.md) | 5 |

Orden recomendado: 1 y 2 a la vez, después 3, 4, 5 y 6.

**En paralelo:** las fases 1 y 2 no comparten ficheros y pueden ir en worktrees separados. La fase 3 puede empezar en cuanto se mergee la 2, aunque la 1 siga abierta. El resto es secuencial.

## Riesgos

| Riesgo | Qué se hace |
|---|---|
| Las tablas municipales no están en la API del INE, o no con la serie completa | Plan B: descarga manual de los CSV a `data-raw/` con la URL documentada. El resto del pipeline no cambia |
| El IAEST no ofrece API cómoda para nacimientos y defunciones | Plan B: usar el Movimiento Natural de la Población del INE, o introducir a mano las 3 filas por año |
| No está claro si el "2024" de los CSV es el padrón a 1-ene-2024 o a 1-ene-2025 | La fase 1 lo resuelve comparando con la cifra oficial de Zaragoza capital. Si está mal etiquetado, la fase 4 lo corrige |
| Cambios de municipios (fusiones, segregaciones, cambios de nombre) en los años nuevos | La validación avisa de códigos nuevos o desaparecidos. Se decide caso a caso y se anota en la guía |
| El cambio de tramos de edad del INE no permite reconstruir 0-16, 16-64 y 65+ | Se mantienen los tramos más cercanos disponibles y se corrige la etiqueta de la web |
| Rellenar 2012-2019 rompe el eje X de las gráficas, que hoy espera años censales | La fase 4 revisa las gráficas con la serie nueva antes de mergear |
| Borrar código muerto elimina algo que sí se usa | La fase 2 comprueba cada borrado con `grep` y con `npm run build` |

## Definición de hecho del sprint

- `npm run validate:data` termina sin errores.
- `npm run build` termina sin errores y genera 731 páginas de municipio.
- Todas las gráficas visibles muestran el último año publicado por su fuente.
- Almudévar tiene página y sale en los rankings.
- `grep` de años escritos a mano en `src/` solo devuelve el módulo central del año y textos históricos justificados.
- `docs/actualizar-datos.md` existe y el README enlaza a ella.
- El despliegue de producción en Vercel está revisado en escritorio y en móvil.
- `retro.md` está escrita.

## Después de este sprint

- Valorar una GitHub Action que ejecute validación y build en cada PR.
- Valorar si se recuperan el comparador de municipios o el mapa de rankings, borrados en la fase 2.
- La siguiente actualización anual debería hacerse siguiendo solo `docs/actualizar-datos.md`. Si no basta, se corrige la guía.
