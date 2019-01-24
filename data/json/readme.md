
# Scripts

Tenemos un geojson con el trazado de cada municipio. A partir de esto vamos a filtrar por provincia. Seleccionamos en properties la key provincia que su valor sea igual a Huesca(por ejemplo)

```
jq '(.features | map(select(.properties.provincia == "Huesca")))' aragon.json > huesca.json

jq '(.features | map(select(.properties.provincia == "Teruel")))' aragon.json > teruel.json

jq '(.features | map(select(.properties.provincia == "Zaragoza")))' aragon.json > zaragoza.json
```

Ahora vamos a crear un CSV que contenga solo los valores de municipio, código postal y superficie en KM2 del municipio.
```
jq -r '["municipio", "cp", "superficie"], (.[].properties | [ .d_muni_ine, .c_muni_ine, .sup_of_km2]) | @csv' huesca.json > huesca-superficie-municipios.csv
```
