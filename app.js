(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const alle = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const zufall = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const waehle = a => a[Math.floor(Math.random()*a.length)];

  const opt = { max:20, minus:true, ton:true };

  /* ================= Spielerkonten ================= */
  const KONTEN_KEY = "rechenritter.konten";
  const AKTIV_KEY  = "rechenritter.aktiv";
  const MAX_KONTEN = 4;
  const AVATARE = ["🦁","🐲","🦄","🐱","🚀","🐼","🦉","🐸","🐶"];
  const konto = { liste:[], aktiv:"", neuBild:"", neuSprache:"de" };

  function kontoKey(id, art){ return "rechenritter."+id+"."+art; }
  function kontoListeLaden(){
    try{
      const roh = localStorage.getItem(KONTEN_KEY);
      if(roh){ const d = JSON.parse(roh); konto.liste = Array.isArray(d) ? d : []; }
    }catch(e){}
  }
  function kontoListeSichern(){
    try{ localStorage.setItem(KONTEN_KEY, JSON.stringify(konto.liste)); }catch(e){}
  }
  function kontoAktivSichern(){
    try{ localStorage.setItem(AKTIV_KEY, konto.aktiv); }catch(e){}
  }
  function kontoAktuell(){
    return konto.liste.find(k => k.id===konto.aktiv) || null;
  }
  function kontoNeuId(){
    return "k"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
  }
  function kontoMigriereLegacy(id){
    try{
      const alt = localStorage.getItem("rechenritter.schatz");
      if(alt) localStorage.setItem(kontoKey(id,"schatz"), alt);
      const p = localStorage.getItem("rechenritter.puzzle");
      if(p) localStorage.setItem(kontoKey(id,"puzzle"), p);
      const b = localStorage.getItem("rechenritter.burg");
      if(b) localStorage.setItem(kontoKey(id,"burg"), b);
    }catch(e){}
  }
  function kontoInit(){
    kontoListeLaden();
    let aktiv;
    try{ aktiv = localStorage.getItem(AKTIV_KEY); }catch(e){}
    if(konto.liste.length===0){
      /* Erststart: kein Standard-Konto mehr – die Namens-/Avatar-/Sprachwahl
         öffnet sich automatisch, sobald die Seite geladen ist. */
      konto.aktiv = "";
    }else{
      const gueltig = konto.liste.some(k => k.id===aktiv);
      konto.aktiv = gueltig ? aktiv : konto.liste[0].id;
      if(!gueltig) kontoAktivSichern();
    }
  }

  /* ================= Ton ================= */
  let audio = null;
  function ton(freq,dauer,form,warten,laut){
    if(!opt.ton) return;
    try{
      if(!audio) audio = new (window.AudioContext||window.webkitAudioContext)();
      const t = audio.currentTime + (warten||0);
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = form||"square";
      o.frequency.setValueAtTime(freq,t);
      g.gain.setValueAtTime(.0001,t);
      g.gain.exponentialRampToValueAtTime(laut||.16,t+.02);
      g.gain.exponentialRampToValueAtTime(.0001,t+dauer);
      o.connect(g); g.connect(audio.destination);
      o.start(t); o.stop(t+dauer+.05);
    }catch(e){}
  }
  const kRichtig  = () => { ton(660,.12,"square",0); ton(880,.18,"square",.1); };
  const kFalsch   = () => { ton(180,.28,"sawtooth",0,.12); ton(120,.3,"sawtooth",.12,.12); };
  const kSieg     = () => [523,659,784,1046].forEach((f,i)=>ton(f,.22,"triangle",i*.12,.18));
  const kAus      = () => [392,330,262,196].forEach((f,i)=>ton(f,.3,"triangle",i*.16,.16));
  const kMuenze   = () => { ton(988,.08,"triangle",0,.12); ton(1319,.12,"triangle",.07,.12); };
  const kGoldWeg  = () => { ton(440,.1,"triangle",0,.12); ton(294,.16,"triangle",.09,.12); };
  const kTruhe    = () => [523,659,784,1046,1319].forEach((f,i)=>ton(f,.18,"triangle",i*.09,.2));
  /* Sound-Familien für die Schatz-Tipp-Effekte (alle über ton(), respektieren opt.ton) */
  const kChime    = () => { ton(1046,.09,"triangle",0,.14); ton(1568,.14,"triangle",.07,.12); };
  const kFanfare  = () => [523,659,784,1046].forEach((f,i)=>ton(f,.16,"square",i*.08,.16));
  const kMagie    = () => [784,988,1319,1568].forEach((f,i)=>ton(f,.1,"triangle",i*.06,.13));
  const kMetall   = () => { ton(1200,.08,"square",0,.12); ton(1720,.06,"square",.03,.08); ton(900,.2,"square",.05,.07); };
  const kFeuer    = () => [520,400,300,220].forEach((f,i)=>ton(f,.13,"sawtooth",i*.05,.09));
  const kZirp     = () => { ton(1400,.06,"square",0,.1); ton(1900,.06,"square",.05,.09); };
  const kPop      = () => { ton(700,.05,"triangle",0,.13); ton(1300,.08,"triangle",.04,.1); };
  const kGesperrt = () => { ton(240,.12,"triangle",0,.08); ton(180,.16,"triangle",.1,.08); };

  /* ================= Gemeinsame Schatzkammer ================= */
  const SCHAETZE = [
    {id:"diamant",   bild:"💎", nameKey:"schatz.diamant"},
    {id:"krone",     bild:"👑", nameKey:"schatz.krone"},
    {id:"schluessel",bild:"🗝️", nameKey:"schatz.schluessel"},
    {id:"stab",      bild:"🪄", nameKey:"schatz.stab"},
    {id:"schwert",   bild:"⚔️", nameKey:"schatz.schwert"},
    {id:"schild",    bild:"🛡️", nameKey:"schatz.schild"},
    {id:"ei",        bild:"🥚", nameKey:"schatz.ei"},
    {id:"einhorn",   bild:"🦄", nameKey:"schatz.einhorn"},
    {id:"kompass",   bild:"🧭", nameKey:"schatz.kompass"},
    {id:"laterne",   bild:"🕯️", nameKey:"schatz.laterne"},
    {id:"vase",      bild:"🏺", nameKey:"schatz.vase"},
    {id:"perle",     bild:"🌈", nameKey:"schatz.perle"}
  ];
  /* Tipp-Effekt je Schatz: Partikel-Emoji, Farb-Overlay, Animation, Sound-Familie */
  const SCHATZ_FX = {
    diamant:    {p:"✨", glow:"#bfe9ff", anim:"schimmer", sound:kChime},
    krone:      {p:"⭐", glow:"#ffd75e", anim:"wackeln",  sound:kFanfare},
    schluessel: {p:"✨", glow:"#ffdf7a", anim:"wackeln",  sound:kChime},
    stab:       {p:"🌟", glow:"#c9a0ff", anim:"wackeln",  sound:kMagie},
    schwert:    {p:"🔥", glow:"#ff7a3c", anim:"ruettel",  sound:kFeuer},
    schild:     {p:"✨", glow:"#d7e0ea", anim:"ruettel",  sound:kMetall},
    ei:         {p:"💛", glow:"#ffe07a", anim:"huepfen",  sound:kZirp},
    einhorn:    {p:"🌈", glow:"#ff9ad2", anim:"huepfen",  sound:kMagie},
    kompass:    {p:"✨", glow:"#7fe0c8", anim:"wackeln",  sound:kChime},
    laterne:    {p:"🔆", glow:"#ffc36b", anim:"schweben", sound:kFeuer},
    vase:       {p:"✨", glow:"#ffd75e", anim:"puls",     sound:kChime},
    perle:      {p:"🫧", glow:"#b6f0ff", anim:"puls",     sound:kPop}
  };
  const SCHATZ_FX_STD = {p:"✨", glow:"#ffe7a8", anim:"puls", sound:kChime};
  /* Rang richtet sich nach der Gesamtzahl gelöster Aufgaben (schatz.geloest),
     nicht mehr nach dem aktuellen Gold – so kostet Ausgeben keinen Rang.
     "ab" = benötigte gelöste Aufgaben insgesamt. */
  const RAENGE = [
    {ab:0,    nameKey:"rang.knappe",          bild:"🪙"},
    {ab:10,   nameKey:"rang.ritter",          bild:"💰"},
    {ab:25,   nameKey:"rang.schatzmeister",   bild:"💎"},
    {ab:45,   nameKey:"rang.drachenreiter",   bild:"🐲"},
    {ab:75,   nameKey:"rang.legende",         bild:"👑"},
    {ab:120,  nameKey:"rang.baron",           bild:"🏰"},
    {ab:180,  nameKey:"rang.graf",            bild:"⚜️"},
    {ab:260,  nameKey:"rang.herzog",          bild:"🛡️"},
    {ab:370,  nameKey:"rang.fuerst",          bild:"🌟"},
    {ab:520,  nameKey:"rang.koenig",          bild:"🤴"},
    {ab:720,  nameKey:"rang.kaiser",          bild:"🏛️"},
    {ab:1000, nameKey:"rang.drachentoeter",   bild:"🗡️"},
    {ab:1400, nameKey:"rang.unsterblicher",   bild:"✨"},
    {ab:2000, nameKey:"rang.gott.des.goldes", bild:"🌠"}
  ];
  const TRUHE_ALLE = 5;
  const VERLUST = 5, GRUNDGOLD = 10;

  const schatz = { gold:0, album:[], bisTruhe:0, neu:[], geloest:0 };

  function laden(){
    schatz.gold = 0; schatz.album = []; schatz.bisTruhe = 0; schatz.neu = []; schatz.geloest = 0;
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"schatz"));
      if(roh){
        const d = JSON.parse(roh);
        schatz.gold = Math.max(0, Number(d.gold)||0);
        schatz.album = Array.isArray(d.album) ? d.album : [];
        schatz.bisTruhe = Math.min(TRUHE_ALLE-1, Number(d.bisTruhe)||0);
        schatz.neu = Array.isArray(d.neu) ? d.neu : [];
        if(d.geloest === undefined){
          /* Einmalige Migration: alten, gold-basierten Rang beibehalten, damit
             bestehende Spieler nicht sichtbar auf "Knappe" zurückfallen. */
          const altGold = [0,150,400,800,1500,2500,4000,6000,9000,13000,18000,25000,35000,50000];
          let idx = 0; altGold.forEach((g,i)=>{ if(schatz.gold>=g) idx=i; });
          schatz.geloest = RAENGE[idx].ab;
        }else{
          schatz.geloest = Math.max(0, Number(d.geloest)||0);
        }
      }
    }catch(e){}
  }
  function sichern(){
    try{ localStorage.setItem(kontoKey(konto.aktiv,"schatz"), JSON.stringify(schatz)); }catch(e){}
  }
  function optLaden(){
    opt.max = 20; opt.minus = true; opt.ton = true;
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"opt"));
      if(roh){
        const d = JSON.parse(roh);
        opt.max = Number(d.max)===10 ? 10 : 20;
        opt.minus = !!d.minus;
        if(typeof d.ton === "boolean") opt.ton = d.ton;
      }
    }catch(e){}
  }
  function optSichern(){
    try{ localStorage.setItem(kontoKey(konto.aktiv,"opt"), JSON.stringify({max:opt.max,minus:opt.minus,ton:opt.ton})); }catch(e){}
  }
  function optAnwenden(){
    wahlSetzen("wahl-raum", String(opt.max));
    wahlSetzen("wahl-art", opt.minus ? "beides" : "plus");
    alle("[data-ton]").forEach(b => b.textContent = opt.ton ? tr("ton.kurz") : tr("ton.aus"));
    $("btn-ton-start").textContent = opt.ton ? tr("ton.an") : tr("ton.aus");
  }
  function rangFuer(n){
    let r = RAENGE[0];
    RAENGE.forEach(x => { if(n>=x.ab) r = x; });
    return r;
  }
  function rang(){ return rangFuer(schatz.geloest); }
  function naechsterRang(){
    const i = RAENGE.indexOf(rang());
    return i < RAENGE.length-1 ? RAENGE[i+1] : null;
  }
  function rangFortschrittText(){
    const n = naechsterRang();
    if(!n) return tr("rang.max");
    return tr("rang.fortschritt", { n: n.ab - schatz.geloest, rang: tr(n.nameKey) });
  }
  /* Wird bei jeder gelösten Aufgabe (in allen Spielen) aufgerufen: zählt hoch,
     speichert, aktualisiert die Anzeigen und feiert einen Rangaufstieg. */
  function problemGeloest(){
    const vorher = rang();
    schatz.geloest++;
    const jetzt = rang();
    sichern();
    schatzZeichnen();
    if(jetzt !== vorher) rangFeier(jetzt);
  }
  function rangFeier(r){
    kSieg();
    const b = document.createElement("div");
    b.className = "rang-feier";
    b.innerHTML = '<span class="rf-emoji">'+r.bild+'</span>'+
                  '<span class="rf-label">'+tr("rang.neu")+'</span>'+
                  '<span class="rf-name">'+tr(r.nameKey)+'</span>';
    $("app").appendChild(b);
    funkenEl(b, "✨", 16);
    setTimeout(()=>b.classList.add("weg"), 1700);
    setTimeout(()=>b.remove(), 2200);
  }
  function schatzZeichnen(){
    alle(".js-gold").forEach(el => el.textContent = schatz.gold);
    alle(".js-truhe-balken").forEach(el => el.style.width = (schatz.bisTruhe/TRUHE_ALLE*100)+"%");
    alle(".js-truhe-zaehler").forEach(el => el.textContent = schatz.bisTruhe+"/"+TRUHE_ALLE);
    alle(".js-rang").forEach(el => el.textContent = tr(rang().nameKey));
    alle(".js-haufen").forEach(el => el.textContent = rang().bild);
    alle(".js-rang-emoji").forEach(el => el.textContent = rang().bild);
    alle(".js-rang-fort").forEach(el => el.textContent = rangFortschrittText());
  }
  function goldDazu(betrag){
    schatz.gold += betrag;
    alle(".js-goldbox").forEach(el => { el.classList.remove("puls"); void el.offsetWidth; el.classList.add("puls"); });
    schatzZeichnen(); sichern();
    return betrag;
  }
  function goldWeg(){
    const verlust = Math.min(VERLUST, schatz.gold);
    schatz.gold -= verlust;
    if(verlust>0){
      alle(".js-goldbox").forEach(el => { el.classList.remove("minus"); void el.offsetWidth; el.classList.add("minus"); });
      setTimeout(()=>alle(".js-goldbox").forEach(el=>el.classList.remove("minus")),700);
      kGoldWeg();
    }
    schatzZeichnen(); sichern();
    return verlust;
  }
  function goldAusgeben(betrag){
    if(schatz.gold < betrag) return false;
    schatz.gold -= betrag;
    alle(".js-goldbox").forEach(el => { el.classList.remove("minus"); void el.offsetWidth; el.classList.add("minus"); });
    setTimeout(()=>alle(".js-goldbox").forEach(el=>el.classList.remove("minus")),700);
    kGoldWeg();
    schatzZeichnen(); sichern();
    return true;
  }
  /* Truhen gibt es nur in der Schatzjagd – das ist ihr Spiel. Zählte jedes
     Spiel mit, wäre die Schatzjagd nur eines von sechs Rechenspielen und die
     Schatztruhe eine Belohnung, die überall vom Himmel fällt. */
  function truheZaehlen(){
    schatz.bisTruhe++;
    if(schatz.bisTruhe>=TRUHE_ALLE){ schatz.bisTruhe = 0; schatzZeichnen(); sichern(); return true; }
    schatzZeichnen(); sichern();
    return false;
  }

  let truheWeiter = null, truheOffen = false;
  function truheZeigen(weiter){
    truheWeiter = weiter; truheOffen = false;
    kTruhe();
    const bild = $("truhen-bild");
    bild.textContent = "🎁"; bild.className = "truhe";
    $("truhen-titel").textContent = tr("truhe.titel");
    $("truhen-text").textContent = tr("truhe.text");
    $("truhen-gold").style.visibility = "hidden";
    $("btn-truhe-zu").style.visibility = "hidden";
    $("ov-truhe").classList.add("is-offen");
  }
  function truheOeffnen(){
    if(truheOffen) return;
    truheOffen = true;
    kTruhe();
    const bonus = goldDazu(50);
    const offen = SCHAETZE.filter(x => schatz.album.indexOf(x.id)<0);
    const bild = $("truhen-bild");
    if(offen.length){
      const neu = waehle(offen);
      schatz.album.push(neu.id); schatz.neu.push(neu.id); sichern();
      bild.textContent = neu.bild; bild.className = "belohnung";
      $("truhen-titel").textContent = tr("truhe.gefunden", { name: tr(neu.nameKey) });
      $("truhen-text").textContent = tr("truhe.neu", { n: schatz.album.length, m: SCHAETZE.length });
    } else {
      bild.textContent = "💰"; bild.className = "belohnung";
      $("truhen-titel").textContent = tr("truhe.gold.voll");
      $("truhen-text").textContent = tr("truhe.alle");
    }
    $("truhen-gold").textContent = tr("gold.plus", { n: bonus });
    $("truhen-gold").style.visibility = "visible";
    $("btn-truhe-zu").style.visibility = "visible";
  }
  function truheSchliessen(){
    $("ov-truhe").classList.remove("is-offen");
    const w = truheWeiter; truheWeiter = null;
    if(w) w();
  }
  let kammerTakt = null, kammerHinweisTakt = null;

  function kammerTextStd(){
    $("kammer-text").textContent = trp("kammer.text", schatz.album.length, { m: SCHAETZE.length });
  }

  /* Antippen eines gefundenen Schatzes: passende Animation + Farb-Overlay + Funken + Sound.
     istTipp=true nur beim echten Fingertipp (entfernt dann das NEU-Abzeichen). */
  function schatzTippen(el, sch, istTipp){
    const fx = SCHATZ_FX[sch.id] || SCHATZ_FX_STD;
    el.style.setProperty("--fx", fx.glow);
    bewege(el, "fx-"+fx.anim, 620);
    bewege(el, "fx-wash", 620);
    funkenEl(el, fx.p, 12);
    fx.sound();
    if(istTipp){
      const i = schatz.neu.indexOf(sch.id);
      if(i>=0){
        schatz.neu.splice(i,1); sichern();
        const b = el.querySelector(".neu-badge"); if(b) b.remove();
      }
    }
  }

  /* Antippen eines noch gesperrten Slots: sanftes Wackeln + weicher Ton + Hinweis. */
  function schatzGesperrt(el){
    bewege(el, "fx-ruettel", 450);
    kGesperrt();
    $("kammer-text").textContent = tr("kammer.gesperrt");
    clearTimeout(kammerHinweisTakt);
    kammerHinweisTakt = setTimeout(kammerTextStd, 1600);
  }

  function kammerZeigen(){
    const gitter = $("album");
    gitter.innerHTML = "";
    SCHAETZE.forEach(sch => {
      const hat = schatz.album.indexOf(sch.id)>=0;
      const el = document.createElement("div");
      el.className = "sammelstueck"+(hat?"":" fehlt");
      el.dataset.id = sch.id;
      el.innerHTML = '<span class="bild">'+(hat?sch.bild:"❔")+'</span>'+
                     '<span class="titel-klein">'+(hat?tr(sch.nameKey):tr("kammer.noch.offen"))+'</span>';
      if(hat){
        if(schatz.neu.indexOf(sch.id)>=0){
          const badge = document.createElement("span");
          badge.className = "neu-badge"; badge.textContent = tr("kammer.neu");
          el.appendChild(badge);
        }
        el.addEventListener("click", ()=>schatzTippen(el, sch, true));
      }else{
        el.addEventListener("click", ()=>schatzGesperrt(el));
      }
      gitter.appendChild(el);
    });
    kammerTextStd();
    $("kammer-gold").textContent = tr("kammer.gold", { n: schatz.gold, rang: tr(rang().nameKey) });
    $("ov-kammer").classList.add("is-offen");

    /* Frisch gewonnene Schätze kurz selbst feiern (Abzeichen bleibt bis zum Tipp/Schließen) */
    const neue = SCHAETZE.filter(s => schatz.neu.indexOf(s.id)>=0 && schatz.album.indexOf(s.id)>=0);
    neue.forEach((s,i)=>{
      setTimeout(()=>{
        const el = gitter.querySelector('.sammelstueck[data-id="'+s.id+'"]');
        if(el && $("ov-kammer").classList.contains("is-offen")) schatzTippen(el, s, false);
      }, 400 + i*750);
    });

    /* Ambientes Funkeln, solange die Kammer offen ist (nicht bei "Bewegung reduzieren") */
    clearInterval(kammerTakt); kammerTakt = null;
    if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
      kammerTakt = setInterval(()=>{
        if(!$("ov-kammer").classList.contains("is-offen")){ clearInterval(kammerTakt); kammerTakt=null; return; }
        const tiles = alle('#album .sammelstueck:not(.fehlt)');
        if(!tiles.length) return;
        const el = waehle(tiles);
        el.style.setProperty("--fx", "#ffffff");
        bewege(el, "fx-wash", 600);
        funkenEl(el, "✨", 3);
      }, 2600);
    }
  }

  function kammerSchliessen(){
    $("ov-kammer").classList.remove("is-offen");
    clearInterval(kammerTakt); kammerTakt = null;
    if(schatz.neu.length){ schatz.neu = []; sichern(); }
  }
  const multiplikator = serie => serie>=6 ? 3 : serie>=3 ? 2 : 1;

  /* ================= Aufgaben ================= */
  function fertig(a,b,op,luecke){
    const ergebnis = op==="+" ? a+b : a-b;
    return { a:a,b:b,op:op,ergebnis:ergebnis,luecke:luecke,
             antwort: luecke ? b : ergebnis,
             text: luecke ? a+op+"?"+ergebnis : a+op+b,
             loesung: a+" "+op+" "+b+" = "+ergebnis };
  }
  function rohAufgabe(stufe){
    if(opt.max===10 && stufe!==4) stufe = 1;
    let a,b,op;
    if(stufe===4){
      const basis = rohAufgabe(opt.max===10 ? 1 : waehle([2,3]));
      return fertig(basis.a,basis.b,basis.op,true);
    }
    const plus = !opt.minus || Math.random()<.5;
    if(stufe===1){
      if(plus){ op="+"; a=zufall(1,9); b=zufall(1,10-a); }
      else    { op="-"; a=zufall(2,10); b=zufall(1,a); }
    } else if(stufe===2){
      if(plus){ op="+"; a=zufall(10,19); b=zufall(1,20-a); }
      else    { op="-"; a=zufall(11,20); b=zufall(1,a-10); }
    } else {
      if(plus){ op="+"; a=zufall(3,9); b=zufall(11-a,Math.min(9,20-a)); }
      else    { op="-"; a=zufall(11,18); b=zufall(a-9,9); }
    }
    return fertig(a,b,op,false);
  }
  function neuAufgabe(stufen,letzte){
    let n,i=0;
    do { n = rohAufgabe(waehle(stufen)); i++; } while(n.text===letzte && i<12);
    return n;
  }
  function zeigeAufgabe(elId,n){
    $(elId).innerHTML = n.luecke
      ? n.a+" "+n.op+' <span class="luecke">?</span> = '+n.ergebnis
      : n.a+" "+n.op+" "+n.b+' = <span class="luecke">?</span>';
  }
  function sagen(elId,text,art){
    const el = $(elId);
    el.textContent = text;
    el.className = "rueckmeldung" + (art ? " "+art : "");
  }
  function bauePunkte(elId,n){
    const feld = $(elId), gross = opt.max===10 ? 10 : 20;
    const k = new Array(gross).fill("");
    const setze = (v,bis,cls) => { for(let i=v;i<bis && i<gross;i++) k[i]=cls; };
    if(n.op==="+" && !n.luecke){ setze(0,n.a,"a"); setze(n.a,n.a+n.b,"b"); }
    else if(n.op==="+" && n.luecke){ setze(0,n.a,"a"); setze(n.a,n.ergebnis,"dazu"); }
    else if(n.op==="-" && !n.luecke){ setze(0,n.a-n.b,"a"); setze(n.a-n.b,n.a,"weg"); }
    else { setze(0,n.ergebnis,"a"); setze(n.ergebnis,n.a,"weg"); }
    feld.innerHTML = "";
    for(let i=0;i<gross;i++){
      const p = document.createElement("i");
      if(k[i]) p.className = k[i];
      feld.appendChild(p);
    }
  }

  /* ================= Zahlenfeld ================= */
  function baueZahlen(elId,handler){
    const feld = $(elId);
    feld.innerHTML = "";
    feld.classList.toggle("zahlenfeld--klein", opt.max===10);
    for(let i=0;i<=opt.max;i++){
      const b = document.createElement("button");
      b.className = "zahl"; b.type = "button";
      b.textContent = i; b.dataset.wert = i;
      b.setAttribute("aria-label", tr("aria.antwort", { n: i }));
      b.addEventListener("click", ()=>handler(i,b));
      feld.appendChild(b);
    }
  }
  const sperren = elId => $(elId).classList.add("gesperrt");
  function freigeben(elId){
    const f = $(elId);
    f.classList.remove("gesperrt");
    f.querySelectorAll(".zahl").forEach(b=>b.classList.remove("richtig","falsch"));
  }
  function zeigeLoesung(elId,antwort){
    $(elId).querySelectorAll(".zahl").forEach(b=>{
      if(Number(b.dataset.wert)===antwort) b.classList.add("richtig");
    });
  }

  /* ================= Effekte ================= */
  function bewege(el,klasse,dauer){
    el.classList.remove(klasse); void el.offsetWidth; el.classList.add(klasse);
    setTimeout(()=>el.classList.remove(klasse),dauer);
  }
  function funkenEl(box,zeichen,anzahl,reichweite){
    if(!box) return;
    const r = reichweite || 1;
    for(let i=0;i<(anzahl||10);i++){
      const f = document.createElement("span");
      f.className = "funke"; f.textContent = zeichen;
      f.style.left = zufall(20,75)+"%"; f.style.top = zufall(20,70)+"%";
      f.style.setProperty("--dx",Math.round(zufall(-90,90)*r)+"px");
      f.style.setProperty("--dy",Math.round(zufall(-120,-40)*r)+"px");
      f.style.setProperty("--dr",zufall(-180,180)+"deg");
      box.appendChild(f);
      setTimeout(()=>f.remove(),1200);
    }
  }
  function funken(boxId,zeichen,anzahl){ funkenEl($(boxId),zeichen,anzahl); }
  function zeigeScreen(id){
    alle(".screen").forEach(el=>el.classList.remove("is-active"));
    $(id).classList.add("is-active");
    schatzZeichnen();
    hoehleHungerZeichnen();
    window.scrollTo(0,0);
  }
  const lobWorte = ["lob.treffer","lob.stark","lob.volltreffer","lob.genau","lob.perfekt","lob.super"];

  /* ================= SPIEL 1: Drachenkampf ================= */
  const DRACHEN = [
    { nameKey:"drache.glutzahn",      emoji:"🐲", zaehne:4, stufen:[1],   hue:0,   beute:50 },
    { nameKey:"drache.nebelschwinge", emoji:"🐉", zaehne:5, stufen:[1,2], hue:160, beute:75 },
    { nameKey:"drache.frostkralle",   emoji:"🐲", zaehne:5, stufen:[2,3], hue:200, beute:100 },
    { nameKey:"drache.schattenhorn",  emoji:"🐉", zaehne:6, stufen:[3],   hue:270, beute:125 },
    { nameKey:"drache.koenigsdrache", emoji:"🐲", zaehne:6, stufen:[3,4], hue:330, beute:200 }
  ];
  const MAX_HERZEN = 3;
  const k = { drache:0, herzen:3, zaehne:0, maxZaehne:0, aufgabe:null, letzte:"",
              gesperrt:false, richtig:0, falsch:0, serie:0, beste:0, beute:0 };

  function kLeben(){
    const d = DRACHEN[Math.min(k.drache,DRACHEN.length-1)];
    $("herzen").innerHTML = Array.from({length:MAX_HERZEN},(_,i)=>
      '<span class="'+(i<k.herzen?"":"weg")+'">❤️</span>').join("");
    $("zaehne").innerHTML = Array.from({length:k.maxZaehne},(_,i)=>
      '<span class="'+(i<k.zaehne?"":"weg")+'">🦷</span>').join("");
    $("drachen-name").textContent = tr(d.nameKey);
    $("runde").textContent = tr("k.runde", { n: k.drache+1, m: DRACHEN.length });
    const f = $("drache");
    f.textContent = d.emoji;
    f.style.filter = "drop-shadow(0 6px 6px rgba(0,0,0,.5)) hue-rotate("+d.hue+"deg)";
  }
  function kVerlustAnzeigen(feldId,uebrig){
    const kinder = $(feldId).children;
    if(kinder[uebrig]) kinder[uebrig].classList.add("verliert");
  }
  function kNeueAufgabe(){
    const d = DRACHEN[Math.min(k.drache,DRACHEN.length-1)];
    k.aufgabe = neuAufgabe(d.stufen,k.letzte);
    k.letzte = k.aufgabe.text;
    zeigeAufgabe("k-aufgabe",k.aufgabe);
    sagen("k-rueckmeldung", tr("frage.zahl"), "");
    $("k-tipp").classList.remove("is-offen");
    bauePunkte("k-punkte",k.aufgabe);
    k.gesperrt = false;
    freigeben("k-zahlen");
  }
  function kAntwort(wert,knopf){
    if(k.gesperrt) return;
    k.gesperrt = true; sperren("k-zahlen");

    if(wert===k.aufgabe.antwort){
      knopf.classList.add("richtig");
      k.richtig++; k.serie++; k.beste = Math.max(k.beste,k.serie); k.zaehne--;
      problemGeloest();
      const mult = multiplikator(k.serie);
      const gewinn = goldDazu(GRUNDGOLD*mult);
      k.beute += gewinn;
      kRichtig(); kMuenze();
      sagen("k-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      bewege($("ritter"),"angriff",460);
      const e = $("effekt"); e.textContent = "⚔️"; bewege(e,"schlag",750);
      hoehleBegleiterJubelt();
      if(hoehleBegleiterAktiv()){
        const feuer = $("effekt-feuer"); feuer.textContent = "🔥"; bewege(feuer,"feuer",800);
      }
      setTimeout(()=>{
        bewege($("drache"),"getroffen",460);
        funken("k-gold-funken","🪙",mult*4);
        kLeben(); kVerlustAnzeigen("zaehne",k.zaehne);
      },220);
      setTimeout(()=>{ k.zaehne<=0 ? kDracheBesiegt() : kNeueAufgabe(); },1050);

    } else {
      knopf.classList.add("falsch");
      zeigeLoesung("k-zahlen",k.aufgabe.antwort);
      k.falsch++; k.serie = 0; k.herzen--;
      const weg = goldWeg();
      k.beute -= weg;
      kFalsch();
      sagen("k-rueckmeldung", weg
        ? tr("k.falsch.gold", { loesung: k.aufgabe.loesung, n: weg })
        : tr("k.falsch", { loesung: k.aufgabe.loesung }), "schlecht");
      $("k-tipp").classList.add("is-offen");
      const e = $("effekt"); e.textContent = "🔥"; bewege(e,"flamme",750);
      setTimeout(()=>{ bewege($("ritter"),"getroffen",460); kLeben(); kVerlustAnzeigen("herzen",k.herzen); },260);
      setTimeout(()=>{ k.herzen<=0 ? kEnde(false) : kNeueAufgabe(); },2400);
    }
  }
  function kDracheBesiegt(){
    kSieg();
    $("drache").classList.add("faellt");
    funken("funken","⭐",14);
    setTimeout(()=>{
      $("drache").classList.remove("faellt");
      const d = DRACHEN[k.drache];
      const sterne = k.herzen===3 ? "⭐⭐⭐" : k.herzen===2 ? "⭐⭐" : "⭐";
      const beute = goldDazu(d.beute);
      k.beute += beute;
      k.drache++;
      if(k.drache>=DRACHEN.length){ kEnde(true); return; }
      $("win-titel").textContent = tr("k.win.titel", { name: tr(d.nameKey) });
      $("win-sterne").textContent = sterne;
      $("win-beute").textContent = tr("k.win.beute", { n: beute });
      $("win-text").textContent = tr("k.win.text", { name: tr(DRACHEN[k.drache].nameKey) });
      zeigeScreen("screen-win");
    },900);
  }
  function kEnde(gewonnen){
    if(gewonnen){
      kSieg();
      $("ende-figur").textContent = "👑";
      $("ende-titel").textContent = tr("k.ende.sieg.titel");
      $("ende-text").textContent = tr("k.ende.sieg.text");
    } else {
      kAus();
      $("ende-figur").textContent = "🐉";
      $("ende-titel").textContent = tr("k.ende.niederlage.titel");
      $("ende-text").textContent = tr("k.ende.niederlage.text");
    }
    $("stat-richtig").textContent = k.richtig;
    $("stat-serie").textContent = k.beste;
    $("stat-gold").textContent = Math.max(0,k.beute);
    zeigeScreen("screen-ende");
  }
  function kStarteDrachen(){
    const d = DRACHEN[k.drache];
    k.zaehne = d.zaehne; k.maxZaehne = d.zaehne; k.herzen = MAX_HERZEN;
    kLeben();
    baueZahlen("k-zahlen",kAntwort);
    zeigeScreen("screen-kampf");
    kNeueAufgabe();
  }
  function kNeuesSpiel(){
    k.drache=0; k.richtig=0; k.falsch=0; k.serie=0; k.beste=0; k.beute=0; k.letzte="";
    kStarteDrachen();
  }

  /* ================= SPIEL 2: Schatzjagd ================= */
  const ZIEL = 15;
  const h = { runde:1, richtig:0, falsch:0, serie:0, beste:0,
              aufgabe:null, letzte:"", gesperrt:false, wiederholen:false };

  function hKopf(){
    const mult = multiplikator(h.serie);
    $("serie-wert").textContent = "×"+mult;
    $("anz-serie").classList.toggle("aus",mult===1);
    $("runden-wert").textContent = Math.min(h.runde,ZIEL)+"/"+ZIEL;
    schatzZeichnen();
  }
  function hStufen(){
    if(opt.max===10) return h.runde>10 ? [1,4] : [1];
    if(h.runde<=4) return [1];
    if(h.runde<=8) return [1,2];
    if(h.runde<=12) return [2,3];
    return [3,4];
  }
  function hNeueAufgabe(){
    if(!h.wiederholen){
      h.aufgabe = neuAufgabe(hStufen(),h.letzte);
      h.letzte = h.aufgabe.text;
    }
    h.wiederholen = false;
    zeigeAufgabe("h-aufgabe",h.aufgabe);
    sagen("h-rueckmeldung", tr("frage.zahl"), "");
    $("h-tipp").classList.remove("is-offen");
    bauePunkte("h-punkte",h.aufgabe);
    h.gesperrt = false;
    freigeben("h-zahlen");
    hKopf();
  }
  function hAntwort(wert,knopf){
    if(h.gesperrt) return;
    h.gesperrt = true; sperren("h-zahlen");

    if(wert===h.aufgabe.antwort){
      knopf.classList.add("richtig");
      h.richtig++; h.serie++; h.beste = Math.max(h.beste,h.serie);
      problemGeloest();
      const mult = multiplikator(h.serie);
      const gewinn = goldDazu(GRUNDGOLD*mult);
      kMuenze();
      sagen("h-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      bewege($("app").querySelector(".js-haufen"),"huepft",520);
      funken("h-funken","🪙",mult*4);
      if(h.serie===3 || h.serie===6){
        setTimeout(()=>{ sagen("h-rueckmeldung", tr("h.serie", { n: multiplikator(h.serie) }), "gut"); ton(1046,.15,"triangle",0,.18); },560);
      }
      hKopf();
      const truheFaellig = truheZaehlen();
      setTimeout(()=>{
        h.runde++;
        const weiter = () => { (h.runde>ZIEL && h.richtig>=ZIEL) ? hZiel() : hNeueAufgabe(); };
        truheFaellig ? truheZeigen(weiter) : weiter();
      },1150);

    } else {
      knopf.classList.add("falsch");
      zeigeLoesung("h-zahlen",h.aufgabe.antwort);
      h.falsch++; h.serie = 0;
      const weg = goldWeg();
      kFalsch();
      bewege($("app").querySelector(".js-haufen"),"schrumpft",520);
      sagen("h-rueckmeldung", weg
        ? tr("h.fast.gold", { loesung: h.aufgabe.loesung, n: weg })
        : tr("h.fast", { loesung: h.aufgabe.loesung }), "schlecht");
      $("h-tipp").classList.add("is-offen");
      h.wiederholen = true;   /* dieselbe Aufgabe kommt gleich noch einmal */
      hKopf();
      setTimeout(hNeueAufgabe,2600);
    }
  }
  function hZiel(){
    kSieg();
    goldDazu(100);
    $("ziel-text").textContent = trp("h.ziel.basis", h.richtig, { b: h.beste }) + " " +
      (h.falsch===0 ? tr("h.ziel.sauber") : tr("h.weiterso"));
    $("ov-ziel").classList.add("is-offen");
    hKopf();
  }
  function hWeiterSammeln(){
    $("ov-ziel").classList.remove("is-offen");
    h.runde=1; h.richtig=0; h.falsch=0;
    hNeueAufgabe();
  }
  function hStart(){
    h.runde=1; h.richtig=0; h.falsch=0; h.serie=0; h.beste=0; h.letzte=""; h.wiederholen=false;
    baueZahlen("h-zahlen",hAntwort);
    zeigeScreen("screen-hort");
    hNeueAufgabe();
  }


  /* ================= SPIEL 3: PUZZLE-SCHATZ ================= */
  const PUZZLE_PREIS = 200;
  const PUZZLE_TEILE = 20;
  /* Neues Motiv: images/puzzleN.webp ablegen und diese Zahl um eins erhöhen.
     Sonst zeigt das Spiel auf eine Datei, die es nicht gibt. */
  const PUZZLE_ANZAHL = 5;
  const puzzleBild = (nr) => "images/puzzle"+nr+".webp";

  /* geloest: die Nummern der fertigen Bilder – sie bleiben in der Galerie. */
  const puzzle = { nummer:1, offen:[], geloest:[] };

  /* Kleinste noch nicht gelöste Bildnummer, 0 wenn alle fertig sind. */
  function puzzleNaechstes(){
    for(let nr=1; nr<=PUZZLE_ANZAHL; nr++){
      if(puzzle.geloest.indexOf(nr)<0) return nr;
    }
    return 0;
  }
  function puzzleFertig(){ return puzzleNaechstes()===0; }

  function puzzleLaden(){
    puzzle.nummer = 1; puzzle.offen = []; puzzle.geloest = [];
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"puzzle"));
      if(!roh) return;
      const d = JSON.parse(roh);
      puzzle.nummer = Math.max(1, Number(d.nummer)||1);
      puzzle.offen = Array.isArray(d.offen)
        ? d.offen.map(Number).filter(x=>x>=0&&x<PUZZLE_TEILE)
        : [];
      /* Nur Nummern, zu denen es auch ein Bild gibt – nimmst du eines wieder
         heraus und senkst PUZZLE_ANZAHL, fällt der tote Eintrag von allein weg. */
      puzzle.geloest = Array.isArray(d.geloest)
        ? d.geloest.map(Number).filter(x=>x>=1&&x<=PUZZLE_ANZAHL)
                   .filter((x,i,a)=>a.indexOf(x)===i)
        : [];
      /* Ein Bild, das schon in der Galerie hängt, wird nicht noch einmal gepuzzelt.
         Ist alles gelöst, bleibt das letzte Bild vollständig stehen. */
      if(puzzle.geloest.indexOf(puzzle.nummer)>=0){
        const n = puzzleNaechstes();
        if(n){ puzzle.nummer = n; puzzle.offen = []; }
        else { puzzle.offen = []; for(let i=0;i<PUZZLE_TEILE;i++) puzzle.offen.push(i); }
      }
    }catch(e){}
  }

  function puzzleSichern(){
    try{
      localStorage.setItem(kontoKey(konto.aktiv,"puzzle"), JSON.stringify({
        nummer:puzzle.nummer,
        offen:puzzle.offen,
        geloest:puzzle.geloest
      }));
    }catch(e){}
  }

  function puzzleZeichnen(){
    const box = $("puzzle-bild");
    if(!box) return;
    const bild = puzzleBild(puzzle.nummer);
    box.innerHTML = "";

    for(let i=0;i<PUZZLE_TEILE;i++){
      const teil = document.createElement("div");
      const offen = puzzle.offen.indexOf(i)>=0;
      teil.className = "puzzle-teil"+(offen ? " offen" : "");
      teil.style.backgroundImage = 'url("'+bild+'")';

      const col = i % 5;
      const row = Math.floor(i/5);
      teil.style.backgroundPosition =
        (col/(5-1)*100)+"% "+(row/(4-1)*100)+"%";

      if(!offen) teil.style.backgroundImage =
        "linear-gradient(135deg,#26314f,#0b1122)";

      box.appendChild(teil);
    }

    const anzahl = puzzle.offen.length;
    const rest = PUZZLE_TEILE-anzahl;
    $("puzzle-nr").textContent = puzzle.nummer;
    $("puzzle-zaehler").textContent = anzahl+"/"+PUZZLE_TEILE;
    $("puzzle-balken").style.width = (anzahl/PUZZLE_TEILE*100)+"%";

    const kaufen = $("btn-puzzle-kaufen");
    if(rest>0){
      kaufen.disabled = schatz.gold < PUZZLE_PREIS;
      kaufen.textContent = tr("puzzle.kaufen", { n: PUZZLE_PREIS });
      $("puzzle-text").textContent = trp("puzzle.rest", rest);
      $("puzzle-hinweis").textContent =
        schatz.gold < PUZZLE_PREIS
          ? tr("puzzle.brauchst", { n: PUZZLE_PREIS-schatz.gold })
          : tr("puzzle.genug");
    }else if(puzzleFertig()){
      kaufen.disabled = true;
      kaufen.textContent = tr("puzzle.alle.btn");
      $("puzzle-text").textContent = tr("puzzle.alle.text");
      $("puzzle-hinweis").textContent = tr("puzzle.alle.hinweis");
    }else{
      kaufen.disabled = true;
      kaufen.textContent = tr("puzzle.geloest.btn");
      $("puzzle-text").textContent = tr("puzzle.geloest.text");
      $("puzzle-hinweis").textContent = tr("puzzle.geloest.hinweis");
    }
  }

  /* ---------- Bildergalerie ----------
     Gelöste Bilder bleiben hier hängen und lassen sich gross ansehen.
     Aufbau wie kammerZeigen(): eine Kachel je Motiv, gefundene und fehlende. */
  function galerieZeichnen(){
    const gitter = $("galerie-gitter");
    if(!gitter) return;
    gitter.innerHTML = "";

    for(let nr=1; nr<=PUZZLE_ANZAHL; nr++){
      const fertig = puzzle.geloest.indexOf(nr)>=0;
      const dran = !fertig && nr===puzzle.nummer;
      const el = document.createElement("div");
      el.className = "galerie-stueck"+(fertig ? "" : " fehlt");

      if(fertig){
        const bild = document.createElement("img");
        bild.src = puzzleBild(nr);
        bild.alt = tr("bild.titel", { n: nr });
        bild.loading = "lazy";
        bild.decoding = "async";
        el.appendChild(bild);
        el.addEventListener("click", ()=> bildZeigen(nr));
      } else {
        const platz = document.createElement("span");
        platz.className = "galerie-schloss";
        platz.textContent = dran ? "🧩" : "🔒";
        el.appendChild(platz);
      }

      const titel = document.createElement("span");
      titel.className = "titel-klein";
      titel.textContent = fertig ? tr("bild.titel", { n: nr })
        : dran ? tr("galerie.teile.kurz", { n: puzzle.offen.length, m: PUZZLE_TEILE })
        : tr("galerie.noch.zu");
      el.appendChild(titel);
      gitter.appendChild(el);
    }

    const fertige = puzzle.geloest.length;
    $("galerie-zaehler").textContent = fertige+"/"+PUZZLE_ANZAHL;
    $("galerie-text").textContent = fertige===0
      ? tr("galerie.leer")
      : fertige>=PUZZLE_ANZAHL
        ? tr("galerie.alle", { n: PUZZLE_ANZAHL })
        : trp("galerie.teile", fertige, { m: PUZZLE_ANZAHL });
  }

  /* Lupe: Das Bild füllt den Rahmen. Ein Tipp schaltet auf gross um, dann
     lässt sich der Rahmen scrollen – so schiebt man mit dem Finger über
     das Bild, ganz ohne Zoom-Bibliothek. */
  function bildZeigen(nr){
    const rahmen = $("bild-rahmen"), bild = $("bild-gross");
    rahmen.classList.remove("gross");
    rahmen.scrollTop = rahmen.scrollLeft = 0;
    bild.src = puzzleBild(nr);
    bild.alt = tr("bild.titel", { n: nr });
    $("bild-titel").textContent = tr("bild.titel", { n: nr });
    $("bild-hinweis").textContent = tr("bild.hinweis");
    $("ov-bild").classList.add("is-offen");
  }
  function bildZoomen(){
    const rahmen = $("bild-rahmen");
    const gross = rahmen.classList.toggle("gross");
    $("bild-hinweis").textContent = gross
      ? tr("bild.zoom")
      : tr("bild.hinweis");
    if(!gross) rahmen.scrollTop = rahmen.scrollLeft = 0;
  }
  function galerieZeigen(){
    galerieZeichnen();
    zeigeScreen("screen-galerie");
  }

  function puzzleKaufen(){
    if(puzzle.offen.length>=PUZZLE_TEILE || schatz.gold<PUZZLE_PREIS) return;

    const geschlossen = [];
    for(let i=0;i<PUZZLE_TEILE;i++){
      if(puzzle.offen.indexOf(i)<0) geschlossen.push(i);
    }

    const index = waehle(geschlossen);
    schatz.gold -= PUZZLE_PREIS;
    schatzZeichnen();
    sichern();

    puzzle.offen.push(index);
    puzzleSichern();
    puzzleZeichnen();

    const teil = $("puzzle-bild").children[index];
    if(teil){
      teil.classList.add("neu");
      setTimeout(()=>teil.classList.remove("neu"),600);
    }

    kMuenze();

    if(puzzle.offen.length===PUZZLE_TEILE){
      if(puzzle.geloest.indexOf(puzzle.nummer)<0) puzzle.geloest.push(puzzle.nummer);
      puzzleSichern();
      const naechstes = puzzleNaechstes();
      setTimeout(()=>{
        kSieg();
        $("puzzle-text").textContent = tr("puzzle.funken");
        $("puzzle-hinweis").textContent = naechstes
          ? tr("puzzle.wandert")
          : tr("puzzle.alle.galerie");
        funken("puzzle-funken","✨",14);
        setTimeout(()=>{
          /* Das letzte Bild bleibt stehen, wenn es kein nächstes mehr gibt. */
          if(naechstes){ puzzle.nummer = naechstes; puzzle.offen = []; puzzleSichern(); }
          puzzleZeichnen();
          galerieZeichnen();
        },1800);
      },500);
    }
  }

  /* ================= SPIEL 4: BURG BAUEN ================= */
  const BURG_SPALTEN = 9, BURG_REIHEN = 6;
  const BURG_ZELLEN = BURG_SPALTEN*BURG_REIHEN;

  /* Bauteile werden als randfüllende SVG-Kacheln gezeichnet (kein Emoji mehr),
     damit benachbarte Mauern zu einer durchgehenden Wand verschmelzen.
     "gruppe:wand" fasst alle Mauer-Varianten fürs Ziel zusammen.
     Alte IDs (mauer/tor/fenster/flagge/wappen) bleiben erhalten -> gespeicherte
     Burgen behalten ihre Teile. */
  const BURG_TEILE = [
    {id:"mauer",      nameKey:"burg.teil.mauer",     preis:100, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"rote-mauer", nameKey:"burg.teil.rote-mauer", preis:100, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"turmstein",  nameKey:"burg.teil.turmstein", preis:120, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"tor",        nameKey:"burg.teil.tor",       preis:300, erlaubt:(z,s)=>z>=BURG_REIHEN-2},
    {id:"fenster",    nameKey:"burg.teil.fenster",   preis:80,  erlaubt:(z,s)=>true},
    {id:"dach",       nameKey:"burg.teil.dach",      preis:150, erlaubt:(z,s)=>z<BURG_REIHEN-1},
    {id:"flagge",     nameKey:"burg.teil.flagge",    preis:200, erlaubt:(z,s)=>z<=1},
    {id:"wappen",     nameKey:"burg.teil.wappen",    preis:150, erlaubt:(z,s)=>true},
    {id:"fackel",     nameKey:"burg.teil.fackel",    preis:90,  erlaubt:(z,s)=>true},
    {id:"busch",      nameKey:"burg.teil.busch",     preis:60,  erlaubt:(z,s)=>z===BURG_REIHEN-1},
    {id:"fass",       nameKey:"burg.teil.fass",      preis:60,  erlaubt:(z,s)=>z===BURG_REIHEN-1}
  ];
  const BURG_ZIEL = [
    {textKey:"burg.ziel.tor",    min:1, n:()=>burgZaehlen("tor")},
    {textKey:"burg.ziel.wappen", min:1, n:()=>burgZaehlen("wappen")},
    {textKey:"burg.ziel.flagge", min:1, n:()=>burgZaehlen("flagge")},
    {textKey:"burg.ziel.mauern", min:6, n:()=>burgZaehlenGruppe("wand")}
  ];

  const burg = { feld:new Array(BURG_ZELLEN).fill(""), auswahl:null, geloest:false };

  function burgTeil(id){ return BURG_TEILE.find(x=>x.id===id)||null; }

  /* ---- Kachel-Grafik: jedes Teil ist ein randfüllendes SVG (kein Emoji) ---- */
  function svgWrap(inner){
    return '<svg class="kachel-svg" viewBox="0 0 100 100" preserveAspectRatio="none">'+inner+'</svg>';
  }
  /* Mauer-Kachel im Läuferverband; Fugen laufen bis an den Zellenrand,
     sodass anliegende Zellen (Raster hat gap:0) eine durchgehende Wand ergeben. */
  function wandSVG(basis, fuge, hell){
    return svgWrap(
        '<rect width="100" height="100" fill="'+fuge+'"/>'
      + '<g fill="'+basis+'">'
      +   '<rect x="1.5" y="1.5" width="47" height="45" rx="3"/>'
      +   '<rect x="51.5" y="1.5" width="47" height="45" rx="3"/>'
      +   '<rect x="-23" y="53.5" width="47" height="45" rx="3"/>'
      +   '<rect x="27" y="53.5" width="47" height="45" rx="3"/>'
      +   '<rect x="77" y="53.5" width="47" height="45" rx="3"/>'
      + '</g>'
      + '<g fill="'+hell+'" opacity=".55">'
      +   '<rect x="1.5" y="1.5" width="47" height="7" rx="3"/>'
      +   '<rect x="51.5" y="1.5" width="47" height="7" rx="3"/>'
      +   '<rect x="1.5" y="53.5" width="22" height="7" rx="3"/>'
      +   '<rect x="27" y="53.5" width="47" height="7" rx="3"/>'
      +   '<rect x="77" y="53.5" width="21" height="7" rx="3"/>'
      + '</g>');
  }
  /* Grauer Steinblock als Hintergrund für "eingelassene" Teile (Tor, Fenster …). */
  function steinRahmen(){
    return '<rect width="100" height="100" fill="#575a5e"/>'
      + '<rect x="2.5" y="2.5" width="95" height="95" rx="4" fill="#83868b"/>'
      + '<rect x="2.5" y="2.5" width="95" height="26" rx="4" fill="#94979c"/>';
  }
  function kachelSVG(id){
    switch(id){
      case "mauer":      return wandSVG("#8d8f93","#4c4e52","#b9bcc0");
      case "rote-mauer": return wandSVG("#b1502f","#6d2f1c","#cf6a45");
      case "turmstein":  return wandSVG("#c9c3b4","#8a8577","#e6e1d4");
      case "tor": return svgWrap(steinRahmen()
        + '<path d="M22 100 L22 46 A28 26 0 0 1 78 46 L78 100 Z" fill="#7c4a24"/>'
        + '<g stroke="#5a3316" stroke-width="2">'
        +   '<line x1="37" y1="30" x2="37" y2="100"/>'
        +   '<line x1="50" y1="24" x2="50" y2="100"/>'
        +   '<line x1="63" y1="30" x2="63" y2="100"/>'
        + '</g>'
        + '<path d="M22 100 L22 46 A28 26 0 0 1 78 46 L78 100 Z" fill="none" stroke="#3f2611" stroke-width="4"/>'
        + '<circle cx="70" cy="74" r="3" fill="#e8c34a"/>');
      case "fenster": return svgWrap(steinRahmen()
        + '<path d="M32 84 L32 44 A18 18 0 0 1 68 44 L68 84 Z" fill="#28304a"/>'
        + '<g stroke="#aeb6c6" stroke-width="3">'
        +   '<line x1="50" y1="28" x2="50" y2="84"/>'
        +   '<line x1="32" y1="58" x2="68" y2="58"/>'
        + '</g>'
        + '<path d="M32 84 L32 44 A18 18 0 0 1 68 44 L68 84 Z" fill="none" stroke="#4a4d51" stroke-width="4"/>');
      case "dach": return svgWrap(
          '<polygon points="50,6 98,66 2,66" fill="#c0392b"/>'
        + '<polygon points="50,6 98,66 50,66" fill="#9e2d20" opacity=".55"/>'
        + '<rect x="2" y="66" width="96" height="30" fill="#83868b"/>'
        + '<rect x="2" y="66" width="96" height="6" fill="#94979c"/>'
        + '<polygon points="50,6 98,66 2,66" fill="none" stroke="#7d2318" stroke-width="3"/>'
        + '<circle cx="50" cy="7" r="4" fill="#e8c34a"/>');
      case "flagge": return svgWrap(
          '<rect x="27" y="8" width="5" height="88" rx="2" fill="#6b5236"/>'
        + '<circle cx="29.5" cy="8" r="4.5" fill="#e8c34a"/>'
        + '<path d="M32 12 L88 24 L32 40 Z" fill="#d64545"/>'
        + '<path d="M32 12 L88 24 L32 40 Z" fill="none" stroke="#9e2d2d" stroke-width="2"/>');
      case "wappen": return svgWrap(steinRahmen()
        + '<path d="M50 18 L78 27 Q78 62 50 84 Q22 62 22 27 Z" fill="#2f5aa8"/>'
        + '<path d="M50 18 L78 27 Q78 62 50 84 Q22 62 22 27 Z" fill="none" stroke="#e8c34a" stroke-width="4"/>'
        + '<g stroke="#f4e3a1" stroke-width="4">'
        +   '<line x1="50" y1="22" x2="50" y2="78"/>'
        +   '<line x1="26" y1="40" x2="74" y2="40"/>'
        + '</g>');
      case "fackel": return svgWrap(steinRahmen()
        + '<rect x="46" y="46" width="8" height="46" rx="3" fill="#6b4a2b"/>'
        + '<rect x="39" y="43" width="22" height="8" rx="3" fill="#3f3f42"/>'
        + '<path d="M50 12 C39 26 44 39 50 45 C56 39 61 26 50 12 Z" fill="#f0932b"/>'
        + '<path d="M50 22 C44 31 47 40 50 44 C53 40 56 31 50 22 Z" fill="#ffd45e"/>');
      case "busch": return svgWrap(
          '<ellipse cx="50" cy="74" rx="36" ry="22" fill="#3f8b3a"/>'
        + '<circle cx="33" cy="60" r="18" fill="#4a9e44"/>'
        + '<circle cx="66" cy="58" r="20" fill="#57b04f"/>'
        + '<circle cx="50" cy="66" r="21" fill="#4a9e44"/>'
        + '<circle cx="44" cy="54" r="5" fill="#7fce6f" opacity=".7"/>');
      case "fass": return svgWrap(
          '<path d="M30 34 Q50 28 70 34 L66 90 Q50 96 34 90 Z" fill="#9c6b3b"/>'
        + '<g stroke="#7a5024" stroke-width="2">'
        +   '<line x1="42" y1="31" x2="40" y2="93"/>'
        +   '<line x1="58" y1="31" x2="60" y2="93"/>'
        + '</g>'
        + '<path d="M29 47 Q50 43 71 47" stroke="#4a2e15" stroke-width="5" fill="none"/>'
        + '<path d="M31 76 Q50 80 69 76" stroke="#4a2e15" stroke-width="5" fill="none"/>');
    }
    return "";
  }

  function burgLaden(){
    burg.feld = new Array(BURG_ZELLEN).fill("");
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"burg"));
      if(!roh) return;
      const d = JSON.parse(roh);
      if(!Array.isArray(d.feld)) return;
      const gueltig = v => BURG_TEILE.some(x=>x.id===v) ? v : "";
      const altSp = d.spalten || 8;   /* frühere Version: festes 8x5-Raster */
      const altRe = d.reihen  || 5;
      if(d.feld.length===BURG_ZELLEN && altSp===BURG_SPALTEN && altRe===BURG_REIHEN){
        burg.feld = d.feld.map(gueltig);
      }else if(d.feld.length===altSp*altRe){
        /* Ins neue Raster umrechnen statt verwerfen: gleiche Spalte,
           Reihen am Boden verankern, damit die Mauer auf der Wiese stehen bleibt. */
        for(let i=0;i<d.feld.length;i++){
          const az = Math.floor(i/altSp), as = i%altSp;
          const nz = BURG_REIHEN - (altRe - az);
          if(nz>=0 && nz<BURG_REIHEN && as>=0 && as<BURG_SPALTEN){
            burg.feld[nz*BURG_SPALTEN+as] = gueltig(d.feld[i]);
          }
        }
      }
    }catch(e){}
  }

  function burgSichern(){
    try{
      localStorage.setItem(kontoKey(konto.aktiv,"burg"),
        JSON.stringify({ feld:burg.feld, spalten:BURG_SPALTEN, reihen:BURG_REIHEN }));
    }catch(e){}
  }

  function burgWert(){
    return burg.feld.reduce((s,v)=> s + (burgTeil(v)?burgTeil(v).preis:0), 0);
  }

  function burgZaehlen(id){
    return burg.feld.filter(v=>v===id).length;
  }

  function burgZaehlenGruppe(gruppe){
    return burg.feld.filter(v=>{ const t=burgTeil(v); return t && t.gruppe===gruppe; }).length;
  }

  function burgCheckliste(){
    return BURG_ZIEL.map(z => ({ textKey:z.textKey, ok: z.n()>=z.min }));
  }

  function burgFertig(){
    return burgCheckliste().every(z=>z.ok);
  }

  function burgDekoZeichnen(){
    const fundament = $("burg-fundament");
    if(fundament){
      fundament.style.gridTemplateColumns = "repeat("+BURG_SPALTEN+",1fr)";
      fundament.innerHTML = "";
      for(let s=0;s<BURG_SPALTEN;s++){
        const st = document.createElement("div");
        st.className = "stein";
        st.innerHTML = wandSVG("#8d8f93","#4c4e52","#b9bcc0");
        fundament.appendChild(st);
      }
    }
  }

  function burgZeichnen(){
    const raster = $("burg-raster");
    if(!raster) return;
    raster.style.gridTemplateColumns = "repeat("+BURG_SPALTEN+",1fr)";
    burgDekoZeichnen();
    raster.innerHTML = "";
    const gewaehlt = burgTeil(burg.auswahl);

    for(let i=0;i<BURG_ZELLEN;i++){
      const z = Math.floor(i/BURG_SPALTEN), s = i%BURG_SPALTEN;
      const teil = burgTeil(burg.feld[i]);
      const el = document.createElement("button");
      el.type = "button";
      el.className = "burg-zelle";
      el.dataset.index = i;
      el.setAttribute("aria-label", tr("burg.feld", { n: i+1 }));
      if(teil){
        el.classList.add("besetzt");
        el.innerHTML = kachelSVG(teil.id);
        el.title = tr(teil.nameKey);
      }else if(gewaehlt && gewaehlt.erlaubt(z,s) && schatz.gold>=gewaehlt.preis){
        el.classList.add("kann");
      }
      raster.appendChild(el);
    }

    const besetzt = burg.feld.filter(v=>v!==null && v!=="").length;
    $("burg-wert").textContent = burgWert();
    $("burg-zaehler").textContent = besetzt;

    const palette = $("burg-palette");
    palette.innerHTML = "";
    BURG_TEILE.forEach(t => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "burg-werkzeug";
      if(burg.auswahl===t.id) b.classList.add("gewaehlt");
      if(schatz.gold<t.preis) b.classList.add("zu-teuer");
      b.innerHTML = '<span class="zeichen">'+kachelSVG(t.id)+'</span>'+
        '<span class="name">'+tr(t.nameKey)+'</span>'+
        '<span class="preis">'+t.preis+' 🪙</span>';
      b.addEventListener("click", ()=>burgWaehle(t.id));
      palette.appendChild(b);
    });

    const liste = $("burg-checkliste");
    liste.innerHTML = "";
    burgCheckliste().forEach(z => {
      const el = document.createElement("span");
      el.className = "burg-ziel"+(z.ok?" ok":"");
      el.textContent = tr(z.textKey);
      liste.appendChild(el);
    });

    if(!burg.auswahl){
      $("burg-hinweis").textContent = tr("burg.waehle");
    }else if(gewaehlt && schatz.gold<gewaehlt.preis){
      $("burg-hinweis").textContent = tr("burg.fehl", { name: tr(gewaehlt.nameKey), n: gewaehlt.preis-schatz.gold });
    }else if(gewaehlt){
      $("burg-hinweis").textContent = tr("burg.setzen", { name: tr(gewaehlt.nameKey) });
    }
  }

  function burgWaehle(id){
    burg.auswahl = burg.auswahl===id ? null : id;
    burgZeichnen();
  }

  function burgPlatziere(index){
    const z = Math.floor(index/BURG_SPALTEN), s = index%BURG_SPALTEN;
    const gewaehlt = burgTeil(burg.auswahl);
    if(!gewaehlt) return;
    if(burg.feld[index]) return;
    if(!gewaehlt.erlaubt(z,s)){
      $("burg-hinweis").textContent = tr("burg.passt.nicht", { name: tr(gewaehlt.nameKey) });
      return;
    }
    if(!goldAusgeben(gewaehlt.preis)) return;

    burg.feld[index] = gewaehlt.id;
    burgSichern();
    burgZeichnen();
    kMuenze();
    const el = $("burg-raster").children[index];
    if(el){ el.classList.add("neu"); setTimeout(()=>el.classList.remove("neu"),600); }

    if(!burg.geloest && burgFertig()){
      burg.geloest = true;
      setTimeout(()=>{
        kSieg();
        funken("burg-raster","✨",16);
        $("burg-hinweis").textContent = tr("burg.pracht");
      },500);
    }
  }

  function burgAbreissen(index){
    const teil = burgTeil(burg.feld[index]);
    if(!teil) return;
    burg.feld[index] = "";
    const erstattung = Math.floor(teil.preis/2);
    burgSichern();
    burgZeichnen();
    if(erstattung>0){
      goldDazu(erstattung);
      kGoldWeg();
    }
    $("burg-hinweis").textContent = tr("burg.abgerissen", { name: tr(teil.nameKey), n: erstattung });
  }

  /* ================= SPIEL 6: DRACHENHÖHLE =================
     Dritte Ausgeben-Möglichkeit neben Puzzle und Burg: ein Ei kaufen und den
     eigenen Drachen grossfüttern. Ab dem Jungdrachen fliegt er im Drachenkampf
     als Begleiter mit. Achtung: "hort" ist schon die Schatzjagd, deshalb
     heisst hier alles "hoehle". */
  const HOEHLE_EI = 500;
  const HOEHLE_FUTTER = 80;
  const HOEHLE_STUFEN = [
    {ab:0,  bild:"🥚", nameKey:"hoehle.stufe.ei",
     textKey:"hoehle.text.ei"},
    {ab:3,  bild:"🐣", img:"images/schluepfling.svg", nameKey:"hoehle.stufe.schluepfling",
     textKey:"hoehle.text.schluepfling"},
    {ab:8,  bild:"🐲", img:"images/jungdrache.svg", nameKey:"hoehle.stufe.jungdrache",
      textKey:"hoehle.text.jungdrache"},
    {ab:15, bild:"🐉", img:"images/hausdrache.svg", nameKey:"hoehle.stufe.hausdrache",
     textKey:"hoehle.text.hausdrache"}
  ];
  /* Ab dieser Stufe erscheint der Drache in der Kampfarena. */
  const HOEHLE_BEGLEITER_AB = 2;
  /* x/y in Prozent der Bühne: x von links, y von unten. */
  const HOEHLE_SCHMUCK = [
    {id:"nest",     bild:"🪺", nameKey:"hoehle.schmuck.nest",     preis:150, x:15, y:14},
    {id:"fackel",   bild:"🔥", nameKey:"hoehle.schmuck.fackel",   preis:90,  x:85, y:46},
    {id:"gold",     bild:"💰", nameKey:"hoehle.schmuck.gold",     preis:200, x:77, y:13},
    {id:"kristall", bild:"💎", nameKey:"hoehle.schmuck.kristall", preis:250, x:25, y:52},
    {id:"knochen",  bild:"🦴", nameKey:"hoehle.schmuck.knochen",  preis:70,  x:34, y:7},
    {id:"stern",    bild:"🌟", nameKey:"hoehle.schmuck.stern",    preis:300, x:62, y:60}
  ];
  /* Namen werden angetippt, nicht getippt – im ganzen Spiel wird nichts geschrieben.
     Hier liegen die Übersetzungs-Schlüssel; gespeichert wird nur der Index. */
  const HOEHLE_NAMEN = ["hoehle.name.funkenschweif","hoehle.name.glutherz","hoehle.name.mondschuppe",
                        "hoehle.name.sternenzahn","hoehle.name.rauchwoelkchen","hoehle.name.goldkralle"];
  /* Alte Spielstände speichern den deutschen Namen als Text – nur fürs Umstellen. */
  const HOEHLE_NAMEN_ALT = ["Funkenschweif","Glutherz","Mondschuppe","Sternenzahn","Rauchwölkchen","Goldkralle"];

  /* Drachenfarben: hue-rotate auf den eigenen Drachen. Farbe i wird frei, sobald
     im Drachenturm i Türme fehlerfrei geschafft wurden – Farbe 0 also sofort. */
  /* Die Gradzahlen sind am Drachen ausgemessen, nicht geraten: hue-rotate dreht
     ab der Grundfarbe der Grafik, und die ist grün. Deshalb ist Grün 0° (der
     Standard, unverändert) und Rot liegt bei 240°, nicht bei 0°. */
  const DRACHEN_FARBEN = [
    {id:"wald",  hue:0,   nameKey:"farbe.wald"},
    {id:"eis",   hue:90,  nameKey:"farbe.eis"},
    {id:"nacht", hue:150, nameKey:"farbe.nacht"},
    {id:"rosen", hue:210, nameKey:"farbe.rosen"},
    {id:"feuer", hue:240, nameKey:"farbe.feuer"},
    {id:"gold",  hue:300, nameKey:"farbe.gold"}
  ];

  /* Hunger: 20 Stunden statt 24, damit ein Kind, das jeden Tag nach der Schule
     spielt, den Drachen zuverlässig hungrig antrifft und nicht je nach Uhrzeit
     mal so, mal so. "hunger" ist ein Zähler (0–3), keine Uhr – er sagt, wie viele
     Portionen nachzuholen sind. Der Drache verliert nie etwas; die Portionen
     kosten nur Gold. */
  const HUNGER_STUFE_MS = 20*60*60*1000;
  const HUNGER_MAX = 3;

  const hoehle = { ei:false, futter:0, schmuck:[], name:-1,
                   farbe:0, goldTuerme:0, gefuettert:0, hunger:0 };

  function hoehleStufeIndex(){
    if(!hoehle.ei) return -1;
    let i = 0;
    HOEHLE_STUFEN.forEach((s,n)=>{ if(hoehle.futter>=s.ab) i = n; });
    return i;
  }
  function hoehleAusgewachsen(){ return hoehleStufeIndex() >= HOEHLE_STUFEN.length-1; }

  function hoehleLaden(){
    hoehle.ei = false; hoehle.futter = 0; hoehle.schmuck = []; hoehle.name = -1;
    hoehle.farbe = 0; hoehle.goldTuerme = 0; hoehle.gefuettert = 0; hoehle.hunger = 0;
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"hoehle"));
      if(!roh) return;
      const d = JSON.parse(roh);
      hoehle.ei = !!d.ei;
      hoehle.futter = Math.max(0, Number(d.futter)||0);
      hoehle.schmuck = Array.isArray(d.schmuck)
        ? d.schmuck.filter(id => HOEHLE_SCHMUCK.some(s=>s.id===id))
        : [];
      /* Neues Format: Index. Alte Spielstände (String) werden einmalig umgestellt. */
      if(typeof d.name === "number"){
        hoehle.name = (d.name>=0 && d.name<HOEHLE_NAMEN.length) ? d.name : -1;
      }else{
        hoehle.name = HOEHLE_NAMEN_ALT.indexOf(d.name);
      }
      hoehle.goldTuerme = Math.max(0, Number(d.goldTuerme)||0);
      const f = Number(d.farbe)||0;
      hoehle.farbe = (f>=0 && f<DRACHEN_FARBEN.length && f<=hoehle.goldTuerme) ? f : 0;
      hoehle.gefuettert = Math.max(0, Number(d.gefuettert)||0);
      hoehle.hunger = Math.min(HUNGER_MAX, Math.max(0, Number(d.hunger)||0));
      /* Spielstände von vor dem Hunger kennen keinen Zeitpunkt. Ohne diese Zeile
         stünde beim ersten Start nach dem Update sofort ein hungriger Drache da. */
      if(hoehle.ei && !hoehle.gefuettert){
        hoehle.gefuettert = Date.now();
        hoehleSichern();
      }
    }catch(e){}
  }
  function hoehleSichern(){
    try{
      localStorage.setItem(kontoKey(konto.aktiv,"hoehle"), JSON.stringify({
        ei:hoehle.ei, futter:hoehle.futter, schmuck:hoehle.schmuck, name:hoehle.name,
        farbe:hoehle.farbe, goldTuerme:hoehle.goldTuerme,
        gefuettert:hoehle.gefuettert, hunger:hoehle.hunger
      }));
    }catch(e){}
  }

  /* Hunger holt höchstens EINE Portion je Spielstart auf: zwei Wochen Ferien
     kosten damit nicht mehr als ein einzelner vergessener Tag. Läuft deshalb nur
     beim Start und beim Kontowechsel – niemals aus einer Zeichnen-Funktion. */
  function hoehleHungerAufholen(){
    if(!hoehle.ei || hoehleStufeIndex() < 1) return;   /* das Ei wird nicht hungrig */
    if(!hoehle.gefuettert){ hoehle.gefuettert = Date.now(); hoehleSichern(); return; }
    const her = Date.now() - hoehle.gefuettert;
    if(her < 0){ hoehle.gefuettert = Date.now(); hoehleSichern(); return; }  /* Uhr verstellt */
    if(her < HUNGER_STUFE_MS) return;
    hoehle.hunger = Math.min(HUNGER_MAX, hoehle.hunger + 1);
    hoehle.gefuettert = Date.now();
    hoehleSichern();
  }
  function hoehleHungrig(){ return hoehle.ei && hoehle.hunger > 0; }
  function hoehleDrachenName(){
    const i = hoehleStufeIndex();
    return hoehle.name>=0 ? tr(HOEHLE_NAMEN[hoehle.name])
                          : tr(HOEHLE_STUFEN[Math.max(0,i)].nameKey);
  }
  /* Reines Zeichnen ohne Seiteneffekt – darf beliebig oft laufen. */
  function hoehleHungerZeichnen(){
    const banner = $("hunger-banner"), punkt = $("hoehle-punkt");
    const hungrig = hoehleHungrig();
    if(punkt) punkt.hidden = !hungrig;
    if(!banner) return;
    banner.hidden = !hungrig;
    if(!hungrig) return;
    $("hunger-titel").textContent = tr("hunger.banner.titel");
    $("hunger-text").textContent = hoehle.hunger>1
      ? trp("hoehle.hunger.mehr", hoehle.hunger)
      : tr("hunger.banner.text");
  }
  function hoehleFarbeAnwenden(){
    const f = DRACHEN_FARBEN[hoehle.farbe] || DRACHEN_FARBEN[0];
    document.documentElement.style.setProperty("--drachen-hue", f.hue+"deg");
  }

  /* Der Begleiter in der Kampfarena – wird auch beim Kontowechsel neu gesetzt. */
  function hoehleBegleiterZeichnen(){
    const el = $("kampf-begleiter");
    if(!el) return;
    const i = hoehleStufeIndex();
    if(i >= HOEHLE_BEGLEITER_AB){
      const stufe = HOEHLE_STUFEN[i];
      if(stufe.img){
        el.innerHTML = '<img src="'+stufe.img+'" alt="'+tr(stufe.nameKey)+'">';
      }else{
        el.textContent = stufe.bild;
      }
      el.classList.remove("aus");
    }else{
      el.innerHTML = "";
      el.classList.add("aus");
    }
  }
  function hoehleBegleiterJubelt(){
    const el = $("kampf-begleiter");
    if(el && !el.classList.contains("aus")) bewege(el,"jubelt",520);
  }
  function hoehleBegleiterAktiv(){
    const el = $("kampf-begleiter");
    return !!el && !el.classList.contains("aus");
  }

  function hoehleSchmuckZeichnen(){
    const box = $("hoehle-schmuck");
    box.innerHTML = "";
    HOEHLE_SCHMUCK.forEach(s => {
      if(hoehle.schmuck.indexOf(s.id)<0) return;
      const el = document.createElement("span");
      el.className = "schmuck-" + s.id;
      el.textContent = s.bild;
      el.style.left = s.x+"%";
      el.style.bottom = s.y+"%";
      box.appendChild(el);
    });
  }

  function hoehleLadenZeichnen(){
    const box = $("hoehle-laden");
    box.innerHTML = "";
    if(!hoehle.ei) return;
    HOEHLE_SCHMUCK.forEach(s => {
      const hat = hoehle.schmuck.indexOf(s.id)>=0;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hoehle-ware"+(hat ? " gekauft" : (schatz.gold<s.preis ? " zu-teuer" : ""));
      b.innerHTML = '<span class="zeichen">'+s.bild+'</span>'
        + '<span class="name">'+tr(s.nameKey)+'</span>'
        + '<span class="preis">'+(hat ? tr("gekauft") : s.preis+" 🪙")+'</span>';
      if(!hat) b.addEventListener("click", ()=>hoehleSchmuckKaufen(s.id));
      box.appendChild(b);
    });
  }

  function hoehleNamenZeichnen(){
    const box = $("hoehle-namen"), wahl = $("hoehle-namenwahl");
    const zeigen = hoehle.ei && hoehleStufeIndex()>=1 && hoehle.name<0;
    /* Überschrift und Erklärsatz stehen im Wrapper – der wird versteckt, nicht
       nur die Knöpfe, sonst bliebe die Frage ohne Antwortmöglichkeit stehen. */
    wahl.hidden = !zeigen;
    box.innerHTML = "";
    if(!zeigen) return;
    HOEHLE_NAMEN.forEach((key, idx) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = tr(key);
      b.addEventListener("click", ()=>{
        hoehle.name = idx;
        hoehleSichern(); hoehleZeichnen();
        kChime();
        funken("hoehle-funken","✨",10);
      });
      box.appendChild(b);
    });
  }

  /* Farbwahl: baugleich zum Deko-Laden, aber nichts kostet Gold – die Farben
     werden im Drachenturm verdient. */
  function hoehleFarbenZeichnen(){
    const wahl = $("hoehle-farbwahl"), box = $("hoehle-farben");
    if(!wahl || !box) return;
    wahl.hidden = !hoehle.ei;
    box.innerHTML = "";
    if(!hoehle.ei) return;
    DRACHEN_FARBEN.forEach((f, idx) => {
      const frei = hoehle.goldTuerme >= idx;
      const aktiv = hoehle.farbe === idx;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hoehle-ware"+(aktiv ? " gekauft" : (frei ? "" : " zu-teuer"));
      b.innerHTML = '<span class="zeichen farbtupfer" style="filter:hue-rotate('+f.hue+'deg)">🐉</span>'
        + '<span class="name">'+tr(f.nameKey)+'</span>'
        + '<span class="preis">'+(aktiv ? tr("gekauft")
            : frei ? "✓" : "🔒 "+tr("farbe.gesperrt",{ n: idx-hoehle.goldTuerme }))+'</span>';
      if(frei && !aktiv) b.addEventListener("click", ()=>{
        hoehle.farbe = idx;
        hoehleSichern(); hoehleFarbeAnwenden(); hoehleFarbenZeichnen();
        kMagie();
        funken("hoehle-funken","✨",10);
        $("hoehle-hinweis").textContent = tr("hoehle.schmueckt", { name: tr(f.nameKey) });
      });
      box.appendChild(b);
    });
  }

  function hoehleZeichnen(){
    const i = hoehleStufeIndex();
    const drache = $("hoehle-drache");

    if(i<0){
      drache.textContent = "🥚";
      drache.style.opacity = ".35";
      drache.style.filter = "grayscale(1) drop-shadow(0 8px 10px rgba(0,0,0,.55))";
      $("hoehle-stufe").textContent = "–";
      $("hoehle-name").textContent = tr("karte.hoehle.titel");
    }else{
      const stufe = HOEHLE_STUFEN[i];
      if(stufe.img){
        drache.innerHTML = '<img src="'+stufe.img+'" alt="'+tr(stufe.nameKey)+'">';
      }else{
        drache.textContent = stufe.bild;
      }
      drache.style.opacity = "";
      /* Leer lassen, damit die CSS-Regel mit hue-rotate(var(--drachen-hue)) greift. */
      drache.style.filter = "";
      $("hoehle-stufe").textContent = tr(stufe.nameKey);
      $("hoehle-name").textContent = hoehle.name>=0 ? tr(HOEHLE_NAMEN[hoehle.name]) : tr(stufe.nameKey);
    }
    drache.classList.toggle("hungrig", hoehleHungrig());

    $("hoehle-zaehler").textContent = hoehle.futter;
    hoehleFarbeAnwenden();
    hoehleSchmuckZeichnen();
    hoehleLadenZeichnen();
    hoehleNamenZeichnen();
    hoehleFarbenZeichnen();
    hoehleBegleiterZeichnen();
    hoehleHungerZeichnen();

    const knopf = $("btn-hoehle-haupt");
    const text = $("hoehle-text");
    const fort = $("hoehle-fort");
    const hinweis = $("hoehle-hinweis");
    const balken = $("hoehle-balken");

    if(!hoehle.ei){
      knopf.disabled = schatz.gold < HOEHLE_EI;
      knopf.textContent = tr("hoehle.ei.kaufen", { n: HOEHLE_EI });
      text.textContent = tr("hoehle.still");
      balken.style.width = "0%";
      fort.textContent = "";
      hinweis.textContent = schatz.gold < HOEHLE_EI
        ? tr("hoehle.brauchst.ei", { n: HOEHLE_EI-schatz.gold })
        : tr("hoehle.genug.ei");
      return;
    }

    text.textContent = tr(HOEHLE_STUFEN[i].textKey);

    /* Der Hungertext geht allem anderen vor – er ist das, was jetzt zu tun ist. */
    const hungerText = hoehle.hunger>1 ? trp("hoehle.hunger.mehr", hoehle.hunger)
                     : hoehle.hunger===1 ? tr("hoehle.hunger") : "";

    if(hoehleAusgewachsen()){
      /* Ausgewachsen und hungrig: füttern bleibt möglich, sonst stünde die
         Warnung da und der Knopf wäre tot. Es kostet normal, wächst aber nicht. */
      knopf.disabled = hoehle.hunger===0 || schatz.gold < HOEHLE_FUTTER;
      knopf.textContent = hoehle.hunger>0
        ? tr("hoehle.fuettern", { n: HOEHLE_FUTTER })
        : tr("hoehle.ausgewachsen");
      balken.style.width = "100%";
      fort.textContent = tr("hoehle.fertig");
      hinweis.textContent = hungerText
        || tr("hoehle.schmuecke");
      if(hungerText && schatz.gold < HOEHLE_FUTTER)
        hinweis.textContent = tr("hoehle.brauchst.futter", { n: HOEHLE_FUTTER-schatz.gold });
    }else{
      const naechste = HOEHLE_STUFEN[i+1];
      const vorige = HOEHLE_STUFEN[i].ab;
      const fehlt = naechste.ab - hoehle.futter;
      knopf.disabled = schatz.gold < HOEHLE_FUTTER;
      knopf.textContent = tr("hoehle.fuettern", { n: HOEHLE_FUTTER });
      balken.style.width =
        ((hoehle.futter-vorige)/(naechste.ab-vorige)*100)+"%";
      fort.textContent = tr("hoehle.noch", { n: fehlt, name: tr(naechste.nameKey) });
      hinweis.textContent = schatz.gold < HOEHLE_FUTTER
        ? tr("hoehle.brauchst.futter", { n: HOEHLE_FUTTER-schatz.gold })
        : (hungerText || tr("hoehle.hunger"));
    }
  }

  function hoehleEiKaufen(){
    if(hoehle.ei || !goldAusgeben(HOEHLE_EI)) return;
    hoehle.ei = true;
    hoehle.gefuettert = Date.now();
    hoehle.hunger = 0;
    hoehleSichern();
    hoehleZeichnen();
    kZirp();
    bewege($("hoehle-drache"),"waechst",620);
    funken("hoehle-funken","✨",12);
  }

  function hoehleFuettern(){
    if(!hoehle.ei) return;
    /* Ausgewachsen: nur noch füttern, wenn er wirklich Hunger hat. */
    if(hoehleAusgewachsen() && hoehle.hunger === 0) return;
    const vorher = hoehleStufeIndex();
    if(!goldAusgeben(HOEHLE_FUTTER)) return;

    if(!hoehleAusgewachsen()) hoehle.futter++;
    hoehle.hunger = Math.max(0, hoehle.hunger - 1);
    hoehle.gefuettert = Date.now();
    hoehleSichern();
    hoehleZeichnen();

    const nachher = hoehleStufeIndex();
    if(nachher > vorher){
      /* Aufstieg wird gefeiert – wie der Rangaufstieg im Rest des Spiels. */
      kSieg();
      bewege($("hoehle-drache"),"waechst",620);
      funken("hoehle-funken","⭐",16);
      $("hoehle-hinweis").textContent =
        tr("hoehle.gewachsen", { name: tr(HOEHLE_STUFEN[nachher].nameKey) });
    }else{
      kPop();
      bewege($("hoehle-drache"),"huepft",520);
      funken("hoehle-funken","💛",6);
    }
  }

  function hoehleSchmuckKaufen(id){
    const ware = HOEHLE_SCHMUCK.find(s=>s.id===id);
    if(!ware || hoehle.schmuck.indexOf(id)>=0) return;
    if(!goldAusgeben(ware.preis)){ kGesperrt(); return; }
    hoehle.schmuck.push(id);
    hoehleSichern();
    hoehleZeichnen();
    kMagie();
    funken("hoehle-funken","✨",10);
    $("hoehle-hinweis").textContent = tr("hoehle.schmueckt", { name: tr(ware.nameKey) });
  }

  /* ================= SPIEL 5: RECHENMAUER ================= */
  const MAUER_ZIEL = 15;
  const m = { runde:1, richtig:0, falsch:0, serie:0, beste:0,
              wand:null, reihenfolge:[], aktiv:0, gesperrt:false,
              geloest:new Set(), zuletzt:null, flashNeu:false };

  function mStufen(){
    const max20 = opt.max===20;
    const r = m.runde;
    if(r<=4)  return {hoehe:3, luecken:2, unten:0};
    if(r<=8)  return {hoehe:3, luecken:3, unten: opt.minus?1:0};
    if(r<=12) return {hoehe: max20?4:3, luecken:3, unten: opt.minus?1:0};
    return     {hoehe: max20?4:3, luecken: max20?4:3, unten: opt.minus?2:0};
  }

  function mErzeuge(hoehe){
    let maxBase = opt.max===10 ? 3 : 6;
    for(let versuch=0; versuch<80; versuch++){
      const zeilen = [];
      for(let z=0;z<hoehe;z++) zeilen.push(new Array(z+1).fill(0));
      const unten = zeilen[hoehe-1];
      for(let s=0;s<hoehe;s++) unten[s] = zufall(1, maxBase);
      for(let z=hoehe-2;z>=0;z--)
        for(let s=0;s<=z;s++) zeilen[z][s] = zeilen[z+1][s]+zeilen[z+1][s+1];
      if(zeilen[0][0] <= opt.max) return zeilen;
      if(versuch>50 && maxBase>1) maxBase--;
    }
    const zeilen = [];
    for(let z=0;z<hoehe;z++) zeilen.push(new Array(z+1).fill(1));
    for(let z=hoehe-2;z>=0;z--)
      for(let s=0;s<=z;s++) zeilen[z][s] = zeilen[z+1][s]+zeilen[z+1][s+1];
    return zeilen;
  }

  function mEltern(z,s){
    const el = [];
    if(z>0 && s-1>=0) el.push([z-1,s-1]);
    if(z>0 && s<=z-1) el.push([z-1,s]);
    return el;
  }

  function mLoesungsReihenfolge(zeilen, luecken){
    const hoehe = zeilen.length;
    const bekannt = {};
    for(let z=0;z<hoehe;z++) for(let s=0;s<=z;s++){
      const key = z+"-"+s;
      if(!luecken.has(key)) bekannt[key] = true;
    }
    const geloest = [];
    let fort = true;
    while(fort){
      fort = false;
      for(let z=0;z<hoehe;z++){
        for(let s=0;s<=z;s++){
          const key = z+"-"+s;
          if(bekannt[key] || !luecken.has(key)) continue;
          let wert = null;
          if(z<hoehe-1){
            const l = (z+1)+"-"+s, r = (z+1)+"-"+(s+1);
            if(bekannt[l] && bekannt[r]) wert = zeilen[z+1][s]+zeilen[z+1][s+1];
          }
          if(wert===null){
            const eltern = mEltern(z,s);
            for(const [pz,ps] of eltern){
              const pkey = pz+"-"+ps;
              if(!bekannt[pkey]) continue;
              const geschw = (z===pz+1 && s===ps) ? [pz+1,ps+1] : [pz+1,ps];
              const gkey = geschw[0]+"-"+geschw[1];
              if(bekannt[gkey]){
                wert = zeilen[pz][ps] - zeilen[geschw[0]][geschw[1]];
                break;
              }
            }
          }
          if(wert!==null){
            bekannt[key] = true;
            geloest.push([z,s]);
            fort = true;
          }
        }
      }
    }
    for(const key of luecken){
      if(!bekannt[key]) return null;
    }
    return geloest;
  }

  function mZiehe(arr, n){
    const copy = arr.slice();
    const out = [];
    while(out.length<n && copy.length){
      const i = Math.floor(Math.random()*copy.length);
      out.push(copy.splice(i,1)[0]);
    }
    return out;
  }

  function mWaehleLuecken(zeilen, hoehe, luecken, unten){
    const untenZellen = [], obenZellen = [];
    for(let z=0;z<hoehe;z++) for(let s=0;s<=z;s++){
      if(z===hoehe-1) untenZellen.push([z,s]); else obenZellen.push([z,s]);
    }
    for(let versuch=0; versuch<200; versuch++){
      const set = new Set();
      mZiehe(untenZellen, unten).forEach(c=>set.add(c[0]+"-"+c[1]));
      mZiehe(obenZellen, luecken-unten).forEach(c=>set.add(c[0]+"-"+c[1]));
      if(set.size < luecken) continue;
      const reihenfolge = mLoesungsReihenfolge(zeilen, set);
      if(reihenfolge && reihenfolge.length===luecken) return { set, reihenfolge };
    }
    const set = new Set();
    mZiehe(obenZellen, luecken).forEach(c=>set.add(c[0]+"-"+c[1]));
    return { set, reihenfolge: mLoesungsReihenfolge(zeilen, set) || [] };
  }

  function mTippAktualisieren(){
    const hin = $("m-tipp-hinweis");
    if(!hin) return;
    const aktiv = m.reihenfolge[m.aktiv];
    const w = m.wand;
    if(!aktiv || !w){ hin.textContent = ""; return; }
    const [z,s] = aktiv;
    if(z < w.hoehe-1){
      hin.textContent = tr("m.rechne", { a: w.zeilen[z+1][s], b: w.zeilen[z+1][s+1] });
      return;
    }
    for(const [pz,ps] of mEltern(z,s)){
      const pkey = pz+"-"+ps;
      const geschw = (z===pz+1 && s===ps) ? [pz+1,ps+1] : [pz+1,ps];
      const gkey = geschw[0]+"-"+geschw[1];
      const pknown = !w.luecken.has(pkey) || m.geloest.has(pkey);
      const gknown = !w.luecken.has(gkey) || m.geloest.has(gkey);
      if(pknown && gknown){
        hin.textContent = tr("m.rechne.rueckwaerts", { a: w.zeilen[pz][ps], b: w.zeilen[geschw[0]][geschw[1]] });
        return;
      }
    }
    hin.textContent = "";
  }

  function mZeichnen(){
    const box = $("mauer");
    if(!box) return;
    box.innerHTML = "";
    const w = m.wand;
    if(!w) return;
    for(let z=0;z<w.hoehe;z++){
      const zeile = document.createElement("div");
      zeile.className = "mauer-zeile";
      for(let s=0;s<=z;s++){
        const key = z+"-"+s;
        const wert = w.zeilen[z][s];
        const el = document.createElement("div");
        el.className = "mauer-stein";
        el.dataset.mZ = z; el.dataset.mS = s;
        const istLuecke = w.luecken.has(key);
        const geloest = m.geloest.has(key);
        if(istLuecke && !geloest){
          el.classList.add("mauer-luecke");
          const aktiv = m.reihenfolge[m.aktiv];
          if(aktiv && aktiv[0]===z && aktiv[1]===s) el.classList.add("aktiv");
          el.textContent = "?";
        }else{
          el.textContent = wert;
          if(geloest){
            if(key===m.zuletzt && m.flashNeu) el.classList.add("richtig");
            else el.classList.add("gefuellt");
          }
        }
        zeile.appendChild(el);
      }
      box.appendChild(zeile);
    }
    mTippAktualisieren();
  }

  function mKopf(){
    const mult = multiplikator(m.serie);
    $("m-serie-wert").textContent = "×"+mult;
    $("m-serie").classList.toggle("aus", mult===1);
    $("m-runden").textContent = Math.min(m.runde,MAUER_ZIEL)+"/"+MAUER_ZIEL;
    schatzZeichnen();
  }

  function mNeueWand(){
    const st = mStufen();
    const zeilen = mErzeuge(st.hoehe);
    const gew = mWaehleLuecken(zeilen, st.hoehe, st.luecken, st.unten);
    m.wand = { hoehe:st.hoehe, zeilen:zeilen, luecken:gew.set };
    m.reihenfolge = gew.reihenfolge;
    m.aktiv = 0;
    m.geloest = new Set();
    m.zuletzt = null;
    m.flashNeu = false;
    m.gesperrt = false;
    mZeichnen();
    mKopf();
    sagen("m-rueckmeldung", tr("m.frage"), "");
    $("m-tipp").classList.remove("is-offen");
    freigeben("m-zahlen");
  }

  function mWandFertig(){
    m.runde++;
    if(m.runde > MAUER_ZIEL){
      mZiel();
    }else{
      kSieg();
      funken("mauer","✨",12);
      setTimeout(mNeueWand,900);
    }
  }

  function mZiel(){
    kSieg();
    goldDazu(100);
    $("mauer-ziel-text").textContent = trp("m.ziel.basis", m.richtig, { b: m.beste }) + " " +
      (m.falsch===0 ? tr("h.ziel.sauber") : tr("h.weiterso"));
    $("ov-mauer").classList.add("is-offen");
    mKopf();
  }

  function mWeiterMauern(){
    $("ov-mauer").classList.remove("is-offen");
    m.runde=1; m.richtig=0; m.falsch=0; m.serie=0; m.beste=0;
    mNeueWand();
  }

  function mAntwort(wert,knopf){
    if(m.gesperrt) return;
    const aktiv = m.reihenfolge[m.aktiv];
    if(!aktiv) return;
    const [z,s] = aktiv;
    const loesung = m.wand.zeilen[z][s];

    if(wert===loesung){
      m.gesperrt = true; sperren("m-zahlen");
      knopf.classList.add("richtig");
      m.richtig++; m.serie++; m.beste = Math.max(m.beste,m.serie);
      problemGeloest();
      const mult = multiplikator(m.serie);
      const gewinn = goldDazu(GRUNDGOLD*mult);
      kRichtig(); kMuenze();
      const key = z+"-"+s;
      m.geloest.add(key);
      m.aktiv++;
      m.zuletzt = key; m.flashNeu = true;
      sagen("m-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      mZeichnen(); m.flashNeu = false;
      mKopf();
      setTimeout(()=>{ m.aktiv>=m.reihenfolge.length ? mWandFertig() : mNaechsteLuecke(); },1050);
    }else{
      m.gesperrt = true; sperren("m-zahlen");
      knopf.classList.add("falsch");
      zeigeLoesung("m-zahlen",loesung);
      m.falsch++; m.serie = 0;
      const weg = goldWeg();
      kFalsch();
      sagen("m-rueckmeldung", weg
        ? tr("m.falsch.gold", { loesung: loesung, n: weg })
        : tr("m.falsch", { loesung: loesung }), "schlecht");
      mZeichnen();
      const el = $("mauer").querySelector('[data-m-z="'+z+'"][data-m-s="'+s+'"]');
      if(el) el.classList.add("falsch");
      mKopf();
      setTimeout(()=>{
        freigeben("m-zahlen");
        m.gesperrt = false;
      },1800);
    }
  }

  function mNaechsteLuecke(){
    m.gesperrt = false;
    freigeben("m-zahlen");
    sagen("m-rueckmeldung", tr("m.weiter"), "");
    mZeichnen();
  }

  function mStart(){
    m.runde=1; m.richtig=0; m.falsch=0; m.serie=0; m.beste=0;
    baueZahlen("m-zahlen",mAntwort);
    zeigeScreen("screen-mauer");
    mNeueWand();
  }

  /* ================= SPIEL 7: RITTER-TURNIER =================
     Ein Tjost: Jede Aufgabe ist ein Ritt. Beide Ritter preschen aufeinander zu,
     in der Mitte krachen die Lanzen – bei einer richtigen Antwort trifft der
     eigene Ritter, bei einer falschen der Gegner. Danach reiten beide an ihr
     Ende zurück und der nächste Ritt beginnt. Nach 8 Ritten entscheidet, wer
     mehr Treffer gelandet hat (bei Gleichstand gewinnt der Spieler). */
  const TURNIER_RITTE = 8;
  /* Takt eines Ritts: hin, Lanzen krachen, zurück. */
  const RITT_HIN = 380, RITT_HALT = 240, RITT_ZURUECK = 420;
  const RITT_GESAMT = RITT_HIN + RITT_HALT + RITT_ZURUECK;
  /* Jeder Gegner hat seine eigenen Wappenfarben – Fahne und Satteldecke. Die
     Namen geben sie in allen fünf Sprachen vor (Blauhelm, Grauguss,
     Silberzahn, Goldhelm), und von blau über Eisen und Silber zu Gold läuft
     die Reihe nebenbei mit der Schwierigkeit mit. */
  const TURNIER_GEGNER = [
    { nameKey:"t.gegner.blauhelm",  stufen:[1],     beute:50,  hell:"#6ea0f2", dunkel:"#22499b" },
    { nameKey:"t.gegner.grauguss",  stufen:[1,2],   beute:75,  hell:"#95a1ab", dunkel:"#333c45" },
    { nameKey:"t.gegner.silberzahn",stufen:[2,3],   beute:100, hell:"#ffffff", dunkel:"#93a3b4" },
    { nameKey:"t.gegner.goldhelm",  stufen:[3,4],   beute:150, hell:"#ffd873", dunkel:"#9a6a10" }
  ];
  const GEGNER_BILD = "images/ritter-nach-links.svg";
  const t = { gegner:0, richtig:0, falsch:0, serie:0, beste:0,
              aufgabe:null, letzte:"", gesperrt:false, wiederholen:false, beute:0, gewonnen:false };

  function tKopf(){
    const mult = multiplikator(t.serie);
    $("t-serie-wert").textContent = "×"+mult;
    $("t-serie").classList.toggle("aus",mult===1);
    $("t-gegner").textContent = (t.gegner+1)+"/"+TURNIER_GEGNER.length;
    schatzZeichnen();
  }
  function tStufen(){
    const g = TURNIER_GEGNER[Math.min(t.gegner,TURNIER_GEGNER.length-1)];
    return g.stufen;
  }
  function tGegnerName(){
    return tr(TURNIER_GEGNER[Math.min(t.gegner,TURNIER_GEGNER.length-1)].nameKey);
  }
  /* Ein <img> lässt sich von außen nicht umfärben – die Verläufe stecken in der
     SVG-Datei. Also wird die Datei einmal geholt, für den jeweiligen Gegner
     werden die vier Farbwerte von gDecke und gFahne im Text ersetzt, und das
     Ergebnis hängt als Blob-URL am selben <img>. So bleiben alle CSS-Klassen
     (angriff, getroffen, faellt) unangetastet.

     Klappt das Holen nicht – etwa wenn jemand die index.html direkt per
     file:// öffnet –, bleibt einfach der blaue Ritter aus dem Markup stehen. */
  let gegnerSvg = null, gegnerLaeuft = false, gegnerBlob = "", gegnerGezeigt = -1;

  function gegnerEinfaerben(txt, hell, dunkel){
    return txt.replace(/<linearGradient id="g(?:Decke|Fahne)"[\s\S]*?<\/linearGradient>/g, block => {
      let n = 0;
      return block.replace(/stop-color="#[0-9a-fA-F]{3,8}"/g,
                           () => 'stop-color="' + (n++ ? dunkel : hell) + '"');
    });
  }
  function gegnerBildSetzen(){
    const i = Math.min(t.gegner, TURNIER_GEGNER.length-1);
    if(!gegnerSvg || gegnerGezeigt === i) return;
    const g = TURNIER_GEGNER[i];
    const url = URL.createObjectURL(
      new Blob([gegnerEinfaerben(gegnerSvg, g.hell, g.dunkel)], {type:"image/svg+xml"}));
    $("t-gegner-ritter").src = url;
    /* Immer nur eine Fassung im Speicher: die Datei ist mehrere hundert KB. */
    if(gegnerBlob) URL.revokeObjectURL(gegnerBlob);
    gegnerBlob = url;
    gegnerGezeigt = i;
  }
  function gegnerBildLaden(){
    if(gegnerSvg || gegnerLaeuft) return;
    gegnerLaeuft = true;
    fetch(GEGNER_BILD)
      .then(r => r.ok ? r.text() : Promise.reject(new Error(r.status)))
      .then(txt => { gegnerSvg = txt; gegnerBildSetzen(); })
      .catch(() => { gegnerLaeuft = false; });
  }

  function tZeichnen(){
    const k = kontoAktuell();
    const g = TURNIER_GEGNER[Math.min(t.gegner,TURNIER_GEGNER.length-1)];
    $("t-name-ich").textContent    = (k && k.name) || tr("t.dein.ritter");
    $("t-name-gegner").textContent = tGegnerName();
    /* Das Namensschild trägt dieselbe Farbe – bei 60 Pixel Rittergröße ist das
       der schnellere Hinweis als die Fahne selbst. */
    $("t-name-gegner").style.color = g.hell;
    gegnerBildSetzen();
    $("t-treffer-ich").textContent    = "⚔".repeat(t.richtig);
    $("t-treffer-gegner").textContent = "⚔".repeat(t.falsch);
    $("t-ritt").textContent = tr("t.ritt", { n: t.richtig+t.falsch, m: TURNIER_RITTE });
  }
  function tRittWeg(){
    /* Halbe Bühne minus Ritterbreite: die beiden stehen sich in der Mitte
       gegenüber statt sich zu überlappen. Die 10 px Zugabe lassen die
       Lanzenspitzen sich kreuzen. Wird vor jedem Ritt neu gerechnet, damit
       Drehen des Geräts ohne resize-Listener stimmt. */
    const b = $("turnier-buehne"), r = $("t-ich");
    if(!b || !r) return 0;
    return Math.max(0, Math.round(b.clientWidth/2 - r.offsetWidth + 10));
  }
  /* Ein Anritt. "getroffen" ist "gegner" oder "ich"; beim letzten Ritt (finale)
     bleiben die Ritter in der Mitte stehen, damit der Verlierer dort stürzt. */
  function tRitt(getroffen, finale){
    const b = $("turnier-buehne");
    const ich = $("t-platz-ich"), geg = $("t-platz-gegner");
    b.style.setProperty("--ritt-weg", tRittWeg()+"px");
    if(finale){
      ich.classList.add("reitet-finale");
      geg.classList.add("reitet-finale");
    } else {
      bewege(ich,"reitet",RITT_GESAMT);
      bewege(geg,"reitet",RITT_GESAMT);
    }
    setTimeout(()=>{
      const opfer = getroffen==="gegner" ? $("t-gegner-ritter") : $("t-ich");
      const stoss = getroffen==="gegner" ? $("t-ich") : $("t-gegner-ritter");
      bewege(stoss,"angriff",460);
      bewege(opfer,"getroffen",460);
      const e = $("t-effekt");
      e.textContent = getroffen==="gegner" ? "⚔️" : "🛡️";
      bewege(e,"schlag",750);
    }, RITT_HIN);
  }
  function tNeueAufgabe(){
    if(!t.wiederholen){
      t.aufgabe = neuAufgabe(tStufen(), t.letzte);
      t.letzte = t.aufgabe.text;
    }
    t.wiederholen = false;
    zeigeAufgabe("t-aufgabe",t.aufgabe);
    sagen("t-rueckmeldung", tr("frage.zahl"), "");
    $("t-tipp").classList.remove("is-offen");
    bauePunkte("t-punkte",t.aufgabe);
    t.gesperrt = false;
    freigeben("t-zahlen");
    tKopf();
  }
  function tKampf(){
    const gewonnen = t.richtig >= t.falsch;   /* Gleichstand zählt für den Spieler */
    t.gewonnen = gewonnen;
    if(gewonnen){
      const g = TURNIER_GEGNER[Math.min(t.gegner,TURNIER_GEGNER.length-1)];
      const beute = goldDazu(g.beute);
      t.beute += beute;
      kSieg();
      tRitt("gegner",true);
      setTimeout(()=> funken("t-funken","⭐",14), RITT_HIN);
      setTimeout(()=> $("t-gegner-ritter").classList.add("faellt"), RITT_HIN+160);
      setTimeout(()=>{
        t.gegner++;
        if(t.gegner >= TURNIER_GEGNER.length){
          setTimeout(()=> tTurnierSieg(beute), 700);
          return;
        }
        $("t-erg-emoji").textContent = "⚔️";
        $("t-erg-titel").textContent = tr("t.aus.sattel", { name: tr(g.nameKey) });
        $("t-erg-text").textContent = tr("t.weiter.gegen", { n: t.richtig, name: tGegnerName() });
        $("t-erg-gold").textContent = "🪙 "+tr("gold.plus", { n: beute });
        $("ov-turnier").classList.add("is-offen");
      },RITT_HIN+680);
    } else {
      kAus();
      tRitt("ich",true);
      setTimeout(()=> funken("t-funken","💥",12), RITT_HIN);
      setTimeout(()=> $("t-ich").classList.add("faellt"), RITT_HIN+160);
      setTimeout(()=>{
        $("t-erg-emoji").textContent = "🛡️";
        $("t-erg-titel").textContent = tr("t.staerker", { name: tGegnerName() });
        $("t-erg-text").textContent = tr("t.verloren", { n: t.richtig, m: t.falsch });
        $("t-erg-gold").textContent = "";
        $("ov-turnier").classList.add("is-offen");
      },RITT_HIN+680);
    }
  }
  function tTurnierSieg(beute){
    kSieg();
    $("t-erg-emoji").textContent = "🏆";
    $("t-erg-titel").textContent = tr("t.sieg");
    $("t-erg-text").textContent = tr("t.sieg.text", { n: t.richtig, b: t.beste });
    $("t-erg-gold").textContent = "🪙 "+tr("gold.plus", { n: beute });
    $("ov-turnier").classList.add("is-offen");
  }
  function tAntwort(wert,knopf){
    if(t.gesperrt) return;
    t.gesperrt = true; sperren("t-zahlen");

    if(wert===t.aufgabe.antwort){
      knopf.classList.add("richtig");
      t.richtig++; t.serie++; t.beste = Math.max(t.beste,t.serie);
      problemGeloest();
      const mult = multiplikator(t.serie);
      const gewinn = goldDazu(GRUNDGOLD*mult);
      t.beute += gewinn;
      kRichtig(); kMuenze();
      sagen("t-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      const letzter = (t.richtig+t.falsch) >= TURNIER_RITTE;
      /* Beim letzten Ritt übernimmt tKampf() das Anreiten – die Münzen fliegen
         dann schon in der kurzen Pause davor. */
      if(letzter){
        funken("t-gold-funken","🪙",mult*4);
      } else {
        tRitt("gegner");
        setTimeout(()=> funken("t-gold-funken","🪙",mult*4), RITT_HIN);
      }
      tZeichnen();
      tKopf();
      setTimeout(()=>{ letzter ? tKampf() : tNeueAufgabe(); }, letzter ? 400 : RITT_GESAMT+160);
    } else {
      knopf.classList.add("falsch");
      zeigeLoesung("t-zahlen",t.aufgabe.antwort);
      t.falsch++; t.serie = 0;
      const weg = goldWeg();
      kFalsch();
      if((t.richtig+t.falsch) < TURNIER_RITTE) tRitt("ich");
      sagen("t-rueckmeldung", weg
        ? tr("t.daneben.gold", { loesung: t.aufgabe.loesung, n: weg })
        : tr("t.daneben", { loesung: t.aufgabe.loesung }), "schlecht");
      $("t-tipp").classList.add("is-offen");
      t.wiederholen = true;
      tZeichnen();
      tKopf();
      setTimeout(()=>{
        (t.richtig+t.falsch) >= TURNIER_RITTE ? tKampf() : tNeueAufgabe();
      },2600);
    }
  }
  /* Beide Ritter zurück an ihr Ende – Sturz und laufende Ritte aufräumen. */
  function tBuehneZuruecksetzen(){
    $("t-gegner-ritter").classList.remove("faellt");
    $("t-ich").classList.remove("faellt");
    ["t-platz-ich","t-platz-gegner"].forEach(id =>
      $(id).classList.remove("reitet","reitet-finale"));
  }
  function tStart(){
    t.gegner=0; t.richtig=0; t.falsch=0; t.serie=0; t.beste=0;
    t.beute=0; t.letzte=""; t.wiederholen=false; t.gewonnen=false;
    tBuehneZuruecksetzen();
    baueZahlen("t-zahlen",tAntwort);
    zeigeScreen("screen-turnier");
    gegnerBildLaden();
    tZeichnen();
    tNeueAufgabe();
  }
  /* Nächster Gegner (nach Sieg): Gegner-Index bleibt, nur die Runde wird neu gesetzt. */
  function tNaechsterGegner(){
    t.richtig=0; t.falsch=0; t.serie=0; t.letzte=""; t.wiederholen=false;
    tBuehneZuruecksetzen();
    tZeichnen();
    tNeueAufgabe();
  }
  function tWeiter(){
    $("ov-turnier").classList.remove("is-offen");
    if(t.gewonnen && t.gegner < TURNIER_GEGNER.length) tNaechsterGegner();
    else tStart();
  }

  /* ================= SPIEL 8: DRACHENTURM =================
     Verdoppeln und Halbieren – aber nie mit diesen Wörtern. Hoch geht es mit
     ganz normalen Plusaufgaben (8 + 8 = ?), runter mit Platzhaltern, bei denen
     BEIDE Lücken dieselbe Zahl sind (? + ? = 16). Stünde links schon die 8,
     würde das Kind sie nur abschreiben statt zu halbieren.

     Jeder Turm ist gleich hoch. Solange die Verdopplung im Zahlenraum bleibt,
     baut die Leiter sich selbst weiter: 3 → 6 → 12. Ist oben kein Platz mehr,
     wird mit einer anderen zufälligen Verdopplung aufgefüllt. Ohne das Auffüllen
     wäre ein Turm mit der 7 nach einer einzigen Stufe zu Ende (14, und 28 liegt
     schon über 20) – kurz, langweilig und viel zu leicht. */
  const TURM_ANZAHL = 3;
  /* Sprossen je Turm, also TURM_SPROSSEN-1 Aufgaben hinauf und ebenso viele
     hinunter. Höher zu bauen geht durchaus – bis 10 trägt die Leiter
     1·2·4·6·8·10 –, aber mit jeder Sprosse fällt eine Startzahl weg: bis 10
     bleiben bei vier Sprossen noch 1, 2 und 3, bei fünf nur noch 1 und 2.
     Vier ist der Punkt, an dem für jeden der drei Türme noch eine eigene
     Startzahl da ist. */
  const TURM_SPROSSEN = 4;
  const TURM_GIPFEL_GOLD = 25, TURM_UNTEN_GOLD = 50, TURM_UNTEN_SILBER = 25;
  /* Nach so vielen Fehlern auf derselben Sprosse geht es ohne Abrutschen weiter –
     damit niemand zwischen zwei Sprossen hin- und herpendelt. */
  const TURM_FEHLER_HALT = 3;

  const turm = { turmNr:0, starts:[], leiter:[], schritte:[], sprosse:0, richtung:"hoch",
                 richtig:0, falsch:0, serie:0, beste:0,
                 fehlerImTurm:false, fehlerHier:0, gesperrt:false, neueFarbe:-1 };

  /* Die Leiter zerfällt in zwei Listen, weil sie nach dem Auffüllen keine reine
     Verdopplungskette mehr ist:
       leiter   – die Zahlen auf den Sprossen (Startzahl, dann jedes Ergebnis)
       schritte – der Summand der Aufgabe je Stufe, schritte[i]+schritte[i]=leiter[i+1]
     Trägt die Leiter sich selbst weiter, ist schritte[i] genau leiter[i]. */
  function turmLeiter(start){
    const leiter = [start], schritte = [];

    /* Summanden, mit denen es von der Sprosse n aus weitergehen kann: Das
       Ergebnis muss über n liegen (die Leiter soll steigen) und im Zahlenraum
       bleiben. Ein aufgefüllter Summand darf außerdem nicht schon als
       Sprossenzahl dastehen – beim Abstieg wäre die gesuchte Zahl sonst von
       der Leiter abzulesen (Leiter 5·10·18·20 fragt "? + ? = 20", und die 10
       stünde zwei Sprossen tiefer). Trägt die Leiter selbst weiter, hat das
       Vorrang, der Rest kommt in zufälliger Reihenfolge. */
    function moeglich(n){
      const rest = [];
      let kette = false;
      for(let k=1; k*2 <= opt.max; k++){
        if(k*2 <= n) continue;
        if(k === n) kette = true;
        else if(leiter.indexOf(k) < 0) rest.push(k);
      }
      for(let i=rest.length-1; i>0; i--){
        const j = zufall(0,i); const h = rest[i]; rest[i] = rest[j]; rest[j] = h;
      }
      return kette ? [n].concat(rest) : rest;
    }

    /* Mit Rücknahme, weil ein zu gieriger Schritt den Turm zu kurz enden ließe:
       von der 20 aus geht es nicht weiter, und wer dort zu früh landet, käme
       nie auf die volle Höhe. */
    function bauen(n){
      if(schritte.length === TURM_SPROSSEN-1) return true;
      /* Die erste Stufe ist immer die Startzahl selbst. Ohne das findet die
         Suche auch Leitern wie 9·12·14·16 – der Ritter stünde dann auf einer
         9, die in keiner einzigen Aufgabe des Turms vorkommt. */
      const kandidaten = schritte.length === 0
        ? (start*2 <= opt.max ? [start] : [])
        : moeglich(n);
      for(let i=0; i<kandidaten.length; i++){
        const k = kandidaten[i];
        schritte.push(k); leiter.push(k*2);
        if(bauen(k*2)) return true;
        schritte.pop(); leiter.pop();
      }
      return false;
    }
    bauen(start);
    return { leiter, schritte };
  }
  /* Mögliche Startzahlen sind die, von denen aus der Turm seine volle Höhe
     erreicht. Das wird ausprobiert statt ausgerechnet: turmLeiter() sucht mit
     Rücknahme, findet also jede Leiter, die es gibt – eine Formel müsste die
     Sperre für schon vergebene Zahlen mitrechnen. */
  function turmStartsMoeglich(){
    const aus = [];
    for(let s=1; s*2 <= opt.max; s++)
      if(turmLeiter(s).schritte.length === TURM_SPROSSEN-1) aus.push(s);
    return aus;
  }
  function turmZiehe(arr,n){
    const rest = arr.slice(), aus = [];
    while(aus.length<n && rest.length) aus.push(rest.splice(zufall(0,rest.length-1),1)[0]);
    /* Weniger mögliche Starts als Türme: dann darf sich einer wiederholen. */
    while(aus.length<n) aus.push(waehle(arr));
    return aus;
  }

  function turmKopf(){
    const mult = multiplikator(turm.serie);
    $("turm-serie-wert").textContent = "×"+mult;
    $("turm-serie").classList.toggle("aus", mult===1);
    $("turm-runden").textContent = Math.min(turm.turmNr+1,TURM_ANZAHL)+"/"+TURM_ANZAHL;
    schatzZeichnen();
  }

  /* Alle Türme haben gleich viele Sprossen und sind gleich hoch gezeichnet.
     Auf den Sprossen stehen die Zahlen, die schon erklommen sind – bei einer
     aufgefüllten Stufe ist die Aufgabe darüber nicht die Verdopplung der
     Sprosse, auf der der Ritter steht. Die Leiter bleibt trotzdem aufsteigend,
     dafür sorgt die Bedingung k*2 > n in turmLeiter(). */
  /* Die Sprosse, in die die Antwort gehört – die, auf der das ? golden pulst.
     Hinauf ist das die Sprosse über dem Ritter. Hinunter füllen sich die
     Sprossen von unten auf, weil der Abstieg vorne anfängt (siehe turmAktuell);
     die unterste noch offene ist das Ziel. Am Gipfel und ganz unten liegt das
     Ziel außerhalb der Leiter: dann steht alles offen da und nichts pulst.

     Alles unterhalb des Ziels ist ausgerechnet und wird angezeigt, alles ab dem
     Ziel bleibt ?. Damit ist die Antwort der laufenden Aufgabe nie auf der
     Leiter abzulesen – beim Abstieg wäre sie das sonst, denn dort ist die
     gesuchte Zahl genau die Sprosse unter der aus der Aufgabe. */
  function turmZielSprosse(){
    if(turm.richtung==="hoch") return turm.sprosse+1;
    return turm.sprosse===0 ? turm.leiter.length
                            : turm.leiter.length-1-turm.sprosse;
  }

  function turmZeichnen(){
    const box = $("turm-leiter");
    const ziel = turmZielSprosse();
    box.innerHTML = "";
    for(let i=turm.leiter.length-1; i>=0; i--){
      const el = document.createElement("div");
      el.className = "turm-sprosse";
      const bekannt = i < ziel;
      if(i===ziel) el.classList.add("aktiv");
      if(!bekannt) el.classList.add("verdeckt");
      const zahl = document.createElement("span");
      zahl.className = "turm-zahl";
      zahl.textContent = bekannt ? turm.leiter[i] : "?";
      el.appendChild(zahl);
      /* Der Ritter steht auf der Sprosse, die gerade dran ist. Beim Aufstieg
         ist das die unter dem goldenen ? – er greift von dort nach oben. Beim
         Abstieg läuft er von oben herunter, während sich die Leiter von unten
         auffüllt: Die Halbierungsaufgaben fangen vorne an, nicht bei der
         zuletzt erklommenen Sprosse (siehe turmAktuell). */
      if(i===turm.sprosse){
        const ritter = document.createElement("img");
        ritter.className = "turm-ritter";
        ritter.src = "images/ritter-leiter.svg?v=2";
        ritter.alt = "";
        el.appendChild(ritter);
      }
      if(i===turm.leiter.length-1){
        const schatz = document.createElement("span");
        schatz.className = "turm-schatz";
        schatz.textContent = turm.richtung==="runter" ? "🥈" : "💰";
        el.appendChild(schatz);
      }
      box.appendChild(el);
    }
  }

  function turmAktuell(){
    /* Gibt die Aufgabe der aktuellen Sprosse zurück: hoch wird verdoppelt,
       runter halbiert (als zwei gleiche Summanden getarnt). */
    const i = turm.sprosse;
    if(turm.richtung==="hoch"){
      const n = turm.schritte[i];
      return { n:n, antwort:turm.leiter[i+1], hoch:true,
               loesung: n+" + "+n+" = "+turm.leiter[i+1] };
    }
    /* Abstieg in Vorwärts-Reihenfolge: zuerst die erste Sprosse halbieren,
       nicht die zuletzt erklommene – sonst wäre es nur die Umkehrung der
       letzten Aufgabe. Die Ritterposition ist davon entkoppelt. */
    const k = turm.leiter.length-1;
    const j = k - i + 1;
    const n = turm.schritte[j-1];
    return { n:n, antwort:n, hoch:false,
             loesung: turm.leiter[j]+" = "+n+" + "+n };
  }
  function turmAufgabeZeigen(a){
    /* zeigeAufgabe() kennt die Form "? + ? = 16" nicht; die vier bestehenden
       Spiele sollen dafür nicht angefasst werden. */
    $("turm-aufgabe").innerHTML = a.hoch
      ? a.n+" + "+a.n+' = <span class="luecke">?</span>'
      : '<span class="luecke">?</span> + <span class="luecke">?</span> = '+(a.n*2);
    bauePunkte("turm-punkte", fertig(a.n,a.n,"+",false));
  }
  function turmNeueAufgabe(){
    const a = turmAktuell();
    turmAufgabeZeigen(a);
    sagen("turm-rueckmeldung", tr(a.hoch ? "turm.frage.hoch" : "turm.frage.runter"), "");
    $("turm-tipp").classList.remove("is-offen");
    turmZeichnen();
    turmKopf();
    turm.gesperrt = false;
    freigeben("turm-zahlen");
  }

  function turmNeuerTurm(){
    const gebaut = turmLeiter(turm.starts[turm.turmNr]);
    turm.leiter = gebaut.leiter;
    turm.schritte = gebaut.schritte;
    turm.sprosse = 0;
    turm.richtung = "hoch";
    turm.fehlerImTurm = false;
    turm.fehlerHier = 0;
    turmNeueAufgabe();
  }

  function turmGipfel(){
    kSieg();
    turm.richtung = "runter";
    turm.fehlerHier = 0;
    goldDazu(TURM_GIPFEL_GOLD);
    /* Die gerade gelöste Aufgabe ausgeschrieben stehen lassen, statt die alte
       Lücke – sonst klebt während der Gipfelpause eine Frage auf der Tafel,
       die schon beantwortet ist. */
    const oben = turm.leiter[turm.leiter.length-1],
          drunter = turm.schritte[turm.schritte.length-1];
    $("turm-aufgabe").textContent = drunter+" + "+drunter+" = "+oben;
    turmZeichnen();
    sagen("turm-rueckmeldung", tr("turm.gipfel"), "gut");
    funken("turm-funken","🥈",14);
    setTimeout(turmNeueAufgabe, 1400);
  }

  function turmFertig(){
    const gold = !turm.fehlerImTurm;
    kSieg();
    goldDazu(gold ? TURM_UNTEN_GOLD : TURM_UNTEN_SILBER);
    if(gold){
      /* Fehlerfreier Turm schaltet die nächste Drachenfarbe frei. */
      if(hoehle.goldTuerme < DRACHEN_FARBEN.length-1) turm.neueFarbe = hoehle.goldTuerme+1;
      hoehle.goldTuerme++;
      hoehleSichern();
    }
    sagen("turm-rueckmeldung", tr(gold ? "turm.unten.gold" : "turm.unten.silber"), "gut");
    funken("turm-funken", gold ? "🥇" : "🥈", 16);
    turm.turmNr++;
    setTimeout(()=>{
      if(turm.turmNr >= TURM_ANZAHL) turmZiel();
      else turmNeuerTurm();
    }, 1500);
  }

  function turmZiel(){
    kSieg();
    goldDazu(100);
    $("turm-ziel-text").textContent =
      trp("turm.ziel.basis", turm.richtig, { b: turm.beste }) + " " +
      (turm.falsch===0 ? tr("h.ziel.sauber") : tr("h.weiterso"));
    const frei = $("turm-farbe-frei");
    if(turm.neueFarbe >= 0){
      frei.hidden = false;
      frei.textContent = tr("turm.farbe.frei", { name: tr(DRACHEN_FARBEN[turm.neueFarbe].nameKey) });
    }else{
      frei.hidden = true;
    }
    $("ov-turm").classList.add("is-offen");
    turmKopf();
  }

  function turmAntwort(wert,knopf){
    if(turm.gesperrt) return;
    turm.gesperrt = true; sperren("turm-zahlen");
    const a = turmAktuell();

    if(wert===a.antwort){
      knopf.classList.add("richtig");
      turm.richtig++; turm.serie++; turm.beste = Math.max(turm.beste,turm.serie);
      turm.fehlerHier = 0;
      problemGeloest();
      const gewinn = goldDazu(GRUNDGOLD*multiplikator(turm.serie));
      kRichtig(); kMuenze();
      sagen("turm-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      funken("turm-funken","🪙",multiplikator(turm.serie)*4);

      if(turm.richtung==="hoch") turm.sprosse++;
      else turm.sprosse--;
      turmZeichnen();
      turmKopf();

      const oben   = turm.richtung==="hoch"   && turm.sprosse===turm.leiter.length-1;
      const unten  = turm.richtung==="runter" && turm.sprosse===0;
      setTimeout(()=>{ oben ? turmGipfel() : unten ? turmFertig() : turmNeueAufgabe(); }, 1050);

    }else{
      knopf.classList.add("falsch");
      zeigeLoesung("turm-zahlen", a.antwort);
      turm.falsch++; turm.serie = 0;
      turm.fehlerImTurm = true;
      turm.fehlerHier++;
      const weg = goldWeg();
      kFalsch();
      $("turm-tipp").classList.add("is-offen");

      /* Abrutschen: beim Aufstieg eine Sprosse runter, beim Abstieg wieder hoch.
         Ganz unten bzw. ganz oben gibt es kein Zurück, und nach drei Fehlern auf
         derselben Sprosse bleibt der Ritter stehen. */
      const halt = turm.fehlerHier >= TURM_FEHLER_HALT;
      let gerutscht = false;
      if(!halt){
        if(turm.richtung==="hoch" && turm.sprosse>0){ turm.sprosse--; gerutscht = true; }
        else if(turm.richtung==="runter" && turm.sprosse<turm.leiter.length-1){ turm.sprosse++; gerutscht = true; }
      }
      sagen("turm-rueckmeldung", gerutscht
        ? (weg ? tr("turm.abgerutscht.gold", { loesung:a.loesung, n:weg })
               : tr("turm.abgerutscht", { loesung:a.loesung }))
        : tr("turm.halt", { loesung:a.loesung }), "schlecht");
      if(gerutscht){
        const box = $("turm-leiter");
        bewege(box,"rutscht",520);
      }
      turmZeichnen();
      turmKopf();
      setTimeout(turmNeueAufgabe, 2400);
    }
  }

  function turmStart(){
    turm.turmNr=0; turm.richtig=0; turm.falsch=0; turm.serie=0; turm.beste=0;
    turm.neueFarbe=-1;
    turm.starts = turmZiehe(turmStartsMoeglich(), TURM_ANZAHL);
    baueZahlen("turm-zahlen", turmAntwort);
    zeigeScreen("screen-turm");
    turmNeuerTurm();
  }
  function turmWeiter(){
    $("ov-turm").classList.remove("is-offen");
    turmStart();
  }

  /* ================= SPIEL 9: UHRTURM =================
     Uhrzeit lesen nach dem Lehrplan der 1. Klasse Volksschule: volle und
     halbe Stunden. Viertelstunden gibt es nur als freiwillige Bonusrunde,
     sie gehören erst in die 2. Klasse.

     Die Sprachfalle: "halb 4" ist 3:30 – aber nur im Deutschen wird dabei die
     NÄCHSTE Stunde genannt. Englisch ("half past three"), Spanisch ("3 y
     media"), Französisch und Türkisch nennen die aktuelle. Dieselbe Uhr hat
     also je nach Sprache eine andere richtige Antwort; welche gilt, steht in
     uhr.halb.bezug. Bei "viertel vor" ist es in allen fünf Sprachen die
     nächste Stunde, da braucht es keine Fallunterscheidung.

     Zwei Aufgabenarten, beide antippbar – ein Sechsjähriger soll keine Zeiger
     ziehen müssen:
       ablesen   – die Turmuhr zeigt eine Zeit, auf der Tafel steht der Rahmen
                   mit einer Lücke ("halb ▢"), getippt wird die Zahl.
       zuordnen  – auf der Tafel steht die Zeit in Worten, darunter stehen drei
                   Uhren zur Wahl. Das ist das "Einstellen" des Lehrplans. */
  const UHR_RUNDEN = 3;          /* Runden im Hauptteil */
  const UHR_JE_RUNDE = 4;        /* Aufgaben je Runde */
  const UHR_BONUS_AUFGABEN = 4;
  const UHR_ZIEL_GOLD = 100, UHR_BONUS_GOLD = 60;
  const UHR_WAHL = 3;            /* Uhren zur Auswahl beim Zuordnen */

  const uhr = { gestellt:0, richtig:0, falsch:0, serie:0, beste:0,
                zeit:null, art:"ablesen", wahl:[], gesperrt:false,
                bonus:false, bonusGeschafft:false, bonusRichtig:0 };

  const uhrNaechste = h => h===12 ? 1 : h+1;
  const uhrVorige   = h => h===1  ? 12 : h-1;

  /* Welcher Satz gehört zu welcher Minutenstellung. */
  function uhrForm(z){
    return z.m===0  ? "uhr.form.voll"
         : z.m===30 ? "uhr.form.halb"
         : z.m===15 ? "uhr.form.viertelnach"
                    : "uhr.form.viertelvor";
  }
  /* Die Zahl, die im Satz genannt wird – und damit die richtige Antwort. */
  function uhrZahl(z){
    if(z.m===0 || z.m===15) return z.h;
    if(z.m===45) return uhrNaechste(z.h);
    return tr("uhr.halb.bezug")==="naechste" ? uhrNaechste(z.h) : z.h;
  }
  const uhrSatz = z => tr(uhrForm(z), { n: uhrZahl(z) });

  /* Zeigerwinkel. Der kleine Zeiger steht bei 3:30 NICHT auf der 3, sondern
     auf halbem Weg zur 4 – genau daran liest ein Kind ab, dass es fast vier
     ist. Ohne den halben Grad je Minute wäre die Uhr didaktisch falsch. */
  const uhrStdWinkel = z => (z.h % 12) * 30 + z.m * 0.5;
  const uhrMinWinkel = z => z.m * 6;

  /* Zifferblatt als SVG. Wird auch für die drei Wahluhren benutzt. */
  function uhrBlattHTML(){
    let t = '<svg class="uhr-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
    t += '<circle class="uhr-rand" cx="50" cy="50" r="46"/>';
    for(let i=0;i<12;i++){
      const w = i*30, r = Math.PI*w/180;
      const x = 50+Math.sin(r), y = 50-Math.cos(r);
      t += '<line class="uhr-strich" x1="'+(50+42*Math.sin(r)).toFixed(1)+'" y1="'+(50-42*Math.cos(r)).toFixed(1)+
           '" x2="'+(50+37*Math.sin(r)).toFixed(1)+'" y2="'+(50-37*Math.cos(r)).toFixed(1)+'"/>';
    }
    for(let i=1;i<=12;i++){
      const r = Math.PI*i*30/180;
      t += '<text class="uhr-zahl-svg" x="'+(50+30*Math.sin(r)).toFixed(1)+
           '" y="'+(50-30*Math.cos(r)+4).toFixed(1)+'">'+i+'</text>';
    }
    t += '<line class="uhr-zeiger uhr-zeiger--std" x1="50" y1="54" x2="50" y2="28"/>';
    t += '<line class="uhr-zeiger uhr-zeiger--min" x1="50" y1="56" x2="50" y2="15"/>';
    t += '<circle class="uhr-mitte" cx="50" cy="50" r="3.4"/></svg>';
    return t;
  }
  function uhrZeigerSetzen(el,z){
    el.style.setProperty("--std", uhrStdWinkel(z)+"deg");
    el.style.setProperty("--min", uhrMinWinkel(z)+"deg");
  }

  /* Minuten, die in der laufenden Runde vorkommen dürfen. */
  function uhrMinuten(){
    if(uhr.bonus) return [15,45];
    return uhr.gestellt < UHR_JE_RUNDE ? [0] : [0,30];
  }
  function uhrRunde(){ return Math.min(UHR_RUNDEN, Math.floor(uhr.gestellt/UHR_JE_RUNDE)+1); }

  function uhrZiehen(){
    return { h: zufall(1,12), m: waehle(uhrMinuten()) };
  }
  /* Ablenker für das Zuordnen: die echten Verwechslungen – dieselbe Stunde mit
     anderer Zeigerstellung und die Nachbarstunden. */
  function uhrAblenker(z,n){
    const kand = [];
    for(const h of [z.h, uhrNaechste(z.h), uhrVorige(z.h)])
      for(const m of (uhr.bonus ? [0,15,30,45] : [0,30]))
        if(!(h===z.h && m===z.m)) kand.push({h:h,m:m});
    const aus = [];
    while(aus.length<n && kand.length){
      const k = kand.splice(zufall(0,kand.length-1),1)[0];
      if(!aus.some(a => a.h===k.h && a.m===k.m)) aus.push(k);
    }
    return aus;
  }

  function uhrKopf(){
    const mult = multiplikator(uhr.serie);
    $("uhr-serie-wert").textContent = "×"+mult;
    $("uhr-serie").classList.toggle("aus", mult===1);
    $("uhr-runden").textContent = uhr.bonus ? "★" : uhrRunde()+"/"+UHR_RUNDEN;
    schatzZeichnen();
  }
  function uhrFensterZeichnen(){
    const box = $("uhr-fenster");
    box.innerHTML = "";
    for(let i=0;i<UHR_RUNDEN;i++){
      const f = document.createElement("i");
      f.className = "uhr-licht" + ((uhr.bonus || i < Math.floor(uhr.gestellt/UHR_JE_RUNDE)) ? " an" : "");
      box.appendChild(f);
    }
  }

  function uhrTipptext(){
    const z = uhr.zeit;
    return tr(z.m===0 ? "uhr.tipp.voll" : z.m===30 ? "uhr.tipp.halb" : "uhr.tipp.viertel");
  }

  function uhrAufgabeZeigen(){
    const z = uhr.zeit;
    const blatt = $("uhr-blatt");
    const luecke = '<span class="luecke">?</span>';
    if(uhr.art==="ablesen"){
      blatt.classList.remove("ohne-zeiger");
      uhrZeigerSetzen(blatt.firstChild, z);
      $("uhr-aufgabe").innerHTML = tr(uhrForm(z), { n: luecke });
      $("uhr-zahlen").hidden = false;
      $("uhr-wahl").hidden = true;
    }else{
      /* Beim Zuordnen verliert die Turmuhr ihre Zeiger – die Antwort stünde
         sonst oben schon da. Das Zifferblatt bleibt stehen, sonst klaffte im
         Turm ein leerer Kasten, und es passt zur Geschichte: Die Uhr ist
         kaputt, das Kind sagt ihr, wie spät es ist. Nach der richtigen Antwort
         bekommt sie die Zeiger zurück. */
      blatt.classList.add("ohne-zeiger");
      $("uhr-aufgabe").textContent = uhrSatz(z);
      $("uhr-zahlen").hidden = true;
      $("uhr-wahl").hidden = false;
      uhrWahlZeichnen();
    }
    $("uhr-tipptext").textContent = uhrTipptext();
    sagen("uhr-rueckmeldung", tr(uhr.art==="ablesen" ? "uhr.frage.ablesen" : "uhr.frage.zuordnen"), "");
    $("uhr-tipp").classList.remove("is-offen");
  }

  function uhrWahlZeichnen(){
    const box = $("uhr-wahl");
    box.innerHTML = "";
    uhr.wahl.forEach((z,i) => {
      const b = document.createElement("button");
      b.className = "zahl uhr-karte"; b.type = "button";
      b.dataset.wert = i;
      b.setAttribute("aria-label", tr("aria.uhr.wahl", { n:i+1 }));
      b.innerHTML = uhrBlattHTML();
      uhrZeigerSetzen(b.firstChild, z);
      b.addEventListener("click", ()=>uhrAntwort(i,b));
      box.appendChild(b);
    });
  }

  /* Die erste Runde ist reines Ablesen – erst muss das sitzen, und dort kommen
     ohnehin nur volle Stunden vor. Danach ist jede zweite Aufgabe eine
     Zuordnung, in der Bonusrunde die letzte. */
  function uhrArt(){
    if(uhr.bonus) return uhr.gestellt === UHR_BONUS_AUFGABEN-1 ? "zuordnen" : "ablesen";
    return (uhr.gestellt >= UHR_JE_RUNDE && uhr.gestellt % 2 === 1) ? "zuordnen" : "ablesen";
  }

  function uhrNeueAufgabe(){
    uhr.zeit = uhrZiehen();
    uhr.art = uhrArt();
    if(uhr.art==="zuordnen"){
      uhr.wahl = uhrAblenker(uhr.zeit, UHR_WAHL-1).concat([uhr.zeit]);
      for(let i=uhr.wahl.length-1;i>0;i--){
        const j = zufall(0,i), h = uhr.wahl[i]; uhr.wahl[i] = uhr.wahl[j]; uhr.wahl[j] = h;
      }
    }
    uhrAufgabeZeigen();
    uhrFensterZeichnen();
    uhrKopf();
    uhr.gesperrt = false;
    freigeben("uhr-zahlen"); freigeben("uhr-wahl");
  }

  function uhrRichtigeAntwort(){
    if(uhr.art==="ablesen") return uhrZahl(uhr.zeit);
    return uhr.wahl.findIndex(z => z.h===uhr.zeit.h && z.m===uhr.zeit.m);
  }

  function uhrFertig(){
    const bonusReif = !uhr.bonus && !uhr.bonusGeschafft;
    kSieg();
    goldDazu(uhr.bonus ? UHR_BONUS_GOLD : UHR_ZIEL_GOLD);
    $("uhr-ziel-text").textContent =
      trp("uhr.ziel.basis", uhr.richtig, { b: uhr.beste }) + " " +
      (uhr.falsch===0 ? tr("h.ziel.sauber") : tr("h.weiterso"));
    $("btn-uhr-bonus").hidden = !bonusReif;
    $("ov-uhr").classList.add("is-offen");
    uhrKopf();
  }

  function uhrAntwort(wert,knopf){
    if(uhr.gesperrt) return;
    uhr.gesperrt = true;
    const feld = uhr.art==="ablesen" ? "uhr-zahlen" : "uhr-wahl";
    sperren(feld);
    const richtig = uhrRichtigeAntwort();
    uhr.gestellt++;

    if(wert===richtig){
      knopf.classList.add("richtig");
      uhr.richtig++; uhr.serie++; uhr.beste = Math.max(uhr.beste,uhr.serie);
      problemGeloest();
      const gewinn = goldDazu(GRUNDGOLD*multiplikator(uhr.serie));
      kRichtig(); kMuenze();
      sagen("uhr-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      funken("uhr-funken","🪙",multiplikator(uhr.serie)*4);
      if(uhr.art==="zuordnen"){
        uhrZeigerSetzen($("uhr-blatt").firstChild, uhr.zeit);
        $("uhr-blatt").classList.remove("ohne-zeiger");
      }
    }else{
      knopf.classList.add("falsch");
      zeigeLoesung(feld, richtig);
      uhr.falsch++; uhr.serie = 0;
      const weg = goldWeg();
      kFalsch();
      $("uhr-tipp").classList.add("is-offen");
      sagen("uhr-rueckmeldung",
            weg ? tr("uhr.falsch.gold", { zeit: uhrSatz(uhr.zeit), n: weg })
                : tr("uhr.falsch",      { zeit: uhrSatz(uhr.zeit) }),
            "schlecht");
    }

    /* Rundenwechsel: die Glocke läutet und ein Fenster geht an. */
    const rundeVoll = !uhr.bonus && uhr.gestellt % UHR_JE_RUNDE === 0
                                 && uhr.gestellt < UHR_RUNDEN*UHR_JE_RUNDE;
    if(rundeVoll){
      uhrFensterZeichnen();
      bewege($("uhr-glocke"),"laeutet",900);
      setTimeout(()=> sagen("uhr-rueckmeldung", tr("uhr.glocke"), "gut"), 700);
      kSieg();
    }
    uhrKopf();

    const ende = uhr.gestellt >= (uhr.bonus ? UHR_BONUS_AUFGABEN : UHR_RUNDEN*UHR_JE_RUNDE);
    setTimeout(()=>{ ende ? uhrFertig() : uhrNeueAufgabe(); },
               wert===richtig ? (rundeVoll ? 1700 : 1050) : 2400);
  }

  function uhrZahlenfeld(){
    const feld = $("uhr-zahlen");
    feld.innerHTML = "";
    for(let i=1;i<=12;i++){
      const b = document.createElement("button");
      b.className = "zahl"; b.type = "button";
      b.textContent = i; b.dataset.wert = i;
      b.setAttribute("aria-label", tr("aria.antwort", { n:i }));
      b.addEventListener("click", ()=>uhrAntwort(i,b));
      feld.appendChild(b);
    }
  }

  function uhrStart(bonus){
    uhr.gestellt=0; uhr.richtig=0; uhr.falsch=0; uhr.serie=0; uhr.beste=0;
    uhr.bonus = !!bonus;
    if(!bonus) uhr.bonusGeschafft = false;
    $("uhr-blatt").innerHTML = uhrBlattHTML();
    uhrZahlenfeld();
    zeigeScreen("screen-uhr");
    if(bonus) sagen("uhr-rueckmeldung", tr("uhr.bonus.start"), "gut");
    uhrNeueAufgabe();
  }
  function uhrWeiter(){
    $("ov-uhr").classList.remove("is-offen");
    uhrStart(false);
  }
  function uhrBonusStarten(){
    $("ov-uhr").classList.remove("is-offen");
    uhr.bonusGeschafft = true;
    uhrStart(true);
  }

  /* ================= SPIEL 10: BURGWAAGE =================
     Mengen vergleichen – mehr, weniger, gleich viel. Kernstoff der 1. Klasse,
     und der einzige Bereich, in dem hier nicht gerechnet, sondern gezählt und
     verglichen wird.

     Die Antwort ist immer dieselbe Entscheidung: linke Seite, gleich viel oder
     rechte Seite. Nur die Beschriftung der drei Knöpfe wechselt – in den ersten
     beiden Runden Wörter, in der dritten die Zeichen > = <. Damit ist das
     Zeichen nichts Neues, sondern die Schreibweise für das, was das Kind schon
     entschieden hat; links steht > , weil links die größere Seite ist.

     Die Dinge auf den Schalen bleiben in allen Runden liegen. "Immer mit
     Ritter-Objekten" heißt auch in der Zeichenrunde: Unter jeder Schale steht
     zusätzlich die Anzahl als Ziffer, das ist die Brücke von der Menge zur
     Zahl. */
  const WAAGE_RUNDEN = 3, WAAGE_JE_RUNDE = 4;
  const WAAGE_ZIEL_GOLD = 100;
  /* Mehr als zwölf Bilder kann ein Kind auf einem Handy nicht mehr abzählen –
     und abzählen ist ja die Aufgabe. */
  const WAAGE_MAX = 12;
  const WAAGE_DINGE = ["🛡️","⚔️","🐴","🐑","👑","🍞","🏹","🔔","🗝️","🪙"];

  const waage = { gestellt:0, richtig:0, falsch:0, serie:0, beste:0,
                  links:0, rechts:0, ding:"🛡️", art:"mengen", gesperrt:false };

  /* Die dritte Runde schreibt den Vergleich mit Zeichen. */
  function waageArt(){
    return waage.gestellt >= (WAAGE_RUNDEN-1)*WAAGE_JE_RUNDE ? "zeichen" : "mengen";
  }
  function waageRunde(){
    return Math.min(WAAGE_RUNDEN, Math.floor(waage.gestellt/WAAGE_JE_RUNDE)+1);
  }
  const waageGrenze = () => Math.min(opt.max, WAAGE_MAX);
  const waageLoesung = () => waage.links > waage.rechts ? -1
                           : waage.links < waage.rechts ?  1 : 0;

  function waageZiehen(){
    const g = waageGrenze();
    waage.ding = waehle(WAAGE_DINGE);
    /* Jede vierte Aufgabe ist ein Gleichstand. Ohne feste Quote käme er bei
       kleinen Unterschieden fast nie vor – dabei ist er der Fall, den Kinder
       am häufigsten falsch beantworten. */
    if(zufall(1,4)===1){
      waage.links = waage.rechts = zufall(1,g);
      return;
    }
    /* Kleine Unterschiede sind die eigentliche Aufgabe: 3 gegen 11 sieht man
       ohne Zählen, 6 gegen 7 nicht. */
    const a = zufall(1,g);
    let b = a + zufall(1,3) * (zufall(0,1) ? 1 : -1);
    if(b < 1) b = a + zufall(1,3);
    if(b > g) b = a - zufall(1,3);
    if(b < 1 || b === a) b = a === g ? a-1 : a+1;
    waage.links = a; waage.rechts = b;
  }

  function waageSchaleFuellen(id, anzahl, ariaKey){
    const box = $(id);
    box.innerHTML = "";
    for(let i=0;i<anzahl;i++){
      const e = document.createElement("i");
      e.className = "waage-ding";
      e.textContent = waage.ding;
      box.appendChild(e);
    }
    box.setAttribute("aria-label", tr(ariaKey, { n: anzahl }));
  }

  function waageZeichnen(){
    const bild = $("waage-bild");
    bild.className = "waage";                       /* wieder waagrecht */
    waageSchaleFuellen("waage-links",  waage.links,  "aria.waage.links");
    waageSchaleFuellen("waage-rechts", waage.rechts, "aria.waage.rechts");
    const zeichen = waage.art==="zeichen";
    $("waage-zahl-links").hidden  = !zeichen;
    $("waage-zahl-rechts").hidden = !zeichen;
    $("waage-zahl-links").textContent  = waage.links;
    $("waage-zahl-rechts").textContent = waage.rechts;
    /* In der Zeichenrunde steht der Vergleich auch in der gewohnten
       Schreibweise auf der Tafel – die Ziffern unter den Schalen sind die
       Brücke von der Menge zur Zahl, die Tafel zeigt, wo das Zeichen hinkommt. */
    $("waage-aufgabe").hidden = !zeichen;
    if(zeichen)
      $("waage-aufgabe").innerHTML =
        waage.links + ' <span class="luecke">?</span> ' + waage.rechts;
  }

  function waageKopf(){
    const mult = multiplikator(waage.serie);
    $("waage-serie-wert").textContent = "×"+mult;
    $("waage-serie").classList.toggle("aus", mult===1);
    $("waage-runden").textContent = waageRunde()+"/"+WAAGE_RUNDEN;
    schatzZeichnen();
  }

  /* Dieselben drei Knöpfe für beide Aufgabenarten – nur die Aufschrift wechselt. */
  function waageAntwortfeld(){
    const box = $("waage-antwort");
    const zeichen = waage.art==="zeichen";
    box.innerHTML = "";
    box.classList.toggle("waage-antwort--zeichen", zeichen);
    [[-1,">","waage.links"],[0,"=","waage.gleich"],[1,"<","waage.rechts"]].forEach(([wert,sym,key])=>{
      const b = document.createElement("button");
      b.className = "zahl waage-knopf"; b.type = "button";
      b.dataset.wert = wert;
      b.innerHTML = zeichen
        ? '<span class="waage-sym">'+sym+'</span><span class="waage-wort">'+tr(key)+'</span>'
        : '<span class="waage-wort waage-wort--gross">'+tr(key)+'</span>';
      b.setAttribute("aria-label", tr(key));
      b.addEventListener("click", ()=>waageAntwort(wert,b));
      box.appendChild(b);
    });
  }

  function waageNeueAufgabe(){
    const vorher = waage.art;
    waage.art = waageArt();
    waageZiehen();
    waageZeichnen();
    waageAntwortfeld();
    waageKopf();
    sagen("waage-rueckmeldung",
          (waage.art==="zeichen" && vorher!=="zeichen")
            ? tr("waage.zeichen.start")
            : tr(waage.art==="zeichen" ? "waage.frage.zeichen" : "waage.frage.mengen"), "");
    $("waage-tipptext").textContent = tr(waage.art==="zeichen" ? "waage.tipp.zeichen" : "waage.tipp.mengen");
    $("waage-tipp").classList.remove("is-offen");
    waage.gesperrt = false;
    freigeben("waage-antwort");
  }

  function waageFertig(){
    kSieg();
    goldDazu(WAAGE_ZIEL_GOLD);
    $("waage-ziel-text").textContent =
      trp("waage.ziel.basis", waage.richtig, { b: waage.beste }) + " " +
      (waage.falsch===0 ? tr("h.ziel.sauber") : tr("h.weiterso"));
    $("ov-waage").classList.add("is-offen");
    waageKopf();
  }

  function waageAntwort(wert,knopf){
    if(waage.gesperrt) return;
    waage.gesperrt = true; sperren("waage-antwort");
    const richtig = waageLoesung();
    waage.gestellt++;

    /* Die Waage kippt erst nach der Antwort – vorher stünde die Lösung da. */
    $("waage-bild").classList.add(richtig===0 ? "waage--gleich"
                                : richtig<0  ? "waage--links" : "waage--rechts");

    if(wert===richtig){
      knopf.classList.add("richtig");
      waage.richtig++; waage.serie++; waage.beste = Math.max(waage.beste,waage.serie);
      problemGeloest();
      const gewinn = goldDazu(GRUNDGOLD*multiplikator(waage.serie));
      kRichtig(); kMuenze();
      sagen("waage-rueckmeldung", tr(waehle(lobWorte))+"  "+tr("gold.plus",{n:gewinn}), "gut");
      funken("waage-funken","🪙",multiplikator(waage.serie)*4);
    }else{
      knopf.classList.add("falsch");
      zeigeLoesung("waage-antwort", richtig);
      waage.falsch++; waage.serie = 0;
      const weg = goldWeg();
      kFalsch();
      $("waage-tipp").classList.add("is-offen");
      sagen("waage-rueckmeldung",
            weg ? tr("waage.falsch.gold", { a:waage.links, b:waage.rechts, n:weg })
                : tr("waage.falsch",      { a:waage.links, b:waage.rechts }),
            "schlecht");
    }
    waageKopf();

    const ende = waage.gestellt >= WAAGE_RUNDEN*WAAGE_JE_RUNDE;
    setTimeout(()=>{ ende ? waageFertig() : waageNeueAufgabe(); },
               wert===richtig ? 1500 : 2800);
  }

  function waageStart(){
    waage.gestellt=0; waage.richtig=0; waage.falsch=0; waage.serie=0; waage.beste=0;
    waage.art = "mengen";
    zeigeScreen("screen-waage");
    waageNeueAufgabe();
  }
  function waageWeiter(){
    $("ov-waage").classList.remove("is-offen");
    waageStart();
  }

  /* ================= Auswahl & Bedienung ================= */
  function wahlSetzen(gruppeId,wert){
    alle("#"+gruppeId+" button").forEach(b =>
      b.setAttribute("aria-pressed", b.dataset.wert===wert ? "true" : "false"));
  }
  $("wahl-raum").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    opt.max = Number(b.dataset.wert); wahlSetzen("wahl-raum",b.dataset.wert);
    optSichern();
    ton(880,.09,"triangle",0,.12);
  });
  $("wahl-art").addEventListener("click", e => {
    const b = e.target.closest("button"); if(!b) return;
    opt.minus = b.dataset.wert==="beides"; wahlSetzen("wahl-art",b.dataset.wert);
    optSichern();
    ton(880,.09,"triangle",0,.12);
  });
  function tonUmschalten(){
    opt.ton = !opt.ton;
    alle("[data-ton]").forEach(b => b.textContent = opt.ton ? tr("ton.kurz") : tr("ton.aus"));
    $("btn-ton-start").textContent = opt.ton ? tr("ton.an") : tr("ton.aus");
    optSichern();
    if(opt.ton) ton(880,.1,"triangle",0);
  }
  function heim(){
    alle(".overlay").forEach(o=>o.classList.remove("is-offen"));
    truheWeiter = null;
    zeigeScreen("screen-start");
  }

  /* ================= Spielerkonten: Anzeige & Bedienung ================= */
  function kontoAnzeigen(){
    const k = kontoAktuell();
    if(k){
      $("spieler-avatar").textContent = k.bild;
      $("spieler-name").textContent = k.name;
    }else{
      /* Noch kein Konto – die Leiste zeigt einen neutralen Platzhalter. */
      $("spieler-avatar").textContent = "🙂";
      $("spieler-name").textContent = "";
    }
  }
  function kontoDatenLaden(){
    setLang((kontoAktuell() && kontoAktuell().sprache) || "de");
    laden(); optLaden(); optAnwenden();
    puzzleLaden(); burgLaden(); hoehleLaden();
    hoehleHungerAufholen();
    burg.auswahl = null; burg.geloest = false;
    hoehleFarbeAnwenden();
    schatzZeichnen(); puzzleZeichnen(); galerieZeichnen(); burgZeichnen(); hoehleZeichnen();
    hoehleHungerZeichnen();
    kontoAnzeigen();
  }
  function kontoGitterZeichnen(){
    const g = $("konto-gitter");
    g.innerHTML = "";
    konto.liste.forEach(k => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "konto-karte"+(k.id===konto.aktiv ? " aktiv" : "");
      el.innerHTML = '<span class="avatar">'+k.bild+'</span><span class="name">'+k.name+'</span>';
      el.addEventListener("click", ()=>kontoWechseln(k.id));
      g.appendChild(el);
    });
    if(konto.liste.length<MAX_KONTEN){
      const neu = document.createElement("button");
      neu.type = "button";
      neu.className = "konto-karte konto-karte--neu";
      neu.innerHTML = '<span class="plus">➕</span><span class="name">'+tr("konto.neu")+'</span>';
      neu.addEventListener("click", kontoNeuZeigen);
      g.appendChild(neu);
    }
  }
  function kontoOeffnen(){
    if(konto.liste.length===0){ kontoNeuZeigen(); return; }
    kontoGitterZeichnen();
    sprachenWahlZeichnen("sprache-wahl-konto", (kontoAktuell() && kontoAktuell().sprache) || "de");
    $("ov-konto").classList.add("is-offen");
  }
  /* Sprachwahl (antippbar, kein Tippen). Zwei Einsätze:
     - im "Wer spielt?"-Overlay: ändert die Sprache des aktiven Kontos
     - im "Neues Kind"-Overlay: legt die Sprache für das neue Konto fest */
  function sprachenWahlZeichnen(boxId, aktive){
    const box = $(boxId);
    if(!box) return;
    box.innerHTML = "";
    SPRACHEN.forEach(code => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sprache-knopf"+(code===aktive ? " gewaehlt" : "");
      b.textContent = SPRACH_NAME[code];
      b.dataset.lang = code;
      b.addEventListener("click", ()=>spracheKnopf(code, boxId));
      box.appendChild(b);
    });
  }
  function spracheKnopf(code, boxId){
    if(boxId === "sprache-wahl-neu"){
      konto.neuSprache = code;
      sprachenWahlZeichnen("sprache-wahl-neu", code);
    }else{
      const k = kontoAktuell();
      if(k){ k.sprache = code; kontoListeSichern(); }
      spracheAnwenden(code);
      sprachenWahlZeichnen("sprache-wahl-konto", code);
    }
  }
  function spracheAnwenden(code){
    setLang(code);
    optAnwenden();
    schatzZeichnen(); puzzleZeichnen(); galerieZeichnen(); burgZeichnen(); hoehleZeichnen();
    hoehleHungerZeichnen();
    kontoAnzeigen();
  }
  function kontoWechseln(id){
    if(id===konto.aktiv){ $("ov-konto").classList.remove("is-offen"); return; }
    konto.aktiv = id;
    kontoAktivSichern();
    kontoDatenLaden();
    $("ov-konto").classList.remove("is-offen");
    zeigeScreen("screen-start");
  }
  function avatarWahlZeichnen(){
    const box = $("avatar-wahl");
    box.innerHTML = "";
    AVATARE.forEach(a => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "avatar-option"+(a===konto.neuBild ? " gewaehlt" : "");
      el.textContent = a;
      el.addEventListener("click", ()=>{ konto.neuBild = a; avatarWahlZeichnen(); });
      box.appendChild(el);
    });
  }
  function kontoNeuZeigen(){
    if(konto.liste.length>=MAX_KONTEN) return;
    konto.neuBild = AVATARE[0];
    konto.neuSprache = browserSprache();
    $("konto-name-eingabe").value = "";
    avatarWahlZeichnen();
    sprachenWahlZeichnen("sprache-wahl-neu", konto.neuSprache);
    /* Erststart: ohne Konto gibt es nichts, wozu man abbrechen könnte. */
    $("btn-konto-neu-zu").hidden = konto.liste.length===0;
    $("ov-konto").classList.remove("is-offen");
    $("ov-konto-neu").classList.add("is-offen");
  }
  function kontoAnlegen(){
    if(konto.liste.length>=MAX_KONTEN) return;
    const erste = konto.liste.length===0;
    const name = ($("konto-name-eingabe").value||"").trim();
    const id = kontoNeuId();
    konto.liste.push({
      id:id,
      name: name || tr("konto.default.name",{n:konto.liste.length+1}),
      bild: konto.neuBild || AVATARE[0],
      sprache: konto.neuSprache || "de"
    });
    kontoListeSichern();
    konto.aktiv = id;
    kontoAktivSichern();
    if(erste) kontoMigriereLegacy(id);
    kontoDatenLaden();
    $("ov-konto-neu").classList.remove("is-offen");
    zeigeScreen("screen-start");
    kSieg();
  }

  $("spieler-leiste").addEventListener("click", kontoOeffnen);
  $("btn-konto-zu").addEventListener("click", ()=> $("ov-konto").classList.remove("is-offen"));
  $("btn-konto-neu-zu").addEventListener("click", ()=>{
    $("ov-konto-neu").classList.remove("is-offen");
    kontoOeffnen();
  });
  $("btn-konto-anlegen").addEventListener("click", kontoAnlegen);

  $("karte-kampf").addEventListener("click", kNeuesSpiel);
  $("karte-hort").addEventListener("click", hStart);
  $("btn-weiter").addEventListener("click", kStarteDrachen);
  $("btn-nochmal").addEventListener("click", kNeuesSpiel);
  $("truhen-bild").addEventListener("click", truheOeffnen);
  $("btn-truhe-zu").addEventListener("click", truheSchliessen);
  $("btn-ziel-weiter").addEventListener("click", hWeiterSammeln);
  $("btn-kammer-zu").addEventListener("click", kammerSchliessen);
  $("btn-ton-start").addEventListener("click", tonUmschalten);
  alle("[data-ton]").forEach(b=>b.addEventListener("click",tonUmschalten));
  alle("[data-heim]").forEach(b=>b.addEventListener("click",heim));
  alle("[data-kammer]").forEach(b=>b.addEventListener("click",kammerZeigen));
  alle("[data-tipp]").forEach(b=>b.addEventListener("click",()=>{
    $(b.dataset.tipp+"-tipp").classList.toggle("is-offen");
  }));

  $("karte-puzzle").addEventListener("click", ()=>{
    puzzleZeichnen();
    zeigeScreen("screen-puzzle");
  });
  $("btn-puzzle-kaufen").addEventListener("click", puzzleKaufen);

  $("karte-galerie").addEventListener("click", galerieZeigen);
  $("btn-zur-galerie").addEventListener("click", galerieZeigen);
  $("btn-zum-puzzle").addEventListener("click", ()=>{
    puzzleZeichnen();
    zeigeScreen("screen-puzzle");
  });
  $("bild-gross").addEventListener("click", bildZoomen);
  $("btn-bild-zu").addEventListener("click", ()=> $("ov-bild").classList.remove("is-offen"));

  $("karte-burg").addEventListener("click", ()=>{
    burgZeichnen();
    zeigeScreen("screen-burg");
  });

  $("karte-hoehle").addEventListener("click", ()=>{
    hoehleZeichnen();
    zeigeScreen("screen-hoehle");
  });
  $("btn-hoehle-haupt").addEventListener("click", ()=>{
    hoehle.ei ? hoehleFuettern() : hoehleEiKaufen();
  });
  $("burg-raster").addEventListener("click", e => {
    const zelle = e.target.closest(".burg-zelle");
    if(!zelle) return;
    const index = Number(zelle.dataset.index);
    if(burg.feld[index]) burgAbreissen(index);
    else burgPlatziere(index);
  });

  $("karte-mauer").addEventListener("click", mStart);
  $("btn-mauer-weiter").addEventListener("click", mWeiterMauern);

  $("karte-turnier").addEventListener("click", tStart);
  $("btn-turnier-weiter").addEventListener("click", tWeiter);

  $("karte-turm").addEventListener("click", turmStart);
  $("karte-uhr").addEventListener("click", ()=>uhrStart(false));
  $("karte-waage").addEventListener("click", waageStart);
  $("btn-waage-weiter").addEventListener("click", waageWeiter);
  $("btn-uhr-weiter").addEventListener("click", uhrWeiter);
  $("btn-uhr-bonus").addEventListener("click", uhrBonusStarten);
  $("btn-turm-weiter").addEventListener("click", turmWeiter);

  $("hunger-banner").addEventListener("click", ()=>{ hoehleZeichnen(); zeigeScreen("screen-hoehle"); });

  kontoInit();
  setLang((kontoAktuell() && kontoAktuell().sprache) || browserSprache());
  laden();
  optLaden();
  optAnwenden();
  puzzleLaden();
  burgLaden();
  hoehleLaden();
  hoehleHungerAufholen();
  hoehleFarbeAnwenden();
  schatzZeichnen();
  puzzleZeichnen();
  galerieZeichnen();
  burgZeichnen();
  hoehleZeichnen();
  hoehleHungerZeichnen();
  kontoAnzeigen();
  /* Erststart: noch kein Konto -> direkt die Namens-/Avatar-/Sprachwahl. */
  if(!kontoAktuell()) kontoNeuZeigen();
})();
