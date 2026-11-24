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
  const MODI = ["plus","minus"];

  const BELOHNUNGEN = [
    { punkte: 300,  zeichen:"😘", nameKey:"hh.lohn.bussi"  },
    { punkte: 1000, zeichen:"🍬", nameKey:"hh.lohn.suess"  },
    { punkte: 2500, zeichen:"🎮", nameKey:"hh.lohn.switch" }
  ];
  const LOHN_MAX = BELOHNUNGEN[BELOHNUNGEN.length-1].punkte;

  /* ================= Konto =================
     Nur gelesen: Die Kinder behalten Namen, Bild und Sprache aus dem
     Rechen-Ritter, weil beide Seiten von derselben Adresse kommen.
     Geschrieben wird ausschliesslich der eigene Schluessel ".hochhaus" -
     an den Daten des anderen Spiels ruehrt hier nichts. */
  function kontoListe(){
    try{
      const liste = JSON.parse(localStorage.getItem("rechenritter.konten") || "[]");
      return Array.isArray(liste) ? liste.filter(x => x && x.id) : [];
    }catch(e){ return []; }
  }
  function kontoLesen(){
    const liste = kontoListe();
    try{
      const id = localStorage.getItem("rechenritter.aktiv");
      const k = liste.filter(x => x.id === id)[0];
      if(k) return k;
    }catch(e){}
    return liste.length ? liste[0] : null;
  }
  let konto = kontoLesen();
  const standKey = () => "rechenritter." + ((konto && konto.id) || "gast") + ".hochhaus";

  /* Sterne je Stufe und Richtung, dazu das Punktekonto. */
  function standLaden(){
    const leer = { plus:{}, minus:{}, punkte:0, lohn:0 };
    MODI.forEach(m => STUFEN.forEach(s => leer[m][s] = 0));
    try{
      const d = JSON.parse(localStorage.getItem(standKey()) || "{}");
      /* Die erste Fassung kannte nur Plus und speicherte die Sterne flach.
         Solche Spielstaende werden als Plus uebernommen. */
      const quelle = (d.plus || d.minus) ? d : { plus:d };
      MODI.forEach(m => STUFEN.forEach(s => {
        const n = Number((quelle[m] || {})[s]);
        if(n >= 0 && n <= 3) leer[m][s] = n;
      }));
      leer.punkte = Math.max(0, Number(d.punkte) || 0);
      leer.lohn = Math.min(LOHN_MAX, Math.max(0, Number(d.lohn) || 0));
    }catch(e){}
    return leer;
  }
  function standSichern(){
    try{ localStorage.setItem(standKey(), JSON.stringify(stand)); }catch(e){}
  }
  let stand = standLaden();
  const offen = (m, s) => s === 1 || stand[m][s-1] > 0;

  /* ================= Punkte =================
     Zehn Punkte je zugestelltem Paket, und wer eine Serie schafft, bekommt
     mehr - dieselbe Rechnung wie im Rechen-Ritter, die die Kinder kennen. */
  const PUNKTE_PRO = 10;
  const PUNKTE_BONUS = { 3:60, 2:30, 1:0 };
  const malNehmer = serie => serie >= 6 ? 3 : serie >= 3 ? 2 : 1;

  /* ================= Belohnungen =================
     Drei Stufen auf einem Balken. Eine saubere Lieferung bringt 350 Punkte -
     das Bussi ist also nach der ersten Lieferung dran, die Suessigkeit nach
     dreien, die Switch-Zeit nach siebenen. Beim Erreichen der letzten Stufe
     faengt der Balken von vorn an, der Rest wird mitgenommen.

     Eingeloest wird nicht in der App: Wer ein Bussi bekommt, merkt das auch so. */
  /* Traegt Punkte ein und gibt zurueck, welche Stufen dabei erreicht wurden. */
  function punkteDazu(n){
    if(!n) return [];
    const vorher = stand.lohn;
    stand.punkte += n;
    stand.lohn += n;
    const erreicht = BELOHNUNGEN.filter(b => vorher < b.punkte && stand.lohn >= b.punkte);
    if(stand.lohn >= LOHN_MAX) stand.lohn -= LOHN_MAX;
    standSichern();
    balkenZeichnen();
    return erreicht;
  }

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
  function aufgabe(a, b, op){
    const e = op === "-" ? a - b : a + b;
    return { a:a, b:b, op:op || "+", ergebnis:e,
             stock:Math.floor(e/10), fenster:e%10 };
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

  /* Dieselben drei Formen rueckwaerts. Beim Minus wandert der Bote nach unten
     und nach links, sonst aendert sich nichts - auch hier bleibt jede Rechnung
     im Stockwerk. */
  function familieNachbarnMinus(){
    if(Math.random() < .5){
      /* 25-2, 25-3, 25-4: der Subtrahend wandert */
      const e = zufall(3,9);
      const b = zufall(1, e-2);
      const a = zufall(1,9)*10 + e;
      return [0,1,2].map(i => aufgabe(a, b+i, "-"));
    }
    /* 47-2, 48-2, 49-2: der Minuend wandert */
    const b = zufall(1,7);
    const e = zufall(b, 7);
    const a = zufall(1,9)*10 + e;
    return [0,1,2].map(i => aufgabe(a+i, b, "-"));
  }

  function familieFensterMinus(){
    const e = zufall(1,9);
    const b = zufall(1, e);
    const z = zufall(2,9);
    return [z,1,0].map(k => aufgabe(k*10 + e, b, "-"));
  }

  function familieStockwerkeMinus(){
    const z = zufall(3,9), e = zufall(0,9);
    const a = z*10 + e;
    const moeglich = [];
    for(let t = 1; t <= z; t++) moeglich.push(t*10);
    const drei = mische(moeglich).slice(0,3);
    if(Math.random() < .5) drei.sort((x,y) => y-x);
    return drei.map(t => aufgabe(a, t, "-"));
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

  const FAMILIEN = {
    plus:  { 1:familieNachbarn,      2:familieFenster,      3:familieStockwerke },
    minus: { 1:familieNachbarnMinus, 2:familieFensterMinus, 3:familieStockwerkeMinus }
  };

  /* Stufe 4 - dieselben drei Formen, aber einzeln und ohne sichtbaren
     Zusammenhang. Das ist der Schritt vom Muster zum Koennen. */
  function einzelAufgabe(modus){
    const f = FAMILIEN[modus];
    return waehle(waehle([f[1], f[2], f[3]])());
  }

  function lieferungBauen(stufe, modus){
    const aus = [];
    if(stufe === 4){
      let letzte = "";
      while(aus.length < PAKETE){
        const n = einzelAufgabe(modus);
        const schl = n.a + n.op + n.b;
        if(schl === letzte) continue;
        letzte = schl;
        aus.push({ n:n, familie:[n], platz:0 });
      }
      return aus;
    }
    while(aus.length < PAKETE){
      const fam = FAMILIEN[modus][stufe]();
      fam.forEach((n,i) => aus.push({ n:n, familie:fam, platz:i }));
    }
    return aus.slice(0, PAKETE);
  }

  /* ================= Kleine Bewegungen =================
     Nichts davon traegt Bedeutung - sie machen nur sichtbar, dass etwas
     passiert ist. Deshalb raeumen sie sich alle selbst wieder weg. */
  function bewege(el, klasse, dauer){
    if(!el) return;
    el.classList.remove(klasse); void el.offsetWidth; el.classList.add(klasse);
    setTimeout(()=>el.classList.remove(klasse), dauer);
  }
  function punkteFliegen(el, text){
    const p = document.createElement("div");
    p.className = "punkte-flug";
    p.textContent = text;
    p.style.left = (el.offsetLeft + el.offsetWidth/2) + "px";
    p.style.top  = (el.offsetTop) + "px";
    $("haus-gitter").appendChild(p);
    setTimeout(()=>p.remove(), 1100);
  }
  function funkeln(el, anzahl){
    for(let i = 0; i < anzahl; i++){
      const f = document.createElement("div");
      f.className = "funke";
      f.textContent = waehle(["✨","⭐","💫"]);
      f.style.left = (el.offsetLeft + el.offsetWidth/2) + "px";
      f.style.top  = (el.offsetTop + el.offsetHeight/2) + "px";
      f.style.setProperty("--dx", zufall(-46,46) + "px");
      f.style.setProperty("--dy", zufall(-54,-14) + "px");
      f.style.animationDelay = (i*45) + "ms";
      $("haus-gitter").appendChild(f);
      setTimeout(()=>f.remove(), 1200 + i*45);
    }
  }
  /* Zum Abschluss geht im ganzen Haus das Licht an, Stockwerk für Stockwerk. */
  function hausAnzuenden(dann){
    for(let s = 0; s < STOCKWERKE; s++){
      for(let f = 0; f < FENSTER; f++){
        const el = fensterEl[s][f];
        setTimeout(()=>el.classList.add("an"), s*70 + zufall(0,120));
      }
    }
    setTimeout(dann, STOCKWERKE*70 + 450);
  }
  function hausAusmachen(){
    for(let s = 0; s < STOCKWERKE; s++)
      for(let f = 0; f < FENSTER; f++) fensterEl[s][f].classList.remove("an");
  }

  /* Beide Balken - auf der Auswahl und im Spiel - zeigen denselben Stand. */
  function balkenZeichnen(){
    const anteil = Math.min(100, stand.lohn / LOHN_MAX * 100);
    ["lohn-fuell","lohn-fuell-spiel"].forEach(id => {
      const el = $(id); if(el) el.style.width = anteil + "%";
    });
    ["lohn-balken","lohn-balken-spiel"].forEach(id => {
      const bal = $(id); if(!bal) return;
      bal.querySelectorAll(".lohn-marke").forEach(m => {
        m.classList.toggle("erreicht", stand.lohn >= Number(m.dataset.punkte));
      });
    });
    const p = $("lohn-punkte");
    if(p) p.textContent = stand.punkte;
    const n = $("lohn-naechste");
    if(n){
      const naechste = BELOHNUNGEN.filter(b => stand.lohn < b.punkte)[0];
      n.textContent = naechste
        ? tr("hh.lohn.noch", { n: naechste.punkte - stand.lohn, name: tr(naechste.nameKey) })
        : tr("hh.lohn.alles");
    }
  }

  function balkenBauen(balkenId){
    const bal = $(balkenId);
    if(!bal) return;
    BELOHNUNGEN.forEach(b => {
      const m = document.createElement("i");
      m.className = "lohn-marke";
      m.dataset.punkte = b.punkte;
      m.style.left = (b.punkte / LOHN_MAX * 100) + "%";
      m.textContent = b.zeichen;
      bal.appendChild(m);
    });
  }

  /* Kurze Einblendung ueber dem Haus, wenn eine Stufe erreicht ist. */
  function lohnMelden(liste){
    liste.forEach((b, i) => {
      setTimeout(()=>{
        const el = document.createElement("div");
        el.className = "lohn-ruf";
        el.innerHTML = '<span class="lohn-ruf-zeichen">' + b.zeichen + '</span>' +
                       '<span>' + tr("hh.lohn.verdient", { name: tr(b.nameKey) }) + '</span>';
        $("app").appendChild(el);
        [523,659,784,1047,1319].forEach((h,k)=>ton(h,.2,"triangle",k*.09,.13));
        setTimeout(()=>el.classList.add("weg"), 2400);
        setTimeout(()=>el.remove(), 3000);
      }, i*700);
    });
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
  const spiel = { modus:"plus", stufe:1, pakete:[], nr:0, richtig:0, fehler:0,
                  punkte:0, serie:0, stock:null, fenster:null,
                  gesperrt:false, lauf:0 };

  /* Wer mitten in der Zustellung auf "Zur Auswahl" tippt, laesst sonst die
     Zeitgeber laufen: Der Bote faehrt weiter, markiert Wohnungen und blaettert
     in der naechsten Lieferung eine Aufgabe vor. Jeder Zeitgeber merkt sich
     deshalb, zu welchem Durchgang er gehoert. */
  function spaeter(fn, ms){
    const lauf = spiel.lauf;
    setTimeout(()=>{ if(lauf === spiel.lauf) fn(); }, ms);
  }

  function modiZeichnen(){
    const box = $("modi");
    box.innerHTML = "";
    MODI.forEach(m => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "modus" + (m === spiel.modus ? " gewaehlt" : "");
      b.dataset.modus = m;
      b.innerHTML = '<span class="modus-zeichen">' + (m === "plus" ? "+" : "−") + '</span>' +
                    '<span class="modus-wort">' + tr("hh." + m) + '</span>';
      b.addEventListener("click", ()=>{ spiel.modus = m; modiZeichnen(); stufenZeichnen(); });
      box.appendChild(b);
    });
    balkenZeichnen();
  }

  function stufenZeichnen(){
    const box = $("stufen");
    box.innerHTML = "";
    const m = spiel.modus;
    STUFEN.forEach(s => {
      const frei = offen(m, s);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "stufe";
      b.dataset.stufe = s;
      b.disabled = !frei;
      const sterne = stand[m][s] ? "⭐".repeat(stand[m][s]) : "";
      b.innerHTML =
        '<span class="stufe-nr">' + s + '</span>' +
        '<span class="stufe-text">' +
          '<span class="stufe-name">' + tr("hh.stufe"+s+".name") + '</span>' +
          '<span class="stufe-info">' + (frei ? tr("hh.stufe"+s+".text") : tr("hh.gesperrt")) + '</span>' +
        '</span>' +
        '<span class="stufe-sterne">' + (frei ? sterne : "🔒") + '</span>';
      if(frei) b.addEventListener("click", ()=>lieferungStarten(s, m));
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
      z.innerHTML = n.a + " " + (n.op === "-" ? "−" : "+") + " " + n.b + " = " +
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

  function kopfZeichnen(){
    $("spiel-punkte").textContent = spiel.punkte;
    const mal = malNehmer(spiel.serie);
    $("spiel-serie").textContent = mal > 1 ? "×" + mal : "";
    $("spiel-serie").classList.toggle("aus", mal === 1);
  }

  function aufgabeZeigen(){
    const p = spiel.pakete[spiel.nr];
    $("spiel-fortschritt").textContent = tr("hh.lieferung", { n: spiel.nr+1, m: PAKETE });
    kopfZeichnen();
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

    let gewinn = 0;
    if(richtig){
      spiel.richtig++;
      spiel.serie++;
      const mal = malNehmer(spiel.serie);
      gewinn = PUNKTE_PRO * mal;
      spiel.punkte += gewinn;
      lohnMelden(punkteDazu(gewinn));
      klangGut();
      kopfZeichnen();
      bewege($("spiel-punkte"), "puls", 450);
      sagen(spiel.serie === 3 || spiel.serie === 6
            ? tr("hh.serie.neu", { n: mal }) : tr("hh.richtig"), "gut");
    }else{
      spiel.fehler++;
      spiel.serie = 0;
      klangDaneben();
      kopfZeichnen();
      sagen(tr("hh.falsch", { n: n.ergebnis }), "schlecht");
      /* Die falsche Wohnung kurz zeigen, dann den richtigen Weg gehen -
         gelernt wird am Weg, nicht an der Strafe. */
      const fal = fensterEl[spiel.stock][spiel.fenster];
      if(fal !== fensterEl[n.stock][n.fenster]){
        fal.className = "fenster daneben";
        fal.textContent = spiel.stock*10 + spiel.fenster;
        bewege(fal, "wackelt", 500);
      }
    }

    spaeter(()=>{
      botenFahren(vonS, vonF, n.stock, n.fenster, ()=>{
        const ziel = fensterEl[n.stock][n.fenster];
        ziel.className = "fenster ziel";
        ziel.textContent = n.ergebnis;
        paketZeigen(n.stock, n.fenster);
        if(gewinn){
          punkteFliegen(ziel, "+" + gewinn);
          funkeln(ziel, gewinn >= 30 ? 7 : gewinn >= 20 ? 5 : 3);
        }
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
      p.n.a + " " + (p.n.op === "-" ? "−" : "+") + " " + p.n.b + " = " + p.n.ergebnis;
  }

  function weiter(){
    spiel.nr++;
    if(spiel.nr >= spiel.pakete.length){ lieferungFertig(); return; }
    aufgabeZeigen();
  }

  function sterneFuer(fehler){ return fehler === 0 ? 3 : fehler <= 2 ? 2 : 1; }

  function lieferungFertig(){
    const sterne = sterneFuer(spiel.fehler);
    const bonus = PUNKTE_BONUS[sterne] || 0;
    spiel.punkte += bonus;
    if(sterne > stand[spiel.modus][spiel.stufe]) stand[spiel.modus][spiel.stufe] = sterne;
    standSichern();
    lohnMelden(punkteDazu(bonus));
    kopfZeichnen();
    klangFertig();
    $("fertig-text").textContent = tr("hh.fertig.text", { n: spiel.richtig, m: PAKETE });
    $("fertig-punkte").textContent = tr("hh.fertig.punkte", { n: spiel.punkte });
    $("fertig-bonus").textContent = bonus ? tr("hh.bonus", { n: bonus }) : "";
    $("fertig-lob").textContent = tr("hh.sterne" + sterne);
    const naechste = spiel.stufe + 1;
    $("btn-weiter").hidden = naechste > STUFEN.length;
    $("btn-weiter").textContent = tr("hh.weiter");
    /* Erst geht im Haus das Licht an, dann kommt das Fenster. */
    hausAnzuenden(()=>{
      $("fertig-sterne").innerHTML = "";
      $("ov-fertig").classList.add("is-offen");
      for(let i = 0; i < 3; i++){
        spaeter(()=>{
          const st = document.createElement("span");
          st.className = "stern" + (i < sterne ? " voll" : "");
          st.textContent = i < sterne ? "⭐" : "☆";
          $("fertig-sterne").appendChild(st);
          if(i < sterne) ton(660 + i*220, .16, "triangle", 0, .12);
        }, i*260);
      }
    });
  }

  function lieferungStarten(stufe, modus){
    spiel.lauf++;
    spiel.stufe = stufe;
    if(modus) spiel.modus = modus;
    spiel.pakete = lieferungBauen(stufe, spiel.modus);
    spiel.nr = 0; spiel.richtig = 0; spiel.fehler = 0;
    spiel.punkte = 0; spiel.serie = 0;
    hausAusmachen();
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
    hausAusmachen();
    modiZeichnen();
    stufenZeichnen();
    zeigeSchirm("schirm-wahl");
  }

  /* Der Spielerwechsel: Die Konten gehoeren dem Rechen-Ritter, das Hochhaus
     liest sie nur. Geschrieben wird einzig, WER gerade dran ist - genau das,
     was ein Wechsel bedeutet, und derselbe Schluessel, den der Ritter dafuer
     benutzt. Der Spielstand haengt am Konto und wird mitgetauscht. */
  function kontoGitterZeichnen(){
    const box = $("konto-gitter");
    box.innerHTML = "";
    const liste = kontoListe();
    if(!liste.length){
      const leer = document.createElement("p");
      leer.className = "hinweis";
      leer.textContent = tr("hh.konto.leer");
      box.appendChild(leer);
      return;
    }
    liste.forEach(k => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "konto-knopf" + (konto && k.id === konto.id ? " aktiv" : "");
      b.dataset.konto = k.id;
      b.innerHTML = '<span class="konto-bild">' + (k.bild || "🙂") + '</span>' +
                    '<span class="konto-name">' + (k.name || "?") + '</span>' +
                    (konto && k.id === konto.id
                       ? '<span class="konto-dran">' + tr("konto.du.bist.dran") + '</span>' : "");
      b.addEventListener("click", ()=>kontoWechseln(k.id));
      box.appendChild(b);
    });
  }

  function kontoWechseln(id){
    if(konto && konto.id === id){ $("ov-konto").classList.remove("is-offen"); return; }
    try{ localStorage.setItem("rechenritter.aktiv", id); }catch(e){}
    spiel.lauf++;                       /* laufende Zustellung entwerten */
    konto = kontoLesen();
    stand = standLaden();               /* der Spielstand haengt am Konto */
    spiel.modus = "plus";
    $("ov-konto").classList.remove("is-offen");
    spracheSetzen();
    hausBauen();                        /* der Bote traegt das neue Bild */
    hausAusmachen();
    modiZeichnen();
    stufenZeichnen();
    balkenZeichnen();
    zeigeSchirm("schirm-wahl");
  }

  function spracheSetzen(){
    setLang((konto && konto.sprache) || browserSprache());
    document.title = tr("hh.title");
    $("wahl-avatar").textContent = (konto && konto.bild) || "🙂";
    $("wahl-name").textContent = (konto && konto.name) || "";
    const bote = $("bote");
    if(bote) bote.textContent = (konto && konto.bild) || "🙂";
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
  $("btn-spieler").addEventListener("click", ()=>{
    kontoGitterZeichnen();
    $("ov-konto").classList.add("is-offen");
  });
  $("btn-konto-zu").addEventListener("click", ()=>$("ov-konto").classList.remove("is-offen"));
  $("btn-klingeln").addEventListener("click", klingeln);
  $("btn-abbrechen").addEventListener("click", zurAuswahl);
  $("btn-fertig-zurueck").addEventListener("click", zurAuswahl);
  $("btn-weiter").addEventListener("click", ()=>{
    const n = spiel.stufe + 1;
    if(n <= STUFEN.length) lieferungStarten(n, spiel.modus); else zurAuswahl();
  });
  balkenBauen("lohn-balken");
  balkenBauen("lohn-balken-spiel");
  modiZeichnen();
  stufenZeichnen();
  balkenZeichnen();

  /* Fuer die Testlaeufe sichtbar machen, sonst nichts nach aussen. */
  window.HOCHHAUS = { spiel:spiel, stand:stand, lieferungBauen:lieferungBauen,
                      familien:FAMILIEN, belohnungen:BELOHNUNGEN, punkteDazu:punkteDazu,
                      konto:()=>konto, standJetzt:()=>stand };
})();
