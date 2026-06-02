# Rosa dei Venti — Specifica di progetto (per Claude Code)

Sei l'agente incaricato di costruire **completamente e in autonomia** questa app.
Lavori nella repo https://github.com/pezzaliapp/rosa-dei-venti
Obiettivo: una **PWA** (installabile su iOS e Android) che mostra il vento in tempo reale
con una **bussola VERA** che usa il magnetometro del telefono.

## Regole di lavoro (autonomia)
- Procedi da solo dall'inizio alla fine: crea i file, scrivi il codice, verificalo, fai il commit.
- NON chiedere conferme intermedie. Se una scelta è ambigua, scegli l'opzione più semplice e robusta e annotala nel README.
- Alla fine fai `git add -A && git commit` con un messaggio chiaro. NON fare push finché non te lo chiede l'utente (lascia il commit pronto).
- Mantieni il codice in **file statici** (niente build step, niente framework): deve girare su GitHub Pages senza compilazione.
- Tutti i percorsi devono essere **relativi** (`./`, `manifest.json`, `sw.js`, `icon-*.png`) così funziona anche in sottocartella `https://utente.github.io/rosa-dei-venti/`.

## File da produrre (nella root della repo)
- `index.html`  — app completa (HTML + CSS + JS inline, un solo file)
- `manifest.json` — manifest PWA
- `sw.js` — service worker (offline + installabilità)
- `icon-192.png`, `icon-512.png`, `icon-maskable.png` — icone (genera con uno script Node/Python, poi rimuovi lo script)
- `README.md` — descrizione, come pubblicare su GitHub Pages, scelte fatte

## Funzionalità richieste

### 1. Dati del vento (Open-Meteo, gratuito, senza API key)
- Endpoint corrente: `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`
- Geocoding ricerca città: `https://geocoding-api.open-meteo.com/v1/search?name=NOME&count=1&language=it&format=json`
- `wind_direction_10m` è la direzione **da cui proviene** il vento (convenzione meteo/nautica). Usala così.
- All'avvio carica subito una località di default (Roma 41.9028, 12.4964) così la UI non è mai vuota, poi prova la geolocalizzazione del dispositivo e la sovrascrive se concessa.
- Usa `fetch` con timeout (AbortController, ~8s) così non resta mai appeso.

### 2. Nome del vento mediterraneo (da `wind_direction_10m`)
Mappa a 8 settori (±22,5°):
- N 0° Tramontana · NE 45° Grecale · E 90° Levante · SE 135° Scirocco
- S 180° Ostro · SO 225° Libeccio · O 270° Ponente · NO 315° Maestrale
Mostra: nome del vento, provenienza (cardinale + gradi + sigla a 16 punti), breve descrizione.

### 3. BUSSOLA VERA (requisito centrale)
- Disegna una rosa dei venti (SVG) con tacche, raggi a 16 punte ed etichette N/NE/E/SE/S/SO/O/NO.
- La rosa deve **ruotare in tempo reale** con l'orientamento del telefono (magnetometro), come la bussola di iOS:
  il Nord della rosa punta sempre al **Nord reale**.
- Indice **fisso** in alto (triangolo) = la direzione verso cui è rivolto il telefono. NON ruota.
- Mostra la lettura live dei gradi della direzione in cui si è rivolti (es. "147° SE").
- L'**ago del vento** (colore distinto) resta agganciato al dato Open-Meteo e, con la rosa allineata,
  punta nella **direzione geografica reale** da cui arriva il vento.
- Pulsante per attivare/disattivare la bussola (tornando a "Nord in alto" fisso).

#### Dettagli tecnici bussola
- iOS 13+: serve `DeviceOrientationEvent.requestPermission()` chiamato **da un tap** dell'utente. Gestisci `granted` / negato.
- iOS: usa `event.webkitCompassHeading` (già nord vero, orario).
- Android/altri: usa l'evento `deviceorientationabsolute` se disponibile, altrimenti `deviceorientation` con `heading = (360 - event.alpha) % 360`.
- Rotazione: ruota l'intera rosa di `-heading`. Mantieni un **angolo continuo** (non wrappare 359→0) per evitare giri di 360°, e applica uno **smoothing** (low-pass o transition CSS ~0.12s lineare) per renderla fluida.
- Se non c'è magnetometro/permesso: lascia la rosa con Nord fisso in alto e mostra un avviso, ma l'app resta usabile (ricerca + dati).

### 4. Unità di misura
- Toggle km/h · nodi · m/s (conversione lato client da km/h: nodi ×0.539957, m/s ÷3.6).

### 5. Statistiche
- Provenienza, velocità (+ raffiche), forza **Beaufort** (con etichetta), temperatura aria.

### 6. PWA
- `manifest.json`: name "Rosa dei Venti", short_name "Venti", `display: standalone`, theme/background scuri, le 3 icone (192, 512, maskable).
- `sw.js`: install resiliente (un file mancante non blocca), app-shell cache-first, dati Open-Meteo **sempre da rete**, fallback a `index.html` per le navigazioni. Registra il SW solo su http/https.
- Meta tag iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`.

## Stile / UX
- Tema marinaresco elegante: blu notte profondo, dettagli ottone/oro, accento ciano per l'ago.
- Font serif eleganti (es. Cinzel per i titoli, Spectral per il testo) via Google Fonts.
- Layout mobile-first, una sola colonna, `viewport-fit=cover` e safe-area per iPhone.
- Niente librerie esterne pesanti: SVG fatto a mano, CSS puro, JS vanilla.

## Verifica prima del commit (obbligatoria)
1. `node --check` sul JS estratto dall'`index.html` e su `sw.js` → nessun errore di sintassi.
2. Avvia un server statico locale (`python3 -m http.server 8080`) e con `curl` controlla che
   `index.html`, `manifest.json`, `sw.js` e le icone rispondano 200.
3. Controlla che NON ci siano percorsi assoluti tipo `/index.html` o `file://` hardcoded.
4. Verifica con `curl` che l'endpoint Open-Meteo risponda (la chiamata è lato browser, ma conferma la forma dell'URL).
5. Scrivi nel README le scelte fatte e i limiti noti (es. precisione magnetometro, permesso iOS).

## Definition of Done
- I 6 file esistono nella root, percorsi relativi, sintassi ok, server locale serve tutto a 200.
- La bussola ruota col dispositivo (codice presente e corretto) e l'ago del vento è agganciato al dato reale.
- Commit creato e pronto. Riepilogo finale stampato: cosa fatto, come testare, come pubblicare su Pages.
