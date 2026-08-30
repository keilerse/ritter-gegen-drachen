# Ideen für Rechen-Ritter

Sammlung von Ausbauideen – neue Aufgabentypen, Gameplay und Dinge, für die sich
Gold ausgeben lässt. Stand: 30. August 2026.

## Bereits umgesetzt

- ✅ **Verdoppeln und Halbieren** als eigenes Spiel: der **Drachenturm** (siehe
  README). Statt eines Aufgabentyps unter vielen ist daraus eine Leiter geworden,
  die man hoch und wieder hinunter geht – und beide Richtungen sind Plusaufgaben,
  weil Erstklässler das Wort „verdoppeln" nicht kennen.
- ✅ **Drachenfarben** – sechs Farben, freigeschaltet durch fehlerfreie Türme.
- ✅ **Überschrift bei der Namensvergabe** in der Drachenhöhle.
- ✅ **Hunger** – der Drache will gefüttert werden, ohne dass er je etwas verliert.

---

## Der Ausgangspunkt: das Gold läuft dem Laden davon

Alles, was im Spiel gekauft werden kann, kostet zusammen rund **29.000 Gold**:

| Bereich | Rechnung | Summe |
|---|---|---|
| Puzzle | 5 Bilder × 20 Teile × 200 G | 20.000 G |
| Burg | 54 Felder × ⌀ 120 G | ~6.500 G |
| Drachenhöhle | 500 (Ei) + 15 × 80 (Futter) + 1.060 (Deko) | ~2.800 G |
| | | **~29.000 G** |

Bei etwa 20 Gold pro Aufgabe (10 Grundgold, im Schnitt mit Serien-Multiplikator,
dazu Drachenbeute und Truhen) ist der Laden nach ungefähr **1.450 Aufgaben**
leergekauft. Der letzte Rang „Gott des Goldes" verlangt aber **2.000 gelöste
Aufgaben**. Ein Kind, das gerne spielt, rechnet die letzten 500 Aufgaben also für
Gold, das nichts mehr kaufen kann.

Daraus folgen zwei Dinge, die die Liste unten leiten:

1. Es fehlen **Ausgabemöglichkeiten, die nicht endlich sind**.
2. Die fünf Drachen sind mechanisch identisch – sie unterscheiden sich nur in
   Zahnzahl, Aufgabenstufe, Farbton und Beute.

---

## Coole Aufgaben

Der entscheidende Punkt: **das Zahlenfeld gibt 0–20 aus.** Jede Aufgabe, deren
Antwort eine Zahl zwischen 0 und 20 ist, braucht deshalb *keine neue Oberfläche* –
nur ein paar Zeilen in `rohAufgabe()` (`app.js:413`).

### 1. Umkehraufgabe – die Lücke nach vorne
`fertig()` setzt die Lücke immer auf `b`, also `7 + ? = 15`. Die Variante
`? + 7 = 15` fehlt komplett, ist aber mental eine ganz andere Operation.

*Aufwand: ~3 Zeilen (ein Flag in `fertig()`).*

### 2. Zerlegungen und Zahlenfreunde
`10 = 4 + ?` und `20 = 13 + ?`. Das ist **die** Automatisierungs-Fähigkeit der
ersten Klasse: Wer die Partnerzahlen bis 10 im Schlaf kann, rechnet plötzlich
alles andere leichter. Denkbar als schneller „Blitz-Modus" mit 20 Aufgaben am
Stück.

*Aufwand: ~6 Zeilen.*

### 3. Verdoppeln und Halbieren ✅ *(umgesetzt als Drachenturm)*
„Das Doppelte von 7?", „Die Hälfte von 16?" Der zweite große
Automatisierungsblock – und die Grundlage für den Zehnerübergang
(8 + 7 rechnet man als 8 + 8 − 1).

*Aufwand: ~6 Zeilen.*

### 4. Drei Summanden
`4 + 3 + 5 = ?` Fühlt sich für ein Kind deutlich größer an, als es rechnerisch
ist – gutes Futter für einen Boss.

*Aufwand: ~4 Zeilen.*

### 5. Rechenkette
`7 + 5 − 3 = ?`, die Schritte nacheinander eingeblendet. Passt zum Königsdrachen.

*Aufwand: ~8 Zeilen.*

### 6. Sachaufgaben im Ritter-Setting
„Der Drache hatte 12 Münzen. 5 rollen in die Schlucht." Genau da hakt es bei
Kindern wirklich, und thematisch passt es hier besser als in jedem Schulbuch.
Als Satzschablonen bauen: etwa 6 Muster mit Zufallszahlen, also rund 30 neue
Strings je Sprache.

*Aufwand: höher – fünf Sprachen wollen übersetzt werden.*

---

## Gameplay

### 1. Bosse mit eigener Mechanik ⭐
Die fünf Drachen unterscheiden sich heute nur in `zaehne`, `stufen`, `hue` und
`beute` (`app.js:520-524`) – mechanisch sind sie derselbe Kampf. Je eine
Sonderregel macht aus fünf Runden fünf Erlebnisse:

| Drache | Sonderregel |
|---|---|
| Nebelschwinge | blendet die Punktereihe aus → Kopfrechnen statt Abzählen |
| Frostkralle | friert vier (falsche) Zahlen im Zahlenfeld ein |
| Schattenhorn | verdeckt die Aufgabe nach drei Sekunden |
| Königsdrache | lässt einen Zahn nachwachsen, wenn man zu lange braucht |

Nutzt ausschließlich vorhandene Bausteine (`sperren`, `bauePunkte`, `bewege`),
kein neuer Screen nötig.

### 2. Tagesquest und Streak-Kalender
„Heute: 20 Aufgaben schaffen" → 100 Bonusgold, dazu eine Reihe Flammen-Symbole
für aufeinanderfolgende Tage. Für die tägliche Übungsgewohnheit ist das der
stärkste Hebel im ganzen Spiel – mehr als jeder neue Aufgabentyp.

*Aufwand: ~40 Zeilen, ein Datum im localStorage.*

### 3. Der Übungsdrache
Ein sechster Drache, der **genau die Aufgaben stellt, die dieses Kind zuletzt
falsch hatte**, und dafür doppeltes Gold zahlt. Bisher ist eine falsch
beantwortete Aufgabe im Drachenkampf und im Turnier einfach weg (nur die
Schatzjagd wiederholt sie). Als Belohnung verpackt statt als Nachsitzen.

### 4. Duell am selben Gerät
Es gibt bereits bis zu vier Konten und die komplette Turnier-Mechanik. Zwei
Kinder abwechselnd am Tablet, wer den Ritt gewinnt, setzt den Treffer. Fast nur
Verdrahtung vorhandener Teile.

---

## Dinge zum Ausgeben

### 1. Ritterausrüstung – die Anziehpuppe ⭐
Helm, Umhang, Schild, Rüstungsfarbe, Reittier zu 150–600 Gold, jedes Teil
**sichtbar am eigenen Ritter** im Kampf und im Turnier. Der Ritter liegt im
Turnier schon als SVG auf dem Schirm (`t-ich`); Emoji-Overlays darüber passen
genau zum Stil des restlichen Spiels.

Höchster emotionaler Gegenwert pro Goldstück in dieser Altersgruppe – und
beliebig erweiterbar, ohne dass neue Mechanik dazukommt.

### 2. Wappen-Werkstatt
Form × Farbe × Symbol selbst zusammenstellen. Das Wappen erscheint auf der
Burgflagge, am Turnierschild und auf dem Startbildschirm. Kombinatorisch riesig,
technisch nur CSS und Emoji – und es gehört dem Kind.

### 3. Verbrauchsgüter – der Fix gegen den leergekauften Laden
Deko kauft man einmal; Verbrauchsgüter halten Gold dauerhaft wertvoll:

- **Trank der zweiten Chance** (200 G) – ein Herz zurück im Drachenkampf
- **Glücksmünze** (150 G) – doppeltes Gold im nächsten Kampf
- **Drachenatem** (250 G) – schlägt einem Boss sofort einen Zahn aus

Hinweise und Tipps sollten **nicht** verkauft werden – Hilfe muss gratis
bleiben, sonst spart das Kind an der falschen Stelle.

### 4. Drachenfarben ✅ *(umgesetzt – verdient im Drachenturm)*
`hue-rotate` steckt bereits in `kLeben()`. Sechs Farben für den eigenen Drachen
zu je 300 Gold sind praktisch ein Einzeiler plus Kaufknopf.

### 5. Burg-Ausbaustufe statt weiterer Deko
Für 3.000 Gold wird die Burg zur Festung – und schaltet damit einen sechsten
Drachen frei. Koppelt das Ausgeben an **neuen Inhalt** statt an noch ein Fass in
der Ecke.

---

## Vorgeschlagene Reihenfolge

1. **Ritterausrüstung** – schafft Sinks und sichtbaren Stolz zugleich
2. **Bosse mit Sondermechanik** – macht die vorhandenen fünf Drachen fünfmal so
   interessant, ohne neue Screens
3. **Zerlegungen und Verdoppeln** – die beiden lohnendsten neuen Aufgabentypen
4. **Tagesquest** – der günstigste Einzelgewinn, falls zuerst etwas Kleines
   drankommen soll

---

## Anhang: technische Quick Wins

Kein Gameplay, aber billig und wirksam.

- **Puzzle-Bilder komprimieren.** Die fünf PNGs sind zusammen 8,8 MB (je ~1,8 MB
  bei 1200×896). Als WebP (q82) gemessen: 169K / 208K / 123K / 169K / 101K –
  zusammen 770K, also **91 % weniger**. Nur `puzzleBild()` (`app.js:753`) auf
  `.webp` umstellen. Dazu sind `images/ritter-nach-links.svg` (557K) und
  `-rechts.svg` (425K) nachgezeichnete Bitmaps mit unnötig vielen
  Nachkommastellen – Runden halbiert sie.
- **„Bis 10" hat keine Steigerung.** `app.js:414` setzt `stufe = 1`, sobald
  `opt.max === 10` ist. Dadurch stellen **alle fünf Drachen identische
  Aufgaben** – ausgerechnet für die Erstklässler, die die Steigerung am
  nötigsten hätten. Abhilfe: Unterstufen innerhalb von 10 (Summen ≤ 5, dann ≤ 10
  ohne Fünferübergang, dann mit, dann Platzhalter).
- **Kein PWA-Manifest.** Die README verspricht „Zum Home-Bildschirm hinzufügen
  wie eine App", aber es gibt weder `manifest.json` noch `apple-touch-icon`,
  `theme-color` oder Favicon. Aktuell landet ein graues Lesezeichen auf dem
  Homescreen.
- **Ton stirbt nach dem App-Wechsel.** `app.js:66` erzeugt den AudioContext
  einmal und ruft nie `resume()`. Wechselt das Kind am Tablet kurz die App,
  bleibt der Ton für den Rest der Sitzung weg. Zweizeiler:
  `if(audio.state === "suspended") audio.resume();`
- **Cache-Version dreimal von Hand.** `v=14` steht in `index.html` in den Zeilen
  10, 672 und 673 und muss laut README nach jeder Änderung hochgezählt werden –
  ein kleines `bump.sh` nimmt die Fehlerquelle raus.
- **`index-singlefile.html`** ist auf dem Stand vom 28.08. 06:00, `app.js` vom
  selben Tag 12:54 – die Datei liefert inzwischen ein anderes Spiel.
- **`assets/original/`** sind 5 MB Rohdaten (jfif, doppelte PNGs und SVGs) in
  jedem Clone.
