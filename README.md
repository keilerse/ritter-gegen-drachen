# Ritter gegen Drachen

Ein kleines Rechenspiel für die erste und zweite Klasse: Addition und Subtraktion
im Zahlenraum bis 20. Jede richtig gelöste Aufgabe schlägt dem Drachen einen Zahn
aus, jede falsche kostet eines von drei Herzen.

**Spielen:** https://BENUTZERNAME.github.io/ritter-gegen-drachen/

## Wie es funktioniert

Fünf Drachen warten hintereinander, jeder etwas schwerer als der vorige:

| Drache | Aufgaben |
|---|---|
| Glutzahn | im Zahlenraum bis 10 |
| Nebelschwinge | bis 10 und bis 20 ohne Zehnerübergang |
| Frostkralle | bis 20, teils mit Zehnerübergang |
| Schattenhorn | mit Zehnerübergang |
| Königsdrache | zusätzlich Platzhalter-Aufgaben wie 7 + ? = 15 |

Die Antwort wird über ein Zahlenfeld von 0 bis 20 eingegeben, es muss also nichts
getippt werden. Wer unsicher ist, kann sich per Knopfdruck ein Zwanzigerfeld
einblenden lassen, das die Aufgabe als Punktebild zeigt. Am Ende jedes Drachen
gibt es je nach verbliebenen Herzen ein bis drei Sterne.

## Technisches

Eine einzige HTML-Datei ohne Framework, ohne Build-Schritt und ohne Abhängigkeiten.
Einfach `index.html` im Browser öffnen, das genügt. Die Klänge erzeugt die Web Audio
API direkt im Browser, es werden keine Sounddateien geladen. Der Ton lässt sich im
Spiel abschalten.

Die Oberfläche ist für Smartphones gebaut (große Flächen zum Antippen, kein
horizontales Scrollen) und funktioniert am Tablet und Desktop genauso. Am Handy
lässt sich die Seite über "Zum Home-Bildschirm hinzufügen" wie eine App ablegen.

Die Schriften Luckiest Guy und Fredoka werden von Google Fonts geladen. Ohne
Internetverbindung greift eine Systemschrift, das Spiel bleibt spielbar.

## Ändern

Die Drachen stehen als Liste `DRACHEN` am Anfang des Skripts, dort lassen sich
Namen, Zahnzahl und Schwierigkeitsstufen anpassen. Die Aufgaben selbst entstehen
in `baueAufgabe()`, jede Stufe hat dort ein paar Zeilen. Die Farben liegen als
CSS-Variablen ganz oben in der Datei.

## Lizenz

Privates Projekt, entstanden für meine Kinder. Gerne benutzen und verändern.
