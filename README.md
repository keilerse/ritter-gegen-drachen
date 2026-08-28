# Rechen-Ritter

Ein Rechenspiel für die erste und zweite Klasse: Plus und Minus im Zahlenraum bis 20.
Richtig gerechnet wird belohnt – mit Gold, Schätzen und einer eigenen Burg.

**Spielen:** https://keilerse.github.io/ritter-gegen-drachen/

## Die Idee

Kinder rechnen Plus- und Minusaufgaben, tippen die Antwort über ein Zahlenfeld an
(nichts wird getippt) und verdienen dabei Gold. Das Gold lässt sich für Puzzle-Bilder,
eine Burg und einen eigenen Drachen ausgeben – so entsteht ein kleiner Anreiz zum
Weiterrechnen. Bis zu vier
Kinder spielen mit eigenen Konten, eigenem Gold und eigenen Einstellungen.

Vor dem Spiel lässt sich einstellen, ob im Zahlenraum bis 10 oder bis 20 gerechnet
wird und ob nur Plus oder Plus und Minus vorkommen.

## Die Spiele

Auf dem Startbildschirm wird zwischen „Spielen &amp; Verdienen“ und „Gold ausgeben“
unterschieden:

### Spielen &amp; Verdienen

- **Ritter gegen Drachen** – das Herzstück. Fünf Drachen warten hintereinander, jeder
  etwas schwerer als der vorige. Jede richtige Antwort schlägt dem Drachen einen Zahn
  aus, jede falsche kostet eines von drei Herzen. Am Ende jedes Drachen gibt es je nach
  verbliebenen Herzen ein bis drei Sterne und Drachengold.

  | Drache | Zähne | Aufgaben |
  |---|---|---|
  | Glutzahn | 4 | im Zahlenraum bis 10 |
  | Nebelschwinge | 5 | bis 10 und bis 20 ohne Zehnerübergang |
  | Frostkralle | 5 | bis 20, teils mit Zehnerübergang |
  | Schattenhorn | 6 | mit Zehnerübergang |
  | Königsdrache | 6 | zusätzlich Platzhalter-Aufgaben wie 7 + ? = 15 |

- **Schatzjagd** – Rechnen in Ruhe, ohne Herzen und ohne Verlieren. Eine Serie richtiger
  Antworten bringt den zwei- und dreifachen Goldbetrag, nach 15 Aufgaben winkt Bonus-Gold.

- **Rechenmauer** – Lücken in der Zahlenmauer füllen. Jede Mauer ist so aufgebaut, dass
  sich die Lücken Schritt für Schritt lösen lassen; ein Knopf zeigt den nächsten
  Rechenschritt als Hilfestellung an.

### Gold ausgeben

- **Puzzle-Schatz** – jedes Puzzleteil kostet 200 Gold. Stück für Stück wird ein Bild
  enthüllt (fünf verschiedene Motive), bis das Puzzle gelöst ist.
- **Burg bauen** – Mauern, Tor, Fenster, Flagge und Wappen kosten unterschiedlich viel
  Gold und werden auf einem Raster platziert. Eine vollständige Burg wird belohnt.
- **Drachenhöhle** – für 500 Gold gibt es ein Drachenei, jede Fütterung kostet 80 Gold.
  Der Drache wächst in vier Stufen vom Ei über den Schlüpfling und den Jungdrachen bis
  zum Hausdrachen. Ab dem Jungdrachen fliegt er im Drachenkampf als Begleiter mit und
  jubelt bei jedem Treffer. Sein Name wird aus einer Liste angetippt, und die Höhle
  lässt sich mit Nest, Fackel, Goldhaufen, Kristall, Knochen und Sternenlicht schmücken.

### Schatzkammer, Truhen und Ränge

Alle Spiele zahlen in dieselbe Schatzkammer ein. Nach fünf richtigen Antworten öffnet
sich eine Schatztruhe mit Gold und einem von zwölf sammelbaren Schätzen. Mit steigendem
Goldbesitz steigt man im Rang auf – vom Knappen bis zum Gott des Goldes.

## Technisches

Kein Framework, kein Build-Schritt, keine Abhängigkeiten. Einfach `index.html` im
Browser öffnen, das genügt. Die Seite besteht aus drei Dateien:

- `index.html` – die Struktur,
- `style.css` – das komplette Design,
- `app.js` – die gesamte Spiellogik.

Die Klänge erzeugt die Web Audio API direkt im Browser, es werden keine Sounddateien
geladen. Der Ton lässt sich im Spiel abschalten. (Die frühere Ein-Datei-Variante liegt
als `index-singlefile.html` daneben.)

Spielstände (Konten, Gold, Schätze, Puzzle, Burg, Drache) liegen als `localStorage` im
Browser des jeweiligen Kindes. Die Puzzle-Motive liegen als `puzzle1.png` bis
`puzzle5.png` im Ordner `images/`.

Die Drachenhöhle nimmt `images/drachenhoehle.png` als Hintergrund. Darunter liegt als Ersatz
eine gezeichnete Höhle als Inline-SVG – fehlt die PNG-Datei, bleibt die sichtbar und
das Spiel funktioniert weiter. Das Bild ist auf 572×260 zugeschnitten, dasselbe
Seitenverhältnis wie die Bühne; ein Ersatzbild sollte dieses Format haben, sonst
schneidet `cover` etwas ab. Die Kulisse läuft an den Rändern über eine Maske weich in
den Seitenhintergrund aus, damit der Übergang nicht hart abbricht.

Die Oberfläche ist für Smartphones gebaut (große Flächen zum Antippen, kein
horizontales Scrollen) und funktioniert am Tablet und Desktop genauso. Querformat am
Handy und Geräte mit Notch werden über eigene CSS-Regeln berücksichtigt. Am Handy
lässt sich die Seite über „Zum Home-Bildschirm hinzufügen“ wie eine App ablegen.

Die Schriften Luckiest Guy und Fredoka werden von Google Fonts geladen. Ohne
Internetverbindung greift eine Systemschrift, das Spiel bleibt spielbar.

## Ändern

Die Drachen stehen als Liste `DRACHEN`, die Schätze als `SCHAETZE` und die Ränge als
`RAENGE` im Skript – dort lassen sich Namen, Zahnzahl, Schwierigkeit, Preise und
Beute anpassen. Für die Drachenhöhle gilt dasselbe mit `HOEHLE_STUFEN` (Wachstum),
`HOEHLE_SCHMUCK` (Deko samt Position in der Höhle), `HOEHLE_NAMEN` sowie den Preisen
`HOEHLE_EI` und `HOEHLE_FUTTER`. Die Aufgaben selbst entstehen in `rohAufgabe()`, jede Stufe hat dort
ein paar Zeilen. Die Farben liegen als CSS-Variablen ganz oben in der Datei.

## Lizenz

Privates Projekt, entstanden für meine Kinder. Gerne benutzen und verändern.
