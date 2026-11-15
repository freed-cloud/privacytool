'use strict';
// Clickjacking-bescherming: weiger te draaien in een frame van een andere site
if (window.top !== window.self) { document.documentElement.hidden = true; try { window.top.location = window.self.location; } catch (e) {} }
(function(){
  // ---------- Navigatie ----------
  const buttons = document.querySelectorAll('nav.steps button');
  function show(n){
    buttons.forEach(b => b.classList.toggle('active', b.dataset.step == n));
    document.querySelectorAll('section.step').forEach(s => s.classList.toggle('active', s.id === 'step-' + n));
  }
  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.step)));

  const $ = id => document.getElementById(id);
  const val = id => $(id).value.trim();

  // ---------- Stap 1: deep scan ----------
  const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
  const uniq = a => [...new Set(a)];
  const enc = encodeURIComponent;

  const ENGINES = {
    Google: q => 'https://www.google.com/search?q=' + enc(q),
    Bing: q => 'https://www.bing.com/search?q=' + enc(q),
    DuckDuckGo: q => 'https://duckduckgo.com/?q=' + enc(q)
  };

  // Naamvarianten: "Jan van der Berg", "J. van der Berg", "van der Berg, Jan", "Jan Berg"
  function nameVariants(first, last, alts) {
    const v = [];
    const parts = last.split(/\s+/).filter(Boolean);
    const core = parts[parts.length - 1] || '';
    const tussen = parts.slice(0, -1).join(' ');
    const firsts = uniq([first, ...alts.filter(a => !a.includes(' '))].filter(Boolean));
    firsts.forEach(f => {
      if (last) {
        v.push(`${f} ${last}`);
        v.push(`${f[0]}. ${last}`);
        v.push(`${last}, ${f}`);
        if (tussen) v.push(`${f} ${core}`);
      } else v.push(f);
    });
    alts.filter(a => a.includes(' ')).forEach(a => v.push(a)); // volledige alternatieve naam
    return uniq(v);
  }

  // Telefoonvarianten: 0612345678, 06-12345678, 06 12345678, +31612345678, +31 6 12345678, 0031612345678
  function phoneVariants(p) {
    let d = p.replace(/[^\d+]/g, '');
    if (d.startsWith('+31')) d = '0' + d.slice(3);
    if (d.startsWith('0031')) d = '0' + d.slice(4);
    const out = [p.trim(), d];
    if (/^0\d{9}$/.test(d)) {
      const intl = '+31' + d.slice(1);
      out.push(intl, '0031' + d.slice(1));
      if (d.startsWith('06')) {
        out.push(`06-${d.slice(2)}`, `06 ${d.slice(2)}`, `+31 6 ${d.slice(2)}`, `06 ${d.slice(2,4)} ${d.slice(4,6)} ${d.slice(6,8)} ${d.slice(8)}`);
      } else {
        out.push(`${d.slice(0,3)}-${d.slice(3)}`);
      }
    }
    return uniq(out.filter(Boolean));
  }

  // Nederlandse sites die persoonsgegevens publiceren of verzamelen
  const NL_PEOPLE = ['locatefamily.com', 'oozo.nl', 'drimble.nl', 'gevonden.cc', 'detelefoongids.nl', 'nummerzoeker.nl'];
  const NL_COMPANY = ['opencompanies.nl', 'bedrijvenbase.nl', 'nederlandinbedrijf.nl', 'cylex-bedrijvengids.nl', 'kvk.nl'];
  const SOCIAL = ['linkedin.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'x.com', 'twitter.com', 'youtube.com', 'reddit.com', 'pinterest.com', 'github.com', 'twitch.tv'];
  const PROFILE_URLS = {
    Instagram: u => `https://www.instagram.com/${u}/`,
    TikTok: u => `https://www.tiktok.com/@${u}`,
    X: u => `https://x.com/${u}`,
    Facebook: u => `https://www.facebook.com/${u}`,
    YouTube: u => `https://www.youtube.com/@${u}`,
    Twitch: u => `https://www.twitch.tv/${u}`,
    GitHub: u => `https://github.com/${u}`,
    Reddit: u => `https://www.reddit.com/user/${u}/`,
    Pinterest: u => `https://www.pinterest.com/${u}/`,
    Snapchat: u => `https://www.snapchat.com/add/${u}`
  };

  function buildScan(d) {
    const groups = [];
    const add = (g, label, url, eng) => g.items.push({ label, url, eng });
    const group = (title, desc) => { const g = { title, desc, items: [] }; groups.push(g); return g; };
    const names = nameVariants(d.first, d.last, d.alts);
    const main = names[0];

    if (names.length) {
      const g = group('Zoekmachines: je naam', 'Elke schrijfwijze van je naam in Google, Bing en DuckDuckGo. Andere zoekmachines tonen vaak andere resultaten.');
      names.forEach(n => Object.entries(ENGINES).forEach(([e, f]) => add(g, `"${n}"`, f(`"${n}"`), e)));

      if (d.cities.length || d.orgs.length) {
        const g2 = group('Naam + woonplaats, werk of school', 'Combinaties maken resultaten persoonlijker en vinden pagina\'s die alleen op je naam niet opvallen.');
        names.slice(0, 2).forEach(n => {
          [...d.cities, ...d.orgs].forEach(x => Object.entries(ENGINES).forEach(([e, f]) => add(g2, `"${n}" "${x}"`, f(`"${n}" "${x}"`), e)));
        });
      }

      const g3 = group('Nederlandse personenzoekers en gegevenshandelaren', 'Sites die namen, adressen en telefoonnummers publiceren. Hier staat vaak iets wat je wilt laten verwijderen.');
      names.slice(0, 2).forEach(n => NL_PEOPLE.forEach(s => add(g3, `"${n}" op ${s}`, ENGINES.Google(`"${n}" site:${s}`), 'Google')));
      d.cities.forEach(c => add(g3, `${d.last} in ${c} op personenzoekers`, ENGINES.Google(`"${d.last}" "${c}" (${NL_PEOPLE.map(s => 'site:' + s).join(' OR ')})`), 'Google'));

      const g4 = group('Bedrijfsregisters en bedrijvengidsen', 'Heb je ooit een eenmanszaak of bv gehad, dan kunnen je naam en adres in bedrijvengidsen staan.');
      names.slice(0, 2).forEach(n => NL_COMPANY.forEach(s => add(g4, `"${n}" op ${s}`, ENGINES.Google(`"${n}" site:${s}`), 'Google')));

      const g5 = group('Sociale media', 'Zoek per platform via Google én in de zoekfunctie van het platform zelf. Voor sommige platforms moet je ingelogd zijn.');
      SOCIAL.forEach(s => add(g5, `"${main}" op ${s}`, ENGINES.Google(`"${main}" site:${s}`), 'Google'));
      const full = `${d.first} ${d.last}`.trim();
      add(g5, `LinkedIn: personen "${full}"`, 'https://www.linkedin.com/search/results/people/?keywords=' + enc(full), 'LinkedIn');
      add(g5, `Facebook: personen "${full}"`, 'https://www.facebook.com/search/people/?q=' + enc(full), 'Facebook');
      add(g5, `TikTok: accounts "${full}"`, 'https://www.tiktok.com/search/user?q=' + enc(full), 'TikTok');
      add(g5, `X: accounts "${full}"`, 'https://x.com/search?q=' + enc(full) + '&f=user', 'X');
      add(g5, `YouTube: "${full}"`, 'https://www.youtube.com/results?search_query=' + enc(`"${full}"`), 'YouTube');
      add(g5, `Reddit: "${full}"`, 'https://www.reddit.com/search/?q=' + enc(`"${full}"`), 'Reddit');

      const g6 = group('Documenten en overheid', 'Cv\'s, ledenlijsten, notulen en gemeentestukken met je naam. Vooral pdf\'s blijven vaak jaren online staan.');
      ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'csv'].forEach(t => add(g6, `"${main}" in .${t}-bestanden`, ENGINES.Google(`"${main}" filetype:${t}`), 'Google'));
      add(g6, `"${main}" op overheidssites`, ENGINES.Google(`"${main}" site:overheid.nl OR site:officielebekendmakingen.nl OR site:gemeenteraad.nl`), 'Google');
      add(g6, `"${main}" in Bing-documenten`, ENGINES.Bing(`"${main}" filetype:pdf`), 'Bing');

      const g7 = group('Afbeeldingen en nieuws', 'Foto\'s en artikelen waarin je naam voorkomt. Wil je weten waar een foto van jezelf staat, upload hem dan bij Google Lens of TinEye.');
      add(g7, `Google Afbeeldingen: "${main}"`, 'https://www.google.com/search?tbm=isch&q=' + enc(`"${main}"`), 'Google');
      add(g7, `Bing Afbeeldingen: "${main}"`, 'https://www.bing.com/images/search?q=' + enc(`"${main}"`), 'Bing');
      add(g7, `Google Nieuws: "${main}"`, 'https://www.google.com/search?tbm=nws&q=' + enc(`"${main}"`), 'Google');
      add(g7, 'Zoek met je eigen foto: Google Lens', 'https://lens.google.com/', 'Lens');
      add(g7, 'Zoek met je eigen foto: TinEye', 'https://tineye.com/', 'TinEye');
    }

    if (d.emails.length) {
      const g = group('E-mailadressen', 'Waar je e-mailadres openbaar staat: forums, ledenlijsten, documenten, oude profielen.');
      d.emails.forEach(m => {
        Object.entries(ENGINES).forEach(([e, f]) => add(g, `"${m}"`, f(`"${m}"`), e));
        add(g, `"${m}" in documenten`, ENGINES.Google(`"${m}" (filetype:pdf OR filetype:xls OR filetype:xlsx OR filetype:csv OR filetype:doc)`), 'Google');
        const local = m.split('@')[0];
        if (local && local.length > 3) add(g, `Gebruikersnaam "${local}" uit je e-mailadres`, ENGINES.Google(`"${local}"`), 'Google');
      });
      add(g, 'Datalekken: Have I Been Pwned', 'https://haveibeenpwned.com/', 'Datalek');
      add(g, 'Datalekken: Mozilla Monitor', 'https://monitor.mozilla.org/', 'Datalek');
    }

    if (d.phones.length) {
      const g = group('Telefoonnummers', 'Elk nummer in meerdere schrijfwijzen, want sites noteren nummers verschillend.');
      d.phones.forEach(p => {
        phoneVariants(p).forEach(v => add(g, `"${v}"`, ENGINES.Google(`"${v}"`), 'Google'));
        const pv = phoneVariants(p);
        add(g, `"${pv[1]}" in Bing`, ENGINES.Bing(`"${pv[1]}" OR "${pv[2] || pv[1]}"`), 'Bing');
        add(g, `"${pv[1]}" in DuckDuckGo`, ENGINES.DuckDuckGo(`"${pv[1]}"`), 'DuckDuckGo');
        add(g, `${pv[1]} op personenzoekers`, ENGINES.Google(`"${pv[1]}" (${NL_PEOPLE.map(s => 'site:' + s).join(' OR ')})`), 'Google');
      });
    }

    if (d.users.length) {
      const g = group('Gebruikersnamen', 'Bestaat er een profiel met deze naam? Ook oude accounts die je vergeten bent. Een foutpagina betekent: niets gevonden.');
      d.users.forEach(u => {
        Object.entries(PROFILE_URLS).forEach(([p, f]) => add(g, `${p}: ${u}`, f(enc(u)), p));
        add(g, `"${u}" overal op internet`, ENGINES.Google(`"${u}"`), 'Google');
        add(g, `"${u}" in Bing`, ENGINES.Bing(`"${u}"`), 'Bing');
      });
    }

    // dubbele links eruit
    const seen = new Set();
    groups.forEach(g => g.items = g.items.filter(i => !seen.has(i.url) && seen.add(i.url)));
    return groups.filter(g => g.items.length);
  }

  // Status per zoekopdracht (alleen in deze browser)
  const SKEY = 'vergeetmij-scan';
  let scanMem = {};
  function loadScan() { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return scanMem; } }
  function saveScan(s) { scanMem = s; try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }

  let currentGroups = [];

  function renderScan() {
    const st = loadScan();
    const box = $('scan-groups');
    box.innerHTML = '';
    currentGroups.forEach((g, gi) => {
      const det = document.createElement('details');
      det.className = 'group';
      if (gi === 0) det.open = true;
      const sum = document.createElement('summary');
      const t = document.createElement('span'); t.textContent = g.title;
      const c = document.createElement('span'); c.className = 'small';
      sum.append(t, c);
      const p = document.createElement('p'); p.className = 'gdesc'; p.textContent = g.desc;
      det.append(sum, p);
      let done = 0;
      g.items.forEach(item => {
        const s = st[item.url] || {};
        if (s.status) done++;
        const row = document.createElement('div');
        row.className = 'q' + (s.status ? ' ' + s.status : '');
        const a = document.createElement('a');
        a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        const eng = document.createElement('span'); eng.className = 'eng'; eng.textContent = item.eng;
        a.append(eng, document.createTextNode(item.label));
        a.addEventListener('click', () => { markOpened(item.url); });
        const btns = document.createElement('div'); btns.className = 'st';
        const bn = document.createElement('button'); bn.className = 'b-none'; bn.textContent = 'Niets';
        const bf = document.createElement('button'); bf.className = 'b-found'; bf.textContent = 'Gevonden';
        bn.onclick = () => setStatus(item.url, s.status === 'none' ? null : 'none');
        bf.onclick = () => setStatus(item.url, s.status === 'found' ? null : 'found');
        btns.append(bn, bf);
        row.append(a, btns);
        if (s.status === 'found') {
          const fb = document.createElement('div'); fb.className = 'foundbox';
          const inp = document.createElement('input');
          inp.placeholder = 'Op welke website? Bijv. oozo.nl';
          inp.value = s.site || '';
          inp.oninput = () => { const x = loadScan(); x[item.url] = { ...(x[item.url] || {}), site: inp.value }; saveScan(x); };
          const go = document.createElement('button'); go.className = 'btn'; go.textContent = 'Maak verwijderverzoek';
          go.onclick = () => { $('r-company').value = inp.value || ''; $('r-type').value = 'delete'; show('brief'); $('r-company').focus(); };
          fb.append(inp, go);
          row.append(fb);
        }
        det.append(row);
      });
      c.textContent = `${done} van ${g.items.length} gecontroleerd`;
      box.append(det);
    });
    updateCounts();
  }

  function allItems() { return currentGroups.flatMap(g => g.items); }
  function updateCounts() {
    const st = loadScan(), items = allItems();
    const done = items.filter(i => st[i.url] && st[i.url].status).length;
    const found = items.filter(i => st[i.url] && st[i.url].status === 'found').length;
    $('scan-count').textContent = items.length;
    $('scan-done').textContent = done;
    $('scan-found').textContent = found;
    $('scan-progress').style.width = items.length ? (done / items.length * 100) + '%' : '0';
  }
  function setStatus(url, status) {
    const s = loadScan();
    s[url] = { ...(s[url] || {}), status };
    saveScan(s); renderScan();
  }
  function markOpened(url) {
    const s = loadScan(); s[url] = { ...(s[url] || {}), opened: true }; saveScan(s);
  }

  $('make-searches').addEventListener('click', () => {
    const d = {
      first: val('s-first'), last: val('s-last'), alts: list(val('s-alt')),
      cities: list(val('s-city')), emails: list(val('s-email')), phones: list(val('s-phone')),
      users: list(val('s-user')).map(u => u.replace(/^@/, '')), orgs: list(val('s-org'))
    };
    if (!d.first && !d.last && !d.emails.length && !d.phones.length && !d.users.length) {
      alertBox('Vul minimaal je naam, een e-mailadres, telefoonnummer of gebruikersnaam in.'); return;
    }
    currentGroups = buildScan(d);
    $('scan').hidden = false;
    renderScan();
    $('scan').scrollIntoView({ behavior: 'smooth' });
  });

  function alertBox(msg) {
    let n = $('scan-msg');
    if (!n) { n = document.createElement('div'); n.id = 'scan-msg'; n.className = 'note warn'; $('make-searches').after(n); }
    n.textContent = msg;
  }

  $('open-next').addEventListener('click', () => {
    const st = loadScan();
    const next = allItems().find(i => !(st[i.url] && (st[i.url].status || st[i.url].opened)));
    if (!next) { alertBox('Alle zoekopdrachten zijn geopend. Markeer ze nog als Niets of Gevonden.'); return; }
    window.open(next.url, '_blank', 'noopener,noreferrer');
    markOpened(next.url);
  });
  $('hide-done').addEventListener('change', e => $('scan-groups').classList.toggle('hide-done', e.target.checked));
  $('reset-scan').addEventListener('click', () => { saveScan({}); renderScan(); });
  $('export-scan').addEventListener('click', () => {
    const st = loadScan();
    const lines = ['Vergeet Mij – overzicht deep scan', new Date().toLocaleString('nl-NL'), ''];
    currentGroups.forEach(g => {
      lines.push('== ' + g.title);
      g.items.forEach(i => {
        const s = st[i.url] || {};
        const mark = s.status === 'found' ? '[GEVONDEN' + (s.site ? ': ' + s.site : '') + ']' : s.status === 'none' ? '[niets]' : '[nog doen]';
        lines.push(`${mark} ${i.eng} – ${i.label}\n    ${i.url}`);
      });
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vergeet-mij-scan.txt'; a.click();
  });

  // ---------- Stap 4: brief ----------
  function today(){ return new Date().toLocaleDateString('nl-NL', {day:'numeric', month:'long', year:'numeric'}); }

  // Eén brief maken; gebruikt door stap 2 (veel bedrijven tegelijk) en stap 4 (één bedrijf)
  function letterFor(o){
    const type = o.type, company = o.company || '[bedrijf]', name = o.name || '[jouw naam]',
          email = o.email || '[jouw e-mailadres]', extra = o.extra;
    const subject = {
      delete: 'Verzoek tot verwijdering van persoonsgegevens (art. 17 AVG)',
      access: 'Verzoek om inzage in persoonsgegevens (art. 15 AVG)',
      both: 'Verzoek om inzage en verwijdering van persoonsgegevens (art. 15 en 17 AVG)'
    }[type];

    let body = `Geachte heer/mevrouw,\n\n`;
    if (type === 'access' || type === 'both') {
      body += `Op grond van artikel 15 van de Algemene Verordening Gegevensbescherming (AVG) verzoek ik ${company} om mij te laten weten of u persoonsgegevens van mij verwerkt. Zo ja, dan ontvang ik graag:\n` +
        `- een kopie van alle persoonsgegevens die u van mij heeft;\n` +
        `- de doelen waarvoor u deze gegevens gebruikt;\n` +
        `- met wie u deze gegevens heeft gedeeld;\n` +
        `- hoe lang u deze gegevens bewaart;\n` +
        `- waar u deze gegevens vandaan heeft, als u ze niet van mij zelf heeft gekregen.\n\n`;
    }
    if (type === 'delete' || type === 'both') {
      body += (type === 'both' ? `Daarnaast verzoek ik u` : `Op grond van artikel 17 van de Algemene Verordening Gegevensbescherming (AVG) verzoek ik u`) +
        ` om alle persoonsgegevens die u van mij verwerkt te verwijderen. Heeft u mijn gegevens met anderen gedeeld, dan verzoek ik u hen op de hoogte te brengen van dit verzoek (artikel 19 AVG). Bent u wettelijk verplicht bepaalde gegevens te bewaren, laat mij dan weten om welke gegevens het gaat en op grond van welke verplichting.\n\n`;
    }
    body += `Om mij te kunnen herkennen:\n- Naam: ${name}\n- E-mailadres: ${email}\n` + (extra ? `- Overig: ${extra}\n` : '') + `\n`;
    body += `Volgens artikel 12 lid 3 AVG dient u binnen één maand na ontvangst op dit verzoek te reageren. Ik ontvang graag een bevestiging van ontvangst.\n\n` +
      `Met vriendelijke groet,\n\n${name}\n${today()}`;
    return {subject, body};
  }
  function buildLetter(){
    return letterFor({ type: $('r-type').value, company: val('r-company'), name: val('r-name'), email: val('r-email'), extra: val('r-extra') });
  }

  let current = null;
  $('make-letter').addEventListener('click', () => {
    current = buildLetter();
    $('letter').value = 'Onderwerp: ' + current.subject + '\n\n' + current.body;
    $('letter-box').hidden = false;
    updateMailLink();
  });
  function updateMailLink(){
    const text = $('letter').value.replace(/^Onderwerp:.*\n\n/, '');
    $('mail-letter').href = 'mailto:' + encodeURIComponent(val('r-to')) + '?subject=' + encodeURIComponent(current.subject) + '&body=' + encodeURIComponent(text);
  }
  $('letter').addEventListener('input', updateMailLink);
  $('r-to').addEventListener('input', () => current && updateMailLink());
  $('copy-letter').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('letter').value); $('copy-letter').textContent = 'Gekopieerd ✓'; }
    catch(e){ $('letter').select(); document.execCommand('copy'); $('copy-letter').textContent = 'Gekopieerd ✓'; }
    setTimeout(() => $('copy-letter').textContent = 'Kopieer', 2000);
  });

  // ---------- Stap 5: tracker ----------
  const KEY = 'vergeetmij-verzoeken';
  let memory = [];
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ $('storage-note').textContent = 'Opslaan lukt niet in deze browser; je overzicht verdwijnt als je de pagina sluit.'; return memory; } }
  function save(list){ memory = list; try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e){} }
  const typeLabel = {delete:'Verwijderen', access:'Inzage', both:'Inzage + verwijderen'};

  const STATUSES = ['Wacht op antwoord', 'Afgerond', 'Geweigerd', 'Klacht ingediend'];
  const cell = (tr, text, cls) => { const td = document.createElement('td'); td.textContent = text; if (cls) td.className = cls; tr.appendChild(td); return td; };

  function render(){
    const items = load(), tb = $('tracker');
    tb.replaceChildren();
    if (!Array.isArray(items) || !items.length){
      const tr = document.createElement('tr'); const td = cell(tr, 'Nog geen verzoeken. Maak ze in stap 2 of 4.', 'small'); td.colSpan = 6; tb.appendChild(tr); return;
    }
    const now = new Date();
    items.forEach((r, i) => {
      const sent = new Date(r.sent);
      if (isNaN(sent)) return; // beschadigde invoer overslaan
      const due = new Date(sent); due.setMonth(due.getMonth() + 1);
      const status = STATUSES.includes(r.status) ? r.status : STATUSES[0];
      const late = status === STATUSES[0] && now > due;
      const tr = document.createElement('tr');
      cell(tr, String(r.company || 'Onbekend bedrijf').slice(0, 200));
      cell(tr, typeLabel[r.type] || 'Onbekend');
      cell(tr, sent.toLocaleDateString('nl-NL'));
      cell(tr, due.toLocaleDateString('nl-NL') + (late ? ' (verlopen)' : ''), late ? 'late' : '');
      const sel = document.createElement('select');
      STATUSES.forEach(s => { const o = document.createElement('option'); o.textContent = s; sel.appendChild(o); });
      sel.value = status;
      sel.addEventListener('change', () => { const l = load(); l[i].status = sel.value; save(l); render(); });
      const tdSel = document.createElement('td'); tdSel.appendChild(sel); tr.appendChild(tdSel);
      const del = document.createElement('button'); del.className = 'btn secondary nomargin'; del.textContent = 'Wis';
      del.addEventListener('click', () => { const l = load(); l.splice(i, 1); save(l); render(); });
      const tdDel = document.createElement('td'); tdDel.appendChild(del); tr.appendChild(tdDel);
      tb.appendChild(tr);
    });
  }

  // ---------- Stap 2: bekende bedrijven ----------
  // Bewaard in deze browser: alleen welke bedrijven zijn aangevinkt en zelf toegevoegde bedrijfsnamen.
  // Naam, e-mailadres en de brieven zelf worden niet bewaard.
  const BKEY = 'vergeetmij-bedrijven';
  let bMem = { selected: [], custom: [] };
  const strs = (a, max, len) => Array.isArray(a) ? a.filter(s => typeof s === 'string').map(s => s.slice(0, len)).slice(0, max) : [];
  function loadB() {
    try {
      const x = JSON.parse(localStorage.getItem(BKEY));
      if (x && typeof x === 'object') return { selected: strs(x.selected, 1000, 120), custom: strs(x.custom, 200, 80) };
    } catch (e) {}
    return { selected: [...bMem.selected], custom: [...bMem.custom] };
  }
  function saveB(x) { bMem = x; try { localStorage.setItem(BKEY, JSON.stringify(x)); } catch (e) {} }

  const CATALOG = (Array.isArray(window.VERGEETMIJ_BEDRIJVEN) ? window.VERGEETMIJ_BEDRIJVEN : []).map(g => ({
    cat: g.cat, note: g.note || '', items: g.items.map(([name, domain]) => ({ id: domain, name, domain }))
  }));
  const OWN = 'Zelf toegevoegd';
  const customItem = n => ({ id: 'eigen:' + n.toLowerCase(), name: n, domain: '', custom: true });
  const bGroups = st => st.custom.length ? [{ cat: OWN, note: '', items: st.custom.map(customItem) }, ...CATALOG] : CATALOG;
  const shortName = n => n.replace(/\s*\(.*\)\s*$/, '');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const privacyUrl = i => i.domain ? ENGINES.Google(`privacy site:${i.domain}`) : ENGINES.Google(`privacyverklaring "${i.name}"`);
  const newLink = (url, text) => { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = text; return a; };

  const openCats = new Set();
  let bView = [];

  function renderB() {
    const st = loadB(), sel = new Set(st.selected), q = norm($('b-filter').value.trim());
    const box = $('b-groups');
    box.replaceChildren();
    bView = [];
    bGroups(st).forEach(g => {
      const items = q ? g.items.filter(i => norm(i.name + ' ' + i.domain).includes(q)) : g.items;
      if (!items.length) return;
      const det = document.createElement('details');
      det.className = 'group';
      det.open = !!q || openCats.has(g.cat);
      det.addEventListener('toggle', () => { if (!q) { if (det.open) openCats.add(g.cat); else openCats.delete(g.cat); } });
      const sum = document.createElement('summary');
      const t = document.createElement('span'); t.textContent = g.cat;
      const c = document.createElement('span'); c.className = 'small';
      sum.append(t, c);
      det.append(sum);
      if (g.note) { const p = document.createElement('p'); p.className = 'gdesc'; p.textContent = g.note; det.append(p); }
      items.forEach(i => {
        const row = document.createElement('div');
        row.className = 'bq' + (sel.has(i.id) ? ' on' : '');
        const lab = document.createElement('label');
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = sel.has(i.id);
        cb.addEventListener('change', () => {
          const s = loadB(), set = new Set(s.selected);
          if (cb.checked) set.add(i.id); else set.delete(i.id);
          s.selected = [...set]; saveB(s);
          row.classList.toggle('on', cb.checked);
          updateBCounts();
        });
        const nm = document.createElement('span'); nm.textContent = i.name;
        lab.append(cb, nm);
        if (i.domain) { const dm = document.createElement('span'); dm.className = 'dom'; dm.textContent = i.domain; lab.append(dm); }
        const acts = document.createElement('div'); acts.className = 'bacts';
        acts.append(newLink(privacyUrl(i), 'Privacypagina ↗'));
        if (i.custom) {
          const x = document.createElement('button'); x.type = 'button'; x.className = 'linkbtn'; x.textContent = 'Verwijder';
          x.addEventListener('click', () => {
            const s = loadB();
            s.custom = s.custom.filter(n => n.toLowerCase() !== i.name.toLowerCase());
            s.selected = s.selected.filter(id => id !== i.id);
            saveB(s); renderB();
          });
          acts.append(x);
        }
        row.append(lab, acts);
        det.append(row);
      });
      box.append(det);
      bView.push({ ids: g.items.map(i => i.id), small: c });
    });
    if (!box.children.length) { const p = document.createElement('p'); p.className = 'small'; p.textContent = 'Geen bedrijf gevonden. Voeg het hieronder zelf toe.'; box.append(p); }
    updateBCounts();
  }

  function updateBCounts() {
    const st = loadB(), sel = new Set(st.selected);
    const valid = new Set(bGroups(st).flatMap(g => g.items.map(i => i.id)));
    $('b-count').textContent = st.selected.filter(id => valid.has(id)).length;
    bView.forEach(v => {
      const n = v.ids.filter(id => sel.has(id)).length;
      v.small.textContent = n ? `${n} van ${v.ids.length} aangevinkt` : `${v.ids.length} bedrijven`;
    });
  }

  $('b-filter').addEventListener('input', renderB);
  $('b-clear').addEventListener('click', () => { const s = loadB(); s.selected = []; saveB(s); renderB(); });

  function addCustom() {
    const n = $('b-custom').value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80);
    if (!n) return;
    const s = loadB();
    if (!s.custom.some(x => x.toLowerCase() === n.toLowerCase())) s.custom.unshift(n);
    const id = customItem(n).id;
    if (!s.selected.includes(id)) s.selected.push(id);
    saveB(s);
    $('b-custom').value = '';
    openCats.add(OWN);
    renderB();
  }
  $('b-add').addEventListener('click', addCustom);
  $('b-custom').addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });

  // Alle brieven in één keer maken
  let batch = [];
  function bMsg(text) { $('b-msg').textContent = text; $('b-msg').hidden = !text; }

  $('b-make').addEventListener('click', () => {
    const st = loadB(), sel = new Set(st.selected);
    const chosen = bGroups(st).flatMap(g => g.items).filter(i => sel.has(i.id));
    if (!chosen.length) { bMsg('Vink eerst minimaal één bedrijf aan.'); return; }
    const base = { type: $('b-type').value, name: val('b-name'), email: val('b-email'), extra: val('b-extra') };
    bMsg(base.name && base.email ? '' : 'Let op: vul je naam en e-mailadres in, anders staan er nog [haakjes] in de brieven.');
    batch = chosen.map(i => {
      const company = shortName(i.name);
      return { item: i, company, type: base.type, letter: letterFor({ ...base, company }), to: '', sent: false };
    });
    renderLetters();
    $('b-out').hidden = false;
    $('b-out').scrollIntoView({ behavior: 'smooth' });
  });

  function renderLetters() {
    const box = $('b-letters');
    box.replaceChildren();
    batch.forEach((b, idx) => {
      const det = document.createElement('details');
      det.className = 'group letter-card' + (b.sent ? ' sent' : '');
      if (idx === 0) det.open = true;
      const sum = document.createElement('summary');
      const t = document.createElement('span'); t.textContent = b.company;
      const s = document.createElement('span'); s.className = 'small'; s.textContent = b.sent ? 'Verstuurd ✓' : 'Nog versturen';
      sum.append(t, s);

      const inner = document.createElement('div'); inner.className = 'card-inner';
      const p = document.createElement('p'); p.className = 'small';
      p.append('1. ', newLink(privacyUrl(b.item), `Open de privacypagina van ${b.company} ↗`), ' en zoek het e-mailadres of formulier van de privacy-afdeling.');
      const lt = document.createElement('label'); lt.htmlFor = `b-to-${idx}`;
      lt.textContent = '2. E-mailadres privacy-afdeling (gebruikt het bedrijf een formulier, kopieer dan de brief en plak hem daarin)';
      const to = document.createElement('input'); to.id = `b-to-${idx}`; to.type = 'email'; to.maxLength = 120; to.placeholder = 'privacy@bedrijf.nl'; to.value = b.to;
      const ll = document.createElement('label'); ll.htmlFor = `b-letter-${idx}`; ll.textContent = '3. Je brief (je kunt hem nog aanpassen)';
      const ta = document.createElement('textarea'); ta.id = `b-letter-${idx}`; ta.value = 'Onderwerp: ' + b.letter.subject + '\n\n' + b.letter.body;
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn'; copy.textContent = 'Kopieer';
      const mail = document.createElement('a'); mail.className = 'btn secondary'; mail.textContent = 'Open in mailprogramma';
      const done = document.createElement('button'); done.type = 'button'; done.className = 'btn secondary';
      const setDone = () => { done.textContent = b.sent ? 'In je overzicht ✓' : 'Verstuurd, zet in overzicht'; done.disabled = b.sent; };
      setDone();

      const upd = () => {
        b.to = to.value.trim();
        const m = ta.value.match(/^Onderwerp:[ \t]*(.*)\n/);
        const subject = m ? m[1] : b.letter.subject;
        const text = ta.value.replace(/^Onderwerp:.*\n\n?/, '');
        mail.href = 'mailto:' + encodeURIComponent(b.to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
      };
      to.addEventListener('input', upd);
      ta.addEventListener('input', upd);
      upd();

      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(ta.value); } catch (e) { ta.select(); document.execCommand('copy'); }
        copy.textContent = 'Gekopieerd ✓';
        setTimeout(() => { copy.textContent = 'Kopieer'; }, 2000);
      });
      done.addEventListener('click', () => {
        if (b.sent) return;
        const l = load(), list = Array.isArray(l) ? l : [];
        list.push({ company: b.company, type: b.type, sent: new Date().toISOString(), status: STATUSES[0] });
        save(list); render();
        b.sent = true; setDone();
        det.classList.add('sent'); s.textContent = 'Verstuurd ✓';
        updateBatchCounts();
      });

      inner.append(p, lt, to, ll, ta, copy, mail, done);
      det.append(sum, inner);
      box.append(det);
    });
    updateBatchCounts();
  }
  function updateBatchCounts() {
    $('b-made').textContent = batch.length;
    $('b-sent').textContent = batch.filter(b => b.sent).length;
  }

  $('b-download').addEventListener('click', () => {
    const lines = ['Vergeet Mij: AVG-verzoeken', new Date().toLocaleString('nl-NL'), ''];
    batch.forEach((b, i) => {
      const ta = $(`b-letter-${i}`);
      lines.push('==================================================', b.company, 'Privacypagina zoeken: ' + privacyUrl(b.item));
      if (b.to) lines.push('E-mailadres privacy-afdeling: ' + b.to);
      lines.push('', ta ? ta.value : 'Onderwerp: ' + b.letter.subject + '\n\n' + b.letter.body, '');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vergeet-mij-verzoeken.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // Alles wissen wat deze tool in de browser bewaart
  $('wipe-all').addEventListener('click', () => {
    if (!confirmWipe.armed) { confirmWipe.armed = true; $('wipe-all').textContent = 'Weet je het zeker? Klik nogmaals'; setTimeout(() => { confirmWipe.armed = false; $('wipe-all').textContent = 'Wis al mijn gegevens uit deze browser'; }, 4000); return; }
    try { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); localStorage.removeItem(BKEY); } catch (e) {}
    memory = []; scanMem = {}; bMem = { selected: [], custom: [] }; batch = [];
    document.querySelectorAll('input, textarea').forEach(el => { if (el.type === 'checkbox') el.checked = false; else el.value = ''; });
    currentGroups = []; $('scan').hidden = true; $('letter-box').hidden = true;
    $('b-out').hidden = true; $('b-letters').replaceChildren(); bMsg(''); openCats.clear();
    render(); renderB(); confirmWipe.armed = false;
    $('wipe-all').textContent = 'Alles is gewist ✓';
  });
  const confirmWipe = { armed: false };

  $('track-letter').addEventListener('click', () => {
    const l = load();
    l.push({company: val('r-company') || 'Onbekend bedrijf', type: $('r-type').value, sent: new Date().toISOString(), status: 'Wacht op antwoord'});
    save(l); render(); show('volg');
  });
  render();
  renderB();
})();
