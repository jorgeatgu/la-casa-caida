#!/usr/local/bin/bash

years=(1900 1910 1920 1930 1940 1950 1960 1970 1981 1991 2001 2011 2018 2019)

comarcas=('Jacetania' 'bajo-cinca' 'hoya-de-huesca' 'monegros')

for (( i=0; i<${#comarcas[@]}; ++i )); do
  for (( j=0; j<${#years[@]}; ++j )); do
    csvgrep -c year -r "^${years[$j]}" ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/years/years-"${comarcas[$i]}".csv  | csvstat -c population --sum >> ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/suma-"${comarcas[$i]}".csv
  done
  csvjoin -u 1 ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/suma-"${comarcas[$i]}".csv ~/github/la-casa-caida/data/comarcas/years.csv > ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/total-"${comarcas[$i]}".csv
  sed -i '1s/^/population,year\n/' ~/github/la-casa-caida/data/comarcas/huesca-zaragoza/total-"${comarcas[$i]}".csv
done
