# Come far costruire l'app a Claude Code (in autonomia)

Questo file ti dà i comandi esatti. Servono un **Mac/PC** con terminale, **Node.js 18+**,
e un account a pagamento (Claude Pro/Max o credito API). Non si fa da iPhone.

## 0) Prerequisiti (una volta sola)
```bash
# Node.js: verifica
node --version        # deve essere >= 18

# Installa Claude Code
npm install -g @anthropic-ai/claude-code

# Verifica
claude --version
```
Al primo avvio `claude` ti chiede di accedere (browser). In alternativa, per uso non interattivo:
```bash
export ANTHROPIC_API_KEY=sk-ant-...    # se usi credito API
```

## 1) Prepara la cartella di lavoro (la tua repo)
```bash
git clone https://github.com/pezzaliapp/rosa-dei-venti.git
cd rosa-dei-venti

# Copia qui dentro i due file dello scaffold:
#   CLAUDE.md   (la specifica completa)
#   BUILD.md    (questo file)
# Se hai scaricato lo zip "rosa-dei-venti-cc", copia il suo contenuto nella repo:
#   cp -R /percorso/rosa-dei-venti-cc/. .
```

## 2A) Modalità interattiva (consigliata la prima volta)
Lanci Claude Code e gli dai un solo ordine: legge `CLAUDE.md` e fa tutto.
```bash
claude
```
Poi, dentro la sessione, incolla:
```
Leggi CLAUDE.md e costruisci l'intera app da zero, completamente e in autonomia,
seguendo la specifica e la sezione "Verifica prima del commit". Non chiedermi conferme:
crea tutti i file, verifica, e lascia un commit pronto (senza push). Alla fine fammi
un riepilogo con come testare in locale e come pubblicare su GitHub Pages.
```

## 2B) Modalità headless (autonomia totale, un comando)
Esegue tutto senza interazione e si ferma da solo.
```bash
claude -p "Leggi CLAUDE.md e costruisci l'intera app da zero in autonomia: crea index.html, manifest.json, sw.js e le 3 icone, esegui la sezione 'Verifica prima del commit', poi fai 'git add -A && git commit' con un messaggio chiaro (NIENTE push). Stampa un riepilogo finale." \
  --allowedTools "Read,Write,Edit,Bash" \
  --max-turns 40
```
Note utili:
- `--allowedTools "..."` pre-autorizza solo le azioni che servono (lettura/scrittura file e bash).
- `--max-turns 40` dà abbastanza passi per costruire + verificare + commit.
- Se vuoi log dettagliati: aggiungi ` --output-format stream-json`.
- `--dangerously-skip-permissions` esiste ma usalo SOLO in ambienti isolati/container: salta ogni controllo permessi.

## 3) Prova in locale
```bash
python3 -m http.server 8080
# apri http://localhost:8080  (la bussola e la ricerca funzionano; il GPS richiede https o localhost)
```

## 4) Pubblica su GitHub Pages
```bash
git push                       # invia il commit che Claude Code ha preparato
```
Poi su GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
Dopo ~1 minuto: `https://pezzaliapp.github.io/rosa-dei-venti/`
(oppure il tuo dominio se hai configurato il CNAME, es. `alessandropezzali.it/rosa-dei-venti/`).

## Se qualcosa va storto
- Bussola che non parte su iPhone: Impostazioni → Safari → Movimento e orientamento → ON, poi ricarica.
- 404 su manifest.json o sw.js: assicurati che i file siano nella ROOT del branch pubblicato e che i percorsi siano relativi.
- Claude Code si ferma a metà: rilancia con la stessa frase aggiungendo "continua da dove eri rimasto e completa la Definition of Done".
