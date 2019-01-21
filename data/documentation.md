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

La encuesta del INE de 2011 nos da la opción de saber la edad de los habitantes de cada municipio de España. Hasta 2021 no se volverá a hacer este tipo de encuesta.

Lo primero es seleccionar por código postal de cada una de las provincias y seleccionar todas las opciones desde 65 años hasta 100 años. Con esto obtenemos un CSV con las cantidades de población por años. 

El CSV hay que trabajarlo un poco. En primer lugar si no hay habitantes de esas edad lo marca con dos puntos, estos dos puntos los he sustituído por 0. He eliminado las cabeceras ya que no aportan nada, he eliminado años de los headers y solamente he dejado la edad.

Ahora toca sumar el total de población, para ello he utilizado algo que llevo tiempo usando y es una extensión de sublime text. Lo primero es dejar el CSV solamente con números
