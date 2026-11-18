#!/usr/local/bin/bash



# Guardamos en un array la poblacion de 2018
readarray -t dosmildieciocho < ~/github/la-casa-caida/data/2015-2018/zaragoza/2018.csv

# Guardamos en un array la poblacion de 2015
readarray -t dosmilquince < ~/github/la-casa-caida/data/2015-2018/zaragoza/2015.csv


# Recorremos el array de artistas
for (( i=0; i<${#dosmilquince[@]}; ++i )); do
    echo "scale=2; (${dosmildieciocho[$i]} - ${dosmilquince[$i]}) / ${dosmilquince[$i]} * 100" | bc >> porcentaje.csv
done










