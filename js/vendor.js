// ===== Extras comunes 1.15 / 1.2: Mis hashtags · Creador de promos · Guardar logo PNG · Voz Piper sin conexión =====
// Sin speechSynthesis: la voz en off sale de Piper (sherpa-onnx WebAssembly, es_ES-davefx-medium) dentro de la app;
// si el dispositivo no puede con WebAssembly, se concatenan piezas de palabras pregrabadas del presentador.
function crearExtras(cfg) {
  const P = cfg.pref, $ = (t, css, html) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (html != null) d.innerHTML = html; return d; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = m => { try { cfg.toast(m); } catch (e) { } };
  const LSJ = (k, d) => { try { return JSON.parse(localStorage.getItem(P + '_' + k)) || d; } catch (e) { return d; } };
  const LSG = (k, v) => { try { localStorage.setItem(P + '_' + k, JSON.stringify(v)); } catch (e) { } };
  const C1 = cfg.color || '#f5c542', C2 = cfg.color2 || '#0a1a5a';
  const sinTeclas = z => { z.addEventListener('keydown', e => e.stopPropagation()); z.addEventListener('pointerup', e => e.stopPropagation()); return z; };
  const inp = (v, ph, max = 60) => sinTeclas(Object.assign($('input', 'width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid #888;background:#111a;color:#fff;font:15px system-ui'), { type: 'text', value: v || '', placeholder: ph, maxLength: max }));
  const sel = (ops, v) => { const s = sinTeclas($('select', 'width:100%;padding:8px;border-radius:8px;background:#111;color:#fff;font:15px system-ui')); for (const [k, t] of ops) { const o = $('option'); o.value = k; o.textContent = t; if (k === v) o.selected = true; s.appendChild(o); } return s; };
  const btn = (t, fn, prim) => { const b = $('button', `margin:4px;padding:9px 14px;border-radius:10px;border:2px solid ${C1};background:${prim ? C1 : 'transparent'};color:${prim ? '#111' : '#fff'};font:bold 14px system-ui;cursor:pointer`); b.innerHTML = t; b.onclick = e => { e.stopPropagation(); fn(b); }; return b; };
  function capa(titulo) { // ventana a pantalla completa propia
    const o = $('div', `position:fixed;inset:0;z-index:99990;background:#000d;display:flex;align-items:center;justify-content:center;font:15px system-ui;color:#fff`);
    const v = $('div', `width:min(760px,94vw);max-height:92vh;overflow:auto;background:linear-gradient(${C2},#05081a);border:2px solid ${C1};border-radius:16px;padding:14px 16px;box-sizing:border-box`);
    v.appendChild($('div', `font:bold 20px system-ui;color:${C1};margin-bottom:8px`, esc(titulo))); o.appendChild(v); document.body.appendChild(o);
    ['pointerdown', 'pointerup', 'click', 'keydown', 'wheel', 'touchstart'].forEach(ev => o.addEventListener(ev, e => e.stopPropagation()));
    return { o, v, cierra: () => o.remove() };
  }

  // ---------- Guardar archivos (Android: puente MediaStore; web: enlace de descarga) ----------
  async function guardar(nombre, blob, carpeta) {
    const N = window.AppNativo;
    if (N && N.guardarArchivo) {
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
      const res = N.guardarArchivo(nombre, blob.type || 'application/octet-stream', b64, carpeta || 'Download');
      toast(String(res).startsWith('ok') ? 'Guardado en ' + String(res).slice(3) : 'No se pudo guardar: ' + res); return res;
    }
    const a = $('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); toast('Descargando ' + nombre); return 'ok:' + nombre;
  }

  // ---------- Guardar logo (PNG transparente, 2048 px) ----------
  const limpio = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'logo';
  async function logoPNG(v) { const c = await cfg.logoCanvas(2048, v); return await new Promise(r => c.toBlob(r, 'image/png')); }
  async function guardarLogo(v) { const b = await logoPNG(v); return guardar(`logo-${P}-${limpio(v.nombre)}.png`, b, 'Pictures'); }
  function zip(archivos) { // ZIP sin compresión (store) para descargar todas las variantes de una vez en la web
    const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
    const crc = d => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = crcT[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
    const partes = [], central = []; let off = 0; const te = new TextEncoder();
    for (const [nombre, d] of archivos) { const n = te.encode(nombre), c = crc(d), h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, c, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, n.length, true); partes.push(h.buffer, n, d);
      const e = new DataView(new ArrayBuffer(46)); e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x0800, true); e.setUint32(16, c, true); e.setUint32(20, d.length, true); e.setUint32(24, d.length, true); e.setUint16(28, n.length, true); e.setUint32(42, off, true); central.push(e.buffer, n); off += 30 + n.length + d.length; }
    const tam = central.reduce((s, x) => s + (x.byteLength || x.length), 0), f = new DataView(new ArrayBuffer(22)); f.setUint32(0, 0x06054b50, true); f.setUint16(8, archivos.length, true); f.setUint16(10, archivos.length, true); f.setUint32(12, tam, true); f.setUint32(16, off, true);
    return new Blob([...partes, ...central, f.buffer], { type: 'application/zip' });
  }
  async function guardarTodos() { const L = cfg.variantesLogo(); let n = 0;
    if (!(window.AppNativo && window.AppNativo.guardarArchivo)) { const A = []; for (const v of L) toast(`Preparando logo ${A.length + 1} de ${L.length}…`), A.push([`logo-${P}-${limpio(v.nombre)}.png`, new Uint8Array(await (await logoPNG(v)).arrayBuffer())]); await guardar(`logos-${P}.zip`, zip(A), 'Download'); toast(A.length + ' logos en un ZIP'); return A.length; } for (const v of L) { await guardarLogo(v); n++; await new Promise(r => setTimeout(r, 350)); } toast(n + ' logos guardados'); return n; }
  function panelLogo() {
    const w = capa('🖼 Guardar logo (PNG transparente)'); const L = cfg.variantesLogo();
    w.v.appendChild($('p', 'opacity:.8;margin:4px 0 10px', 'Exporta el logo a 2048×2048 px con fondo transparente. En Android se guarda en Imágenes; en la web se descarga.'));
    const g = $('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px');
    for (const v of L) { const c = $('div', 'background:repeating-conic-gradient(#333 0 25%,#222 0 50%) 0/16px 16px;border-radius:10px;padding:6px;text-align:center'); const im = $('img', 'width:100%;aspect-ratio:1'); cfg.logoCanvas(256, v).then(cv => im.src = cv.toDataURL()); c.append(im, $('div', 'font-size:12px;margin:4px 0', esc(v.nombre)), btn('💾 Guardar', () => guardarLogo(v))); g.appendChild(c); }
    w.v.append(g, $('div', 'margin-top:10px', ''), btn('💾 Guardar TODAS las variantes', () => guardarTodos(), true), btn('Cerrar', w.cierra));
    return w;
  }

  // ---------- Mis hashtags ----------
  const HT = () => LSJ('hashtags', { on: true, pos: 'sd', general: [cfg.hashtagDef || '#' + limpio(cfg.titulo()).replace(/-/g, '')], esp: {} });
  const htLista = (esp) => { const h = HT(); const e = (esp && h.esp[esp]) || []; const L = [...e, ...h.general].filter(Boolean); return L.length ? L : []; };
  const htActual = (t = performance.now()) => { const h = HT(); if (!h.on) return ''; const L = htLista(cfg.especial()); return L.length ? L[Math.floor(t / 6000) % L.length] : ''; };
  let bug = null, bugTimer = 0;
  function bugMostrar(on = true) {
    const h = HT(); if (!on || !h.on || !htLista(cfg.especial()).length) { if (bug) bug.style.display = 'none'; return; }
    if (!bug) { bug = $('div', 'position:fixed;z-index:9000;pointer-events:none;padding:5px 12px;border-radius:8px;font:bold clamp(12px,2.2vw,20px) system-ui;color:#fff;background:#0008;border-left:4px solid ' + C1 + ';transition:opacity .5s;text-shadow:0 1px 3px #000'); document.body.appendChild(bug); }
    const pos = { si: 'top:10px;left:10px', sd: 'top:10px;right:10px', ii: 'bottom:12px;left:10px', id: 'bottom:12px;right:10px' }[h.pos] || 'top:10px;right:10px';
    bug.style.top = bug.style.bottom = bug.style.left = bug.style.right = ''; pos.split(';').forEach(p => { const [k, v] = p.split(':'); bug.style[k] = v; });
    bug.style.display = ''; const pon = () => { const t = htActual(); if (bug.textContent !== t) { bug.style.opacity = 0; setTimeout(() => { bug.textContent = t; bug.style.opacity = 1; }, 450); } };
    pon(); clearInterval(bugTimer); bugTimer = setInterval(pon, 1000);
  }
  function bugOcultar() { clearInterval(bugTimer); if (bug) bug.style.display = 'none'; }
  function htDibuja(g, w, h, t) { // para pantallas LED / canvas de promos y cabeceras
    const s = htActual(t); if (!s) return; const H = HT(); const fs = Math.round(h * .06); g.save(); g.font = `bold ${fs}px system-ui`; const tw = g.measureText(s).width + fs;
    const x = H.pos[1] === 'i' ? fs * .6 : w - tw - fs * .6, y = H.pos[0] === 's' ? fs * .6 : h - fs * 2;
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x, y, tw, fs * 1.5); g.fillStyle = C1; g.fillRect(x, y, fs * .2, fs * 1.5); g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(s, x + fs * .5, y + fs * .75); g.restore();
  }
  function panelHashtags() {
    const w = capa('# Mis hashtags'); let h = HT(); const guarda = () => { LSG('hashtags', h); bugOcultar(); };
    const pinta = () => {
      w.v.querySelectorAll('.htc').forEach(x => x.remove()); const c = $('div'); c.className = 'htc'; w.v.appendChild(c);
      const t1 = btn(h.on ? '✅ Rótulo de hashtags ACTIVADO' : '⬜ Rótulo de hashtags DESACTIVADO', () => { h.on = !h.on; guarda(); pinta(); }, h.on);
      const ps = sel([['si', '↖ Arriba izquierda'], ['sd', '↗ Arriba derecha'], ['ii', '↙ Abajo izquierda'], ['id', '↘ Abajo derecha']], h.pos); ps.onchange = () => { h.pos = ps.value; guarda(); };
      c.append(t1, $('div', 'margin:6px 0 2px', 'Posición en pantalla:'), ps);
      const bloque = (tit, arr, fijar) => {
        const b = $('div', 'margin-top:12px;padding:8px;border:1px solid #fff3;border-radius:10px'); b.appendChild($('div', `font-weight:bold;color:${C1}`, esc(tit)));
        arr.forEach((x, i) => { const r = $('div', 'display:flex;gap:6px;align-items:center;margin:4px 0'); const z = inp(x, '#hashtag', 40); z.onchange = () => { let v = z.value.trim().replace(/\s+/g, ''); if (v && v[0] !== '#') v = '#' + v; arr[i] = v; fijar(arr.filter(Boolean)); guarda(); pinta(); }; r.append(z, btn('🗑', () => { arr.splice(i, 1); fijar(arr); guarda(); pinta(); })); b.appendChild(r); });
        const nz = inp('', 'Nuevo hashtag…', 40); b.append(nz, btn('➕ Añadir', () => { let v = nz.value.trim().replace(/\s+/g, ''); if (!v) return; if (v[0] !== '#') v = '#' + v; arr.push(v); fijar(arr); guarda(); pinta(); })); return b;
      };
      c.appendChild(bloque('Generales (siempre)', h.general.slice(), a => h.general = a));
      for (const e of cfg.especiales()) if (e.id && e.id !== 'normal') c.appendChild(bloque('Especial ' + e.nombre, (h.esp[e.id] || []).slice(), a => { h.esp[e.id] = a; }));
      c.append($('p', 'opacity:.75;font-size:13px', 'Aparecen rotando en una esquina durante el Programa completo, en las promos, en las cabeceras y en las pantallas LED del plató. En un especial se muestran sus hashtags y los generales.'), btn('Cerrar', w.cierra, true));
    }; pinta(); return w;
  }

  // ---------- Voz Piper sin conexión (sherpa-onnx wasm) + piezas pregrabadas ----------
  let wk = null, wkListo = null, wkId = 0; const pend = {};
  function piper() {
    if (wkListo) return wkListo;
    wkListo = new Promise((res, rej) => {
      try { wk = new Worker((cfg.piperBase || 'piper/') + 'piper-worker.js'); } catch (e) { return rej(e); }
      const to = setTimeout(() => rej(new Error('Piper tarda demasiado')), 90000);
      wk.onmessage = e => { const d = e.data; if (d.type === 'listo') { clearTimeout(to); res(d.sampleRate); } else if (d.type === 'error' && d.id == null) { clearTimeout(to); rej(new Error(d.msg)); } else if (d.id && pend[d.id]) { const p = pend[d.id]; delete pend[d.id]; d.type === 'audio' ? p.res(d) : p.rej(new Error(d.msg)); } };
      wk.onerror = e => { clearTimeout(to); rej(new Error(e.message || 'worker')); };
    }); wkListo.catch(() => { wkListo = null; }); return wkListo;
  }
  async function vozPiper(texto, vel) { await piper(); const id = ++wkId; const d = await new Promise((res, rej) => { pend[id] = { res, rej }; wk.postMessage({ id, texto, velocidad: vel || 1 }); }); const ac = cfg.audioCtx(); const b = ac.createBuffer(1, d.samples.length, d.sampleRate); b.copyToChannel(d.samples, 0); return b; }
  let PIEZAS = null; const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
  const normPal = w => w.toLowerCase().normalize('NFC').replace(/[^a-zñáéíóúü0-9]/g, '');
  async function vozPiezas(texto) {
    const base = cfg.piezasBase || 'voz/pal/'; if (!PIEZAS) PIEZAS = await (await fetch(base + 'index.json')).json();
    const ac = cfg.audioCtx(), bufs = [];
    for (const tok of texto.split(/(\s+|[,.;:!?¡¿])/)) {
      if (/^[,.;:!?]$/.test(tok)) { bufs.push(ac.createBuffer(1, Math.round(ac.sampleRate * .22), ac.sampleRate)); continue; }
      const w = normPal(tok); if (!w) continue; const f = PIEZAS[w]; if (!f) continue;
      try { bufs.push(await ac.decodeAudioData(await (await fetch(base + f)).arrayBuffer())); bufs.push(ac.createBuffer(1, Math.round(ac.sampleRate * .03), ac.sampleRate)); } catch (e) { }
    }
    const n = bufs.reduce((s, b) => s + b.length, 0); if (!n) return null; const out = ac.createBuffer(1, n, ac.sampleRate); let o = 0; for (const b of bufs) { out.getChannelData(0).set(b.getChannelData(0), o); o += b.length; } return out;
  }
  async function voz(texto) { if (!texto || !texto.trim()) return null; try { return await vozPiper(texto); } catch (e) { console.warn('Piper wasm no disponible, uso piezas', e); try { return await vozPiezas(texto); } catch (x) { return null; } } }

  // ---------- IndexedDB de promos ----------
  let dbp = null; const DB = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open(P + '_promos', 1); r.onupgradeneeded = () => { r.result.createObjectStore('promos', { keyPath: 'id' }); r.result.createObjectStore('blobs'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = async (st, modo, fn) => { const d = await DB(); return new Promise((res, rej) => { const t = d.transaction(st, modo), s = t.objectStore(st); const q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
  const promosLista = async () => ((await tx('promos', 'readonly', s => s.getAll())) || []).sort((a, b) => b.creada - a.creada);
  const promoGuarda = p => tx('promos', 'readwrite', s => s.put(p));
  const promoBorra = async p => { await tx('promos', 'readwrite', s => s.delete(p.id)); if (p.fondo && p.fondo.blob) await tx('blobs', 'readwrite', s => s.delete(p.fondo.blob)); };
  const blobGuarda = (k, b) => tx('blobs', 'readwrite', s => s.put(b, k)); const blobLee = k => tx('blobs', 'readonly', s => s.get(k));
  const tomasLibres = () => LSJ('tomas_camlibre', []);
  async function guardarTomaCamLibre(blob) { const k = 'cl' + Date.now(); await blobGuarda(k, blob); const L = tomasLibres(); L.unshift({ k, t: new Date().toLocaleString('es-ES') }); LSG('tomas_camlibre', L.slice(0, 12)); toast('Toma guardada para el Creador de promos'); return k; }

  // ---------- Reproductor / exportador de promos ----------
  async function fondoVideo(p) {
    const f = p.fondo || { tipo: 'plato' }; const v = $('video'); v.muted = true; v.playsInline = true; v.loop = true; v.crossOrigin = 'anonymous';
    if (f.tipo === 'video' || f.tipo === 'camlibre') { const b = await blobLee(f.blob); if (!b) return null; v.src = URL.createObjectURL(b); }
    else if (f.tipo === 'cabecera') { const u = await cfg.cabeceraUrl(f.cab); if (!u) return null; v.src = u; }
    else { const cv = await cfg.platoCanvas(); if (!cv) return null; v.srcObject = cv.captureStream(30); }
    try { await v.play(); } catch (e) { } return v;
  }
  const easeOut = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
  async function reproducir(p, opt = {}) {
    const W = 1280, H = 720, ac = cfg.audioCtx(); try { await ac.resume(); } catch (e) { }
    const cont = $('div', 'position:fixed;inset:0;z-index:99995;background:#000;display:flex;align-items:center;justify-content:center');
    const cv = $('canvas', 'max-width:100vw;max-height:100vh;width:100%;aspect-ratio:16/9;object-fit:contain'); cv.width = W; cv.height = H; cont.appendChild(cv);
    let parar = false; const salir = btn('✕ Salir', () => parar = true); salir.style.cssText += ';position:absolute;top:10px;left:10px'; if (!opt.sinBoton) cont.appendChild(salir);
    document.body.appendChild(cont); const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = C1; g.font = 'bold 36px system-ui'; g.textAlign = 'center'; g.fillText('Preparando la promo y la voz en off…', W / 2, H / 2); g.textAlign = 'left';
    cfg.alEmpezar && cfg.alEmpezar(p);
    const vid = await fondoVideo(p); const logo = await cfg.logoCanvas(512, p.logo === 'titulo' ? { tipo: 'titulo' } : p.logo && p.logo !== 'actual' ? { tipo: 'especial', id: p.logo } : { tipo: 'actual' });
    // audio: música + voz con ducking, hacia la salida y la grabación
    const mezcla = ac.createGain(); mezcla.connect(ac.destination); let destRec = null; if (opt.grabar) { destRec = ac.createMediaStreamDestination(); mezcla.connect(destRec); }
    const gM = ac.createGain(); gM.gain.value = .55; gM.connect(mezcla); let mus = null; const MU = cfg.musica;
    const sal = cfg.salida && cfg.salida(); if (destRec && sal && sal !== mezcla) { try { sal.connect(destRec); } catch (e) { } }
    if (p.musica && p.musica !== 'ninguna') { if (MU && MU.play) { try { MU.play(p.musica); } catch (e) { } } else if (cfg.musicaUrl) { try { const ab = await ac.decodeAudioData(await (await fetch(cfg.musicaUrl(p.musica))).arrayBuffer()); mus = ac.createBufferSource(); mus.buffer = ab; mus.loop = true; mus.connect(gM); mus.start(); } catch (e) { } } }
    const textoVoz = p.voz === false ? '' : (p.textoVoz || [p.titulo, ...(p.lineas || []), [p.dia, p.hora].filter(Boolean).join(', a las ')].filter(Boolean).join('. '));
    const vb = textoVoz ? await voz(textoVoz) : null;
    const lineas = (p.lineas || []).filter(Boolean); const durTxt = 2.2 + lineas.length * 2.6 + 3.2; const dur = Math.max(durTxt, vb ? vb.duration + 1.6 : 0, 6);
    let rec = null, trozos = [];
    if (opt.grabar) { const st = cv.captureStream(30); destRec.stream.getAudioTracks().forEach(t => st.addTrack(t)); const mt = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ''; rec = new MediaRecorder(st, mt ? { mimeType: mt, videoBitsPerSecond: 5e6 } : {}); rec.ondataavailable = e => e.data.size && trozos.push(e.data); rec.start(250); }
    const t0 = ac.currentTime + .15;
    if (vb) { const s = ac.createBufferSource(); s.buffer = vb; const gv = ac.createGain(); gv.gain.value = .85; s.connect(gv); gv.connect(mezcla); s.start(t0 + .8); gM.gain.setValueAtTime(.55, t0 + .5); gM.gain.linearRampToValueAtTime(.16, t0 + .8); gM.gain.setValueAtTime(.16, t0 + .8 + vb.duration); gM.gain.linearRampToValueAtTime(.55, t0 + 1.2 + vb.duration); if (MU && MU.vol) { setTimeout(() => MU.vol(.3), 800); setTimeout(() => MU.vol(1), 1000 + vb.duration * 1000); } }
    const tr = p.transicion || 'fundido', fin = performance.now() + dur * 1000, ini = performance.now();
    await new Promise(done => {
      const fr = () => {
        const t = (performance.now() - ini) / 1000; if (parar || performance.now() > fin) return done();
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        if (vid && vid.readyState >= 2) { const vw = vid.videoWidth || W, vh = vid.videoHeight || H, k = Math.max(W / vw, H / vh); g.drawImage(vid, (W - vw * k) / 2, (H - vh * k) / 2, vw * k, vh * k); }
        else { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C2); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
        const vi = g.createLinearGradient(0, H * .35, 0, H); vi.addColorStop(0, 'rgba(0,0,0,0)'); vi.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = vi; g.fillRect(0, 0, W, H);
        const ent = (k0) => { const x = easeOut((t - k0) / .6); if (tr === 'barrido') return { a: x, dx: (1 - x) * -W * .5, s: 1 }; if (tr === 'zoom') return { a: x, dx: 0, s: .6 + .4 * x }; return { a: x, dx: 0, s: 1 }; };
        const L = ent(.2); g.save(); g.globalAlpha = L.a; g.translate(W * .16 + L.dx, H * .3); g.scale(L.s, L.s); { const lh = 300 * logo.height / logo.width; g.drawImage(logo, -150, -lh / 2, 300, lh); } g.restore();
        const T = ent(.6); g.save(); g.globalAlpha = T.a; g.translate(T.dx, 0); g.fillStyle = '#fff'; g.font = 'bold 64px system-ui'; g.textAlign = 'left'; g.shadowColor = '#000'; g.shadowBlur = 12; g.fillText(p.titulo || cfg.titulo(), W * .34, H * .28, W * .62); g.restore();
        lineas.forEach((ln, i) => { const k0 = 1.6 + i * 2.6, k1 = k0 + 2.6; if (t < k0) return; const e = ent(k0); const sal = i < lineas.length - 1 ? 1 - easeOut((t - k1 + .3) / .3) : 1; g.save(); g.globalAlpha = e.a * Math.max(0, sal); g.translate(e.dx, 0); g.fillStyle = C1; g.font = 'bold 44px system-ui'; g.shadowColor = '#000'; g.shadowBlur = 10; g.fillText(ln, W * .34, H * .44, W * .62); g.restore(); });
        if (p.dia || p.hora) { const e = ent(1.2); g.save(); g.globalAlpha = e.a; g.fillStyle = C1; g.fillRect(W * .06, H * .78, W * .88, 86); g.fillStyle = '#111'; g.font = 'bold 50px system-ui'; g.textAlign = 'center'; g.fillText([p.dia, p.hora].filter(Boolean).join(' · ').toUpperCase(), W / 2, H * .78 + 60, W * .84); g.restore(); }
        htDibuja(g, W, H, performance.now());
        const fo = Math.min(1, t / .5, (fin - performance.now()) / 500); if (fo < 1) { g.fillStyle = `rgba(0,0,0,${1 - Math.max(0, fo)})`; g.fillRect(0, 0, W, H); }
        requestAnimationFrame(fr);
      }; fr();
    });
    try { mus && mus.stop(); } catch (e) { } try { MU && MU.stop && p.musica !== 'ninguna' && MU.stop(); MU && MU.vol && MU.vol(1); } catch (e) { } if (destRec && sal) { try { sal.disconnect(destRec); } catch (e) { } } mezcla.disconnect(); if (vid) { vid.pause(); if (vid.srcObject) vid.srcObject = null; }
    cfg.alTerminar && cfg.alTerminar(p);
    let blob = null; if (rec) { await new Promise(r => { rec.onstop = r; rec.stop(); }); blob = new Blob(trozos, { type: rec.mimeType || 'video/webm' }); }
    cont.remove(); return blob;
  }
  async function exportar(p) { toast('Grabando la promo en vídeo…'); const b = await reproducir(p, { grabar: true }); if (b && b.size) await guardar(`promo-${limpio(p.titulo || 'promo')}.${/mp4/.test(b.type) ? 'mp4' : 'webm'}`, b, 'Movies'); return b; }
  async function aleatoria() { const L = await promosLista().catch(() => []); return L.length ? L[Math.floor(Math.random() * L.length)] : null; }
  async function aleatoriaReproduce(prob = 1) { if (Math.random() > prob) return false; const p = await aleatoria(); if (!p) return false; await reproducir(p); return true; }
  let ocioT = 0; function ocioMenu(activo) { clearTimeout(ocioT); if (!activo) return; ocioT = setTimeout(async () => { if (cfg.enMenu && !cfg.enMenu()) return; if (await aleatoriaReproduce(1)) ocioMenu(true); }, cfg.ocioMs || 60000); }
  ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { if (ocioT) ocioMenu(true); }, true));

  // ---------- Editor ----------
  async function editor(p0, alGuardar) {
    const p = Object.assign({ id: 'p' + Date.now(), creada: Date.now(), titulo: cfg.titulo(), lineas: ['', '', ''], dia: 'Esta noche', hora: '22:00', logo: 'actual', musica: (cfg.musicas()[0] || [''])[0], transicion: 'fundido', fondo: { tipo: 'plato' }, voz: true, textoVoz: '' }, JSON.parse(JSON.stringify(p0 || {})));
    const w = capa(p0 ? '✏️ Editar promo' : '➕ Nueva promo'); const f = $('div', 'display:grid;gap:6px');
    const zT = inp(p.titulo, 'Título', 60); const zL = p.lineas.map((l, i) => inp(l, 'Línea ' + (i + 1), 70)); const zD = inp(p.dia, 'Día (p. ej. Este viernes)', 30); const zH = inp(p.hora, 'Hora (p. ej. 22:00)', 12);
    const lg = sel([['actual', 'Logo actual'], ['titulo', 'Logo con título propio'], ...cfg.especiales().filter(e => e.id !== 'normal').map(e => [e.id, 'Logo especial ' + e.nombre])], p.logo);
    const mu = sel([['ninguna', 'Sin música'], ...cfg.musicas()], p.musica); const tr = sel([['fundido', 'Fundido'], ['barrido', 'Barrido'], ['zoom', 'Zoom']], p.transicion);
    const fo = sel([['plato', 'Toma del plató 3D'], ['video', 'Vídeo propio'], ['camlibre', 'Grabación de Cámara libre'], ...cfg.cabeceras().map(c => ['cab:' + c.id, 'Cabecera: ' + c.nombre])], p.fondo.tipo === 'cabecera' ? 'cab:' + p.fondo.cab : p.fondo.tipo);
    const extra = $('div'); let blobNuevo = null;
    const pintaFondo = () => { extra.innerHTML = ''; if (fo.value === 'video') extra.append(btn(p.fondo.tipo === 'video' && p.fondo.blob ? '🎞 Vídeo guardado (cambiar…)' : '🎞 Elegir vídeo…', async b => { const fl = await cfg.pideArchivo('video/*'); if (fl) { blobNuevo = fl; b.innerHTML = '🎞 ' + esc(fl.name || 'vídeo'); } }));
      if (fo.value === 'camlibre') { const L = tomasLibres(); if (!L.length) extra.append($('div', 'opacity:.8', 'Aún no hay tomas. Graba una en Cámara libre (botón «Guardar para promos»).')); else { const s = sel(L.map(x => [x.k, 'Toma ' + x.t]), p.fondo.blob); s.onchange = () => p.fondo.blob = s.value; if (!L.some(x => x.k === p.fondo.blob)) p.fondo.blob = L[0].k; extra.append(s); } } };
    fo.onchange = pintaFondo; pintaFondo();
    const vz = btn(p.voz ? '🎙 Voz en off: SÍ (Piper, sin conexión)' : '🎙 Voz en off: NO', b => { p.voz = !p.voz; b.innerHTML = p.voz ? '🎙 Voz en off: SÍ (Piper, sin conexión)' : '🎙 Voz en off: NO'; }); const zV = inp(p.textoVoz, 'Texto de la voz (vacío = título + líneas + día y hora)', 300);
    const lab = t => $('div', `color:${C1};font-weight:bold;margin-top:4px`, t);
    f.append(lab('Título'), zT, lab('Líneas'), ...zL, lab('Día y hora'), zD, zH, lab('Logo'), lg, lab('Música del juego'), mu, lab('Transición'), tr, lab('Fondo'), fo, extra, lab('Voz en off'), vz, zV); w.v.appendChild(f);
    const recoge = async () => { Object.assign(p, { titulo: zT.value.trim(), lineas: zL.map(z => z.value.trim()), dia: zD.value.trim(), hora: zH.value.trim(), logo: lg.value, musica: mu.value, transicion: tr.value, textoVoz: zV.value.trim() });
      if (fo.value.startsWith('cab:')) p.fondo = { tipo: 'cabecera', cab: fo.value.slice(4) }; else if (fo.value === 'video') { if (blobNuevo) { const k = 'v' + p.id; await blobGuarda(k, blobNuevo); p.fondo = { tipo: 'video', blob: k }; } else if (p.fondo.tipo !== 'video') p.fondo = { tipo: 'plato' }; } else if (fo.value === 'camlibre') p.fondo = { tipo: 'camlibre', blob: p.fondo.blob || (tomasLibres()[0] || {}).k }; else p.fondo = { tipo: 'plato' }; return p; };
    w.v.append($('div', 'margin-top:10px'), btn('💾 Guardar', async () => { await promoGuarda(await recoge()); toast('Promo guardada'); w.cierra(); alGuardar && alGuardar(); }, true), btn('▶ Vista previa', async () => { const q = await recoge(); w.o.style.display = 'none'; await reproducir(q); w.o.style.display = 'flex'; }), btn('Cancelar', w.cierra));
  }
  async function panelPromos() {
    const w = capa('🎬 Creador de promos'); const c = $('div'); w.v.appendChild(c);
    const pinta = async () => { c.innerHTML = ''; c.append($('p', 'opacity:.8;margin:2px 0 8px', 'Crea tus propias promos: aparecen en PROMOS, en las pausas de publicidad y al azar (menú en reposo y entre secciones). Voz en off con Piper dentro de la app, sin conexión.'), btn('➕ Nueva promo', () => editor(null, pinta), true));
      const L = await promosLista(); if (!L.length) c.append($('p', 'opacity:.7', 'Todavía no has creado ninguna promo.'));
      for (const p of L) { const r = $('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin:6px 0;padding:6px;border:1px solid #fff3;border-radius:10px'); r.append($('div', 'flex:1;min-width:160px', `<b>${esc(p.titulo)}</b><br><span style="opacity:.75;font-size:13px">${esc([p.dia, p.hora].filter(Boolean).join(' · '))} · ${esc({ plato: 'plató 3D', video: 'vídeo propio', camlibre: 'cámara libre', cabecera: 'cabecera' }[p.fondo.tipo] || '')}</span>`), btn('▶', async () => { w.o.style.display = 'none'; await reproducir(p); w.o.style.display = 'flex'; }), btn('✏️', () => editor(p, pinta)), btn('⬇ Vídeo', async () => { w.o.style.display = 'none'; await exportar(p); w.o.style.display = 'flex'; }), btn('🗑', async () => { if (confirm('¿Borrar la promo «' + p.titulo + '»?')) { await promoBorra(p); pinta(); } })); c.appendChild(r); }
      c.append(btn('Cerrar', w.cierra)); };
    await pinta(); return w;
  }
  return { guardar, guardarLogo, guardarTodos, logoPNG, panelLogo, panelHashtags, htActual, htDibuja, bugMostrar, bugOcultar, voz, vozPiper, vozPiezas, promosLista, promoGuarda, promoBorra, reproducir, exportar, aleatoria, aleatoriaReproduce, ocioMenu, panelPromos, editor, guardarTomaCamLibre, tomasLibres };
}
if (typeof window !== 'undefined') window.crearExtras = crearExtras;
// CÁMARA LIBRE: vuela por el plató 3D para hacer tus propias cabeceras. Táctil (joystick, arrastrar para mirar,
// pellizco = zoom, botones subir/bajar) y PC (WASD/QE, ratón para mirar, rueda = zoom). Velocidad y FOV, ocultar UI,
// luces/LED/logo/música, puntos clave con recorrido de grúa suave y GRABAR (canvas.captureStream + MediaRecorder con audio).
// Uso: abrirCamaraLibre({ canvas, camera, aplicar(pos, mira), soltar(), audio:{ctx, nodo}, toggles:{ 'Luces': fn(on) ... }, guardarCabecera(blob), toast(txt) })
function abrirCamaraLibre(o) {
  const V = (x, y, z) => ({ x, y, z }); const cam = o.camera;
  const st = { pos: V(cam.position.x, cam.position.y, cam.position.z), yaw: 0, pitch: -0.1, vel: 4, fov: cam.fov || 50, mov: { x: 0, z: 0, y: 0 }, keys: {}, claves: [], reprod: null, rec: null, vivo: true };
  { const d = o.mira ? [o.mira.x - st.pos.x, o.mira.y - st.pos.y, o.mira.z - st.pos.z] : [0, 0, -1]; st.yaw = Math.atan2(d[0], -d[2]); st.pitch = Math.atan2(d[1], Math.hypot(d[0], d[2])); }
  const css = document.createElement('style'); css.textContent = `#camlib{position:fixed;inset:0;z-index:9000;pointer-events:none;font:14px system-ui;color:#fff}
#camlib .cl-p{pointer-events:auto}#camlib .cl-bar{position:absolute;top:8px;left:8px;right:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#camlib button{background:#0a1a5acc;border:2px solid #3a6aff;color:#fff;border-radius:12px;padding:7px 10px;font:600 13px system-ui}#camlib button.on{background:#ffb81a;color:#1a1000;border-color:#ffe08a}
#camlib .cl-rec{background:#c0101a!important;border-color:#ff8080!important}#camlib .cl-rec.on{animation:clp 1s infinite}@keyframes clp{50%{opacity:.5}}
#camlib label{background:#0a1a5acc;border-radius:10px;padding:4px 8px;display:flex;gap:6px;align-items:center}#camlib input[type=range]{width:90px}
#camlib .cl-joy{position:absolute;left:24px;bottom:24px;width:130px;height:130px;border-radius:50%;background:#ffffff22;border:2px solid #ffffff66;touch-action:none}
#camlib .cl-knob{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:#ffffffaa}
#camlib .cl-ud{position:absolute;right:20px;bottom:30px;display:flex;flex-direction:column;gap:10px}#camlib .cl-ud button{width:64px;height:54px;font-size:20px}
#camlib .cl-look{position:absolute;inset:0;touch-action:none}#camlib.oculta .cl-ui{display:none}#camlib .cl-show{display:none;position:absolute;right:8px;top:8px}#camlib.oculta .cl-show{display:block;opacity:.35}
#camlib .cl-info{position:absolute;left:8px;bottom:170px;background:#0008;border-radius:8px;padding:3px 8px;font-size:12px}`;
  document.head.appendChild(css);
  const R = document.createElement('div'); R.id = 'camlib'; document.body.appendChild(R);
  const look = document.createElement('div'); look.className = 'cl-look cl-p'; R.appendChild(look);
  const ui = document.createElement('div'); ui.className = 'cl-ui'; R.appendChild(ui);
  const bar = document.createElement('div'); bar.className = 'cl-bar cl-p'; ui.appendChild(bar);
  const B = (t, fn, cls = '') => { const b = document.createElement('button'); b.className = cls; b.textContent = t; b.onclick = (e) => { e.stopPropagation(); fn(b); }; b.onpointerdown = e => e.stopPropagation(); return b; };
  const slider = (t, min, max, step, val, fn) => { const l = document.createElement('label'); l.textContent = t; const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = val; r.oninput = () => fn(+r.value); r.onpointerdown = e => e.stopPropagation(); l.appendChild(r); return l; };
  const info = document.createElement('div'); info.className = 'cl-info'; ui.appendChild(info);
  const msg = (t) => (o.toast ? o.toast(t) : (info.textContent = t));
  bar.append(B('✕ Salir', cerrar), B('👁 Ocultar UI', () => R.classList.add('oculta')),
    slider('🏃 Velocidad', 0.5, 15, 0.5, st.vel, v => st.vel = v), slider('🔭 FOV', 20, 100, 1, st.fov, v => st.fov = v));
  for (const [nom, fn] of Object.entries(o.toggles || {})) { let on = true; bar.appendChild(B(nom, (b) => { on = !on; b.classList.toggle('on', !on); b.textContent = (on ? '' : '🚫 ') + nom; fn(on); })); }
  bar.append(B('📍 Añadir punto', () => { st.claves.push({ ...st.pos, yaw: st.yaw, pitch: st.pitch, fov: st.fov }); msg('Punto ' + st.claves.length + ' guardado'); }),
    B('▶ Recorrido', () => reproducir()), B('🗑 Borrar puntos', () => { st.claves = []; st.reprod = null; msg('Puntos borrados'); }),
    B('⏺ GRABAR', (b) => grabar(b), 'cl-rec'));
  const show = B('👁', () => R.classList.remove('oculta'), 'cl-show cl-p'); R.appendChild(show);
  // joystick
  const joy = document.createElement('div'); joy.className = 'cl-joy cl-p'; const knob = document.createElement('div'); knob.className = 'cl-knob'; joy.appendChild(knob); ui.appendChild(joy);
  let jid = null; const jset = (e) => { const r = joy.getBoundingClientRect(); let x = (e.clientX - r.left - 65) / 50, y = (e.clientY - r.top - 65) / 50; const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } st.mov.x = x; st.mov.z = y; knob.style.left = 40 + x * 40 + 'px'; knob.style.top = 40 + y * 40 + 'px'; };
  joy.onpointerdown = (e) => { e.stopPropagation(); jid = e.pointerId; joy.setPointerCapture(jid); jset(e); }; joy.onpointermove = (e) => e.pointerId === jid && jset(e);
  joy.onpointerup = joy.onpointercancel = () => { jid = null; st.mov.x = st.mov.z = 0; knob.style.left = knob.style.top = '40px'; };
  const ud = document.createElement('div'); ud.className = 'cl-ud cl-p'; ui.appendChild(ud);
  for (const [t, dy] of [['⬆', 1], ['⬇', -1]]) { const b = document.createElement('button'); b.textContent = t; b.onpointerdown = (e) => { e.stopPropagation(); st.mov.y = dy; }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => st.mov.y = 0; ud.appendChild(b); }
  // mirar (arrastrar) y pellizco (zoom)
  const ptr = new Map(); let pinch0 = 0, fov0 = st.fov;
  look.onpointerdown = (e) => { look.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); fov0 = st.fov; } };
  look.onpointermove = (e) => { const p = ptr.get(e.pointerId); if (!p) return; if (ptr.size === 2) { ptr.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); st.fov = Math.max(20, Math.min(100, fov0 * pinch0 / Math.max(10, d))); return; }
    st.yaw += (e.clientX - p[0]) * 0.005; st.pitch = Math.max(-1.45, Math.min(1.45, st.pitch - (e.clientY - p[1]) * 0.005)); ptr.set(e.pointerId, [e.clientX, e.clientY]); };
  look.onpointerup = look.onpointercancel = (e) => ptr.delete(e.pointerId);
  look.onwheel = (e) => { e.preventDefault(); st.fov = Math.max(20, Math.min(100, st.fov + Math.sign(e.deltaY) * 3)); };
  const kd = (e) => { if (e.target.tagName === 'INPUT') return; st.keys[e.code] = true; if (e.code === 'Escape') cerrar(); if (e.code === 'KeyH') R.classList.toggle('oculta'); e.stopPropagation(); }, ku = (e) => { st.keys[e.code] = false; };
  addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
  // recorrido de grúa (Catmull-Rom entre puntos clave)
  function reproducir() { if (st.claves.length < 2) return msg('Añade al menos 2 puntos'); st.reprod = { t0: performance.now(), dur: (st.claves.length - 1) * 4000 / Math.max(0.25, st.vel / 4) }; }
  const cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  function enRecorrido() { const C = st.claves, k = Math.min(1, (performance.now() - st.reprod.t0) / st.reprod.dur), u = k * (C.length - 1), i = Math.min(C.length - 2, Math.floor(u)), t = u - i; const e = t * t * (3 - 2 * t);
    const g = (j) => C[Math.max(0, Math.min(C.length - 1, j))]; for (const c of ['x', 'y', 'z', 'yaw', 'pitch', 'fov']) st[c === 'x' || c === 'y' || c === 'z' ? 'pos' : c] = st[c === 'x' || c === 'y' || c === 'z' ? 'pos' : c];
    for (const c of ['x', 'y', 'z']) st.pos[c] = cr(g(i - 1)[c], g(i)[c], g(i + 1)[c], g(i + 2)[c], e); for (const c of ['yaw', 'pitch', 'fov']) st[c] = cr(g(i - 1)[c], g(i)[c], g(i + 1)[c], g(i + 2)[c], e);
    if (k >= 1) { st.reprod = null; if (st.rec && st.rec.auto) grabar(st.rec.boton); } }
  // grabar
  function grabar(b) {
    if (st.rec) { st.rec.mr.stop(); return; }
    if (!o.canvas.captureStream || !window.MediaRecorder) return msg('Este dispositivo no permite grabar el lienzo 3D');
    const vs = o.canvas.captureStream(30); let dest = null; try { if (o.audio && o.audio.ctx && o.audio.nodo) { dest = o.audio.ctx.createMediaStreamDestination(); o.audio.nodo.connect(dest); dest.stream.getAudioTracks().forEach(t => vs.addTrack(t)); } } catch (e) { }
    const tipo = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
    const mr = new MediaRecorder(vs, tipo ? { mimeType: tipo, videoBitsPerSecond: 6e6 } : undefined), trozos = [];
    mr.ondataavailable = (e) => e.data.size && trozos.push(e.data);
    mr.onstop = () => { try { dest && o.audio.nodo.disconnect(dest); } catch (e) { } vs.getTracks().forEach(t => t.stop()); b.classList.remove('on'); b.textContent = '⏺ GRABAR'; const blob = new Blob(trozos, { type: (tipo || 'video/webm').split(';')[0] }); st.rec = null; ofrecer(blob); };
    mr.start(500); st.rec = { mr, boton: b, auto: !!st.reprod }; b.classList.add('on'); b.textContent = '⏹ PARAR'; msg('Grabando…');
  }
  function ofrecer(blob) {
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm', nombre = 'cabecera-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.' + ext;
    const caja = document.createElement('div'); caja.className = 'cl-p'; caja.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#0a1a5aee;border:2px solid #ffd23a;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px;min-width:260px';
    caja.innerHTML = `<b>🎬 Grabación lista</b><small>${(blob.size / 1048576).toFixed(1)} MB · ${ext.toUpperCase()}</small>`;
    caja.append(B('💾 Guardar en el dispositivo', async () => { if (o.guardarArchivo) { await o.guardarArchivo(nombre, blob); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); msg('Guardado: ' + nombre); }),
      B('🎥 Usar como vídeo de la cabecera 3D', async () => { if (o.guardarCabecera) { await o.guardarCabecera(blob); msg('Guardado como vídeo de la cabecera 3D'); } caja.remove(); }), (o.guardarPromo ? B('🎬 Guardar para el Creador de promos', async () => { await o.guardarPromo(blob); msg('Toma guardada para el Creador de promos'); }) : ''), B('Cerrar', () => caja.remove()));
    ui.appendChild(caja);
  }
  // bucle
  let tAnt = performance.now();
  (function paso() { if (!st.vivo) return; const t = performance.now(), dt = Math.min(0.05, (t - tAnt) / 1000); tAnt = t;
    if (st.reprod) enRecorrido(); else {
      const k = st.keys, fx = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0) + st.mov.x, fz = (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0) + st.mov.z, fy = (k.KeyE || k.Space ? 1 : 0) - (k.KeyQ || k.ShiftLeft ? 1 : 0) + st.mov.y;
      if (k.ArrowLeft) st.yaw -= dt * 1.5; if (k.ArrowRight) st.yaw += dt * 1.5; if (k.ArrowUp) st.pitch = Math.min(1.45, st.pitch + dt); if (k.ArrowDown) st.pitch = Math.max(-1.45, st.pitch - dt);
      const sx = Math.sin(st.yaw), cz = -Math.cos(st.yaw), v = st.vel * dt; st.pos.x += (sx * -fz + -cz * fx) * v; st.pos.z += (cz * -fz + sx * fx) * v; st.pos.y += fy * v;
    }
    const cp = Math.cos(st.pitch), mira = V(st.pos.x + Math.sin(st.yaw) * cp, st.pos.y + Math.sin(st.pitch), st.pos.z - Math.cos(st.yaw) * cp);
    if (Math.abs(cam.fov - st.fov) > 0.01) { cam.fov = st.fov; cam.updateProjectionMatrix(); }
    o.aplicar(st.pos, mira); info.textContent = `x ${st.pos.x.toFixed(1)} · y ${st.pos.y.toFixed(1)} · z ${st.pos.z.toFixed(1)} · FOV ${st.fov | 0}° · ${st.claves.length} puntos${st.rec ? ' · ● REC' : ''}`;
    requestAnimationFrame(paso); })();
  function cerrar() { if (st.rec) st.rec.mr.stop(); st.vivo = false; removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); R.remove(); css.remove(); o.soltar && o.soltar(); }
  return { cerrar, estado: st };
}
// Generador procedural de escenas (Fuera de cámaras · Tomas falsas · Cámara oculta).
// Determinista: «Escena n» (1..9600) siempre es la misma. Combina lugar × situación × reacción × final.
// Uso: const G = EscenasGen(POOL, { roles:{P:'adrian',R:'reg',T:'tec',M:'maq',J:'jefe',C:'conc'}, nombres:{P:'Adrián',R:'Toni',T:'Rober',M:'Nuria',J:'el jefe',SHOW:'¡Ahora caigo!'}, cam:{P:'host'}, camDef:'cerca' });
//      G.total, G.escena('fuera', 123) -> {id:'g123', n, titulo, lugar, pasos:[[voz,texto,cam,gesto,efecto],...]}, G.buscar('tomas','micro'), G.azar('oculta'), G.textos()
function EscenasGen(POOL, cfg) {
  const NL = POOL.lugares.length, NS = 30, NF = 16, TOTAL = NL * NS * NF, A = 7919, B = 1237;
  const sub = (t) => t.replace(/\{(P|R|T|M|J|C|SHOW)\}/g, (_, k) => (cfg.nombres || {})[k] || k).replace(/([!?])\./g, '$1');
  const voz = (r) => (cfg.roles || {})[r] || r, cam = (r) => (cfg.cam || {})[r] || cfg.camDef || 'wide';
  const rng = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const SEC = { fuera: 1, tomas: 2, oculta: 3 };
  const NOMBRE = { fuera: 'Fuera de cámaras', tomas: 'Tomas falsas', oculta: 'Cámara oculta' };
  const cache = {};
  function escena(sec, n) {
    n = Math.max(1, Math.min(TOTAL, n | 0)); const k = sec + n; if (cache[k]) return cache[k];
    const S = POOL.secciones[sec], x = ((n - 1) * A + B) % TOTAL, li = x % NL, si = Math.floor(x / NL) % NS, fi = Math.floor(x / (NL * NS));
    const r = rng(n * 977 + SEC[sec] * 104729), L = POOL.lugares[li], [tit, ls] = S.sit[si], F = S.fin[fi];
    const P = (rol, t, g = '', ef = '') => [voz(rol), sub(t), cam(rol), g, ef];
    const pasos = [P(L[1], L[2], 'habla', sec === 'tomas' ? 'claqueta:1' : '')];
    pasos.push(P(ls[0][0], ls[0][1], 'habla'), P(ls[1][0], ls[1][1], 'senala'));
    const usados = new Set(ls.map(l => l[0]).concat(F.map(l => l[0])));
    const cand = POOL.reacciones.filter(q => usados.has(q[0])), q = cand[Math.floor(r() * cand.length)];
    pasos.push(P(q[0], q[1], q[2], q[3]));
    pasos.push(P(ls[2][0], ls[2][1], 'habla'), P(ls[3][0], ls[3][1], r() < 0.5 ? 'encoge' : 'habla', sec === 'tomas' ? 'tomafalsa' : ''));
    if (r() < 0.35) { const q2 = cand[Math.floor(r() * cand.length)]; if (q2 !== q) pasos.push(P(q2[0], q2[1], q2[2], q2[3])); }
    pasos.push(P(F[0][0], F[0][1], 'senala', { tomas: 'corten', oculta: 'inocente', fuera: '' }[sec]), P(F[1][0], F[1][1], 'aplaude', sec === 'fuera' ? 'aplauso' : 'risas'));
    return cache[k] = { id: 'g' + n, n, gen: true, seccion: NOMBRE[sec], titulo: 'Escena ' + n + ' · ' + tit, sub: L[0], lugar: L[0], pasos };
  }
  const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function buscar(sec, q, max = 60) {
    q = norm(String(q || '').trim()); const out = []; if (!q) return out;
    const num = /^\d+$/.test(q) ? +q : 0; if (num >= 1 && num <= TOTAL) out.push(escena(sec, num));
    for (let n = 1; n <= TOTAL && out.length < max; n++) { if (n === num) continue; const e = escena(sec, n); if (norm(e.titulo + ' ' + e.lugar).includes(q) || e.pasos.some(p => norm(p[1]).includes(q))) out.push(e); }
    return out;
  }
  function textos() { // todas las frases (voz, texto) para pregrabar con Piper
    const m = new Map(), add = (r, t) => { const s = sub(t); m.set(voz(r) + '|' + s, [voz(r), s]); };
    for (const L of POOL.lugares) add(L[1], L[2]); for (const q of POOL.reacciones) add(q[0], q[1]);
    for (const S of Object.values(POOL.secciones)) { for (const [, ls] of S.sit) for (const l of ls) add(l[0], l[1]); for (const F of S.fin) for (const l of F) add(l[0], l[1]); }
    return [...m.values()];
  }
  return { total: TOTAL, escena, buscar, azar: (sec) => escena(sec, 1 + Math.floor(Math.random() * TOTAL)), textos, nombre: NOMBRE };
}
if (typeof window !== 'undefined') window.EscenasGen = EscenasGen;
if (typeof module !== 'undefined') module.exports = EscenasGen;
