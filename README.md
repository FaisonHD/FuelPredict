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

## Projektorganisation (Übungsblatt 1)

- **Team:** Einzelprojekt (eine Person)
- **Projektidee:** FuelPredict – Tankstellen nach Ort, Kraftstoffart und Entfernung suchen und Preise vergleichen. Später sollen historische Preisverläufe analysiert und mögliche Preisentwicklungen prognostiziert werden.
- **Geplante Datenquelle:** [Tankerkönig-API](https://creativecommons.tankerkoenig.de/) für aktuelle Tankstellen und Kraftstoffpreise. Eine Live-Anbindung besteht noch nicht.
- **Historische Daten:** Tankerkönig bietet gesonderte historische Datensätze an; deren Zugang und Lizenzbedingungen müssen vor einer Einbindung geprüft werden.

### Fünf mögliche Projektideen (Vorschläge zur Auswahl)

1. **FuelPredict (gewählt):** Tankstellen finden, aktuelle Spritpreise vergleichen und langfristig Preisverläufe analysieren. Datenquelle: Tankerkönig.
2. **WeatherCompare:** Wetterdaten mehrerer Orte übersichtlich vergleichen. Datenquelle: Open-Meteo.
3. **BikeStationFinder:** Fahrradverleihstationen und verfügbare Fahrräder auflisten. Datenquelle: GBFS-Feeds teilnehmender Verleihsysteme.
4. **AirQualityMap:** Luftqualitäts-Messstationen und Messwerte vergleichen. Datenquelle: OpenAQ.
5. **PublicHolidayPlanner:** Feiertage nach Land und Jahr filtern. Datenquelle: Nager.Date.

**Vorgeschlagene Auswahlbegründung:** FuelPredict verbindet eine konkrete Alltagssituation mit filterbaren Daten und einer späteren Analysefunktion. WeatherCompare ist weniger passend, weil es stärker auf bereits vorhandene Wetterdarstellungen hinausläuft. BikeStationFinder hängt von der Verfügbarkeit regionaler Verleihdaten ab. AirQualityMap erfordert mehr Einarbeitung in Messgrößen und Datenqualität. PublicHolidayPlanner bietet für spätere Analysen weniger dynamische Daten.

> Die fünf Ideen und Auswahlgründe sind ein Vorschlag zur Dokumentation, keine Behauptung über einen tatsächlich früher durchgeführten Entscheidungsprozess.

## Nachweise und offene Prüfungen (Übungsblätter 1 und 2)

- Git-Commit-Historie dokumentiert die Entwicklung.
- Semantisches HTML, Formularvalidierung, Navigation, Meta-Beschreibung und maschinenlesbare Dateien sind im Projekt enthalten.
- **Google Rich Results Test:** Am 22.10.2026 wurde laut bereitgestelltem Screenshot ein gültiges Software-App-Element erkannt; Crawling erfolgreich, keine kritischen Probleme. Der Screenshot muss noch als Bilddatei unter `docs/rich-results-test.png` in das Repository hochgeladen und hier eingebunden werden.
- **Noch manuell nachzuweisen:** Installation der Entwicklungswerkzeuge, DevTools-Versuch, Tastaturbedienung und Lighthouse-Accessibility-Wert, Versand der Projekt-E-Mail.
- **Sitemap:** Eine produktive öffentliche URL ist noch nicht bestätigt; `sitemap.xml` wird nach Festlegung der Hosting-Adresse ergänzt.
