# Datos

Extrayendo datos 

Para discriminar por provincia he utilizado csvgrep de csvkit.

Buscamos en toda la serie historica en la columna de código postal
Usamos una expresión regular:
^(2) --> que el código postal comience por 2(referente a Huesca)
([0-9] --> que solo busque números
{4}) --> que la longitud sea de 4, y ¿porque no 5? al decirle que empiece en ese número el mismo número ya no cuenta, así es la vida en REGEXP 🤷


Huesca
```
csvgrep -c 2 -r "^(2)([0-9]{4})" serie-historica-aragon.csv > huesca.csv
```

Teruel
```
csvgrep -c 2 -r "^(4)([0-9]{4})" serie-historica-aragon.csv > teruel.csv
```

Zaragoza
```
csvgrep -c 2 -r "^(5)([0-9]{4})" serie-historica-aragon.csv > zaragoza.csv
```


Calcular porcentaje de mayores de 65 años


Pueblos con menos de cinco menores de 18 años
```
jq -r '(.[] | select(.total <= 0))'
```

# Densidad de población por municipio

Tenemos un geojson con el trazado de cada municipio. A partir de esto vamos a filtrar por provincia. Seleccionamos en properties la key provincia en la que su valor sea igual a Huesca(por ejemplo). Estos geojson nos servirán para mostrar varios mapas de cada provincia

```
jq '(.features | map(select(.properties.provincia == "Huesca")))' aragon.json > huesca.json

jq '(.features | map(select(.properties.provincia == "Teruel")))' aragon.json > teruel.json

jq '(.features | map(select(.properties.provincia == "Zaragoza")))' aragon.json > zaragoza.json
```

Ahora vamos a crear un CSV que contenga solo los valores de municipio, código postal y superficie en KM2 del municipio.
```
jq -r '["municipio", "cp", "superficie"], (.[].properties | [ .d_muni_ine, .c_muni_ine, .sup_of_km2]) | @csv' huesca.json > huesca-superficie-municipios.csv && sed -i 's/"//g' huesca-superficie-municipios.csv

jq -r '["municipio", "cp", "superficie"], (.[].properties | [ .d_muni_ine, .c_muni_ine, .sup_of_km2]) | @csv' teruel.json >teruel-superficie-municipios.csv && sed -i 's/"//g' teruel-superficie-municipios.csv

jq -r '["municipio", "cp", "superficie"], (.[].properties | [ .d_muni_ine, .c_muni_ine, .sup_of_km2]) | @csv' zaragoza.json >zaragoza-superficie-municipios.csv && sed -i 's/"//g ' zaragoza-superficie-municipios.csv

```

Obtenemos un CSV desordenado, esto es muy importante a la hora de hacer operaciones, ya que el INE y todos los datasets que he ido generando están ordenados por su código postal. Así que vamos a ordenarlo con csvsort

```
csvsort -c 2 huesca-superficie-municipios.csv > temp.csv && rm huesca-superficie-municipios.csv | mv temp.csv huesca-superficie-municipios.csv

csvsort -c 2 teruel-superficie-municipios.csv > temp.csv && rm teruel-superficie-municipios.csv | mv temp.csv teruel-superficie-municipios.csv

csvsort -c 2 zaragoza-superficie-municipios.csv > temp.csv && rm zaragoza-superficie-municipios.csv | mv temp.csv zaragoza-superficie-municipios.csv
```

La operación para calcular la densidad de población de cada municipio es la división del número de habitantes y de la superficie 


Reordenar el GEOJSON en base al código postal

```
jq -s -r '(.[] | sort_by(.properties.c_muni_ine))' huesca.json > reorder-huesca.json && rm huesca.json | mv reorder-huesca.json huesca.json

jq -s -r '(.[] | sort_by(.properties.c_muni_ine))' teruel.json > reorder-teruel.json && rm teruel.json | mv reorder-teruel.json teruel.json

jq -s -r '(.[] | sort_by(.properties.c_muni_ine))' zaragoza.json > reorder-zaragoza.json && rm zaragoza.json | mv reorder-zaragoza.json zaragoza.json
```
