# Fuentes de datos

Resultado de la fase 1 del sprint 01, comprobado contra la API del INE el 2026-09-30. `npm run data:download` (`scripts/data/descargar.js`) descarga todas las tablas a `data-raw/`.

## ¿A qué fecha corresponde el "2024" de los CSV actuales?

**A 1 de enero de 2024.** Pero no todos los CSV salen de la misma fuente:

| CSV de `public/data/` | Fuente real | Comprobación |
|---|---|---|
| `*-municipios.csv`, `*-tarjetas.csv`, `<prov>.csv`, `*-total.csv` (año 2024) | Padrón municipal (DPOP), cifras oficiales a 1-ene-2024 | Zaragoza capital (50297) 686.986 y provincia de Zaragoza 983.539, iguales que la tabla 2907, periodo 2024-01-01 |
| `*-years-groups-total.csv`, `*-mayor-menor.csv` (año 2024) | **Censo Anual de Población** a 1-ene-2024, no el padrón | Zaragoza capital 691.037 (padrón: 686.986); Villanueva de Gállego 4.809 (padrón: 4.814); Zaragoza, 65 y más, 154.843: los tres iguales que la tabla 68540, periodo 2024 |
| `saldo-vegetativo-total-*.csv` (último año 2023) | MNP definitivo 2023 | Zaragoza: 6.409 nacimientos y 9.769 defunciones, iguales que las tablas 6506 y 6545 |
| `*-densidad.csv` (año 2023) | Padrón a 1-ene-2023 / superficie del gist | Zaragoza capital 682.513, igual que la tabla 2907, periodo 2023 |

Consecuencias para las fases siguientes:

- El "2024" está bien etiquetado: es el padrón a 1-ene-2024. Lo que está mal es `src/pages/index.astro:31-32` ("padrón del INE a fecha 1 de enero de 2025").
- La población total que usan los porcentajes de edad (censo) no es la del padrón. Hay que decidir si se sigue así y documentarlo en Metodología.
- El tramo que se etiqueta como "0-16" es en realidad **"Menos de 16 años"** (0-15). "16-64" y "65-100" corresponden a "De 16 a 64" y "65 y más".
- `zaragoza-total.csv` no coincide con el INE en 2022 y 2023: 2023 = 979.365 (INE 977.413) y 2022 = 968.884 (INE 966.438). Además tiene la cabecera repetida. Lo corrige la fase 3. **Corregido en la fase 3**, junto con los totales de 2021-2023 de Huesca y Teruel, que tampoco coincidían: los `*-total.csv` y `aragon-total.csv` toman ahora de DPOP todos los años del padrón.

## Tablas que se usan

Último periodo comprobado el 2026-09-30. API: `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/<id>`. Web: `https://www.ine.es/jaxiT3/Tabla.htm?t=<id>`.

| Dato | Operación | ID | Cobertura | Periodicidad | Último periodo | Estado | Acceso | Fichero |
|---|---|---|---|---|---|---|---|---|
| Población por municipio y sexo, Huesca | Cifras oficiales del Padrón (DPOP) | [2875](https://www.ine.es/jaxiT3/Tabla.htm?t=2875) | 1996-2025, 202 municipios + provincia | Anual (1 de enero), se publica en diciembre | 1-ene-2025 | Definitivo | API `?tip=AM` | `data-raw/ine/dpop-2875-huesca.json` |
| Población por municipio y sexo, Teruel | DPOP | [2899](https://www.ine.es/jaxiT3/Tabla.htm?t=2899) | 1996-2025, 236 municipios + provincia | Anual | 1-ene-2025 | Definitivo | API `?tip=AM` | `data-raw/ine/dpop-2899-teruel.json` |
| Población por municipio y sexo, Zaragoza | DPOP | [2907](https://www.ine.es/jaxiT3/Tabla.htm?t=2907) | 1996-2025, 293 municipios + provincia | Anual | 1-ene-2025 | Definitivo | API `?tip=AM` | `data-raw/ine/dpop-2907-zaragoza.json` |
| Población por municipio, sexo, edad (Menos de 16, 16-64, 65 y más) y relación nacimiento-residencia | Censo Anual de Población | [68540](https://www.ine.es/jaxiT3/Tabla.htm?t=68540) | 2021-2025, todos los municipios | Anual (1 de enero), se publica en diciembre | 1-ene-2025 | Definitivo | CSV completo `https://www.ine.es/jaxiT3/files/t/es/csv_bdsc/68540.csv` (ver nota) | `data-raw/ine/censo-68540-edad-grandes-grupos.csv` |
| Nacimientos por provincia de residencia de la madre | MNP Nacimientos | [6506](https://www.ine.es/jaxiT3/Tabla.htm?t=6506) | Total nacional y provincias | Anual | 2024 | Definitivo | API `?tip=A` | `data-raw/ine/mnp-6506-nacimientos.json` |
| Defunciones por provincia de residencia | MNP Defunciones | [6545](https://www.ine.es/jaxiT3/Tabla.htm?t=6545) | Total nacional y provincias | Anual | 2024 | Definitivo | API `?tip=A` | `data-raw/ine/mnp-6545-defunciones.json` |
| Nacimientos mensuales y acumulados por provincia | Estimación Mensual de Nacimientos (EMN) | [46682](https://www.ine.es/jaxiT3/Tabla.htm?t=46682) | Total nacional, CCAA y provincias | Mensual | 2025 completo (acumulado de diciembre) y 2026 hasta julio | **Provisional** (`T3_TipoDato` = "Estimados") | API `?tip=A` | `data-raw/ine/emn-46682-nacimientos-mensuales.json` |
| Defunciones mensuales y acumuladas por provincia | Estimación de Defunciones Semanales (EDeS) | [62278](https://www.ine.es/jaxiT3/Tabla.htm?t=62278) | Total nacional y provincias | Mensual | 2025 completo y 2026 parcial | **Provisional** | API `?tip=A` | `data-raw/ine/edes-62278-defunciones-mensuales.json` |
| Superficie por municipio | Gist `aragon.json` (campos `c_muni_ine`, `sup_of_km2`, `shape_area`) | — | 731 municipios | Estática | — | Con errores (ver abajo) | [gist](https://gist.githubusercontent.com/jorgeatgu/40eaa471b02add6d9a7a9aca33fc8bd5/raw/ef7d384a0749df4f9b3594c76b432026344b0df9/aragon.json) | `data-raw/superficie.csv` |

Notas:

- **Código INE.** Con `tip=AM`, cada serie de DPOP trae el código de 5 dígitos en `MetaData[0].Codigo`. El nombre de la serie ("Zaragoza. Total. Total habitantes. Personas.") no lleva código y no se debe usar para cruzar. En el censo, el código es el prefijo de la columna `Municipios` ("50297 Zaragoza").
- **68540 por CSV y no por API.** La API Tempus responde `{"status": "No puede mostrarse por restricciones de volumen"}` incluso filtrando sexo y relación (`tv=18:451&tv=771:304582`). El script descarga el CSV nacional (unos 335 MB) en streaming y guarda solo la cabecera y las líneas de las provincias 22, 44 y 50 con Sexo = Total y Relación = Total, **copiadas sin modificar**: 734 ámbitos (731 municipios + 3 provincias) × 4 tramos de edad × 5 años = 14.680 filas. Es una descarga automática; no hay que hacer nada a mano.
- **Formato de los números.** El CSV del censo usa punto de miles ("691.037") y va en UTF-8 con BOM. La API devuelve números.
- **Datos provisionales.** Para el saldo vegetativo de 2025 no hay MNP (el definitivo sale a finales de 2026). EMN y EDeS dan el total anual provisional con el acumulado de diciembre de 2025. Por ejemplo, Zaragoza: 6.399 nacimientos. Se marcan como provisionales según la decisión del sprint.
- **1-ene-2026** aún no está publicado por municipio: DPOP y el Censo Anual salen en diciembre. La ECP provisional a 1-ene-2026 solo cubre 83 municipios grandes.
- **Municipios.** Los 731 códigos de DPOP a 1-ene-2025 coinciden exactamente con los del gist. En la serie 2012-2025 no aparecen ni desaparecen códigos en Aragón. Lo verifica la validación de la fase 3.

## Tablas y fuentes descartadas

| Fuente | Motivo |
|---|---|
| Estadística del Padrón Continuo, edad año a año por municipio: 33817 (Huesca), 33937 (Teruel), 33967 (Zaragoza) | La serie termina el 1-ene-2022. El INE la sustituyó por el Censo Anual. Los años 2003-2022 publicados se congelan en `data-raw/historico/edades-padron-2003-2022.csv` (fase 4) |
| Padrón Continuo, grupos quinquenales por municipio | Termina en 2022 y los quinquenios no permiten 0-15 / 16-64 |
| Censo Anual 68535 (grupos quinquenales y nacionalidad) | 717 MB y no da el corte en 16 años. La 68540 da los tres tramos directamente |
| ECP 79543 (municipios y grandes grupos de edad) | Solo 83 municipios grandes (en Aragón: Huesca, Teruel y Zaragoza capitales) |
| IAEST, movimiento natural de la población | El MNP del INE da exactamente las mismas cifras que había en el repo (citadas como IAEST) y tiene API. Se aplica el plan B del README del sprint: el MNP del INE |
| Aragón Open Data, serie histórica 1900-2011 | No cambia. Se mantiene la serie actual, congelada en `data-raw/historico/censos-1900-2011.csv` (fase 4) |

## Superficie: errores del gist

El script escribe `data-raw/superficie.csv` con `codigo_ine,nombre,sup_of_km2,area_poligono_km2`:

- `sup_of_km2`: valor del gist, sin tocar.
- `area_poligono_km2`: `shape_area / 1e6` del mismo feature, solo como comprobación.
- El código 22246 aparece dos veces en el gist (Veracruz y Beranuy, con la misma geometría y superficie). Se deja una fila con el nombre actual, Beranuy.
- Los nombres con mojibake ("CastejÃ³n") se reparan. El nombre es solo para mostrar.

Hay 31 municipios cuyo `sup_of_km2` se aleja más de un 5 % del área del polígono. La mayoría son un cruce por prefijo del nombre en el origen del gist: todos los "Castejón de…" valen 17,56; "Villanueva…" 75,99; "Santa Cruz de…" 19,51; "Torralba de…" 40,39; "La Puebla de…" 17,03; "Villarroya…" 91. Es la causa de las densidades absurdas que hay hoy en `*-densidad.csv` (Villanueva de Jiloca, 75,99 km²). Argavieso y Jasa solo difieren por redondeo a entero. En Ansó y Fago el polígono de Fago tiene la misma área que el de Ansó, así que ahí tampoco sirve el polígono. **La fase 3 decide la corrección**, idealmente con una fuente oficial de superficie (IGN / IAEST) o con el área del polígono.

**Decisión de la fase 3.** Se usa `sup_of_km2`, salvo en los 27 municipios de la tabla con más de un 5 % de desviación, donde se usa `area_poligono_km2` con dos decimales. Hay cuatro excepciones que conservan `sup_of_km2`: Argavieso y Jasa (22036 y 22131), porque la diferencia es de redondeo, y Ansó y Fago (22028 y 22106), porque su polígono es compartido. La superficie se cruza siempre por código. Al generar `*-densidad.csv` y `aragon-municipios.csv` hay que aplicar la misma regla.

| Código | Municipio | `sup_of_km2` | Área del polígono |
|---|---|---|---|
| 22028 | Anso | 223.08 | 261.61 |
| 22036 | Argavieso | 9 | 9.72 |
| 22083 | Castejón de Monegros | 17.56 | 165.42 |
| 22084 | Castejón de Sos | 17.56 | 31.59 |
| 22106 | Fago | 28.76 | 261.61 |
| 22131 | Jasa | 8 | 8.91 |
| 22187 | La Puebla de Castro | 17.03 | 29.42 |
| 22209 | Santa Cruz de La Serós | 19.51 | 26.97 |
| 22235 | Torres de Alcanadre | 28.31 | 17.64 |
| 22251 | Villanueva de Sigena | 75.99 | 146.47 |
| 44038 | Belmonte de San José | 43.68 | 33.99 |
| 44065 | Castejón de Tornos | 17.56 | 30.89 |
| 44138 | Loscos | 71.78 | 83.99 |
| 44175 | Orrios | 35 | 44.23 |
| 44191 | La Puebla de Híjar | 17.03 | 60.80 |
| 44192 | La Puebla de Valverde | 17.03 | 282.76 |
| 44207 | San Martín del Río | 5.42 | 16.57 |
| 44208 | Santa Cruz de Nogueras | 19.51 | 15.17 |
| 44220 | Torralba de Los Sisones | 40.39 | 44.78 |
| 44222 | Torrecilla del Rebollar | 26.76 | 63.44 |
| 44256 | Villanueva del Rebollar de La Sierra | 75.99 | 18.99 |
| 44262 | Villarroya de Los Pinares | 91 | 66.43 |
| 50076 | Castejón de Las Armas | 17.56 | 16.18 |
| 50077 | Castejón de Valdejasa | 17.56 | 110.11 |
| 50202 | Paracuellos de La Ribera | 32 | 14.95 |
| 50237 | Santa Cruz de Moncayo | 19.51 | 3.97 |
| 50238 | Santa Eulalia de Gállego | 80.97 | 29.58 |
| 50256 | Torralba de Los Frailes | 40.39 | 59.19 |
| 50257 | Torralba de Ribota | 40.39 | 32.51 |
| 50289 | Villanueva de Jiloca | 75.99 | 7.34 |
| 50294 | Villarroya del Campo | 91 | 16.94 |

## `data-raw/` se versiona

Sí. Así el pipeline es reproducible sin red y el diff de cada actualización anual muestra qué cambió el INE. Ocupa unos 17 MB. El JSON de la API se guarda byte a byte, tal como llega.

## Documentación antigua

Recuperada en [`referencia/`](referencia/README.md). El borrado fue el commit `8a9f4d1`. `d0a3bfd` solo movió los ficheros.
