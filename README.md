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
  **Nur hier gibt es Schatztruhen**: Alle fünf Aufgaben springt eine auf und legt ein
  Stück ins Album. Das ist ihr Alleinstellungsmerkmal – zählte jedes Spiel mit, wäre
  die Schatzjagd bloß eines von sechs Rechenspielen und die Truhe eine Belohnung, die
  überall vom Himmel fällt. Die Truhenleiste steht deshalb nur in der Schatzjagd und
  auf dem Startbildschirm, wo sie als Einladung dient.

- **Rechenmauer** – Lücken in der Zahlenmauer füllen. Jede Mauer ist so aufgebaut, dass
  sich die Lücken Schritt für Schritt lösen lassen; ein Knopf zeigt den nächsten
  Rechenschritt als Hilfestellung an.

- **Ritter-Turnier** – ein Tjost gegen vier Gegner, von Ritter Blauhelm bis König
  Goldhelm. Jede Aufgabe ist ein Ritt: beide Ritter preschen aufeinander zu, in der
  Mitte krachen die Lanzen. Eine richtige Antwort setzt den eigenen Treffer, eine
  falsche einen für den Gegner. Nach acht Ritten muss der Verlierer aus dem Sattel –
  bei Gleichstand gewinnt das Kind.

- **Drachenturm** – Verdoppeln und Halbieren, ohne dass diese Wörter je fallen. Der
  Ritter steigt eine Leiter zum Schatz hinauf und wieder hinunter. Hoch geht es mit
  ganz normalen Plusaufgaben (`8 + 8 = ?`), runter mit Platzhaltern, bei denen beide
  Lücken dieselbe Zahl sind (`? + ? = 16`). Runter fängt es wieder bei der ersten
  Sprosse an statt bei der zuletzt erklommenen; der Ritter steht dabei auf genau
  einer Sprosse und läuft von oben herunter, während sich die Leiter von unten
  auffüllt. Golden pulst immer die Sprosse, in
  die die Antwort gehört – hinauf die über dem Ritter, hinunter füllt sich die
  Leiter von unten wieder auf. Was darunter steht, ist ausgerechnet und sichtbar;
  ab der goldenen Sprosse bleibt alles `?`, damit die gesuchte Zahl nie auf der
  Leiter abzulesen ist. **Jeder Turm ist gleich hoch.** Solange
  die Verdopplung im Zahlenraum bleibt, baut die Leiter sich selbst weiter
  (`3 · 6 · 12`); ist oben kein Platz mehr, wird mit einer anderen zufälligen
  Verdopplung aufgefüllt (`8 · 16 · 18`, weil 32 über 20 läge). Ohne dieses Auffüllen
  wäre ein Turm mit der 7 nach einer einzigen Stufe zu Ende – kurz und viel zu leicht.
  Die Sprossen bleiben dabei immer aufsteigend; auf einer aufgefüllten Stufe ist die
  Aufgabe aber nicht die Verdopplung der Sprosse, auf der der Ritter gerade steht –
  die Antwort ist dafür immer die Sprosse, auf der er landet. Vier Sprossen, also
  drei Aufgaben hinauf und drei hinunter.

  Beim Auffüllen darf ein Summand keine Zahl treffen, die schon auf einer Sprosse
  steht: Die Leiter `5 · 10 · 18 · 20` fragt beim Abstieg `? + ? = 20`, und die
  gesuchte 10 stünde zwei Sprossen tiefer offen da. `turmLeiter()` sucht deshalb
  mit Rücknahme statt geradeaus – ein zu gieriger Schritt (etwa früh auf die 20)
  ließe den Turm sonst zu kurz enden.
  Oben gibt es eine silberne Truhe, unten eine goldene, wenn der Turm fehlerfrei war.
  Eine falsche Antwort lässt den Ritter eine Sprosse abrutschen. Drei Türme pro
  Durchgang; jeder fehlerfreie Turm schaltet eine Drachenfarbe frei.

### Gold ausgeben

- **Uhrturm** – die Uhr lesen, nach dem Lehrplan der 1. Klasse Volksschule: volle
  und halbe Stunden. Die Turmuhr zeigt eine Zeit, auf der Tafel steht der Satz mit
  einer Lücke (`halb ▢`), getippt wird die Zahl auf einem Feld von 1 bis 12. In der
  letzten Runde kommt die Gegenrichtung dazu: Auf der Tafel steht die Zeit, darunter
  drei Uhren zur Wahl – das ist das „Einstellen" des Lehrplans, ohne dass ein
  Sechsjähriger Zeiger ziehen muss. Dabei verliert die Turmuhr ihre Zeiger und
  bekommt sie nach der richtigen Antwort zurück. Alle vier Aufgaben läutet die
  Glocke und ein Fenster geht an. Nach zwölf Aufgaben bietet das Abschluss-Fenster
  eine **freiwillige Bonusrunde mit Viertelstunden** an – die gehören erst in die
  2. Klasse, deshalb kann man sie überspringen.

- **Puzzle-Schatz** – jedes Puzzleteil kostet 200 Gold. Stück für Stück wird ein Bild
  enthüllt, bis das Puzzle gelöst ist. Danach geht es mit dem nächsten Motiv weiter,
  und das fertige Bild bleibt.
- **Bildergalerie** – alle gelösten Bilder hängen hier nebeneinander; ein Tipp zeigt
  eines gross, ein zweiter vergrössert es noch einmal zum Verschieben. Noch nicht
  gelöste Motive sind als Schloss zu sehen. Sind alle Bilder fertig, bleibt das letzte
  vollständig stehen und es beginnt kein neues Puzzle mehr.
- **Burg bauen** – Mauern, Tor, Fenster, Flagge und Wappen kosten unterschiedlich viel
  Gold und werden auf einem Raster platziert. Eine vollständige Burg wird belohnt.
- **Drachenhöhle** – für 500 Gold gibt es ein Drachenei, jede Fütterung kostet 80 Gold.
  Der Drache wächst in vier Stufen vom Ei über den Schlüpfling und den Jungdrachen bis
  zum Hausdrachen. Ab dem Jungdrachen fliegt er im Drachenkampf als Begleiter mit und
  jubelt bei jedem Treffer. Sein Name wird aus einer Liste angetippt, und die Höhle
  lässt sich mit Nest, Fackel, Goldhaufen, Kristall, Knochen und Sternenlicht schmücken.
  Jedes Stück bewegt sich, und zwar unterschiedlich: Die Fackel flackert und wirft
  Licht, der Stern funkelt, der Kristall blinkt, das Gold glitzert, das Nest wiegt
  sich in seiner eigenen Wärme, und der Knochen liegt meist still und kippelt dann
  kurz. Nest und Knochen bekommen ihre Bewegung hinter dem Aufpoppen (`animation`
  mit zwei Einträgen und `.5s` Verzögerung); die vier leuchtenden überschreiben das
  Aufpoppen weiterhin, sonst wären sie bei jedem Öffnen der Höhle eine halbe Sekunde
  lang unsichtbar.

  Der Drache **bekommt Hunger**: Nach 20 Stunden meldet ein Banner auf dem
  Startbildschirm, dass gefüttert werden will, und mit jedem weiteren Tag kommt eine
  Portion dazu (höchstens drei). Wichtig dabei: Der Rückstand wächst **höchstens um
  eine Portion je Spielstart** – zwei Wochen Ferien kosten also nicht mehr als ein
  einzelner vergessener Tag. Der Drache verliert nie etwas, er wird nicht kleiner und
  fliegt auch hungrig weiter mit; die nachzuholenden Portionen kosten nur Gold. Einen
  ausgewachsenen Drachen kann man deshalb weiterhin füttern, wenn er Hunger hat.

  Seine **Farbe** wird im Drachenturm verdient: Jeder fehlerfrei geschaffte Turm
  schaltet eine der sechs Farben frei, umgestellt wird in der Höhle. Die Farbe gilt
  für den Drachen in der Höhle und für den Begleiter im Drachenkampf.

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

`style.css` und `app.js` werden in `index.html` mit einer Versionsnummer eingebunden
(`app.js?v=11`). Der Browser holt nach einer Änderung dadurch sicher die neue Datei und
nicht die alte aus dem Cache. **Wichtig:** Nach jeder Änderung an `style.css` oder
`app.js` die Zahl in beiden Zeilen um eins hochzählen, sonst sehen Kinder mit offener
Seite unter Umständen noch die alte Version (GitHub Pages liefert die Dateien mit zehn
Minuten Cache aus).

Die Klänge erzeugt die Web Audio API direkt im Browser, es werden keine Sounddateien
geladen. Der Ton lässt sich im Spiel abschalten. (Die frühere Ein-Datei-Variante liegt
als `index-singlefile.html` daneben.)

Spielstände (Konten, Gold, Schätze, Puzzle, Burg, Drache) liegen als `localStorage` im
Browser des jeweiligen Kindes. Die Puzzle-Motive liegen als `puzzle1.webp` bis
`puzzle5.webp` im Ordner `images/`; welche Bilder schon gelöst sind, merkt sich der
Spielstand pro Kind.

Die Drachenhöhle nimmt `images/drachenhoehle.webp` als Hintergrund. Darunter liegt als Ersatz
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
`HOEHLE_EI` und `HOEHLE_FUTTER`. Die Turniergegner liegen als `TURNIER_GEGNER`
(Name, Schwierigkeit, Beute, Wappenfarben), die Zahl der Ritte pro Gegner als
`TURNIER_RITTE`.

**Jeder Gegner hat eigene Farben** an Fahne und Satteldecke – die Namen geben sie
in allen fünf Sprachen vor (Blauhelm, Grauguss, Silberzahn, Goldhelm), und von Blau
über Eisen und Silber zu Gold läuft die Reihe nebenbei mit der Schwierigkeit mit.
Sein Namensschild trägt dieselbe Farbe; bei 60 Pixel Rittergröße ist das der
schnellere Hinweis als die Fahne.

Umgesetzt ist das ohne vier Kopien der Grafik: Ein `<img>` lässt sich von außen
nicht umfärben, die Verläufe stecken in der Datei. Also wird `ritter-nach-links.svg`
einmal geholt, im Text werden die vier Farbwerte von `gDecke` und `gFahne` ersetzt,
und das Ergebnis hängt als Blob-URL am selben `<img>` – alle CSS-Klassen
(`angriff`, `getroffen`, `faellt`) bleiben unangetastet. Es liegt immer nur eine
Fassung im Speicher, die vorige wird freigegeben.

Ein `filter: hue-rotate()` auf das ganze Bild wäre einfacher gewesen, geht aber
nicht: Es würde das braune Pferd mitdrehen, und für Gold müsste man so weit
drehen, dass das Pferd blau wird.

**Wichtig fürs Ausprobieren:** `fetch` scheitert, wenn man die `index.html` direkt
per `file://` öffnet – dann bleibt für alle Gegner der blaue Ritter aus dem Markup
stehen. Zum Prüfen also `python3 -m http.server` im Projektordner benutzen.

Für den Drachenturm gibt es `TURM_ANZAHL` (Türme je Durchgang), `TURM_SPROSSEN`
(Sprossen je Turm, also eine Aufgabe weniger hinauf und ebenso viele hinunter) und
`TURM_FEHLER_HALT` (nach so vielen Fehlern auf derselben Sprosse rutscht der Ritter
nicht weiter ab, damit niemand hängenbleibt). Die Drachenfarben stehen als
`DRACHEN_FARBEN`; die Gradzahlen sind an der Drachengrafik ausgemessen und nicht
frei wählbar – `hue-rotate` dreht ab deren Grundfarbe, und die ist grün. Deshalb ist
Grün 0° und Rot liegt bei 240°. Den Hunger steuern `HUNGER_STUFE_MS` (Standard
20 Stunden) und `HUNGER_MAX` (höchstens drei offene Portionen).

`TURM_SPROSSEN` lässt sich hochsetzen – die Höhe ist nicht das Problem. Selbst bis
10 trägt die Leiter `1 · 2 · 4 · 6 · 8 · 10`, also alle fünf Verdopplungen des
Zahlenraums in einem Turm. Es kostet nur Startzahlen: `turmStartsMoeglich()` wirft
alle weg, von denen aus die Höhe nicht mehr erreichbar ist, und das sind mit jeder
Sprosse mehr.

Bei vier Sprossen bleiben bis 10 die Startzahlen 1–3 und bis 20 die Startzahlen
1–8 übrig, also je genug für die drei Türme eines Durchgangs; bei fünf müsste sich
bis 10 schon einer wiederholen. Die 18 Aufgaben je Durchgang liegen nahe an
Schatzjagd und Rechenmauer (je `ZIEL`/`MAUER_ZIEL` = 15). Welche Startzahlen
durchkommen, rechnet `turmStartsMoeglich()` nicht aus, sondern probiert es –
die Sperre für schon vergebene Zahlen ließe sich sonst kaum mitrechnen.

Der Uhrturm hat `UHR_RUNDEN` × `UHR_JE_RUNDE` Aufgaben im Hauptteil und
`UHR_BONUS_AUFGABEN` in der Bonusrunde, dazu `UHR_WAHL` Uhren beim Zuordnen.

**Die Sprachfalle des Uhrturms.** „halb 4" ist 3:30 – aber nur im Deutschen wird
dabei die *nächste* Stunde genannt. Englisch („half past three"), Spanisch („3 y
media"), Französisch und Türkisch nennen die *aktuelle*. Dieselbe Uhr hat also je
nach Sprache eine andere richtige Antwort. Welche gilt, steht als
`uhr.halb.bezug` in `strings.js` (`naechste` nur bei `de`); `uhrZahl()` liest es
aus. Bei „viertel vor" nennen alle fünf Sprachen die nächste Stunde, da braucht es
keine Fallunterscheidung. Wer eine Sprache ergänzt, muss diesen Schlüssel setzen.

Die Zeitangaben in Spanisch, Französisch und Türkisch sind für Ziffern
vereinfacht („1 heures" statt „une heure"); wer es genauer will, muss die Formen
in `uhr.form.*` sprachspezifisch aufteilen.

**Der Stundenzeiger** steht bei 3:30 nicht auf der 3, sondern auf halbem Weg zur 4
(`(h % 12) * 30 + m * 0.5`). Genau daran liest ein Kind ab, dass es schon fast vier
ist – ohne den halben Grad je Minute wäre die Uhr didaktisch falsch. Der Test
rechnet die Zeit aus den tatsächlich gesetzten Zeigerwinkeln zurück und prüft das
nach, statt dem Spielzustand zu glauben.

**Ein neues Puzzlebild** kommt in zwei Schritten dazu: die Datei als `images/puzzle6.webp`
ablegen (Seitenverhältnis 4:3) und `PUZZLE_ANZAHL` im Skript um eins erhöhen. Nimmst du
ein Bild wieder heraus, senke die Zahl entsprechend – gespeicherte Einträge zu Bildern,
die es nicht mehr gibt, wirft das Spiel beim Laden von allein weg.

Die Bilder liegen als **WebP** vor, nicht als PNG: Als PNG waren die fünf Motive
zusammen 8,8 MB schwer, in der Bildergalerie hängen sie alle nebeneinander. Mit
WebP bei Qualität 88 sind es 1,1 MB, ohne dass man am Bild einen Unterschied
sieht. Wer ein Motiv austauscht, sollte es also ebenfalls als WebP speichern
(`Image.save(..., "WEBP", quality=88, method=6)` oder `cwebp -q 88`).

**Die Ritter-Grafiken** sind nachgezeichnete SVGs: jede Farbfläche liegt als genau
ein `<path>` vor. Umfärben geht deshalb über die Füllfarbe – aber nur, solange eine
Farbe auch wirklich nur eine Sache meint. Sobald das nicht mehr stimmt, hilft die
**Zerlegung in Teilpfade**: `M` beginnt jeweils eine neue Teilfigur, und über deren
Bounding-Box lässt sich einzeln entscheiden. Wichtig dabei: Ein Loch (etwa das Auge
eines Wappentiers) liegt immer in der Box seines Elternteils und muss mit ihm
zusammen umziehen, sonst wird aus dem Loch eine gefüllte Fläche.

`images/ritter-nach-rechts.svg` (im Turnier der linke Ritter, Quelle in
`assets/original/`) hat beides: ein rotes Drachenwappen auf der Satteldecke **und**
rote Sprenkel in genau derselben Farbe, verstreut über Beine, Schweif und Hufe. Das
Wappen ist ein einziger Teilpfad; alles, was seine Box nicht berührt, ist Sprenkel
und liegt jetzt in einem zweiten Pfad in `#6a564f`, dem Braun des Pferdes. Gegengeprüft
wird an der gerenderten Grafik: außerhalb des Wappens darf kein rotes Pixel
übrig sein.

`images/ritter.svg` (Drachenkampf) ist der umgekehrte Fall – dort war das
Wappentier dieselbe helle Fläche wie die Rüstung, aber eben als eigener Teilpfad.
Der ist jetzt rot, samt seiner beiden Löcher. Der Rest des Schildes bleibt Silber.

`images/ritter-leiter.svg` (Symbol des Drachenturms, Ritter auf der Sprosse und
Bild im Abschluss-Fenster) ist der dritte Fall: Der Drache steckt dort gar nicht
als Fläche in der Zeichnung, sondern nur als **Loch im Konturpfad** – das Wappen
war reine Strichzeichnung auf zweifarbigem Feld. Das Loch lässt sich aber als
eigene Fläche wiederverwenden: Es wird mit `fill-rule="evenodd"` zusammen mit der
Schwanzschlaufe (die Feldfarbe behalten soll) als roter Pfad direkt unter dem
Konturpfad eingehängt, damit die schwarzen Linien darüber liegen bleiben. Die
Grüntöne sind gegen die Grautöne des Kampfritters getauscht (`#c9c9c9`, `#9a9a9a`),
das Gewand gegen ein helleres `#d8d8d8`. Der weiße Hintergrundpfad musste weg,
sonst klebte ein weißer Kasten hinter der Figur.

`images/ritter-nach-links.svg` (der Gegner) hat den schwierigsten Fall: Satteldecke
und Rüstung teilen sich eine Farbe **innerhalb** desselben Teilpfad-Geflechts. Die
Decke wird darum über eine beschnittene Kopie des Rüstungspfades eingefärbt, und sie
ist **zweiteilig** – die große Fläche hinter dem Sattel und ein schmaler Lappen vor
dem Reiterbein. `clipPath#cDecke` enthält deshalb zwei Polygone. Deren Umrisse sind
nicht geschätzt, sondern aus einer Flächenanalyse der gerenderten Grafik gewonnen –
von Hand gesetzte Rechtecke erwischten zuverlässig den Hüftpanzer des Reiters mit.
Die Verläufe (`gRuest`, `gPferd`, `gDecke`, `gFahne`) stehen oben in der Datei und
geben der Figur etwas Tiefe.

Beim Leiter-Ritter kommt noch ein Schritt dazu: Drei Viertel seiner Teilpfade sind
Sprenkel unter 2×2 Einheiten – bei einer Anzeigehöhe von 40 bis 95 Pixeln ist das
weniger als ein Fünftel Pixel, macht aber ein Drittel der Datei aus. Sie fliegen
raus (415 KB → 273 KB); die mittlere Pixelabweichung liegt selbst in voller Größe
bei 0,35 von 255.

**Plastizität** kommt bei allen Figuren aus linearen Verläufen statt flacher
Füllfarben: je Fläche einer, aber alle mit denselben Endpunkten quer über die Figur,
damit sie einer Lichtquelle links oben folgen. Die Endpunkte liegen bei 10 % und 95 %
der Figurenbreite, nicht in den Ecken – sonst läge der hellste Punkt außerhalb der
Zeichnung und der Verlauf wirkte flach. Metall bekommt die größte Spreizung und einen
leicht kühlen Schatten, Stoff und Holz weniger. Mehr geht nicht: Bei anderthalbfacher
Spreizung werden die Beine matschig und das rote Wappen wäscht aus.

`gradientUnits="userSpaceOnUse"` heißt, dass die Koordinaten im Nutzerraum des
Pfades gelten, also **nach** einem `<g transform>` – bei den Dateien mit
Gruppenverschiebung (Leiter-Ritter, Jungdrache, Hausdrache) muss die Box darum um die
Verschiebung bereinigt sein.

Bei den drei Drachen war zu prüfen, ob die Verläufe die Drachenfarben stören: Sie
ändern nur die Helligkeit, nicht den Farbton, und nachgemessen bleibt der Farbton
nach `hue-rotate` derselbe (Feuerrot 3° vorher, 4° nachher). Die Gradzahlen in
`DRACHEN_FARBEN` stimmen also weiter.

Die Pfadkoordinaten sind auf **eine Nachkommastelle** gerundet und knapp geschrieben
(`c1.5-.2 3-1` statt `c 1.5,-0.2 3,-1`); zusammen spart das rund ein Viertel bis die
Hälfte der Dateigröße, ohne dass sich am Bild etwas ändert. Beim Runden muss der
Fehler laufend ausgeglichen werden – die Pfade sind relativ, sonst driftet die Form.
Auf ganze Zahlen zu runden zerlegt die Grafik sichtbar, das ist die Grenze.

**Die beiden Drachen** (`jungdrache.svg`, `schluepfling.svg`) benutzen dieselbe
grüne Palette, damit sie wie dasselbe Tier aussehen und die freigeschalteten
Drachenfarben bei beiden gleich wirken. Die Sättigung ist bewusst mittelhoch: Bei
einem blassen Grün liefert `hue-rotate` nur matte Farben. Die Eierschale beim
Schlüpfling bleibt cremefarben – sie ist kein Drache.

Die Aufgaben selbst entstehen in `rohAufgabe()`, jede Stufe hat dort ein paar Zeilen.
Die Farben liegen als CSS-Variablen ganz oben in der Datei.

## Lizenz

Privates Projekt, entstanden für meine Kinder. Gerne benutzen und verändern.
