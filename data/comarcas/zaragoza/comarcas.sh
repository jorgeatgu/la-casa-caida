#!/usr/local/bin/bash

readarray -t aranda < ~/github/la-casa-caida/data/comarcas/zaragoza/aranda.csv
readarray -t bajoAragon < ~/github/la-casa-caida/data/comarcas/zaragoza/bajo-aragon.csv
readarray -t calatayud < ~/github/la-casa-caida/data/comarcas/zaragoza/calatayud.csv
readarray -t belchite < ~/github/la-casa-caida/data/comarcas/zaragoza/campo-de-belchite.csv
readarray -t borja < ~/github/la-casa-caida/data/comarcas/zaragoza/campo-de-borja.csv
readarray -t daroca < ~/github/la-casa-caida/data/comarcas/zaragoza/campo-de-daroca.csv
readarray -t carinyena < ~/github/la-casa-caida/data/comarcas/zaragoza/cariñena.csv
readarray -t riberaAlta < ~/github/la-casa-caida/data/comarcas/zaragoza/ribera-alta-ebro.csv
readarray -t riberaBaja < ~/github/la-casa-caida/data/comarcas/zaragoza/ribera-baja-ebro.csv
readarray -t cincoVillas < ~/github/la-casa-caida/data/comarcas/zaragoza/cinco-villas.csv
readarray -t tarazona < ~/github/la-casa-caida/data/comarcas/zaragoza/tarazona-moncayo.csv
readarray -t valdejalon < ~/github/la-casa-caida/data/comarcas/zaragoza/valdejalon.csv
readarray -t zaragoza < ~/github/la-casa-caida/data/comarcas/zaragoza/Zaragoza-comarca.csv

for (( j=0; j<${#aranda[@]}; ++j )); do
    csvgrep -c name -r "^${aranda[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-aranda.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-aranda.csv
done

for (( j=0; j<${#bajoAragon[@]}; ++j )); do
    csvgrep -c name -r "^${bajoAragon[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-bajo-aragon.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-bajo-aragon.csv
done

for (( j=0; j<${#calatayud[@]}; ++j )); do
    csvgrep -c name -r "^${calatayud[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-calatayud.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-calatayud.csv
done

for (( j=0; j<${#belchite[@]}; ++j )); do
    csvgrep -c name -r "^${belchite[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-belchite.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-belchite.csv
done

for (( j=0; j<${#borja[@]}; ++j )); do
    csvgrep -c name -r "^${borja[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-borja.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-borja.csv
done

for (( j=0; j<${#daroca[@]}; ++j )); do
    csvgrep -c name -r "^${daroca[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-daroca.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-daroca.csv
done

for (( j=0; j<${#daroca[@]}; ++j )); do
    csvgrep -c name -r "^${daroca[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-daroca.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-daroca.csv
done

for (( j=0; j<${#carinyena[@]}; ++j )); do
    csvgrep -c name -r "^${carinyena[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-cariñena.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-cariñena.csv
done

for (( j=0; j<${#cincoVillas[@]}; ++j )); do
    csvgrep -c name -r "^${cincoVillas[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-cinco-villas.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-cinco-villas.csv
done


for (( j=0; j<${#riberaAlta[@]}; ++j )); do
    csvgrep -c name -r "^${riberaAlta[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-ribera-alta.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-ribera-alta.csv
done


for (( j=0; j<${#riberaBaja[@]}; ++j )); do
    csvgrep -c name -r "^${riberaBaja[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-ribera-baja.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-ribera-baja.csv
done

for (( j=0; j<${#tarazona[@]}; ++j )); do
    csvgrep -c name -r "^${tarazona[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-tarazona-moncayo.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-tarazona-moncayo.csv
done

for (( j=0; j<${#valdejalon[@]}; ++j )); do
    csvgrep -c name -r "^${valdejalon[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-valdejalon.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-valdejalon.csv
done

for (( j=0; j<${#zaragoza[@]}; ++j )); do
    csvgrep -c name -r "^${zaragoza[$j]}" ~/github/la-casa-caida/data/comarcas/zaragoza/zaragoza.csv >> years/years-Zaragoza-comarca.csv
    sed -i '2,${/year,cp,name,population/d;}' years/years-Zaragoza-comarca.csv
done
