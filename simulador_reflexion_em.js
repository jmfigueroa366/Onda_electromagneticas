/* MATERIALES */
const MATS = [
  { name:"Vidrio",   n:1.50 },
  { name:"Agua",     n:1.33 },
  { name:"Diamante", n:2.42 },
  { name:"Cuarzo",   n:1.46 },
  { name:"Zafiro",   n:1.77 },
  { name:"Oro",      n:0.47 }, // índice complejo approx visible
];
let matIdx = 0;

/* ESTADO */
let phaseInc = 0;
let phaseRef = 0;
let animOn   = true;

const canvas = document.getElementById('mainCanvas');
const ctx    = canvas.getContext('2d');

/* Selector de material */
const matSel = document.getElementById('matSel');
MATS.forEach((m,i) => {
  const btn = document.createElement('button');
  btn.className = 'mat-btn' + (i===0?' on':'');
  btn.textContent = m.name;
  btn.addEventListener('click', () => {
    matIdx = i;
    document.querySelectorAll('.mat-btn').forEach((b,j)=> b.classList.toggle('on', j===i));
    update();
  });
  matSel.appendChild(btn);
});

/* FÍSICA */
function physics() {
  const n1     = 1.00;
  const n2     = MATS[matIdx].n;
  const theta1 = parseFloat(document.getElementById('slAngle').value) * Math.PI / 180;

  const sinT2  = n1 * Math.sin(theta1) / n2;
  const tir    = sinT2 > 1;
  const theta2 = tir ? null : Math.asin(sinT2);

  const c1 = Math.cos(theta1);
  const c2 = tir ? 0 : Math.cos(theta2);

  let Rs = 1, Rp = 1;
  if (!tir) {
    const rs = (n1*c1 - n2*c2) / (n1*c1 + n2*c2);
    const rp = (n2*c1 - n1*c2) / (n2*c1 + n1*c2);
    Rs = rs*rs;
    Rp = rp*rp;
  }

  const brewAngle  = Math.atan(n2/n1);
  const critAngle  = n1 > n2 ? Math.asin(n2/n1) : null;

  return { n1, n2, theta1, theta2, Rs, Rp, tir, brewAngle, critAngle };
}

/* ACTUALIZAR UI */
function update() {
  const p    = physics();
  const deg1 = parseFloat(document.getElementById('slAngle').value);

  document.getElementById('valAngle').innerHTML = deg1 + '<span class="u">°</span>';
  document.getElementById('valN2').textContent  = p.n2.toFixed(2);

  // Gradiente del slider
  const sl = document.getElementById('slAngle');
  const pct = ((sl.value - sl.min)/(sl.max - sl.min)*100).toFixed(1);
  sl.style.background = `linear-gradient(90deg,rgba(80,80,200,.55) ${pct}%, var(--dim) ${pct}%)`;

  // Métricas
  document.getElementById('mThetaR').textContent = deg1 + '°';
  document.getElementById('mRs').textContent     = (p.Rs*100).toFixed(1) + '%';
  document.getElementById('mRp').textContent     = (p.Rp*100).toFixed(1) + '%';
  document.getElementById('mBrew').textContent   = (p.brewAngle*180/Math.PI).toFixed(1) + '°';

  // Barras
  document.getElementById('rsBar').style.width  = Math.min(100,p.Rs*100).toFixed(1) + '%';
  document.getElementById('rpBar').style.width  = Math.min(100,p.Rp*100).toFixed(1) + '%';
  document.getElementById('rsPct').textContent  = (p.Rs*100).toFixed(1) + '%';
  document.getElementById('rpPct').textContent  = (p.Rp*100).toFixed(1) + '%';

  // Nota
  let nota;
  const isBrewster = Math.abs(deg1 - p.brewAngle*180/Math.PI) < 1.2;
  const isNormal   = deg1 < 1;
  const isTIR      = p.tir;

  if (isNormal) {
    const R0 = ((p.n1-p.n2)/(p.n1+p.n2))**2;
    nota = `<strong>Incidencia normal (θ = 0°):</strong> La reflexión es mínima para n₂ pequeño. R = ((n₁−n₂)/(n₁+n₂))² = ${(R0*100).toFixed(1)}%. Las polarizaciones s y p son equivalentes a θ = 0°. Base de los recubrimientos anti-reflexión (λ/4) usados en lentes y cámaras.`;
  } else if (isTIR) {
    nota = `<strong>Reflexión total interna (TIR):</strong> Con n₁ > n₂ y θ₁ > θ_c = ${(Math.asin(p.n2/p.n1)*180/Math.PI).toFixed(1)}°, el 100% de la energía se refleja. No existe onda transmitida. Es el principio de funcionamiento de la <strong>fibra óptica</strong> y los prismas de binoculares.`;
  } else if (isBrewster) {
    nota = `<strong>Ángulo de Brewster — θ_B = ${(p.brewAngle*180/Math.PI).toFixed(1)}°:</strong> La reflectancia p (TM) se anula exactamente: Rₚ = 0. La luz reflejada está 100% polarizada en modo s. Se usa en <strong>ventanas de Brewster</strong> de cavidades láser y en filtros polarizantes fotográficos.`;
  } else {
    nota = `<strong>Ley de reflexión:</strong> θ_r = θ_i = ${deg1}°. La onda reflejada sale con el mismo ángulo respecto a la normal. Reflectancia s = ${(p.Rs*100).toFixed(1)}%, p = ${(p.Rp*100).toFixed(1)}%. Al acercarte al ángulo de Brewster (${(p.brewAngle*180/Math.PI).toFixed(1)}°), Rₚ → 0 y la luz reflejada se polariza progresivamente.`;
  }
  document.getElementById('physNote').innerHTML = nota;
}

/* REDIMENSIONAR CANVAS */
function sizeCanvas() {
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

/* DIBUJO */
function draw() {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.width  / dpr;
  const H   = canvas.height / dpr;
  const p   = physics();

  ctx.clearRect(0, 0, W, H);

  // Fondo: zona superior (aire) y zona inferior (material)
  // Zona superior — aire
  ctx.fillStyle = '#f7f7fc';
  ctx.fillRect(0, 0, W, H/2);

  // Zona inferior — material con tono de color
  const matColors = ['rgba(220,220,240,1)','rgba(210,230,245,1)','rgba(200,215,250,1)','rgba(218,228,242,1)','rgba(215,210,245,1)','rgba(240,220,200,1)'];
  ctx.fillStyle = matColors[matIdx] || '#ebebf5';
  ctx.fillRect(0, H/2, W, H/2);

  // Etiquetas de medios
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.fillStyle = 'rgba(100,100,160,.6)';
  ctx.textAlign = 'left';
  ctx.fillText('Aire  n₁ = 1.00', 14, 22);
  ctx.fillStyle = 'rgba(80,80,140,.55)';
  ctx.fillText(`${MATS[matIdx].name}  n₂ = ${p.n2.toFixed(2)}`, 14, H/2 + 20);

  // Superficie (línea de interfaz)
  ctx.strokeStyle = 'rgba(100,80,200,.3)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  ctx.setLineDash([]);

  // Punto de incidencia (centro de la interfaz)
  const ix = W/2, iy = H/2;

  // Normal
  ctx.strokeStyle = 'rgba(100,100,180,.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6,8]);
  ctx.beginPath();
  ctx.moveTo(ix, iy - H*0.44);
  ctx.lineTo(ix, iy + H*0.44);
  ctx.stroke();
  ctx.setLineDash([]);
  // Etiqueta Normal
  ctx.font = '9px IBM Plex Mono';
  ctx.fillStyle = 'rgba(100,100,180,.5)';
  ctx.textAlign = 'center';
  ctx.fillText('Normal', ix + 32, iy - H*0.38);

  // ── Onda incidente ──────────────────────────────────────
  const theta1 = p.theta1;
  // dirección desde el punto hacia arriba-izquierda
  const incDirX = -Math.sin(theta1);
  const incDirY = -Math.cos(theta1);
  const maxLenInc = Math.min(
    (theta1 > 0.001 ? ix / Math.abs(incDirX) : 9999),
    iy / Math.abs(incDirY)
  ) * 0.88;

  drawWave(ix, iy, incDirX, incDirY, maxLenInc, '#1a5fcc', phaseInc, 1.0);
  // Flecha
  arrowHead(ix + incDirX*maxLenInc*0.12, iy + incDirY*maxLenInc*0.12,
            incDirX, incDirY, '#1a5fcc');

  // ── Onda reflejada ───────────────────────────────────────
  // Misma amplitud atenuada por sqrt(Rs promedio)
  const Ravg = (p.Rs + p.Rp) / 2;
  const refDirX = Math.sin(theta1);
  const refDirY = -Math.cos(theta1);
  const maxLenRef = Math.min(
    (theta1 > 0.001 ? (W-ix) / Math.abs(refDirX) : 9999),
    iy / Math.abs(refDirY)
  ) * 0.88;

  drawWave(ix, iy, refDirX, refDirY, maxLenRef, '#cc3030', phaseRef, Math.sqrt(Ravg));
  // Flecha
  arrowHead(ix + refDirX*maxLenRef*0.88, iy + refDirY*maxLenRef*0.88,
            refDirX, refDirY, '#cc3030');

  // Etiqueta % reflejado
  ctx.font = 'bold 10px IBM Plex Mono';
  ctx.fillStyle = '#cc3030';
  ctx.textAlign = 'left';
  const rx = ix + refDirX*maxLenRef*0.5;
  const ry = iy + refDirY*maxLenRef*0.5 - 10;
  ctx.fillText(`R = ${(Ravg*100).toFixed(0)}%`, rx + 6, ry);

  // Etiqueta % incidente
  ctx.fillStyle = '#1a5fcc';
  ctx.textAlign = 'right';
  ctx.fillText('100%', ix + incDirX*maxLenInc*0.5 - 6,
                       iy + incDirY*maxLenInc*0.5 - 10);

  // Arcos de ángulo
  // Incidencia (izq, sobre la normal)
  drawArc(ix, iy, 52, Math.PI + theta1 - Math.PI/2, -Math.PI/2, '#1a5fcc',
          `θ = ${(theta1*180/Math.PI).toFixed(0)}°`, -1);
  // Reflexión (der, sobre la normal)
  drawArc(ix, iy, 38, -Math.PI/2, -Math.PI/2 + theta1, '#cc3030', '', 1);

  // Punto de incidencia
  ctx.beginPath();
  ctx.arc(ix, iy, 5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(80,80,200,.75)';
  ctx.fill();

  // Brewster indicator line
  const brewDeg = p.brewAngle * 180 / Math.PI;
  const curDeg  = theta1 * 180 / Math.PI;
  if (Math.abs(curDeg - brewDeg) < 1.5) {
    ctx.save();
    ctx.strokeStyle = 'rgba(160,80,220,.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4,5]);
    ctx.beginPath(); ctx.moveTo(0, iy-6); ctx.lineTo(W, iy-6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '10px IBM Plex Mono';
    ctx.fillStyle = 'rgba(140,60,200,.8)';
    ctx.textAlign = 'right';
    ctx.fillText('⊕ Ángulo de Brewster — Rₚ = 0', W-10, iy-10);
    ctx.restore();
  }
}

/* ── Onda transversal a lo largo de una dirección ── */
function drawWave(ox, oy, dx, dy, len, color, phase, ampScale) {
  const px   = -dy, py = dx;      // perpendicular
  const amp  = 20 * ampScale;
  const wlen = 72;
  const cyc  = len / wlen;
  const N    = 400;

  // Relleno de lóbulos
  const rgb = hexToRgb(color);
  ctx.save();
  ctx.fillStyle = `rgba(${rgb},.12)`;
  let inL = false, lp;
  for (let i=0;i<=N;i++) {
    const t   = i/N;
    const d   = t*len;
    const a   = Math.sin((d/wlen)*cyc*2*Math.PI + phase)*amp;
    const wx  = ox+dx*d+px*a, wy = oy+dy*d+py*a;
    if (!inL) { inL=true; lp=new Path2D(); lp.moveTo(ox+dx*d,oy+dy*d); }
    lp.lineTo(wx,wy);
  }
  if(inL){ lp.lineTo(ox+dx*len,oy+dy*len); lp.closePath(); ctx.fill(lp); }

  // Curva
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  for (let i=0;i<=N;i++) {
    const t = i/N, d = t*len;
    const a = Math.sin((d/wlen)*cyc*2*Math.PI + phase)*amp;
    const wx = ox+dx*d+px*a, wy = oy+dy*d+py*a;
    i===0 ? ctx.moveTo(wx,wy) : ctx.lineTo(wx,wy);
  }
  ctx.stroke();
  ctx.restore();
}

function arrowHead(tx, ty, dx, dy, color) {
  const a = 10;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tx - dx*a + dy*5, ty - dy*a - dx*5);
  ctx.lineTo(tx, ty);
  ctx.lineTo(tx - dx*a - dy*5, ty - dy*a + dx*5);
  ctx.stroke();
  ctx.restore();
}

function drawArc(cx, cy, r, a0, a1, color, label, side) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = .6;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  if (label) {
    const mid = (a0+a1)/2;
    ctx.globalAlpha = .85;
    ctx.font = '9px IBM Plex Mono';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx+Math.cos(mid)*(r+14), cy+Math.sin(mid)*(r+14));
  }
  ctx.restore();
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

/* LOOP */
(function loop() {
  if (animOn) {
    phaseInc -= 0.052;
    phaseRef -= 0.052;
  }
  draw();
  requestAnimationFrame(loop);
})();

/* EVENTOS */
document.getElementById('slAngle').addEventListener('input', update);

document.getElementById('btnBrewster').addEventListener('click', () => {
  const p    = physics();
  const bDeg = Math.round(p.brewAngle*180/Math.PI);
  document.getElementById('slAngle').value = bDeg;
  update();
});

document.querySelector('.anim-toggle').addEventListener('click', () => {
  animOn = !animOn;
  document.getElementById('animDot').classList.toggle('on', animOn);
});

window.addEventListener('resize', () => { sizeCanvas(); });

/* INICIO */
sizeCanvas();
update();

// Header parallax micro-interaction
;(function headerParallax(){
  const hdr = document.querySelector('.hdr');
  const navLinks = document.querySelectorAll('.nav-top a');
  if(!hdr) return;
  hdr.style.transition = 'transform .25s ease';
  hdr.addEventListener('mousemove', e => {
    const r = hdr.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    const h1 = hdr.querySelector('h1');
    if(h1) h1.style.transform = `translate(${(x*12).toFixed(2)}px, ${(y*8).toFixed(2)}px) rotate(${(x*2).toFixed(2)}deg)`;
    navLinks.forEach((a,i) => a.style.transform = `translate(${(x*(6-i*2)).toFixed(1)}px, ${(y*4).toFixed(1)}px)`);
  });
  hdr.addEventListener('mouseleave', ()=>{
    const h1 = hdr.querySelector('h1'); if(h1) h1.style.transform = '';
    navLinks.forEach(a=> a.style.transform = '');
  });
})();
