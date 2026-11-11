/*
  WoW Forever HUD — gemeinsame Logik für Static_9_WoWForever.html + Static_10_WoWStyle.html
  ───────────────────────────────────────────────────────────────────────────────────────
  Live-Daten kommen aus dem Streambot (/api/public/overlay/stats + /labels).
  → Muss unter streambot.d4rkst3r.de/overlays/ laufen (CORS), sonst nur statisch.

  Skin-Optionen (data-Attribute am <body>):
    data-sub-quest="1"      Sub-Ziel als Quest im Tracker (Standard 1)
    data-level-quest="0"    "Der Weg zur 60" als Quest (Standard 0, im Hardcore-Modus immer über "Unsterblich")
    data-follow-label="…"   Beschriftung der Follower-Leiste (Standard "Gefolgschaft")
    data-sub-label="…"      Beschriftung der Sub-Leiste (Standard "Abonnenten", nur wenn #subBar existiert)

  URL-Parameter:
    demo            Fake-Daten + simulierte Events (zum Testen/Vorschau)
    guide=1         Spiel-UI-Zonen einblenden (bei demo automatisch an, guide=0 = aus)
    fit             Seite auf Fenstergröße skalieren (Browser-Vorschau)
    name=D4RKST3R   Name auf der Plakette
    avatar=pfad.png Portrait-Bild (Standard: assets/cat_alliance_portrait.png)
    race=… class=… realm=…   Charakterzeile, z.B. race=Zwerg&class=Paladin
                    (Klasse deutsch/englisch → Klassen-Icon aus assets/classes/ + Klassenfarbe; classIcon=0 = Icon aus)
    crest=pfad.png  Allianz-Logo (Standard: assets/alliance_logo.png, crest=0 = aus)
    logo=pfad.png   WoW-Forever-Logo unten rechts (Standard: assets/wow_forever_logo.png, logo=0 = aus)
    lvl=1           Startlevel (danach in OBS per "Interagieren": Klick auf Portrait = +1, Rechtsklick = −1)
    max=60          Maximalstufe
    hc=1            Hardcore-Modus (Tode-Counter wird zur "Unsterblich"-Quest)
    goal=500        Follower-Ziel (Standard: automatisch nächste runde Zahl)
    subGoal=30      Sub-Ziel (Standard: automatisch)
    q=Quest A;Quest B   Eigene Quests (per Klick in OBS abhaken)
    deaths=0        Tode-Quest ausblenden (nur ohne hc)
    panel=0 / xp=0 / toast=0   Einzelne Elemente ausblenden
    panelY=420      Y-Position des Quest-Panels
    side=right      Quest-Panel rechts statt links
    start=19:30     /played-Startzeit (Standard: Laden der Quelle)
    api=https://…   API-Basis (Standard: gleiche Domain)
    poll=10         Abfrage-Intervall in Sekunden
    reset=1         Gespeichertes Level + Quest-Haken zurücksetzen
*/
(() => {
  const P    = new URLSearchParams(location.search);
  const B    = document.body.dataset;
  const DEMO = P.has('demo');
  const API  = (P.get('api') || '').replace(/\/$/, '');
  const HC   = P.get('hc') === '1';
  const MAX_LVL = parseInt(P.get('max'), 10) || 60;
  const POLL_MS = Math.max(5, parseInt(P.get('poll'), 10) || 10) * 1000;
  const TOASTS  = P.get('toast') !== '0';

  const OPT = {
    subQuest:    B.subQuest !== '0',
    levelQuest:  B.levelQuest === '1',
    followLabel: B.followLabel || 'Gefolgschaft',
    subLabel:    B.subLabel || 'Abonnenten',
  };

  const $   = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Number(n).toLocaleString('de-DE');

  // WoW-Icons (assets/icons/<name>.jpg) — fällt auf das Unicode-Symbol zurück, falls das Bild fehlt
  const iconHtml = (img, glyph) => img
    ? `<img src="assets/icons/${img}.jpg" alt="" onerror="this.parentNode.textContent='${glyph}'">`
    : glyph;

  // ── Speicher: OBS-Browserquellen behalten localStorage. Demo nutzt nur RAM. ──
  const mem = {};
  const store = {
    get(k, d) {
      if (DEMO) return k in mem ? mem[k] : d;
      try { const v = localStorage.getItem('wowf:' + k); return v === null ? d : JSON.parse(v); }
      catch { return d; }
    },
    set(k, v) {
      if (DEMO) { mem[k] = v; return; }
      try { localStorage.setItem('wowf:' + k, JSON.stringify(v)); } catch {}
    },
  };
  if (P.has('reset')) {
    try {
      Object.keys(localStorage).filter(k => k.startsWith('wowf:')).forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  // ── Layout-Optionen ──
  if (P.get('guide') === '1' || (DEMO && P.get('guide') !== '0')) document.body.classList.add('guide-on');
  if (P.has('fit')) {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${s})`;
  }
  if (P.get('panel') === '0') $('panel')?.classList.add('hidden');
  if (P.get('xp') === '0') { $('xp')?.classList.add('hidden'); $('subBar')?.classList.add('hidden'); }
  if (P.get('side') === 'right') $('panel')?.classList.add('right');
  const panelY = parseInt(P.get('panelY'), 10);
  if (panelY && $('panel')) $('panel').style.top = panelY + 'px';

  // ── Plakette / Unit-Frame ──
  $('name').textContent = P.get('name') || 'D4RKST3R';
  const race  = P.get('race')  ?? (DEMO ? 'Zwerg' : '');
  const cls   = P.get('class') ?? (DEMO ? 'Paladin' : '');
  const realm = P.get('realm') ?? '';
  // Klassen: Icon (assets/classes/<key>.png) + offizielle Klassenfarbe; deutsch oder englisch
  const CLASSES = {
    krieger: ['warrior', '#C69B6D'],      warrior: ['warrior', '#C69B6D'],
    paladin: ['paladin', '#F48CBA'],
    'jäger': ['hunter', '#AAD372'],       jaeger: ['hunter', '#AAD372'],   hunter: ['hunter', '#AAD372'],
    schurke: ['rogue', '#FFF468'],        rogue: ['rogue', '#FFF468'],
    priester: ['priest', '#FFFFFF'],      priest: ['priest', '#FFFFFF'],
    schamane: ['shaman', '#2E8CFF'],      shaman: ['shaman', '#2E8CFF'],   // offiziell #0070DD, aufgehellt für dunklen Grund
    magier: ['mage', '#3FC7EB'],          mage: ['mage', '#3FC7EB'],
    hexenmeister: ['warlock', '#8788EE'], warlock: ['warlock', '#8788EE'],
    druide: ['druid', '#FF7C0A'],         druid: ['druid', '#FF7C0A'],
  };
  const clsInfo = CLASSES[cls.trim().toLowerCase()] || null;
  const showClassIcon = clsInfo && P.get('classIcon') !== '0';
  if (clsInfo) document.body.style.setProperty('--class-color', clsInfo[1]);

  // Icon: eigener Badge-Slot (#classBadge) falls vorhanden, sonst klein in der Charakterzeile
  const badge = $('classBadge');
  if (badge && showClassIcon) {
    const img = badge.querySelector('img');
    img.addEventListener('load', () => badge.classList.remove('hidden'));
    img.src = `assets/classes/${clsInfo[0]}.png`;
  }
  const inlineIcon = showClassIcon && !badge
    ? `<img class="class-icon" src="assets/classes/${clsInfo[0]}.png" alt="" onerror="this.remove()">` : '';
  const clsHtml = cls
    ? `<span class="cls"${clsInfo ? ` style="color:${clsInfo[1]}"` : ''}>${esc(cls)}</span>` : '';
  const lineParts = [race && esc(race), clsHtml, realm && esc(realm)].filter(Boolean);
  $('charline').innerHTML =
    (HC ? '<span class="hc-tag">Hardcore</span>' : '') + inlineIcon +
    (lineParts.length ? lineParts.join(' · ') : 'Für die Allianz · WoW Forever');

  // ── Allianz-Logo (erst zeigen, wenn das Bild wirklich geladen ist) ──
  const crestSrc = P.get('crest');
  document.body.classList.add('no-crest');
  if (crestSrc !== '0' && $('crestImg')) {
    const img = $('crestImg');
    img.addEventListener('load', () => document.body.classList.remove('no-crest'));
    img.src = crestSrc || 'assets/alliance_logo.png';
  }

  // ── Portrait-Bild (Standard: assets/cat_alliance_portrait.png, z.B. ?avatar=assets/cat_starting.png) ──
  const avatar = P.get('avatar');
  if (avatar && $('avatar')) $('avatar').src = avatar;

  // ── WoW-Forever-Logo unten rechts ──
  const logoSrc = P.get('logo');
  if (logoSrc !== '0' && $('gameLogo')) {
    const logo = $('gameLogo');
    logo.addEventListener('load', () => logo.classList.remove('hidden'));
    logo.src = logoSrc || 'assets/wow_forever_logo.png';
  }

  // ── /played-Timer ──
  let t0 = Date.now();
  const start = P.get('start');
  if (start && /^\d{1,2}:\d{2}$/.test(start)) {
    const [h, m] = start.split(':').map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    if (d.getTime() > Date.now()) d.setDate(d.getDate() - 1);
    t0 = d.getTime();
  }
  function tick() {
    const s = Math.max(0, Math.floor((Date.now() - t0) / 1000));
    $('timer').textContent =
      `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  tick();
  setInterval(tick, 1000);

  // ── Level (Klick aufs Portrait in OBS "Interagieren") ──
  const clampLvl = n => Math.min(MAX_LVL, Math.max(1, n | 0));
  let level = clampLvl(store.get('lvl', parseInt(P.get('lvl'), 10) || (DEMO ? 34 : 1)));
  function renderLevel(pop) {
    const el = $('lvl');
    el.textContent = level;
    if (pop) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  $('portrait').addEventListener('click', () => {
    if (level >= MAX_LVL) return;
    level = clampLvl(level + 1);
    store.set('lvl', level);
    renderLevel(true);
    renderQuests();
    toast({
      kind: 'ding', q: 'legendary', icon: '▲', head: 'Stufe aufgestiegen!',
      img: level >= MAX_LVL ? 'achievement_level_60' : 'spell_holy_surgeoflight',
      item: `Stufe ${level}`,
      who: level >= MAX_LVL ? 'Maximalstufe erreicht — für die Allianz!' : 'Ding! GZ in den Chat!',
      ms: 6500,
    });
  });
  $('portrait').addEventListener('contextmenu', e => {
    e.preventDefault();
    level = clampLvl(level - 1);
    store.set('lvl', level);
    renderLevel(false);
    renderQuests();
  });
  renderLevel(false);

  // ── Ziele ──
  const fixedFollowGoal = parseInt(P.get('goal'), 10) || null;
  const fixedSubGoal    = parseInt(P.get('subGoal'), 10) || null;
  function autoGoal(n, kind) {
    const step = kind === 'sub'
      ? (n < 50 ? 5 : n < 200 ? 10 : 25)
      : (n < 100 ? 25 : n < 1000 ? 100 : n < 5000 ? 250 : 500);
    return Math.floor(n / step) * step + step;
  }
  const followGoalFor = n => fixedFollowGoal || autoGoal(n, 'follow');
  const subGoalFor    = n => fixedSubGoal    || autoGoal(n, 'sub');

  // ── State ──
  const state = { followers: null, subs: null, deaths: null };
  const customQuests = (P.get('q') || '').split(';').map(s => s.trim()).filter(Boolean);

  // ── Leisten: Follower (#xp) und optional Subs (#subBar) ──
  function renderBar(ids, value, goalFor, label) {
    const bar = $(ids[0]);
    if (!bar) return;
    if (value == null) {
      $(ids[1]).style.width = '0%';
      $(ids[2]).textContent = `${label} · —`;
      return;
    }
    const goal = goalFor(value);
    const pct  = Math.min(1, value / goal);
    $(ids[1]).style.width = (pct * 100).toFixed(1) + '%';
    bar.classList.toggle('full', pct >= 1);
    $(ids[2]).innerHTML = pct >= 1
      ? `${esc(label)} <span>${fmt(value)}</span> · Ziel erreicht!`
      : `${esc(label)} <span>${fmt(value)} / ${fmt(goal)}</span> (${Math.floor(pct * 100)}%)`;
  }
  function renderBars() {
    renderBar(['xp', 'xpFill', 'xpLabel'], state.followers, followGoalFor, OPT.followLabel);
    renderBar(['subBar', 'subFill', 'subLabel'], state.subs, subGoalFor, OPT.subLabel);
  }

  // ── Quests ──
  function buildQuests() {
    const list = [];
    if (OPT.subQuest && state.subs != null) {
      const goal = subGoalFor(state.subs);
      list.push({
        title: 'Siegel der Treue', tag: '[Gruppe]',
        obj: `Abonnenten: ${state.subs} / ${goal}`,
        pct: state.subs / goal, done: state.subs >= goal,
      });
    }
    if (HC) {
      const dead = (state.deaths || 0) > 0;
      list.push(dead
        ? { title: 'Unsterblich', tag: '[Hardcore]', obj: `Gefallen auf Stufe ${level}`, failed: true }
        : { title: 'Unsterblich', tag: '[Hardcore]', obj: `Überlebe bis Stufe ${MAX_LVL}: ${level} / ${MAX_LVL}`,
            pct: level / MAX_LVL, done: level >= MAX_LVL });
    } else {
      if (OPT.levelQuest) {
        list.push({ title: `Der Weg zur ${MAX_LVL}`, tag: '[Kampagne]', obj: `Stufe ${level} / ${MAX_LVL}`,
                    pct: level / MAX_LVL, done: level >= MAX_LVL });
      }
      if (state.deaths != null && P.get('deaths') !== '0') {
        list.push({ title: 'Geistheiler-Besuche', tag: '[Wiederholbar]', obj: `Tode: ${state.deaths}` });
      }
    }
    customQuests.forEach(t => list.push({ id: t, title: t, custom: true, done: !!store.get('q:' + t, false) }));
    return list;
  }

  let flashQuest = null;
  function renderQuests() {
    const list = buildQuests();
    $('quests').innerHTML = list.map(q => {
      const cls = ['quest', q.done && 'done', q.failed && 'failed', q.custom && 'custom',
                   q.id && q.id === flashQuest && 'flash'].filter(Boolean).join(' ');
      const st  = q.done ? '<span class="q-state">(Abgeschlossen)</span>'
                : q.failed ? '<span class="q-state">(Gescheitert)</span>' : '';
      const tag = q.tag ? `<span class="q-tag">${esc(q.tag)}</span>` : '';
      const obj = q.obj ? `<div class="q-obj">${esc(q.obj)}</div>` : '';
      const bar = q.pct != null && !q.failed
        ? `<div class="q-bar"><i style="width:${Math.min(100, q.pct * 100).toFixed(1)}%"></i></div>` : '';
      const data = q.custom ? ` data-q="${esc(q.id)}"` : '';
      return `<li class="${cls}"${data}><div class="q-head"><span class="q-title">${esc(q.title)}</span>${tag}${st}</div>${obj}${bar}</li>`;
    }).join('');
    flashQuest = null;
  }
  $('quests').addEventListener('click', e => {
    const li = e.target.closest('[data-q]');
    if (!li) return;
    const t = li.dataset.q;
    const done = !store.get('q:' + t, false);
    store.set('q:' + t, done);
    if (done) {
      flashQuest = t;
      toast({ kind: 'quest', q: 'quest', icon: '❖', img: 'inv_scroll_03',
              head: 'Quest abgeschlossen', item: t, who: '+ Ruhm & Ehre' });
    }
    renderQuests();
  });

  // ── Beute (letzte Events in Item-Qualität) ──
  const RANK = { legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
  function subQuality(tier) {
    const n = parseInt(tier, 10) || 1;
    const t = n >= 1000 ? Math.round(n / 1000) : n;
    return t >= 3 ? ['legendary', 'T3'] : t >= 2 ? ['epic', 'T2'] : ['rare', 'T1'];
  }
  const bitsQuality = b => b >= 10000 ? 'legendary' : b >= 1000 ? 'epic' : b >= 100 ? 'rare' : 'uncommon';

  function lootFrom(d) {
    const out = [];
    if (!d) return out;
    if (d.lastRaid)    out.push({ key: 'raid',  q: 'legendary', icon: '⚔', img: 'inv_bannerpvp_02',
                                  item: 'Kriegsbande', who: d.lastRaid.name, meta: `${fmt(d.lastRaid.viewers)} Krieger` });
    if (d.lastGiftSub) out.push({ key: 'gift',  q: 'epic', icon: '✉', img: 'inv_misc_gift_02',
                                  item: 'Geschenkte Siegel', who: d.lastGiftSub.name, meta: `×${d.lastGiftSub.count}` });
    if (d.lastSub) {
      const [q, t] = subQuality(d.lastSub.tier);
      out.push({ key: 'sub', q, icon: '⚜', img: 'spell_holy_sealofrighteousness',
                 item: 'Treuesiegel', who: d.lastSub.name, meta: t });
    }
    if (d.lastCheer)   out.push({ key: 'cheer', q: bitsQuality(d.lastCheer.bits), icon: '◆', img: 'inv_misc_gem_sapphire_02',
                                  item: 'Bitkristall', who: d.lastCheer.name, meta: `${fmt(d.lastCheer.bits)} Bits` });
    if (d.lastFollower) out.push({ key: 'follow', q: 'uncommon', icon: '✦', img: 'achievement_reputation_01',
                                   item: 'Gefährte', who: d.lastFollower, meta: '' });
    return out.sort((a, b) => RANK[b.q] - RANK[a.q]);
  }

  let prevLoot = null;
  function onLabels(d) {
    const loot = lootFrom(d);
    const sig  = Object.fromEntries(loot.map(l => [l.key, `${l.who}|${l.meta}`]));
    const fresh = new Set();
    if (prevLoot) {
      loot.forEach(l => {
        if (prevLoot[l.key] !== sig[l.key]) {
          fresh.add(l.key);
          const raid = l.key === 'raid';
          toast({
            kind: raid ? 'raid' : 'loot', q: l.q, icon: l.icon, img: l.img,
            head: raid ? 'Verstärkung für die Allianz!' : 'Beute erhalten',
            item: `[${l.item}]`,
            who: `von <b>${esc(l.who)}</b>${l.meta ? ' · ' + esc(l.meta) : ''}`, html: true,
            ms: raid ? 7000 : 5500,
          });
        }
      });
    }
    prevLoot = sig;
    $('loot').innerHTML = loot.length
      ? loot.map(l => `
          <li class="q-${l.q}${fresh.has(l.key) ? ' fresh' : ''}">
            <span class="ico">${iconHtml(l.img, l.icon)}</span>
            <span class="item">[${esc(l.item)}]</span>
            <span class="who">${esc(l.who)}</span>
            ${l.meta ? `<span class="meta">${esc(l.meta)}</span>` : ''}
          </li>`).join('')
      : '<li class="empty">Noch keine Beute …</li>';
  }

  // ── Stats (Follower, Subs, Tode, Live) ──
  let prevFollowers = null, prevSubs = null, prevDeaths = null;
  function onStats(s) {
    if (typeof s.live === 'boolean') {
      $('live').classList.toggle('off', !s.live);
      $('liveText').textContent = s.live ? 'LIVE' : 'OFFLINE';
    }
    if (s.followers != null) {
      if (prevFollowers != null && s.followers > prevFollowers) {
        const goal = followGoalFor(prevFollowers);
        if (prevFollowers < goal && s.followers >= goal) {
          toast({ kind: 'ding', q: 'legendary', icon: '★', img: 'achievement_quests_completed_01', head: 'Erfolg errungen!',
                  item: `${fmt(goal)} Follower`, who: 'Danke euch allen — für die Allianz!', ms: 7500 });
        }
      }
      prevFollowers = state.followers = s.followers;
    }
    if (s.subs != null) {
      if (prevSubs != null && s.subs > prevSubs) {
        const goal = subGoalFor(prevSubs);
        if (prevSubs < goal && s.subs >= goal) {
          toast({ kind: 'ding', q: 'epic', icon: '⚜', img: 'spell_holy_sealofrighteousness', head: 'Erfolg errungen!',
                  item: `${fmt(goal)} Abonnenten`, who: 'Das Siegel der Treue ist vollendet!', ms: 7500 });
        }
      }
      prevSubs = state.subs = s.subs;
    }
    if (s.deaths != null) {
      if (prevDeaths != null && s.deaths > prevDeaths) {
        toast(HC
          ? { kind: 'death', q: 'dead', icon: '☠', img: 'inv_misc_bone_humanskull_01',
              head: 'Ein Held ist gefallen', item: 'Hardcore-Run beendet',
              who: `Stufe ${level} · F in den Chat`, ms: 9000 }
          : { kind: 'death', q: 'dead', icon: '☠', img: 'inv_misc_bone_humanskull_01',
              head: 'Du bist gestorben', item: 'Ab zum Geistheiler',
              who: `Tod Nr. ${s.deaths}` });
      }
      prevDeaths = state.deaths = s.deaths;
    }
    document.body.classList.toggle('fallen', HC && (state.deaths || 0) > 0);
    renderBars();
    renderQuests();
  }

  // ── Toast-Warteschlange ──
  const queue = [];
  let busy = false;
  function toast(t) {
    if (!TOASTS) return;
    queue.push(t);
    if (!busy) nextToast();
  }
  function nextToast() {
    const t = queue.shift();
    if (!t) { busy = false; return; }
    busy = true;
    const el = $('toast');
    el.className = `toast q-${t.q} kind-${t.kind || 'loot'}`;
    $('tIco').innerHTML    = iconHtml(t.img, t.icon);
    $('tHead').textContent = t.head;
    $('tItem').textContent = t.item;
    if (t.html) $('tWho').innerHTML = t.who; else $('tWho').textContent = t.who;
    void el.offsetWidth;
    el.classList.add('show');
    if (['epic', 'legendary', 'quest'].includes(t.q) || t.kind === 'ding') el.classList.add('shine');
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(nextToast, 600);
    }, t.ms || 5500);
  }

  // ── Live-Daten vom Streambot ──
  async function getJSON(path) {
    const r = await fetch(API + path, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }
  async function poll() {
    const [st, lb] = await Promise.allSettled([
      getJSON('/api/public/overlay/stats'),
      getJSON('/api/public/labels'),
    ]);
    if (st.status === 'fulfilled') onStats(st.value);
    if (lb.status === 'fulfilled') onLabels(lb.value);
  }

  // ── Demo: Fake-Daten + Event-Simulation ──
  function runDemo() {
    const s  = { live: true, followers: 496, subs: 23, deaths: HC ? 0 : 2 };
    const lb = {
      lastFollower: 'NachtfalkeNele',
      lastSub:      { name: 'Grumpfbart', tier: 1 },
      lastGiftSub:  null,
      lastCheer:    { name: 'BitBaron', bits: 300 },
      lastRaid:     { name: 'Gnomengarde', viewers: 42 },
    };
    onStats({ ...s });
    onLabels(JSON.parse(JSON.stringify(lb)));

    const steps = [
      () => { s.followers += 1; lb.lastFollower = 'Kobold_Kurt'; },
      () => { s.subs += 1; lb.lastSub = { name: 'Zwergenzorn', tier: 2 }; },
      () => { lb.lastRaid = { name: 'Tavernentrupp', viewers: 87 }; },
      () => { s.followers += 3; lb.lastFollower = 'Runenratte'; },
      () => { s.deaths += 1; },
      () => { lb.lastGiftSub = { name: 'Lisa_TV', count: 10 }; s.subs += 10; },
      () => { lb.lastCheer = { name: 'Goldgräber', bits: 12000 }; },
    ];
    let i = 0;
    setInterval(() => {
      steps[i % steps.length]();
      i++;
      onStats({ ...s });
      onLabels(JSON.parse(JSON.stringify(lb)));
    }, 7000);
  }

  renderBars();
  renderQuests();
  if (DEMO) {
    runDemo();
  } else {
    poll();
    setInterval(poll, POLL_MS);
  }
})();
