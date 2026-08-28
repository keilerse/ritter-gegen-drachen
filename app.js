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
  const AVATARE = ["🦁","🐲","🦄","🐱","🚀","🐼","🦉","🐸"];
  const konto = { liste:[], aktiv:"", neuBild:"" };

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
      const id = kontoNeuId();
      konto.liste.push({ id:id, name:"Ritter 1", bild:AVATARE[0] });
      konto.aktiv = id;
      kontoMigriereLegacy(id);
      kontoListeSichern(); kontoAktivSichern();
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
    {id:"diamant",   bild:"💎", name:"Diamant"},
    {id:"krone",     bild:"👑", name:"Krone"},
    {id:"schluessel",bild:"🗝️", name:"Goldschlüssel"},
    {id:"stab",      bild:"🪄", name:"Zauberstab"},
    {id:"schwert",   bild:"⚔️", name:"Flammenschwert"},
    {id:"schild",    bild:"🛡️", name:"Silberschild"},
    {id:"ei",        bild:"🥚", name:"Drachenei"},
    {id:"einhorn",   bild:"🦄", name:"Einhorn"},
    {id:"kompass",   bild:"🧭", name:"Kompass"},
    {id:"laterne",   bild:"🕯️", name:"Ewiges Licht"},
    {id:"vase",      bild:"🏺", name:"Goldvase"},
    {id:"perle",     bild:"🌈", name:"Regenbogenperle"}
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
    {ab:0,    name:"Knappe",          bild:"🪙"},
    {ab:10,   name:"Ritter",          bild:"💰"},
    {ab:25,   name:"Schatzmeister",   bild:"💎"},
    {ab:45,   name:"Drachenreiter",   bild:"🐲"},
    {ab:75,   name:"Legende",         bild:"👑"},
    {ab:120,  name:"Baron",           bild:"🏰"},
    {ab:180,  name:"Graf",            bild:"⚜️"},
    {ab:260,  name:"Herzog",          bild:"🛡️"},
    {ab:370,  name:"Fürst",           bild:"🌟"},
    {ab:520,  name:"König",           bild:"🤴"},
    {ab:720,  name:"Kaiser",          bild:"🏛️"},
    {ab:1000, name:"Drachentöter",    bild:"🗡️"},
    {ab:1400, name:"Unsterblicher",   bild:"✨"},
    {ab:2000, name:"Gott des Goldes", bild:"🌠"}
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
    alle("[data-ton]").forEach(b => b.textContent = opt.ton ? "🔊 Ton" : "🔇 Ton aus");
    $("btn-ton-start").textContent = opt.ton ? "🔊 Ton an" : "🔇 Ton aus";
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
    if(!n) return "Höchster Rang erreicht! 🌠";
    return "noch "+(n.ab - schatz.geloest)+" bis "+n.name;
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
                  '<span class="rf-label">Neuer Rang!</span>'+
                  '<span class="rf-name">'+r.name+'</span>';
    $("app").appendChild(b);
    funkenEl(b, "✨", 16);
    setTimeout(()=>b.classList.add("weg"), 1700);
    setTimeout(()=>b.remove(), 2200);
  }
  function schatzZeichnen(){
    alle(".js-gold").forEach(el => el.textContent = schatz.gold);
    alle(".js-truhe-balken").forEach(el => el.style.width = (schatz.bisTruhe/TRUHE_ALLE*100)+"%");
    alle(".js-truhe-zaehler").forEach(el => el.textContent = schatz.bisTruhe+"/"+TRUHE_ALLE);
    alle(".js-rang").forEach(el => el.textContent = rang().name);
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
  /* Truhenfortschritt zählt in beiden Spielen mit */
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
    $("truhen-titel").textContent = "Eine Schatztruhe!";
    $("truhen-text").textContent = "Tippe die Truhe an.";
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
      $("truhen-titel").textContent = neu.name+" gefunden!";
      $("truhen-text").textContent = "Neu in deiner Schatzkammer – "+schatz.album.length+" von "+SCHAETZE.length+".";
    } else {
      bild.textContent = "💰"; bild.className = "belohnung";
      $("truhen-titel").textContent = "Randvoll mit Gold!";
      $("truhen-text").textContent = "Du hast schon alle Schätze – dafür klingelt die Kasse.";
    }
    $("truhen-gold").textContent = "+"+bonus+" Gold";
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
    $("kammer-text").textContent = schatz.album.length+" von "+SCHAETZE.length+" Schätzen gefunden";
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
    $("kammer-text").textContent = "🔒 Spiel weiter, um ihn zu finden!";
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
                     '<span class="titel-klein">'+(hat?sch.name:"noch offen")+'</span>';
      if(hat){
        if(schatz.neu.indexOf(sch.id)>=0){
          const badge = document.createElement("span");
          badge.className = "neu-badge"; badge.textContent = "NEU";
          el.appendChild(badge);
        }
        el.addEventListener("click", ()=>schatzTippen(el, sch, true));
      }else{
        el.addEventListener("click", ()=>schatzGesperrt(el));
      }
      gitter.appendChild(el);
    });
    kammerTextStd();
    $("kammer-gold").textContent = "🪙 "+schatz.gold+" Gold · "+rang().name;
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
      b.setAttribute("aria-label","Antwort "+i);
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
    window.scrollTo(0,0);
  }
  const lobWorte = ["Treffer!","Stark!","Volltreffer!","Genau richtig!","Perfekt!","Super gerechnet!"];

  /* ================= SPIEL 1: Drachenkampf ================= */
  const DRACHEN = [
    { name:"Glutzahn",      emoji:"🐲", zaehne:4, stufen:[1],   hue:0,   beute:50 },
    { name:"Nebelschwinge", emoji:"🐉", zaehne:5, stufen:[1,2], hue:160, beute:75 },
    { name:"Frostkralle",   emoji:"🐲", zaehne:5, stufen:[2,3], hue:200, beute:100 },
    { name:"Schattenhorn",  emoji:"🐉", zaehne:6, stufen:[3],   hue:270, beute:125 },
    { name:"Königsdrache",  emoji:"🐲", zaehne:6, stufen:[3,4], hue:330, beute:200 }
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
    $("drachen-name").textContent = d.name;
    $("runde").textContent = "Drache "+(k.drache+1)+"/"+DRACHEN.length;
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
    sagen("k-rueckmeldung","Welche Zahl passt?","");
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
      sagen("k-rueckmeldung",waehle(lobWorte)+"  +"+gewinn+" Gold","gut");
      bewege($("ritter"),"angriff",460);
      const e = $("effekt"); e.textContent = "⚔️"; bewege(e,"schlag",750);
      hoehleBegleiterJubelt();
      setTimeout(()=>{
        bewege($("drache"),"getroffen",460);
        funken("funken","🪙",mult*4);
        kLeben(); kVerlustAnzeigen("zaehne",k.zaehne);
      },220);
      const truheFaellig = truheZaehlen();
      setTimeout(()=>{
        const weiter = () => { k.zaehne<=0 ? kDracheBesiegt() : kNeueAufgabe(); };
        truheFaellig ? truheZeigen(weiter) : weiter();
      },1050);

    } else {
      knopf.classList.add("falsch");
      zeigeLoesung("k-zahlen",k.aufgabe.antwort);
      k.falsch++; k.serie = 0; k.herzen--;
      const weg = goldWeg();
      k.beute -= weg;
      kFalsch();
      sagen("k-rueckmeldung","Richtig wäre: "+k.aufgabe.loesung+(weg?"  −"+weg+" Gold":""),"schlecht");
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
      $("win-titel").textContent = d.name+" ist besiegt!";
      $("win-sterne").textContent = sterne;
      $("win-beute").textContent = "🪙 +"+beute+" Gold Drachenschatz";
      $("win-text").textContent = "Weiter geht's: "+DRACHEN[k.drache].name+" wartet schon. Deine Herzen sind wieder voll.";
      zeigeScreen("screen-win");
    },900);
  }
  function kEnde(gewonnen){
    if(gewonnen){
      kSieg();
      $("ende-figur").textContent = "👑";
      $("ende-titel").textContent = "Alle Drachen besiegt!";
      $("ende-text").textContent = "Das Königreich ist gerettet – und dein Drachengold liegt in der Schatzkammer.";
    } else {
      kAus();
      $("ende-figur").textContent = "🐉";
      $("ende-titel").textContent = "Der Drache war stärker";
      $("ende-text").textContent = "Deine Herzen sind aufgebraucht. Dein Gold bleibt dir – noch ein Versuch?";
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
    sagen("h-rueckmeldung","Welche Zahl passt?","");
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
      sagen("h-rueckmeldung",waehle(lobWorte)+"  +"+gewinn+" Gold","gut");
      bewege($("app").querySelector(".js-haufen"),"huepft",520);
      funken("h-funken","🪙",mult*4);
      if(h.serie===3 || h.serie===6){
        setTimeout(()=>{ sagen("h-rueckmeldung","🔥 Serie! Ab jetzt ×"+multiplikator(h.serie)+" Gold","gut"); ton(1046,.15,"triangle",0,.18); },560);
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
        ? "Fast! "+h.aufgabe.loesung+"  −"+weg+" Gold. Gleich nochmal."
        : "Fast! "+h.aufgabe.loesung+" – gleich nochmal.", "schlecht");
      $("h-tipp").classList.add("is-offen");
      h.wiederholen = true;   /* dieselbe Aufgabe kommt gleich noch einmal */
      hKopf();
      setTimeout(hNeueAufgabe,2600);
    }
  }
  function hZiel(){
    kSieg();
    goldDazu(100);
    $("ziel-text").textContent = h.richtig+" Aufgaben geschafft, beste Serie: "+h.beste+". "+
      (h.falsch===0 ? "Und kein einziger Fehler!" : "Weiter so!");
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
  const puzzleBild = () => "images/puzzle"+puzzle.nummer+".png";

  const puzzle = { nummer:1, offen:[] };

  function puzzleLaden(){
    puzzle.nummer = 1; puzzle.offen = [];
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"puzzle"));
      if(!roh) return;
      const d = JSON.parse(roh);
      puzzle.nummer = Math.max(1, Number(d.nummer)||1);
      puzzle.offen = Array.isArray(d.offen)
        ? d.offen.map(Number).filter(x=>x>=0&&x<PUZZLE_TEILE)
        : [];
    }catch(e){}
  }

  function puzzleSichern(){
    try{
      localStorage.setItem(kontoKey(konto.aktiv,"puzzle"), JSON.stringify({
        nummer:puzzle.nummer,
        offen:puzzle.offen
      }));
    }catch(e){}
  }

  function puzzleZeichnen(){
    const box = $("puzzle-bild");
    if(!box) return;
    const bild = puzzleBild();
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
      kaufen.textContent = "🧩 Puzzleteil kaufen – "+PUZZLE_PREIS+" Gold";
      $("puzzle-text").textContent =
        rest+" Teile fehlen noch. Mit jedem Kauf wird das Bild sichtbarer.";
      $("puzzle-hinweis").textContent =
        schatz.gold < PUZZLE_PREIS
          ? "Du brauchst noch "+(PUZZLE_PREIS-schatz.gold)+" Gold."
          : "Du hast genug Gold – welches Stück wird als Nächstes sichtbar?";
    }else{
      kaufen.disabled = true;
      kaufen.textContent = "🏆 Puzzle gelöst!";
      $("puzzle-text").textContent = "Geschafft! Das Bild ist vollständig enthüllt.";
      $("puzzle-hinweis").textContent = "Das nächste Puzzle wird vorbereitet …";
    }
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
      setTimeout(()=>{
        kSieg();
        $("puzzle-text").textContent = "🎉 Puzzle gelöst!";
        $("puzzle-hinweis").textContent = "Das nächste Abenteuer wartet!";
        setTimeout(()=>{
          puzzle.nummer++;
          puzzle.offen = [];
          puzzleSichern();
          puzzleZeichnen();
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
    {id:"mauer",      name:"Mauer",     preis:100, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"rote-mauer", name:"Backstein", preis:100, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"turmstein",  name:"Turmstein", preis:120, gruppe:"wand", erlaubt:(z,s)=>true},
    {id:"tor",        name:"Tor",       preis:300, erlaubt:(z,s)=>z>=BURG_REIHEN-2},
    {id:"fenster",    name:"Fenster",   preis:80,  erlaubt:(z,s)=>true},
    {id:"dach",       name:"Dach",      preis:150, erlaubt:(z,s)=>z<BURG_REIHEN-1},
    {id:"flagge",     name:"Flagge",    preis:200, erlaubt:(z,s)=>z<=1},
    {id:"wappen",     name:"Wappen",    preis:150, erlaubt:(z,s)=>true},
    {id:"fackel",     name:"Fackel",    preis:90,  erlaubt:(z,s)=>true},
    {id:"busch",      name:"Busch",     preis:60,  erlaubt:(z,s)=>z===BURG_REIHEN-1},
    {id:"fass",       name:"Fass",      preis:60,  erlaubt:(z,s)=>z===BURG_REIHEN-1}
  ];
  const BURG_ZIEL = [
    {text:"🚪 Tor",      min:1, n:()=>burgZaehlen("tor")},
    {text:"🛡️ Wappen",   min:1, n:()=>burgZaehlen("wappen")},
    {text:"🚩 Flagge",   min:1, n:()=>burgZaehlen("flagge")},
    {text:"🧱 6 Mauern", min:6, n:()=>burgZaehlenGruppe("wand")}
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
    return BURG_ZIEL.map(z => ({ text:z.text, ok: z.n()>=z.min }));
  }

  function burgFertig(){
    return burgCheckliste().every(z=>z.ok);
  }

  function burgDekoZeichnen(){
    const zinnen = $("burg-zinnen");
    if(zinnen){
      zinnen.style.gridTemplateColumns = "repeat("+BURG_SPALTEN+",1fr)";
      zinnen.innerHTML = "";
      for(let s=0;s<BURG_SPALTEN;s++){
        const z = document.createElement("div");
        const gap = s%2===1;                       /* Zinnenlücke */
        z.className = "zinne"+(gap ? " gap" : "");
        if(!gap) z.innerHTML = svgWrap(steinRahmen());
        zinnen.appendChild(z);
      }
    }
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
      el.setAttribute("aria-label","Feld "+(i+1));
      if(teil){
        el.classList.add("besetzt");
        el.innerHTML = kachelSVG(teil.id);
        el.title = teil.name;
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
        '<span class="name">'+t.name+'</span>'+
        '<span class="preis">'+t.preis+' 🪙</span>';
      b.addEventListener("click", ()=>burgWaehle(t.id));
      palette.appendChild(b);
    });

    const liste = $("burg-checkliste");
    liste.innerHTML = "";
    burgCheckliste().forEach(z => {
      const el = document.createElement("span");
      el.className = "burg-ziel"+(z.ok?" ok":"");
      el.textContent = z.text;
      liste.appendChild(el);
    });

    if(!burg.auswahl){
      $("burg-hinweis").textContent = "Wähle ein Bauteil und tippe dann auf ein leeres Feld.";
    }else if(gewaehlt && schatz.gold<gewaehlt.preis){
      $("burg-hinweis").textContent = "Für "+gewaehlt.name+" fehlen dir noch "+(gewaehlt.preis-schatz.gold)+" Gold.";
    }else if(gewaehlt){
      $("burg-hinweis").textContent = "Tippe ein leuchtendes Feld, um "+gewaehlt.name+" zu setzen. Tippe auf ein gesetztes Teil, um es abzureißen.";
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
      $("burg-hinweis").textContent = gewaehlt.name+" passt hier nicht hin.";
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
        $("burg-hinweis").textContent = "🏰 Prachtburg! Deine Burg ist vollständig – du kannst sie weiter ausbauen.";
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
    $("burg-hinweis").textContent = teil.name+" abgerissen – +"+erstattung+" Gold zurück.";
  }

  /* ================= SPIEL 6: DRACHENHÖHLE =================
     Dritte Ausgeben-Möglichkeit neben Puzzle und Burg: ein Ei kaufen und den
     eigenen Drachen grossfüttern. Ab dem Jungdrachen fliegt er im Drachenkampf
     als Begleiter mit. Achtung: "hort" ist schon die Schatzjagd, deshalb
     heisst hier alles "hoehle". */
  const HOEHLE_EI = 500;
  const HOEHLE_FUTTER = 80;
  const HOEHLE_STUFEN = [
    {ab:0,  bild:"🥚", name:"Ei",
     text:"Ein warmes Ei liegt in der Höhle. Füttere es, damit es schlüpft."},
    {ab:3,  bild:"🐣", name:"Schlüpfling",
     text:"Geschlüpft! Ein winziger Drache blinzelt dich an."},
    {ab:8,  bild:"🐲", name:"Jungdrache",
     text:"Er wächst – und fliegt ab jetzt im Drachenkampf an deiner Seite mit."},
    {ab:15, bild:"🐉", name:"Hausdrache",
     text:"Ausgewachsen! Dein Drache ist der Stolz der Höhle."}
  ];
  /* Ab dieser Stufe erscheint der Drache in der Kampfarena. */
  const HOEHLE_BEGLEITER_AB = 2;
  /* x/y in Prozent der Bühne: x von links, y von unten. */
  const HOEHLE_SCHMUCK = [
    {id:"nest",     bild:"🪺", name:"Nest",         preis:150, x:15, y:14},
    {id:"fackel",   bild:"🔥", name:"Fackel",       preis:90,  x:85, y:46},
    {id:"gold",     bild:"💰", name:"Goldhaufen",   preis:200, x:77, y:13},
    {id:"kristall", bild:"💎", name:"Kristall",     preis:250, x:25, y:52},
    {id:"knochen",  bild:"🦴", name:"Knochen",      preis:70,  x:34, y:7},
    {id:"stern",    bild:"🌟", name:"Sternenlicht", preis:300, x:62, y:60}
  ];
  /* Namen werden angetippt, nicht getippt – im ganzen Spiel wird nichts geschrieben. */
  const HOEHLE_NAMEN = ["Funkenschweif","Glutherz","Mondschuppe",
                        "Sternenzahn","Rauchwölkchen","Goldkralle"];

  const hoehle = { ei:false, futter:0, schmuck:[], name:"" };

  function hoehleStufeIndex(){
    if(!hoehle.ei) return -1;
    let i = 0;
    HOEHLE_STUFEN.forEach((s,n)=>{ if(hoehle.futter>=s.ab) i = n; });
    return i;
  }
  function hoehleAusgewachsen(){ return hoehleStufeIndex() >= HOEHLE_STUFEN.length-1; }

  function hoehleLaden(){
    hoehle.ei = false; hoehle.futter = 0; hoehle.schmuck = []; hoehle.name = "";
    try{
      const roh = localStorage.getItem(kontoKey(konto.aktiv,"hoehle"));
      if(!roh) return;
      const d = JSON.parse(roh);
      hoehle.ei = !!d.ei;
      hoehle.futter = Math.max(0, Number(d.futter)||0);
      hoehle.schmuck = Array.isArray(d.schmuck)
        ? d.schmuck.filter(id => HOEHLE_SCHMUCK.some(s=>s.id===id))
        : [];
      hoehle.name = HOEHLE_NAMEN.indexOf(d.name)>=0 ? d.name : "";
    }catch(e){}
  }
  function hoehleSichern(){
    try{
      localStorage.setItem(kontoKey(konto.aktiv,"hoehle"), JSON.stringify({
        ei:hoehle.ei, futter:hoehle.futter, schmuck:hoehle.schmuck, name:hoehle.name
      }));
    }catch(e){}
  }

  /* Der Begleiter in der Kampfarena – wird auch beim Kontowechsel neu gesetzt. */
  function hoehleBegleiterZeichnen(){
    const el = $("kampf-begleiter");
    if(!el) return;
    const i = hoehleStufeIndex();
    if(i >= HOEHLE_BEGLEITER_AB){
      el.textContent = HOEHLE_STUFEN[i].bild;
      el.classList.remove("aus");
    }else{
      el.textContent = "";
      el.classList.add("aus");
    }
  }
  function hoehleBegleiterJubelt(){
    const el = $("kampf-begleiter");
    if(el && !el.classList.contains("aus")) bewege(el,"jubelt",520);
  }

  function hoehleSchmuckZeichnen(){
    const box = $("hoehle-schmuck");
    box.innerHTML = "";
    HOEHLE_SCHMUCK.forEach(s => {
      if(hoehle.schmuck.indexOf(s.id)<0) return;
      const el = document.createElement("span");
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
        + '<span class="name">'+s.name+'</span>'
        + '<span class="preis">'+(hat ? "gekauft" : s.preis+" 🪙")+'</span>';
      if(!hat) b.addEventListener("click", ()=>hoehleSchmuckKaufen(s.id));
      box.appendChild(b);
    });
  }

  function hoehleNamenZeichnen(){
    const box = $("hoehle-namen");
    const zeigen = hoehle.ei && hoehleStufeIndex()>=1 && !hoehle.name;
    box.hidden = !zeigen;
    box.innerHTML = "";
    if(!zeigen) return;
    HOEHLE_NAMEN.forEach(n => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = n;
      b.addEventListener("click", ()=>{
        hoehle.name = n;
        hoehleSichern(); hoehleZeichnen();
        kChime();
        funken("hoehle-funken","✨",10);
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
      $("hoehle-name").textContent = "Drachenhöhle";
    }else{
      const stufe = HOEHLE_STUFEN[i];
      drache.textContent = stufe.bild;
      drache.style.opacity = "";
      drache.style.filter = "";
      $("hoehle-stufe").textContent = stufe.name;
      $("hoehle-name").textContent = hoehle.name || stufe.name;
    }

    $("hoehle-zaehler").textContent = hoehle.futter;
    hoehleSchmuckZeichnen();
    hoehleLadenZeichnen();
    hoehleNamenZeichnen();
    hoehleBegleiterZeichnen();

    const knopf = $("btn-hoehle-haupt");
    const text = $("hoehle-text");
    const fort = $("hoehle-fort");
    const hinweis = $("hoehle-hinweis");
    const balken = $("hoehle-balken");

    if(!hoehle.ei){
      knopf.disabled = schatz.gold < HOEHLE_EI;
      knopf.textContent = "🥚 Drachenei kaufen – "+HOEHLE_EI+" Gold";
      text.textContent = "In der Höhle ist es still. Hier könnte dein eigener Drache wohnen.";
      balken.style.width = "0%";
      fort.textContent = "";
      hinweis.textContent = schatz.gold < HOEHLE_EI
        ? "Du brauchst noch "+(HOEHLE_EI-schatz.gold)+" Gold für das Ei."
        : "Du hast genug Gold – hol dir das Ei!";
      return;
    }

    text.textContent = HOEHLE_STUFEN[i].text;

    if(hoehleAusgewachsen()){
      knopf.disabled = true;
      knopf.textContent = "🐉 Ausgewachsen!";
      balken.style.width = "100%";
      fort.textContent = "Dein Drache ist fertig gewachsen.";
      hinweis.textContent = "Schmücke jetzt die Höhle – schöner wohnt er allemal.";
    }else{
      const naechste = HOEHLE_STUFEN[i+1];
      const vorige = HOEHLE_STUFEN[i].ab;
      const fehlt = naechste.ab - hoehle.futter;
      knopf.disabled = schatz.gold < HOEHLE_FUTTER;
      knopf.textContent = "🍖 Füttern – "+HOEHLE_FUTTER+" Gold";
      balken.style.width =
        ((hoehle.futter-vorige)/(naechste.ab-vorige)*100)+"%";
      fort.textContent = "noch "+fehlt+"× füttern bis "+naechste.name;
      hinweis.textContent = schatz.gold < HOEHLE_FUTTER
        ? "Du brauchst noch "+(HOEHLE_FUTTER-schatz.gold)+" Gold fürs Futter."
        : "Dein Drache hat Hunger!";
    }
  }

  function hoehleEiKaufen(){
    if(hoehle.ei || !goldAusgeben(HOEHLE_EI)) return;
    hoehle.ei = true;
    hoehleSichern();
    hoehleZeichnen();
    kZirp();
    bewege($("hoehle-drache"),"waechst",620);
    funken("hoehle-funken","✨",12);
  }

  function hoehleFuettern(){
    if(!hoehle.ei || hoehleAusgewachsen()) return;
    const vorher = hoehleStufeIndex();
    if(!goldAusgeben(HOEHLE_FUTTER)) return;

    hoehle.futter++;
    hoehleSichern();
    hoehleZeichnen();

    const nachher = hoehleStufeIndex();
    if(nachher > vorher){
      /* Aufstieg wird gefeiert – wie der Rangaufstieg im Rest des Spiels. */
      kSieg();
      bewege($("hoehle-drache"),"waechst",620);
      funken("hoehle-funken","⭐",16);
      $("hoehle-hinweis").textContent =
        "🎉 Gewachsen! Jetzt ein "+HOEHLE_STUFEN[nachher].name+".";
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
    $("hoehle-hinweis").textContent = ware.name+" schmückt jetzt deine Höhle.";
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
      hin.textContent = "Rechne: "+w.zeilen[z+1][s]+" + "+w.zeilen[z+1][s+1];
      return;
    }
    for(const [pz,ps] of mEltern(z,s)){
      const pkey = pz+"-"+ps;
      const geschw = (z===pz+1 && s===ps) ? [pz+1,ps+1] : [pz+1,ps];
      const gkey = geschw[0]+"-"+geschw[1];
      const pknown = !w.luecken.has(pkey) || m.geloest.has(pkey);
      const gknown = !w.luecken.has(gkey) || m.geloest.has(gkey);
      if(pknown && gknown){
        hin.textContent = "Rechne rückwärts: "+w.zeilen[pz][ps]+" − "+w.zeilen[geschw[0]][geschw[1]];
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
    sagen("m-rueckmeldung","Fülle die leuchtende Lücke der Mauer.","");
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
    $("mauer-ziel-text").textContent = m.richtig+" Lücken gefüllt, beste Serie: "+m.beste+". "+
      (m.falsch===0 ? "Und kein einziger Fehler!" : "Weiter so!");
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
      sagen("m-rueckmeldung",waehle(lobWorte)+"  +"+gewinn+" Gold","gut");
      mZeichnen(); m.flashNeu = false;
      mKopf();
      const truheFaellig = truheZaehlen();
      setTimeout(()=>{
        const weiter = () => { m.aktiv>=m.reihenfolge.length ? mWandFertig() : mNaechsteLuecke(); };
        truheFaellig ? truheZeigen(weiter) : weiter();
      },1050);
    }else{
      m.gesperrt = true; sperren("m-zahlen");
      knopf.classList.add("falsch");
      zeigeLoesung("m-zahlen",loesung);
      m.falsch++; m.serie = 0;
      const weg = goldWeg();
      kFalsch();
      sagen("m-rueckmeldung","Richtig wäre: "+loesung+(weg?"  −"+weg+" Gold":""),"schlecht");
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
    sagen("m-rueckmeldung","Weiter mit der nächsten Lücke.","");
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
  const TURNIER_GEGNER = [
    { name:"Ritter Blauhelm",  stufen:[1],     beute:50 },
    { name:"Graf Grauguss",    stufen:[1,2],   beute:75 },
    { name:"Sir Silberzahn",   stufen:[2,3],   beute:100 },
    { name:"König Goldhelm",   stufen:[3,4],   beute:150 }
  ];
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
    return TURNIER_GEGNER[Math.min(t.gegner,TURNIER_GEGNER.length-1)].name;
  }
  function tZeichnen(){
    const k = kontoAktuell();
    $("t-name-ich").textContent    = (k && k.name) || "Dein Ritter";
    $("t-name-gegner").textContent = tGegnerName();
    $("t-treffer-ich").textContent    = "⚔".repeat(t.richtig);
    $("t-treffer-gegner").textContent = "⚔".repeat(t.falsch);
    $("t-ritt").textContent = "Ritt "+(t.richtig+t.falsch)+"/"+TURNIER_RITTE;
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
    sagen("t-rueckmeldung","Welche Zahl passt?","");
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
        $("t-erg-titel").textContent = g.name+" aus dem Sattel!";
        $("t-erg-text").textContent = "Du hast "+t.richtig+" Treffer gelandet – weiter geht's gegen "+tGegnerName()+".";
        $("t-erg-gold").textContent = "🪙 +"+beute+" Gold";
        $("ov-turnier").classList.add("is-offen");
      },RITT_HIN+680);
    } else {
      kAus();
      tRitt("ich",true);
      setTimeout(()=> funken("t-funken","💥",12), RITT_HIN);
      setTimeout(()=> $("t-ich").classList.add("faellt"), RITT_HIN+160);
      setTimeout(()=>{
        $("t-erg-emoji").textContent = "🛡️";
        $("t-erg-titel").textContent = tGegnerName()+" war stärker";
        $("t-erg-text").textContent = "Du hast "+t.richtig+" gelöst, aber "+t.falsch+" Fehler gemacht. Noch ein Versuch?";
        $("t-erg-gold").textContent = "";
        $("ov-turnier").classList.add("is-offen");
      },RITT_HIN+680);
    }
  }
  function tTurnierSieg(beute){
    kSieg();
    $("t-erg-emoji").textContent = "🏆";
    $("t-erg-titel").textContent = "Turnier gewonnen!";
    $("t-erg-text").textContent = "Alle Ritter sind besiegt – "+t.richtig+" gelöste Aufgaben, beste Serie: "+t.beste+".";
    $("t-erg-gold").textContent = "🪙 +"+beute+" Gold";
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
      sagen("t-rueckmeldung",waehle(lobWorte)+"  +"+gewinn+" Gold","gut");
      const letzter = (t.richtig+t.falsch) >= TURNIER_RITTE;
      /* Beim letzten Ritt übernimmt tKampf() das Anreiten – die Münzen fliegen
         dann schon in der kurzen Pause davor. */
      if(letzter){
        funken("t-funken","🪙",mult*4);
      } else {
        tRitt("gegner");
        setTimeout(()=> funken("t-funken","🪙",mult*4), RITT_HIN);
      }
      tZeichnen();
      tKopf();
      const truheFaellig = truheZaehlen();
      setTimeout(()=>{
        const weiter = () => { letzter ? tKampf() : tNeueAufgabe(); };
        truheFaellig ? truheZeigen(weiter) : weiter();
      }, letzter ? 400 : RITT_GESAMT+160);
    } else {
      knopf.classList.add("falsch");
      zeigeLoesung("t-zahlen",t.aufgabe.antwort);
      t.falsch++; t.serie = 0;
      const weg = goldWeg();
      kFalsch();
      if((t.richtig+t.falsch) < TURNIER_RITTE) tRitt("ich");
      sagen("t-rueckmeldung", weg
        ? "Daneben! "+t.aufgabe.loesung+"  −"+weg+" Gold."
        : "Daneben! "+t.aufgabe.loesung, "schlecht");
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
    alle("[data-ton]").forEach(b => b.textContent = opt.ton ? "🔊 Ton" : "🔇 Ton aus");
    $("btn-ton-start").textContent = opt.ton ? "🔊 Ton an" : "🔇 Ton aus";
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
    }
  }
  function kontoDatenLaden(){
    laden(); optLaden(); optAnwenden();
    puzzleLaden(); burgLaden(); hoehleLaden();
    burg.auswahl = null; burg.geloest = false;
    schatzZeichnen(); puzzleZeichnen(); burgZeichnen(); hoehleZeichnen();
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
      neu.innerHTML = '<span class="plus">➕</span><span class="name">Neues Kind</span>';
      neu.addEventListener("click", kontoNeuZeigen);
      g.appendChild(neu);
    }
  }
  function kontoOeffnen(){
    kontoGitterZeichnen();
    $("ov-konto").classList.add("is-offen");
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
    $("konto-name-eingabe").value = "";
    avatarWahlZeichnen();
    $("ov-konto").classList.remove("is-offen");
    $("ov-konto-neu").classList.add("is-offen");
  }
  function kontoAnlegen(){
    if(konto.liste.length>=MAX_KONTEN) return;
    const name = ($("konto-name-eingabe").value||"").trim();
    const id = kontoNeuId();
    konto.liste.push({
      id:id,
      name: name || ("Ritter "+(konto.liste.length+1)),
      bild: konto.neuBild || AVATARE[0]
    });
    kontoListeSichern();
    konto.aktiv = id;
    kontoAktivSichern();
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

  kontoInit();
  laden();
  optLaden();
  optAnwenden();
  puzzleLaden();
  burgLaden();
  hoehleLaden();
  schatzZeichnen();
  puzzleZeichnen();
  burgZeichnen();
  hoehleZeichnen();
  kontoAnzeigen();
})();
