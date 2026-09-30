#!/usr/local/bin/bash


readarray -t years < ~/github/la-casa-caida/data/data2020/arrays/years.csv
readarray -t cities < ~/github/la-casa-caida/data/data2020/arrays/cities.csv
readarray -t groups < ~/github/la-casa-caida/data/data2020/arrays/groups.csv

for (( i=0; i<${#years[@]}; ++i )); do
  for (( j=0; j<${#cities[@]}; ++j )); do
    for (( k=0; k<${#groups[@]}; ++k )); do
      sed -i 's/;/,/g' ~/github/la-casa-caida/data/data2020/ine/"${cities[$j]}"/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}".csv &&
      sed -i 's/1 de enero de //g' ~/github/la-casa-caida/data/data2020/ine/"${cities[$j]}"/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}".csv &&
      sed -i 's/, / /g' ~/github/la-casa-caida/data/data2020/ine/"${cities[$j]}"/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}".csv &&
      sed -i 's/\.//g' ~/github/la-casa-caida/data/data2020/ine/"${cities[$j]}"/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}".csv &&
      csvcut -c 2,3,4,5 ~/github/la-casa-caida/data/data2020/ine/"${cities[$j]}"/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}".csv > ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv &&
      sed -r -i 's/./,/6' ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv &&
      sed -i 's/,[0]$/,0.0/g' ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv &&
      sed -i '1d' ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv &&
      sed -i '1s/^/cp,city,age,year,total\n/' ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv &&
      csvsort -c 1 ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut-first-column.csv > ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-order.csv &&
      find . -name '*-cut-first-column*' -delete
      # csvcut -c 1,3,4,5 ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-order.csv > ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut.csv &&
      # cat ~/github/la-casa-caida/data/data2020/arrays/"${cities[$j]}"-column.csv | csvjoin ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-cut.csv ~/github/la-casa-caida/data/data2020/arrays/"${cities[$j]}"-column.csv > ~/github/la-casa-caida/data/data2020/"${cities[$j]}"-"${groups[$k]}"-"${years[$i]}"-total.csv
    done
  done
done
