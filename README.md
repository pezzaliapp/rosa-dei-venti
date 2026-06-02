# Rosa dei Venti 🧭

PWA installabile (iOS / Android) che mostra il **vento in tempo reale** con una
**bussola vera** che usa il magnetometro del telefono, come la bussola di iOS.

Dati meteo da [Open-Meteo](https://open-meteo.com) (gratuito, senza API key).

## Funzionalità

- **Bussola vera**: la rosa dei venti (SVG fatto a mano) ruota in tempo reale con
  l'orientamento del telefono; il Nord della rosa punta sempre al **Nord reale**.
  Un indice **fisso** in alto indica la direzione verso cui è rivolto il telefono.
- **Ago del vento** (ciano) agganciato al dato Open-Meteo: con la rosa allineata,
  punta nella direzione geografica reale **da cui proviene** il vento.
- **Nome del vento mediterraneo** dai gradi di provenienza: Tramontana, Grecale,
  Levante, Scirocco, Ostro, Libeccio, Ponente, Maestrale (settori da 45°, ±22,5°).
- **Provenienza** come cardinale a 8 punti, gradi e sigla a 16 punti (es. `SSE`).
- **Unità** commutabili: km/h · nodi · m/s.
- **Statistiche**: provenienza, velocità, raffiche, forza **Beaufort** (con etichetta),
  temperatura dell'aria.
- **Ricerca città** (geocoding Open-Meteo) e **geolocalizzazione** del dispositivo.
- All'avvio carica subito **Roma** (default), poi prova a sovrascrivere con la
  posizione del dispositivo se concessa.
- **PWA**: installabile, funziona offline (app-shell in cache, dati sempre da rete).

## Come funziona la bussola (dettagli tecnici)

- **iOS 13+**: `DeviceOrientationEvent.requestPermission()` viene chiamato **da un
  tap** sul pulsante "Attiva bussola". Si usa `event.webkitCompassHeading`
  (già riferito al Nord vero, orario).
- **Android / altri**: si usa `deviceorientationabsolute` se disponibile, altrimenti
  `deviceorientation`, con `heading = (360 - alpha) % 360`.
- La rosa viene ruotata di **`-heading`** mantenendo un **angolo continuo** (niente
  salto 359°→0°) con uno **smoothing low-pass**; la transizione CSS (~0.12s lineare)
  la rende fluida.
- L'ago del vento è figlio del gruppo della rosa e viene ruotato del bearing del
  vento: ruotando con la rosa, finisce a `windDir − heading` sullo schermo, cioè
  nella direzione **geografica** reale.
- Se non c'è magnetometro o il permesso è negato, la rosa resta con **Nord in alto**
  e compare un avviso: l'app rimane comunque usabile (ricerca + dati).

## Convenzioni

- `wind_direction_10m` di Open-Meteo è la direzione **da cui proviene** il vento
  (convenzione meteo/nautica). È usata così in tutta l'app.
- Conversioni di velocità da km/h: nodi ×0,539957 · m/s ÷3,6.

## Pubblicare su GitHub Pages

1. Fai push del repository su GitHub.
2. `Settings → Pages → Build and deployment → Source: Deploy from a branch`.
3. Scegli il branch `main` e la cartella `/ (root)`, poi `Save`.
4. L'app sarà su `https://<utente>.github.io/rosa-dei-venti/`.

Tutti i percorsi sono **relativi** (`./…`), quindi funziona anche in sottocartella.
La bussola e la geolocalizzazione richiedono un contesto **HTTPS** (GitHub Pages lo è).

## Sviluppo locale

```bash
python3 -m http.server 8080
# poi apri http://localhost:8080/
```

> Nota: su `http://localhost` la geolocalizzazione funziona, ma il magnetometro su
> iOS richiede HTTPS reale (es. GitHub Pages) per dare letture attendibili.

## File

- `index.html` — app completa (HTML + CSS + JS inline, nessun build step).
- `manifest.json` — manifest PWA.
- `sw.js` — service worker (offline + installabilità).
- `icon-192.png`, `icon-512.png`, `icon-maskable.png` — icone.

## Limiti noti

- La precisione della bussola dipende dal magnetometro del dispositivo e dalla
  **calibrazione**: in presenza di interferenze magnetiche la lettura può oscillare.
  Su iOS, muovi il telefono a "8" per calibrare la bussola di sistema.
- Su iOS il permesso di orientamento va concesso **a ogni sessione** con un tap.
- Alcuni browser desktop non espongono il magnetometro: la rosa resta a Nord fisso.

## Scelte fatte

- Nessun framework e nessuna libreria esterna pesante: solo HTML/CSS/JS vanilla e
  SVG disegnato a mano, per girare su GitHub Pages senza compilazione.
- In caso di ambiguità si è scelta l'opzione più semplice e robusta (es. fallback a
  Roma all'avvio, fetch con timeout di 8s via `AbortController`).
