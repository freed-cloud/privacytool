# Beveiliging

Vergeet Mij werkt met persoonsgegevens. Daarom is de tool zo gebouwd dat er zo min mogelijk mis kan gaan.

## Hoe de tool je gegevens beschermt

| Maatregel | Wat het doet |
| --- | --- |
| Geen server, geen database | Wat je invult verlaat je browser niet. Er is geen plek waar gegevens kunnen lekken. |
| Content Security Policy | Alleen de eigen scripts en stijlen van deze site mogen draaien. Code van buitenaf wordt geblokkeerd, en de pagina mag geen verbinding maken met andere servers (`connect-src 'none'`). |
| Geen inline code | Alle JavaScript en CSS staan in aparte bestanden, zodat de CSP streng kan blijven. |
| Veilige weergave | Ingevoerde tekst wordt altijd als tekst getoond (`textContent`), nooit als HTML. Dat voorkomt cross-site scripting. |
| `no-referrer` | Als je een zoekopdracht opent, krijgt de zoekmachine niet te zien van welke pagina je komt. |
| `noopener noreferrer` | Geopende tabbladen kunnen deze pagina niet overnemen. |
| Clickjacking-bescherming | De pagina weigert te werken als een andere site hem in een frame laadt. |
| Geen cookies, trackers of externe bestanden | Geen Google Analytics, geen lettertypes of scripts van andere domeinen. |
| Alles wissen | Eén knop verwijdert alles wat de tool in je browser heeft bewaard. |
| HTTPS | GitHub Pages dwingt een versleutelde verbinding af. |

## Wat de tool bewaart

Alleen in de `localStorage` van je eigen browser:
- de status van je zoekopdrachten (Niets of Gevonden)
- welke bedrijven je in stap 2 hebt aangevinkt, en bedrijfsnamen die je zelf hebt toegevoegd
- je lijst met verstuurde verzoeken (bedrijf, soort verzoek, datum en status)

Je naam, e-mailadres en telefoonnummer worden niet bewaard, en de brieven zelf ook niet. De links naar privacypagina's in stap 2 bevatten alleen de website of naam van het bedrijf, geen gegevens over jou. Ze staan wel in de adressen van de zoeklinks die je opent, en die komen in de geschiedenis van je browser. Gebruik eventueel een privévenster.

## Bekende beperkingen

- GitHub Pages laat geen eigen HTTP-headers toe. De CSP staat daarom in een `<meta>`-tag; `frame-ancestors` werkt daar niet, vandaar de clickjacking-bescherming in JavaScript.
- Wie toegang heeft tot jouw computer en browser, kan de opgeslagen statussen zien. Gebruik dan de wisknop.

## Een kwetsbaarheid melden

Vond je een beveiligingsprobleem? Meld het via een [privé security-advies op GitHub](https://github.com/freed-cloud/privacytool/security/advisories/new) en niet in een openbaar issue. Ik reageer zo snel mogelijk.
