# Vergeet Mij – privacytool

Een gratis webtool waarmee je in vijf stappen terugvindt wat er online over je bekend is en bedrijven vraagt je gegevens te verwijderen.

**Live:** https://freed-cloud.github.io/privacytool/

## Waarom
Door de vele datalekken en hacks liggen persoonsgegevens steeds vaker op straat. Veel mensen weten niet dat ze via de AVG het recht hebben om hun gegevens in te zien en te laten verwijderen, of hoe ze dat moeten doen. Deze tool maakt dat eenvoudig.

## Wat het doet
1. **Deep scan** – maakt van je gegevens tientallen tot honderden gerichte zoekopdrachten:
   - Google, Bing en DuckDuckGo, met elke schrijfwijze van je naam (initialen, met en zonder tussenvoegsel, achternaam eerst, andere namen)
   - meerdere woonplaatsen, e-mailadressen, telefoonnummers (in alle notaties), gebruikersnamen en werkgevers
   - Nederlandse personenzoekers en gegevenshandelaren, bedrijvengidsen en de KvK
   - sociale media, documenten (pdf, Word, Excel), overheidssites, afbeeldingen en nieuws
   - een checklist met voortgang: markeer per zoekopdracht *Niets* of *Gevonden*, en maak bij een vondst direct een verwijderverzoek
2. **Bekende bedrijven** – wat bedrijven in hun eigen systemen over je bewaren, vind je niet met een zoekmachine. Daarom een lijst met zo'n 150 bekende bedrijven in Nederland, in 16 categorieën (tech, webwinkels, supermarkten, telecom, energie, banken, verzekeraars, reizen, uitzendbureaus, gaming en meer):
   - vink aan waar je klant bent of was, of voeg zelf een bedrijf toe
   - per bedrijf een link naar de privacypagina (via een zoekopdracht op de eigen website van het bedrijf, zodat de link niet veroudert)
   - maak in één keer een AVG-brief per aangevinkt bedrijf, met kopieerknop, mailknop en download van alle brieven
   - klik op *Verstuurd* en het verzoek komt in je overzicht
3. **Check datalekken** – verwijst naar Have I Been Pwned en geeft concrete stappen als je in een lek zit.
4. **Schrijf je verzoek** – genereert een AVG-brief voor inzage (art. 15) en/of verwijdering (art. 17), klaar om te kopiëren of te mailen.
5. **Volg je verzoeken** – houdt bij wanneer je iets hebt verstuurd en markeert verzoeken waarvan de wettelijke termijn van één maand is verlopen.

## Privacy en beveiliging
- Geen server, geen database, geen tracking, geen cookies.
- Strikte Content Security Policy: alleen eigen code, geen verbindingen naar buiten.
- Geen inline JavaScript of CSS; alle invoer wordt als tekst weergegeven (bescherming tegen XSS).
- `no-referrer`, `noopener noreferrer` en clickjacking-bescherming.
- Eén knop om alle opgeslagen gegevens uit de browser te wissen.
- Details: [SECURITY.md](SECURITY.md)

## Techniek
- HTML, CSS en JavaScript in aparte bestanden (`index.html`, `style.css`, `app.js`), zonder frameworks of externe libraries.
- De bedrijvenlijst staat los in `bedrijven.js` (naam en website per bedrijf), zodat je makkelijk bedrijven toevoegt.
- Gehost via GitHub Pages.

## Wat ik hiervan heb geleerd
- Werken met Git en GitHub (repository, commits, GitHub Pages).
- Basis van webontwikkeling: HTML-structuur, responsive CSS, DOM-manipulatie in JavaScript.
- Lokale opslag in de browser en foutafhandeling als die niet beschikbaar is.
- De AVG vanuit gebruikersperspectief: inzage, verwijdering, termijnen en klachtroute.
- Webbeveiliging: Content Security Policy, XSS voorkomen, clickjacking en referrer-beleid.

## Plannen
- [x] Lijst met bekende Nederlandse bedrijven, met link naar hun privacypagina
- [ ] Per bedrijf het directe privacy-e-mailadres of -formulier (handmatig gecontroleerd)
- [ ] Brief ook in het Engels en Duits
- [ ] Herinnering als een termijn bijna verloopt

## Disclaimer
Dit is geen juridisch advies.

Gemaakt door Freddy – [portfolio](https://freed-cloud.github.io/)
