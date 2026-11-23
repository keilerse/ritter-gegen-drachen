/* =====================================================================
   hochhaus.js – Das Hochhaus: Rechnen im Zahlenraum bis 100.

   Das Haus ist die Hundertertafel als Gebaeude: Das Stockwerk ist die
   Zehnerstelle, das Fenster die Einerstelle. Wer 30 dazuzaehlt, faehrt drei
   Stockwerke hoch und bleibt beim selben Fenster; wer 3 dazuzaehlt, geht drei
   Fenster weiter und bleibt im selben Stock. Damit ist das Bild des Hauses
   dasselbe wie der Stellenwert, um den es geht.

   Nach demselben Gedanken ist die Eingabe gebaut: Das Kind tippt nicht eine
   Zahl von 0 bis 99, sondern waehlt Stockwerk und Fenster getrennt. Es setzt
   die Antwort also aus Zehnern und Einern zusammen.

   Die Aufgaben kommen in Familien zu dritt, so wie im Schulheft untereinander:
   Es geht nicht ums Ausrechnen einzelner Aufgaben, sondern darum, aus einer
   bekannten eine neue zu machen. Zufaellig gewuerfelte Einzelaufgaben wuerden
   genau das verfehlen. Erst die letzte Stufe stellt sie einzeln - das ist der
   Uebertrag.

   KEINE Aufgabe ueberschreitet den Zehner. Im Heft tut das auch keine: Erst
   sitzt der Stellenwert, der Zehnerübergang im Hunderterraum kommt spaeter.
   ===================================================================== */
(function(){
  "use strict";

  const $ = id => document.getElementById(id);
  const zufall = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const waehle = a => a[Math.floor(Math.random()*a.length)];
  function mische(a){
    const k = a.slice();
    for(let i=k.length-1;i>0;i--){ const j=zufall(0,i); const h=k[i]; k[i]=k[j]; k[j]=h; }
    return k;
  }

  const STOCKWERKE = 10, FENSTER = 10;
  const PAKETE = 12;                 /* Aufgaben je Lieferung */
  const STUFEN = [1,2,3,4];

  /* ================= Konto =================
     Nur gelesen: Die Kinder behalten Namen, Bild und Sprache aus dem
     Rechen-Ritter, weil beide Seiten von derselben Adresse kommen.
     Geschrieben wird ausschliesslich der eigene Schluessel ".hochhaus" -
     an den Daten des anderen Spiels ruehrt hier nichts. */
  function kontoLesen(){
    try{
      const id = localStorage.getItem("rechenritter.aktiv");
      const liste = JSON.parse(localStorage.getItem("rechenritter.konten") || "[]");
      const k = liste.filter(x => x && x.id === id)[0];
      if(k) return k;
      if(liste.length) return liste[0];
    }catch(e){}
    return null;
  }
  const konto = kontoLesen();
  const standKey = () => "rechenritter." + ((konto && konto.id) || "gast") + ".hochhaus";

  /* Sterne je Stufe, 0 = noch nicht geschafft. */
  function standLaden(){
    const leer = {};
    STUFEN.forEach(s => leer[s] = 0);
    try{
      const d = JSON.parse(localStorage.getItem(standKey()) || "{}");
      STUFEN.forEach(s => {
        const n = Number(d[s]); if(n >= 0 && n <= 3) leer[s] = n;
      });
    }catch(e){}
    return leer;
  }
  function standSichern(){
    try{ localStorage.setItem(standKey(), JSON.stringify(stand)); }catch(e){}
  }
  const stand = standLaden();
  const offen = s => s === 1 || stand[s-1] > 0;

  /* ================= Klang =================
     Drei kurze Toene aus der Web Audio API, keine Dateien. */
  let hall = null;
  function ton(hz, dauer, art, start, laut){
    try{
      if(!hall) hall = new (window.AudioContext || window.webkitAudioContext)();
      const o = hall.createOscillator(), g = hall.createGain();
      o.type = art || "sine"; o.frequency.value = hz;
      const t = hall.currentTime + (start || 0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(laut || .14, t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t + dauer);
      o.connect(g); g.connect(hall.destination);
      o.start(t); o.stop(t + dauer + .05);
    }catch(e){}
  }
  const klangGut    = () => { ton(660,.12,"triangle",0); ton(990,.16,"triangle",.1); };
  const klangDaneben= () => { ton(180,.22,"sawtooth",0,.1); };
  const klangFertig = () => { [523,659,784,1047].forEach((h,i)=>ton(h,.22,"triangle",i*.1,.13)); };
  const klangAufzug = () => { ton(420,.09,"sine",0,.07); };

  /* ================= Aufgaben =================
     Jede Aufgabe traegt ihr Ergebnis in Stockwerk und Fenster zerlegt mit -
     danach wird gefragt. */
  function aufgabe(a, b){
    const e = a + b;
    return { a:a, b:b, ergebnis:e, stock:Math.floor(e/10), fenster:e%10 };
  }

  /* Stufe 1 - Nachbaraufgaben: entweder wandert der zweite Summand
     (21+3, 21+4, 21+5) oder der erste (63+6, 62+6, 61+6). */
  function familieNachbarn(){
    if(Math.random() < .5){
      const e = zufall(0,6);            /* Einer der Startzahl */
      const b = zufall(1, 7-e);         /* +b, +b+1 und +b+2 bleiben im Stock */
      const a = zufall(1,9)*10 + e;
      return [0,1,2].map(i => aufgabe(a, b+i));
    }
    const e = zufall(2,8);
    const b = zufall(1, 9-e);
    const a = zufall(1,9)*10 + e;
    return [0,1,2].map(i => aufgabe(a-i, b));
  }

  /* Stufe 2 - gleiche Einerrechnung, anderes Stockwerk. Reihenfolge wie im
     Heft von oben nach unten: 21+4, 11+4, 1+4. Die letzte Zeile ist die
     Aufgabe, die das Kind laengst kann - darum geht es. */
  function familieFenster(){
    const e = zufall(1,8);
    const b = zufall(1, 9-e);
    const z = zufall(2,9);
    return [z,1,0].map(k => aufgabe(k*10 + e, b));
  }

  /* Stufe 3 - ganze Stockwerke. Mal geordnet (+10, +20, +30), mal nicht. */
  function familieStockwerke(){
    const z = zufall(1,6), e = zufall(0,9);
    const a = z*10 + e;
    const moeglich = [];
    for(let t=1; t <= 9-z; t++) moeglich.push(t*10);
    const drei = mische(moeglich).slice(0,3);
    if(Math.random() < .5) drei.sort((x,y) => x-y);
    return drei.map(t => aufgabe(a, t));
  }

  const FAMILIEN = { 1:familieNachbarn, 2:familieFenster, 3:familieStockwerke };

  /* Stufe 4 - dieselben drei Formen, aber einzeln und ohne sichtbaren
     Zusammenhang. Das ist der Schritt vom Muster zum Koennen. */
  function einzelAufgabe(){
    return waehle(waehle([familieNachbarn, familieFenster, familieStockwerke])());
  }

  function lieferungBauen(stufe){
    const aus = [];
    if(stufe === 4){
      let letzte = "";
      while(aus.length < PAKETE){
        const n = einzelAufgabe();
        const schl = n.a + "+" + n.b;
        if(schl === letzte) continue;
        letzte = schl;
        aus.push({ n:n, familie:[n], platz:0 });
      }
      return aus;
    }
    while(aus.length < PAKETE){
      const fam = FAMILIEN[stufe]();
      fam.forEach((n,i) => aus.push({ n:n, familie:fam, platz:i }));
    }
    return aus.slice(0, PAKETE);
  }

  /* ================= Das Haus ================= */
  const fensterEl = [];              /* [stock][fenster] */
  function hausBauen(){
    const gitter = $("haus-gitter");
    gitter.innerHTML = "";
    fensterEl.length = 0;
    for(let s = STOCKWERKE-1; s >= 0; s--){
      const schild = document.createElement("div");
      schild.className = "stock-schild";
      schild.textContent = s*10;
      gitter.appendChild(schild);
      fensterEl[s] = [];
      for(let f = 0; f < FENSTER; f++){
        const el = document.createElement("div");
        el.className = "fenster";
        gitter.appendChild(el);
        fensterEl[s][f] = el;
      }
    }
    const bote = document.createElement("div");
    bote.className = "bote"; bote.id = "bote";
    bote.textContent = (konto && konto.bild) || "🙂";
    gitter.appendChild(bote);
  }

  function hausLeeren(){
    for(let s = 0; s < STOCKWERKE; s++)
      for(let f = 0; f < FENSTER; f++)
        fensterEl[s][f].className = "fenster";
    const alt = $("haus-gitter").querySelector(".paket");
    if(alt) alt.remove();
  }

  /* Zeigt, wo das Kind steht - und die Spur, auf der es sich bewegen kann:
     die Spalte nach oben (Zehner) und die Zeile nach rechts (Einer). */
  function hausStart(zahl){
    hausLeeren();
    const s = Math.floor(zahl/10), f = zahl%10;
    for(let k = 0; k < STOCKWERKE; k++) fensterEl[k][f].classList.add("spur");
    for(let k = 0; k < FENSTER; k++) fensterEl[s][k].classList.add("spur");
    const el = fensterEl[s][f];
    el.className = "fenster hell";
    el.textContent = zahl;
    botenSetzen(s, f, true);
  }

  /* Der Bote steht an der Tuer, also am Rand seines Fensters - nicht mittig
     darauf, sonst verdeckt er die Hausnummer. Am rechten Rand des Hauses
     stellt er sich auf die andere Seite, damit er im Bild bleibt. */
  function botenSetzen(s, f, sofort){
    const bote = $("bote"), ziel = fensterEl[s][f];
    const rechts = f < FENSTER-2;
    if(sofort) bote.style.transition = "none";
    bote.style.left = (ziel.offsetLeft + (rechts ? ziel.offsetWidth : 0)) + "px";
    bote.style.top  = (ziel.offsetTop + ziel.offsetHeight/2) + "px";
    if(sofort){ void bote.offsetWidth; bote.style.transition = ""; }
  }

  /* Erst der Aufzug, dann der Gang - in dieser Reihenfolge, weil genau das
     der Unterschied zwischen Zehnern und Einern ist. */
  function botenFahren(vonS, vonF, nachS, nachF, dann){
    if(vonS !== nachS) klangAufzug();
    botenSetzen(nachS, vonF, false);
    spaeter(()=>{
      if(vonF !== nachF) klangAufzug();
      botenSetzen(nachS, nachF, false);
      spaeter(dann, 520);
    }, vonS === nachS ? 60 : 520);
  }

  /* ================= Ablauf ================= */
  const spiel = { stufe:1, pakete:[], nr:0, richtig:0, fehler:0,
                  stock:null, fenster:null, gesperrt:false, lauf:0 };

  /* Wer mitten in der Zustellung auf "Zur Auswahl" tippt, laesst sonst die
     Zeitgeber laufen: Der Bote faehrt weiter, markiert Wohnungen und blaettert
     in der naechsten Lieferung eine Aufgabe vor. Jeder Zeitgeber merkt sich
     deshalb, zu welchem Durchgang er gehoert. */
  function spaeter(fn, ms){
    const lauf = spiel.lauf;
    setTimeout(()=>{ if(lauf === spiel.lauf) fn(); }, ms);
  }

  function stufenZeichnen(){
    const box = $("stufen");
    box.innerHTML = "";
    STUFEN.forEach(s => {
      const frei = offen(s);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stufe";
      b.dataset.stufe = s;
      b.disabled = !frei;
      const sterne = stand[s] ? "⭐".repeat(stand[s]) : "";
      b.innerHTML =
        '<span class="stufe-nr">' + s + '</span>' +
        '<span class="stufe-text">' +
          '<span class="stufe-name">' + tr("hh.stufe"+s+".name") + '</span>' +
          '<span class="stufe-info">' + (frei ? tr("hh.stufe"+s+".text") : tr("hh.gesperrt")) + '</span>' +
        '</span>' +
        '<span class="stufe-sterne">' + (frei ? sterne : "🔒") + '</span>';
      if(frei) b.addEventListener("click", ()=>lieferungStarten(s));
      box.appendChild(b);
    });
  }

  function tastenBauen(reiheId, handler){
    const reihe = $(reiheId);
    reihe.innerHTML = "";
    for(let i = 0; i < 10; i++){
      const b = document.createElement("button");
      b.type = "button"; b.className = "taste";
      b.textContent = i; b.dataset.wert = i;
      b.addEventListener("click", ()=>handler(i));
      reihe.appendChild(b);
    }
  }

  function wahlSetzen(reiheId, wert){
    $(reiheId).querySelectorAll(".taste").forEach(b =>
      b.classList.toggle("gewaehlt", Number(b.dataset.wert) === wert));
  }

  function knopfPruefen(){
    const fertig = spiel.stock !== null && spiel.fenster !== null;
    $("btn-klingeln").disabled = !fertig || spiel.gesperrt;
    $("knopf-zahl").textContent = fertig ? (spiel.stock*10 + spiel.fenster) : "";
  }

  function listeZeichnen(){
    const p = spiel.pakete[spiel.nr];
    const box = $("liste");
    box.innerHTML = "";
    p.familie.forEach((n,i) => {
      const z = document.createElement("div");
      const fertig = i < p.platz;
      z.className = "zeile" + (i === p.platz ? " jetzt" : "");
      z.innerHTML = n.a + " + " + n.b + " = " +
        (fertig ? n.ergebnis
                : i === p.platz ? '<span class="luecke">?</span>'
                : "▢");
      box.appendChild(z);
    });
  }

  function sagen(text, art){
    const el = $("meldung");
    el.textContent = text;
    el.className = "meldung" + (art ? " " + art : "");
  }

  function paketZeigen(s, f){
    const el = fensterEl[s][f];
    const p = document.createElement("div");
    p.className = "paket";
    p.textContent = "📦";
    p.style.left = (el.offsetLeft + el.offsetWidth) + "px";
    p.style.top  = (el.offsetTop) + "px";
    $("haus-gitter").appendChild(p);
  }

  function aufgabeZeigen(){
    const p = spiel.pakete[spiel.nr];
    $("spiel-fortschritt").textContent = tr("hh.lieferung", { n: spiel.nr+1, m: PAKETE });
    hausStart(p.n.a);
    listeZeichnen();
    sagen(tr("hh.waehle"), "");
    spiel.stock = null; spiel.fenster = null; spiel.gesperrt = false;
    wahlSetzen("reihe-stock", -1);
    wahlSetzen("reihe-fenster", -1);
    $("reihe-stock").classList.remove("gesperrt");
    $("reihe-fenster").classList.remove("gesperrt");
    knopfPruefen();
  }

  function klingeln(){
    if(spiel.gesperrt) return;
    if(spiel.stock === null || spiel.fenster === null) return;
    spiel.gesperrt = true;
    $("btn-klingeln").disabled = true;
    $("reihe-stock").classList.add("gesperrt");
    $("reihe-fenster").classList.add("gesperrt");

    const p = spiel.pakete[spiel.nr];
    const n = p.n;
    const richtig = spiel.stock === n.stock && spiel.fenster === n.fenster;
    const vonS = Math.floor(n.a/10), vonF = n.a%10;

    if(richtig){
      spiel.richtig++;
      klangGut();
      sagen(tr("hh.richtig"), "gut");
    }else{
      spiel.fehler++;
      klangDaneben();
      sagen(tr("hh.falsch", { n: n.ergebnis }), "schlecht");
      /* Die falsche Wohnung kurz zeigen, dann den richtigen Weg gehen -
         gelernt wird am Weg, nicht an der Strafe. */
      const fal = fensterEl[spiel.stock][spiel.fenster];
      if(fal !== fensterEl[n.stock][n.fenster]){
        fal.className = "fenster daneben";
        fal.textContent = spiel.stock*10 + spiel.fenster;
      }
    }

    spaeter(()=>{
      botenFahren(vonS, vonF, n.stock, n.fenster, ()=>{
        const ziel = fensterEl[n.stock][n.fenster];
        ziel.className = "fenster ziel";
        ziel.textContent = n.ergebnis;
        paketZeigen(n.stock, n.fenster);
        listeZeichnenErledigt();
        spaeter(weiter, 1200);
      });
    }, richtig ? 350 : 1500);
  }

  /* Nach der Antwort steht die Zeile fertig da - das ist das, was das Kind
     mitnehmen soll. */
  function listeZeichnenErledigt(){
    const p = spiel.pakete[spiel.nr];
    const zeilen = $("liste").children;
    if(zeilen[p.platz]) zeilen[p.platz].innerHTML =
      p.n.a + " + " + p.n.b + " = " + p.n.ergebnis;
  }

  function weiter(){
    spiel.nr++;
    if(spiel.nr >= spiel.pakete.length){ lieferungFertig(); return; }
    aufgabeZeigen();
  }

  function sterneFuer(fehler){ return fehler === 0 ? 3 : fehler <= 2 ? 2 : 1; }

  function lieferungFertig(){
    const sterne = sterneFuer(spiel.fehler);
    if(sterne > stand[spiel.stufe]){ stand[spiel.stufe] = sterne; standSichern(); }
    klangFertig();
    $("fertig-sterne").textContent = "⭐".repeat(sterne) + "☆".repeat(3-sterne);
    $("fertig-text").textContent = tr("hh.fertig.text", { n: spiel.richtig, m: PAKETE });
    $("fertig-lob").textContent = tr("hh.sterne" + sterne);
    const naechste = spiel.stufe + 1;
    $("btn-weiter").hidden = naechste > STUFEN.length;
    $("btn-weiter").textContent = tr("hh.weiter");
    $("ov-fertig").classList.add("is-offen");
  }

  function lieferungStarten(stufe){
    spiel.lauf++;
    spiel.stufe = stufe;
    spiel.pakete = lieferungBauen(stufe);
    spiel.nr = 0; spiel.richtig = 0; spiel.fehler = 0;
    $("spiel-stufe").textContent = tr("hh.stufe"+stufe+".name");
    $("ov-fertig").classList.remove("is-offen");
    zeigeSchirm("schirm-spiel");
    aufgabeZeigen();
  }

  function zeigeSchirm(id){
    ["schirm-wahl","schirm-spiel"].forEach(s =>
      $(s).classList.toggle("is-active", s === id));
    window.scrollTo(0,0);
  }

  function zurAuswahl(){
    spiel.lauf++;                       /* laufende Zustellung entwerten */
    $("ov-fertig").classList.remove("is-offen");
    stufenZeichnen();
    zeigeSchirm("schirm-wahl");
  }

  function spracheSetzen(){
    setLang((konto && konto.sprache) || browserSprache());
    document.title = tr("hh.title");
    $("wahl-avatar").textContent = (konto && konto.bild) || "🙂";
    $("wahl-name").textContent = (konto && konto.name) || "";
  }

  /* ================= Start ================= */
  spracheSetzen();
  hausBauen();
  tastenBauen("reihe-stock", w => {
    if(spiel.gesperrt) return;
    spiel.stock = w; wahlSetzen("reihe-stock", w); knopfPruefen();
  });
  tastenBauen("reihe-fenster", w => {
    if(spiel.gesperrt) return;
    spiel.fenster = w; wahlSetzen("reihe-fenster", w); knopfPruefen();
  });
  $("btn-klingeln").addEventListener("click", klingeln);
  $("btn-abbrechen").addEventListener("click", zurAuswahl);
  $("btn-fertig-zurueck").addEventListener("click", zurAuswahl);
  $("btn-weiter").addEventListener("click", ()=>{
    const n = spiel.stufe + 1;
    if(n <= STUFEN.length) lieferungStarten(n); else zurAuswahl();
  });
  stufenZeichnen();

  /* Fuer die Testlaeufe sichtbar machen, sonst nichts nach aussen. */
  window.HOCHHAUS = { spiel:spiel, stand:stand, lieferungBauen:lieferungBauen,
                      familien:{ 1:familieNachbarn, 2:familieFenster, 3:familieStockwerke,
                                 4:einzelAufgabe } };
})();
