# Rechen-Ritter

Ein Rechenspiel für die erste und zweite Klasse: Plus und Minus im Zahlenraum bis 20.
Richtig gerechnet wird belohnt – mit Gold, Schätzen und einer eigenen Burg.

**Spielen:** https://keilerse.github.io/ritter-gegen-drachen/

## Die Idee

Kinder rechnen Plus- und Minusaufgaben, tippen die Antwort über ein Zahlenfeld an
und verdienen dabei Gold. Das Gold lässt sich für Puzzle-Bilder, eine Burg und einen
eigenen Drachen ausgeben. Bis zu vier Kinder spielen mit eigenen Konten, eigenem Gold
und eigenen Einstellungen.

Vor dem Spiel lässt sich einstellen, ob im Zahlenraum bis 10 oder bis 20 gerechnet
wird und ob nur Plus oder Plus und Minus vorkommen.

## Die Spiele

### Spielen & Verdienen

- **Ritter gegen Drachen** – das Herzstück. Fünf Drachen warten hintereinander, jeder
  etwas schwerer als der vorige. Jede richtige Antwort schlägt dem Drachen einen Zahn
  aus, jede falsche kostet eines von drei Herzen. Am Ende jedes Drachen gibt es Sterne
  und Drachengold.
- **Schatzjagd** – Rechnen in Ruhe, ohne Verlieren. Richtig gerechnet wird mit dem
  zwei- und dreifachen Gold belohnt, nach 15 Aufgaben winkt Bonus-Gold. Nur hier gibt
  es Schatztruhen: Alle fünf Aufgaben öffnet sich eine mit einem Bild fürs Album.
- **Rechenmauer** – Lücken in der Zahlenmauer füllen; ein Knopf zeigt den nächsten
  Rechenschritt als Hilfe.
- **Ritter-Turnier** – ein Tjost gegen vier Gegner, von Ritter Blauhelm bis König
  Goldhelm. Jede Aufgabe ist ein Ritt; nach acht Ritten muss der Verlierer aus dem
  Sattel.
- **Drachenturm** – Verdoppeln und Halbieren. Der Ritter steigt eine Leiter zum Schatz
  hinauf und wieder hinunter; jeder fehlerfreie Turm schaltet eine Drachenfarbe frei.
- **Burggraben** – der Zehnerübergang als Verfahren: erst `8 + 2 = 10`, dann
  `10 + 3 = 13`, gezeichnet als Rechenstrich mit Bögen über dem Zahlenstrahl.
- **Uhrturm** – die Uhr lesen nach dem Lehrplan der 1. Klasse: volle und halbe
  Stunden, mit freiwilliger Bonusrunde für Viertelstunden.
- **Burgwaage** – Mengen vergleichen: mehr, weniger oder gleich viel.

Es geht dort weiter, wo man aufgehört hat: Jedes Spiel merkt sich die erreichte Stufe,
und wer besiegt wird, fällt eine Stufe zurück – nicht auf null.

### Gold ausgeben

- **Puzzle-Schatz** – jedes Puzzleteil kostet 200 Gold; Stück für Stück wird ein Bild
  enthüllt.
- **Bildergalerie** – alle gelösten Bilder hängen hier nebeneinander.
- **Das Wirtshaus** – „Siebzehn und Vier“ mit Würfeln – das einzige Spiel, in dem Gold
  gesetzt statt verdient wird.
- **Burg bauen** – Mauern, Tor, Fenster, Flagge und Wappen auf einem Raster platzieren.
- **Drachenhöhle** – für 500 Gold gibt es ein Drachenei, jede Fütterung kostet 80 Gold.
  Der Drache wächst vom Ei bis zum Hausdrachen und fliegt als Begleiter im
  Drachenkampf mit.

## Das Hochhaus – ein zweites Spiel

Eigene Seite, eigenes Aussehen, eigener Zahlenraum: **https://keilerse.github.io/ritter-gegen-drachen/hochhaus.html**

Für die zweite Klasse, Plus bis 100. Das Haus hat zehn Stockwerke zu je zehn
Fenstern – das ist die Hundertertafel als Gebäude: **Stockwerk = Zehner, Fenster =
Einer**. Wer 30 dazuzählt, fährt drei Stockwerke hoch und bleibt beim selben
Fenster; wer 3 dazuzählt, geht drei Fenster weiter und bleibt im selben Stock.
Nach demselben Gedanken ist die Eingabe gebaut: Das Kind tippt keine Zahl von 0
bis 99, sondern wählt **Stock und Fenster getrennt** – es setzt die Antwort aus
Zehnern und Einern zusammen.

Vier Lieferungen zu je zwölf Paketen, jede schaltet die nächste frei:

| | | |
|---|---|---|
| 1 | **Nachbarn** | `21+3, 21+4, 21+5` |
| 2 | **Gleiches Fenster** | `21+4, 11+4, 1+4` |
| 3 | **Ganze Stockwerke** | `25+10, 25+20, 25+30` |
| 4 | **Durcheinander** | alles gemischt, einzeln |

Die Aufgaben kommen in **Familien zu dritt** und stehen untereinander wie im
Schulheft. Es geht nicht ums Ausrechnen einzelner Aufgaben, sondern darum, aus
einer bekannten eine neue zu machen – zufällig gewürfelte Einzelaufgaben würden
genau das verfehlen. Erst die vierte Stufe stellt sie einzeln; das ist der
Übertrag. **Keine Aufgabe überschreitet den Zehner**, so wie im Heft auch: Erst
sitzt der Stellenwert, der Zehnerübergang im Hunderterraum kommt später.

Namen, Bild und Sprache liest das Hochhaus aus den Konten des Rechen-Ritters –
beide Seiten kommen von derselben Adresse. Geschrieben wird nur der eigene
Schlüssel `…​.hochhaus` mit den Sternen je Stufe.

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

`style.css` und `app.js` werden mit einer Versionsnummer eingebunden (`app.js?v=11`).
Nach jeder Änderung die Zahl in beiden Zeilen um eins hochzählen, sonst sehen Kinder
mit offener Seite noch die alte Version.

Die Klänge erzeugt die Web Audio API direkt im Browser, es werden keine Sounddateien
geladen. Spielstände (Konten, Gold, Schätze, Puzzle, Burg, Drache) liegen als
`localStorage` im Browser des jeweiligen Kindes. Die Oberfläche ist für Smartphones
gebaut und funktioniert auf Tablet und Desktop genauso.

## Lizenz

Privates Projekt, entstanden für meine Kinder. Gerne benutzen und verändern.
