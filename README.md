# frontend-data
Repo voor de HvA CMD course Functional Programming. Het einddoel van dit project is om een visualisatie te creëeren die gebruikt kan worden door de Volkskrant voor een nieuwsbericht.

De deelvraag die ik heb onderzocht is:
"Hoe kan je ervoor zorgen dat je auto niet gestolen wordt?"

Live demo: https://sjorswijsman.github.io/frontend-data/

Mijn code voor Functional Programming is [hier](https://github.com/SjorsWijsman/functional-programming) terug te vinden. De wiki is volledig verplaatst naar de wiki van deze repo.

## Concept
Om deze deelvraag te visualiseren heb ik 3 visualisaties gemaakt die drie onderliggende deelvragen beantwoorden:

### Wat voor auto's worden het meest gestolen?
![barchart](https://i.ibb.co/f9SVQtV/barchart.png)

### Waar worden de meeste auto's gestolen?
![map](https://i.ibb.co/rwxH1fn/map.png)

### ~Hoe worden auto's gestolen?~
*Deze visualisatie heb ik helaas niet gemaakt.*

## Handleiding
Open `index.html` in een browser om de visualisaties te bekijken. Er is een actieve internetverbinding nodig om data op te halen om de kaart te visualiseren.

Gebruik de dropdown menu's om te interacteren met de data. Hover over de visualisaties heen om meer informatie te krijgen.

_Om aanpassingen te maken:_
Run `npm install` in de root folder ([download npm hier](https://nodejs.org/en/download/)) om Rollup te laten werken.

## Data gebruikt
Barchart:
* Statistiek voertuigdiefstal 2019 - Data aangevraagd bij het LIV  
Kaart:  
* Cartografische data - https://github.com/cartomap/nl
* Gestolen auto's per gemeente - https://localfocuswidgets.net/5f0c4c5e18d62
* Inwoners per gemeente - https://www.uitvoeringvanbeleidszw.nl/subsidies-en-regelingen/veranderopgave-inburgering-pilots/documenten/publicaties/subsidies/veranderopgave-inburgering-pilots/tabel-aantal-inwoners-gemeenten-per-1-januari-2019/tabel-aantal-inwoners-gemeenten-per-1-januari-2019
* Auto's per gemeente - https://opendata.cbs.nl/statline/#/CBS/nl/dataset/37209HVV/table?fromstatweb
