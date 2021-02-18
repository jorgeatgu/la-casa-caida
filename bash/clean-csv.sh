#!/bin/bash

# Eliminamos las seis primeras líneas que no sirven para nada
sed -i '1,6d' poblacion-mayor-65-huesca.csv &&
# Eliminamos las dos últimas lineas pipeando eliminar la última línea dos veces :D
sed -i '$ d' poblacion-mayor-65-huesca.csv | sed -i '$ d' poblacion-mayor-65-huesca.csv &&
# El INE para representar 0 habitantes utiliza dos puntos seguidos, los sustituímos por un 0
sed -i 's/,..,/,0,/g' poblacion-mayor-65-huesca.csv &&
# Eliminamos la primera columna
gcut -d, -f1 --complement poblacion-mayor-65-huesca.csv > suma-poblacion-mayor-65-huesca.csv &&
sed -i 's/,/ + /g' suma-poblacion-mayor-65-huesca.csv
