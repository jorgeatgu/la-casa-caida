#!/usr/local/bin/bash

readarray -t bajoAragon < ~/github/la-casa-caida/data/comarcas/teruel/bajo-aragon.csv
readarray -t bajoMartin < ~/github/la-casa-caida/data/comarcas/teruel/bajo-martin.csv
readarray -t cuencasMineras < ~/github/la-casa-caida/data/comarcas/teruel/cuencas-mineras.csv
readarray -t gudar < ~/github/la-casa-caida/data/comarcas/teruel/gudar.csv
readarray -t jiloca < ~/github/la-casa-caida/data/comarcas/teruel/jiloca.csv
readarray -t maestrazgo < ~/github/la-casa-caida/data/comarcas/teruel/maestrazgo.csv
readarray -t matarranya < ~/github/la-casa-caida/data/comarcas/teruel/matarranya.csv
readarray -t albarracin < ~/github/la-casa-caida/data/comarcas/teruel/sierra-de-albarracin.csv
readarray -t arcos < ~/github/la-casa-caida/data/comarcas/teruel/sierra-de-arcos.csv
readarray -t teruel < ~/github/la-casa-caida/data/comarcas/teruel/teruel-comarca.csv

for (( j=0; j<${#bajoAragon[@]}; ++j )); do
    csvgrep -c name -r "^${bajoAragon[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-bajo-aragon.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-bajo-aragon.csv
done


for (( j=0; j<${#bajoMartin[@]}; ++j )); do
    csvgrep -c name -r "^${bajoMartin[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-bajo-martin.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-bajo-martin.csv
done

for (( j=0; j<${#cuencasMineras[@]}; ++j )); do
    csvgrep -c name -r "^${cuencasMineras[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-cuentas-mineras.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-cuentas-mineras.csv
done

for (( j=0; j<${#gudar[@]}; ++j )); do
    csvgrep -c name -r "^${gudar[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-gudar.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-gudar.csv
done

for (( j=0; j<${#jiloca[@]}; ++j )); do
    csvgrep -c name -r "^${jiloca[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-jiloca.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-jiloca.csv
done

for (( j=0; j<${#maestrazgo[@]}; ++j )); do
    csvgrep -c name -r "^${maestrazgo[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-maestrazgo.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-maestrazgo.csv
done

for (( j=0; j<${#matarranya[@]}; ++j )); do
    csvgrep -c name -r "^${matarranya[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-matarranya.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-matarranya.csv
done

for (( j=0; j<${#albarracin[@]}; ++j )); do
    csvgrep -c name -r "^${albarracin[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-albarracin.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-albarracin.csv
done

for (( j=0; j<${#arcos[@]}; ++j )); do
    csvgrep -c name -r "^${arcos[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-arcos.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-arcos.csv
done

for (( j=0; j<${#teruel[@]}; ++j )); do
    csvgrep -c name -r "^${teruel[$j]}" ~/github/la-casa-caida/data/comarcas/teruel/teruel.csv >> years/years-teruel.csv

    sed -i '2,${/year,cp,name,population/d;}' years/years-teruel.csv
done
