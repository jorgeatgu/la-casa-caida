#!/usr/local/bin/bash

province=$1

readarray -t years < ~/github/la-casa-caida/data/data2020/arrays/years.csv
readarray -t cities < ~/github/la-casa-caida/data/data2020/arrays/"$province".csv
readarray -t groups < ~/github/la-casa-caida/data/data2020/arrays/groups.csv

for (( i=0; i<${#cities[@]}; ++i )); do
    for (( j=0; j<${#years[@]}; ++j )); do
        for (( k=0; k<${#groups[@]}; ++k )); do
          csvgrep -c city -m "${cities[$i]}" ~/github/la-casa-caida/data/data2020/"$province"-"${groups[$k]}"-"${years[$j]}"-order.csv | csvstat --columns total --sum > total-temp.csv

          TOTAL_NUMBER=`cat total-temp.csv`
          echo "${cities[$i]} $TOTAL_NUMBER"
          echo -e "${cities[$i]},${groups[$k]},${years[$j]},$TOTAL_NUMBER" >> "$province"-years-groups-total.csv
        done
    done
done

