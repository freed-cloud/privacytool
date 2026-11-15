'use strict';
// Bekende bedrijven in Nederland die vaak persoonsgegevens van klanten bewaren.
// Per bedrijf alleen de naam en de eigen website. Het privacy-adres zoekt de tool
// via een zoekmachine op die website, zodat de lijst niet veroudert als een bedrijf
// zijn privacypagina verplaatst.
// Bedrijf toevoegen: ['Naam (optionele uitleg)', 'website.nl'] in de juiste categorie.
window.VERGEETMIJ_BEDRIJVEN = Object.freeze([
  { cat: 'Tech en sociale media', items: [
    ['Google (Gmail, YouTube, Android)', 'google.com'],
    ['Meta (Facebook, Instagram, WhatsApp)', 'facebook.com'],
    ['Microsoft (Outlook, Hotmail, Xbox, Teams)', 'microsoft.com'],
    ['Apple (iCloud, App Store)', 'apple.com'],
    ['Amazon (ook Prime Video)', 'amazon.nl'],
    ['TikTok', 'tiktok.com'],
    ['Snapchat', 'snapchat.com'],
    ['X (Twitter)', 'x.com'],
    ['LinkedIn', 'linkedin.com'],
    ['Pinterest', 'pinterest.com'],
    ['Reddit', 'reddit.com'],
    ['Discord', 'discord.com'],
    ['Twitch', 'twitch.tv']
  ]},
  { cat: 'Streaming, nieuws en media', items: [
    ['Netflix', 'netflix.com'],
    ['Spotify', 'spotify.com'],
    ['Disney+', 'disneyplus.com'],
    ['Videoland', 'videoland.com'],
    ['DPG Media (AD, de Volkskrant, NU.nl, Tweakers)', 'dpgmedia.nl'],
    ['Mediahuis (De Telegraaf, NRC, De Limburger)', 'mediahuis.nl']
  ]},
  { cat: 'Webwinkels en marktplaatsen', items: [
    ['Bol', 'bol.com'],
    ['Coolblue', 'coolblue.nl'],
    ['Zalando', 'zalando.nl'],
    ['Wehkamp', 'wehkamp.nl'],
    ['Marktplaats', 'marktplaats.nl'],
    ['Vinted', 'vinted.nl'],
    ['Temu', 'temu.com'],
    ['Shein', 'shein.com'],
    ['AliExpress', 'aliexpress.com'],
    ['Etsy', 'etsy.com'],
    ['MediaMarkt', 'mediamarkt.nl'],
    ['Thuisbezorgd.nl', 'thuisbezorgd.nl']
  ]},
  { cat: 'Supermarkten en winkels', items: [
    ['Albert Heijn (Bonuskaart)', 'ah.nl'],
    ['Jumbo', 'jumbo.com'],
    ['Lidl (Lidl Plus)', 'lidl.nl'],
    ['Aldi', 'aldi.nl'],
    ['Plus', 'plus.nl'],
    ['Picnic', 'picnic.app'],
    ['Kruidvat', 'kruidvat.nl'],
    ['Etos', 'etos.nl'],
    ['Action', 'action.com'],
    ['HEMA', 'hema.nl'],
    ['Blokker', 'blokker.nl'],
    ['IKEA (IKEA Family)', 'ikea.com'],
    ['Praxis', 'praxis.nl'],
    ['Gamma', 'gamma.nl'],
    ['Karwei', 'karwei.nl'],
    ['Decathlon', 'decathlon.nl'],
    ['H&M', 'hm.com'],
    ['Zeeman', 'zeeman.com'],
    ['Douglas', 'douglas.nl']
  ]},
  { cat: 'Telefoon, internet en tv', items: [
    ['KPN', 'kpn.com'],
    ['Odido (vroeger T-Mobile en Tele2)', 'odido.nl'],
    ['Vodafone', 'vodafone.nl'],
    ['Ziggo', 'ziggo.nl'],
    ['DELTA en Caiway (DELTA Fiber)', 'deltafiber.nl'],
    ['Simyo', 'simyo.nl'],
    ['Ben', 'ben.nl'],
    ['hollandsnieuwe', 'hollandsnieuwe.nl'],
    ['Lebara', 'lebara.nl'],
    ['Lycamobile', 'lycamobile.nl'],
    ['Youfone', 'youfone.nl']
  ]},
  { cat: 'Energie', items: [
    ['Eneco', 'eneco.nl'],
    ['Vattenfall', 'vattenfall.nl'],
    ['Essent', 'essent.nl'],
    ['Energiedirect.nl', 'energiedirect.nl'],
    ['Budget Energie', 'budgetenergie.nl'],
    ['Greenchoice', 'greenchoice.nl'],
    ['Vandebron', 'vandebron.nl']
  ]},
  { cat: 'Banken en betalen', items: [
    ['ING', 'ing.nl'],
    ['Rabobank', 'rabobank.nl'],
    ['ABN AMRO (ook Tikkie)', 'abnamro.nl'],
    ['ASN Bank (vroeger SNS, RegioBank en de Volksbank)', 'asnbank.nl'],
    ['bunq', 'bunq.com'],
    ['Knab', 'knab.nl'],
    ['Triodos Bank', 'triodos.nl'],
    ['Revolut', 'revolut.com'],
    ['PayPal', 'paypal.com'],
    ['Klarna', 'klarna.com'],
    ['Riverty (vroeger AfterPay)', 'riverty.com'],
    ['ICS (creditcards)', 'icscards.nl']
  ]},
  { cat: 'Verzekeringen en zorg', items: [
    ['Zilveren Kruis', 'zilverenkruis.nl'],
    ['CZ', 'cz.nl'],
    ['VGZ', 'vgz.nl'],
    ['Menzis', 'menzis.nl'],
    ['DSW', 'dsw.nl'],
    ['ONVZ', 'onvz.nl'],
    ['Centraal Beheer', 'centraalbeheer.nl'],
    ['Interpolis', 'interpolis.nl'],
    ['Nationale-Nederlanden', 'nn.nl'],
    ['OHRA', 'ohra.nl'],
    ['FBTO', 'fbto.nl'],
    ['Univé', 'unive.nl'],
    ['a.s.r.', 'asr.nl'],
    ['ANWB', 'anwb.nl']
  ]},
  { cat: 'Reizen en vervoer', items: [
    ['NS', 'ns.nl'],
    ['OV-chipkaart (Translink)', 'ov-chipkaart.nl'],
    ['Arriva', 'arriva.nl'],
    ['Uber', 'uber.com'],
    ['Bolt', 'bolt.eu'],
    ['Booking.com', 'booking.com'],
    ['Airbnb', 'airbnb.nl'],
    ['KLM', 'klm.nl'],
    ['Transavia', 'transavia.com'],
    ['Ryanair', 'ryanair.com'],
    ['easyJet', 'easyjet.com'],
    ['TUI', 'tui.nl'],
    ['Corendon', 'corendon.nl'],
    ['FlixBus', 'flixbus.nl'],
    ['Center Parcs', 'centerparcs.nl']
  ]},
  { cat: 'Post en pakketten', items: [
    ['PostNL', 'postnl.nl'],
    ['DHL', 'dhl.com'],
    ['DPD', 'dpd.com'],
    ['UPS', 'ups.com']
  ]},
  { cat: 'Werk en uitzendbureaus', items: [
    ['Randstad', 'randstad.nl'],
    ['Tempo-Team', 'tempo-team.nl'],
    ['Adecco', 'adecco.nl'],
    ['Manpower', 'manpower.nl'],
    ['Start People', 'startpeople.nl'],
    ['YoungCapital', 'youngcapital.nl'],
    ['Olympia', 'olympia.nl'],
    ['Indeed', 'indeed.com'],
    ['Nationale Vacaturebank', 'nationalevacaturebank.nl']
  ]},
  { cat: 'Sport, loterijen en spaarprogramma\'s', items: [
    ['Basic-Fit', 'basic-fit.com'],
    ['SportCity', 'sportcity.nl'],
    ['Nationale Postcode Loterij', 'postcodeloterij.nl'],
    ['Nederlandse Loterij (Staatsloterij, Lotto)', 'nederlandseloterij.nl'],
    ['Air Miles', 'airmiles.nl']
  ]},
  { cat: 'Gaming', items: [
    ['PlayStation (Sony)', 'playstation.com'],
    ['Steam (Valve)', 'steampowered.com'],
    ['Epic Games (Fortnite)', 'epicgames.com'],
    ['Nintendo', 'nintendo.com'],
    ['EA (EA SPORTS FC)', 'ea.com'],
    ['Ubisoft', 'ubisoft.com'],
    ['Riot Games (League of Legends, Valorant)', 'riotgames.com']
  ]},
  { cat: 'Daten', items: [
    ['Tinder', 'tinder.com'],
    ['Bumble', 'bumble.com'],
    ['Hinge', 'hinge.co'],
    ['Lexa', 'lexa.nl'],
    ['Parship', 'parship.nl'],
    ['Relatieplanet', 'relatieplanet.nl']
  ]},
  { cat: 'Krediet en incasso', items: [
    ['BKR (kredietregistratie)', 'bkr.nl'],
    ['Intrum (incasso)', 'intrum.nl']
  ]},
  { cat: 'Personenzoekers en telefoongidsen', note: 'Hier ben je geen klant. Stuur een verzoek als je jezelf daar hebt gevonden in stap 1.', items: [
    ['LocateFamily', 'locatefamily.com'],
    ['Oozo', 'oozo.nl'],
    ['Drimble', 'drimble.nl'],
    ['Gevonden.cc', 'gevonden.cc'],
    ['De Telefoongids', 'detelefoongids.nl'],
    ['Nummerzoeker', 'nummerzoeker.nl']
  ]}
]);
