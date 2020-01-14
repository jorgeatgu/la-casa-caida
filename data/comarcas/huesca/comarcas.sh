#!/usr/local/bin/bash

readarray -t altoGallego < ~/github/la-casa-caida/data/comarcas/huesca/alto-gallego.csv
readarray -t cincaMedio < ~/github/la-casa-caida/data/comarcas/huesca/cinca-medio.csv
readarray -t laLitera < ~/github/la-casa-caida/data/comarcas/huesca/la-litera.csv
readarray -t ribagorza < ~/github/la-casa-caida/data/comarcas/huesca/ribagorza.csv
readarray -t sobrarbe < ~/github/la-casa-caida/data/comarcas/huesca/Sobrarbe.csv

for (( j=0; j<${#altoGallego[@]}; ++j )); do
    csvgrep -c name -r "^${altoGallego[$j]}" ~/github/la-casa-caida/data/comarcas/huesca/huesca.csv >> years/years-alto-gallego.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-alto-gallego.csv
done


for (( j=0; j<${#cincaMedio[@]}; ++j )); do
    csvgrep -c name -r "^${cincaMedio[$j]}" ~/github/la-casa-caida/data/comarcas/huesca/huesca.csv >> years/years-cinca-medio.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-cinca-medio.csv
done

for (( j=0; j<${#laLitera[@]}; ++j )); do
    csvgrep -c name -r "^${laLitera[$j]}" ~/github/la-casa-caida/data/comarcas/huesca/huesca.csv >> years/years-la-litera.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-la-litera.csv
done

for (( j=0; j<${#ribagorza[@]}; ++j )); do
    csvgrep -c name -r "^${ribagorza[$j]}" ~/github/la-casa-caida/data/comarcas/huesca/huesca.csv >> years/years-ribagorza.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-ribagorza.csv
done

for (( j=0; j<${#sobrarbe[@]}; ++j )); do
    csvgrep -c name -r "^${sobrarbe[$j]}" ~/github/la-casa-caida/data/comarcas/huesca/huesca.csv >> years/years-sobrarbe.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-sobrarbe.csv
done
