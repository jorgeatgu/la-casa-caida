from bs4 import BeautifulSoup
import requests
import html5lib
import csv


url = 'https://es.wikipedia.org/wiki/Aguatón'

response = requests.get(url)

data = response.text

soup = BeautifulSoup(data, 'html5lib')

densidad = soup.find('a', string='Densidad')

texto = densidad.parent

textoDensidad = texto.nextSibling.getText()

print(textoDensidad)
