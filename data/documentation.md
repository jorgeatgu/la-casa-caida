# Datos

Extrayendo datos 

Para discriminar por provincia he utilizado csvgrep de csvkit.

Buscamos en toda la serie historica en la columna de código postal
Usamos una expresión regular:
^(2) --> que el código postal comience por 2(referente a Huesca)
([0-9] --> que solo busque números
{4}) --> que la longitud sea de 4, y ¿porque no 5? al decirle que empiece ese número ya no cuenta, así es la vida en REGEXP 🤷


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

