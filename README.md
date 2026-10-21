# FuelPredict
Eine Web-App, die aktuelle und historische Tankstellenpreise darstellt, analysiert und vorhersagt, wie sich der Preis einer Tankstelle wahrscheinlich entwickeln wird.

## Maschinenlesbarkeit (Bonusaufgabe)

- `llms.txt` im Projektwurzelverzeichnis beschreibt FuelPredict für KI-Systeme.
- `index.html` enthält JSON-LD nach [schema.org/WebApplication](https://schema.org/WebApplication) im `<head>`.
- Der Stand der Web-App wird korrekt beschrieben: Die Tankstellensuche ist derzeit noch nicht an echte Daten angebunden.

### Google Rich Results Test

[Google Rich Results Test öffnen](https://search.google.com/test/rich-results) und die veröffentlichte Startseiten-URL eingeben (alternativ den HTML-Code testen). `WebApplication` ist nicht automatisch ein von Google unterstützter Rich-Result-Typ. Ein Ergebnis ohne erkannte Rich Results bedeutet deshalb nicht, dass das JSON-LD syntaktisch ungültig ist.

**Screenshot:** Noch ausstehend – der Google-Test muss im Browser ausgeführt und ein echter Screenshot unter `docs/rich-results-test.png` abgelegt werden. Danach hier einbinden:

`![Ergebnis des Google Rich Results Tests](docs/rich-results-test.png)`
