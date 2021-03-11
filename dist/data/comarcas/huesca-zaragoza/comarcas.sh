#!/usr/local/bin/bash

readarray -t bajoCinca < ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/bajo-cinca.csv
readarray -t hoyaDeHuesca < ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/hoya-de-huesca.csv
readarray -t jacetania < ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/jacetania.csv
readarray -t losMonegros < ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/los-monegros.csv

for (( j=0; j<${#bajoCinca[@]}; ++j )); do
    csvgrep -c name -r "^${bajoCinca[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/huesca.csv >> years/years-bajo-cinca.csv
    csvgrep -c name -r "^${bajoCinca[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/zaragoza.csv >> years/years-bajo-cinca.csv

    sed -i '2,${/year,cp,name,population/d;}' years/years-bajo-cinca.csv
done

for (( j=0; j<${#hoyaDeHuesca[@]}; ++j )); do
    csvgrep -c name -r "^${hoyaDeHuesca[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/huesca.csv >> years/years-hoya-de-huesca.csv
    csvgrep -c name -r "^${hoyaDeHuesca[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/zaragoza.csv >> years/years-hoya-de-huesca.csv

    sed -i '2,${/year,cp,name,population/d;}' years/years-hoya-de-huesca.csv
done


for (( j=0; j<${#jacetania[@]}; ++j )); do
    csvgrep -c name -r "^${jacetania[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/huesca.csv >> years/years-jacetania.csv
    csvgrep -c name -r "^${jacetania[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/zaragoza.csv >> years/years-jacetania.csv

    sed -i '2,${/year,cp,name,population/d;}' years/years-jacetania.csv
done


for (( j=0; j<${#losMonegros[@]}; ++j )); do
    csvgrep -c name -r "^${losMonegros[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/huesca.csv >> years/years-monegros.csv
    csvgrep -c name -r "^${losMonegros[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/zaragoza.csv >> years/years-monegros.csv

    sed -i '2,${/year,cp,name,population/d;}' years/years-monegros.csv
done
