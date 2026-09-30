# Referencia: documentación y scripts borrados

Material recuperado del historial de git para consultar cómo se generaban los datos antes del sprint 01. **No se ejecuta.** Los scripts usan rutas absolutas (`~/github/la-casa-caida/data/...`), bash 4 (`/usr/local/bin/bash`), csvkit, jq y ficheros intermedios que ya no existen.

## Origen

| Ficheros | Commit del borrado | Recuperados desde |
|---|---|---|
| `datos-readme.md` (era `public/data/readme.md`, antes `data/readme.md`, enlazado desde el README) | `8a9f4d1` (2025-03-23, "data") | `8a9f4d1^` |
| Todos los `.sh` salvo el de abajo (misma subruta que tenían bajo `public/data/`) | `8a9f4d1` | `8a9f4d1^` |
| `evolucion/huesca/porcentaje-huesca.sh` | `a1ca46b` (2025-01-27, "update") | `a1ca46b^` |

`d0a3bfd` (2021-03-11, "release") no borró nada: movió `data/` a `dist/data/` y a `public/data/` (renombrados al 100 %).

## Qué hacía cada grupo

- `datos-readme.md`: separar por provincia con `csvgrep`, porcentaje de mayores de 65 y menores de 18, y superficie y densidad a partir del gist `aragon.json` con `jq`.
- `data2020/`: convertir los CSV del INE (separador `;`, "1 de enero de", miles con punto) y agregar por municipio, grupo de edad (0-18, 18-40, 40-65, 65-100) y año (2015-2020). Es el origen de `*-years-groups-total.csv`.
- `json/densidad-poblacion-*.sh`: densidad = población / `sup_of_km2`.
- `*/porcentaje-*.sh`: porcentajes de variación y de mayores y menores con `bc`.
- `comarcas/`: agregados por comarca (la sección se eliminó de la web).
