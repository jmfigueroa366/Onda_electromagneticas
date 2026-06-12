/* MATERIALES */
const MATS = [
  { name:"Agua",     n:1.33 },
  { name:"Vidrio",   n:1.50 },
  { name:"Diamante", n:2.42 },
  { name:"Cuarzo",   n:1.46 },
  { name:"Zafiro",   n:1.77 },
  { name:"Hielo",    n:1.31 },
];
let matIdx = 0;

/* ESTADO */
let phaseInc  = 0;
let phaseRefr = 0;
let animOn    = true;

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

  const Ts = tir ? 0 : 1 - Rs;
  const Tp = tir ? 0 : 1 - Rp;

  const critAngle  = n1 < n2 ? null : Math.asin(n2/n1);

  return { n1, n2, theta1, theta2, Rs, Rp, Ts, Tp, tir, critAngle };
}

/* ACTUALIZAR UI */
function update() {
  const p    = physics();
  const deg1 = parseFloat(document.getElementById('slAngle').value);

  document.getElementById('valAngle').innerHTML = deg1 + '<span class="u">°</span>';
  document.getElementById('valN2').textContent  = p.n2.toFixed(2);

  const sl  = document.getElementById('slAngle');
  const pct = ((sl.value - sl.min)/(sl.max - sl.min)*100).toFixed(1);
  sl.style.background = `linear-gradient(90deg,rgba(10,122,106,.55) ${pct}%, var(--dim) ${pct}%)`;

  // Métricas
  document.getElementById('mTheta1').textContent = deg1 + '°';
  document.getElementById('mTheta2').textContent = p.tir ? '—' : (p.theta2*180/Math.PI).toFixed(1) + '°';

  const Tavg = p.tir ? 0 : (p.Ts + p.Tp) / 2;
  document.getElementById('mT').textContent = p.tir ? '0%' : (Tavg*100).toFixed(1) + '%';
  document.getElementById('mCrit').textContent = p.critAngle != null
    ? (p.critAngle*180/Math.PI).toFixed(1) + '°'
    : 'N/A';

  // Barras
  document.getElementById('tsBar').style.width  = (p.Ts*100).toFixed(1) + '%';
  document.getElementById('tpBar').style.width  = (p.Tp*100).toFixed(1) + '%';
  document.getElementById('tsPct').textContent  = (p.Ts*100).toFixed(1) + '%';
  document.getElementById('tpPct').textContent  = (p.Tp*100).toFixed(1) + '%';

  // Badge TIR
  document.getElementById('tirBadge').classList.toggle('show', p.tir);

  // Nota
  let nota;
  if (deg1 < 1) {
    nota = `<strong>Incidencia normal (θ = 0°):</strong> La onda pasa directamente sin desviarse. El ángulo refractado θ₂ = 0°. La transmitancia es máxima: T = 1 − ((n₁−n₂)/(n₁+n₂))² = ${((1-((p.n1-p.n2)/(p.n1+p.n2))**2)*100).toFixed(1)}%. Base de los recubrimientos antirreflexión (λ/4) usados en lentes ópticas.`;
  } else if (p.tir) {
    nota = `<strong>Reflexión total interna (TIR):</strong> Como n₁ > n₂ y θ₁ supera el ángulo crítico, no existe rayo refractado. El 100% de la energía retorna al primer medio. Este principio es la base de la <strong>fibra óptica</strong> y los prismas de reflexión total usados en binoculares.`;
  } else {
    const deg2 = (p.theta2*180/Math.PI).toFixed(1);
    if (p.n2 > p.n1) {
      nota = `<strong>Refracción hacia el normal:</strong> Como n₂ > n₁ (paso de aire a ${MATS[matIdx].name}), el rayo se acerca a la normal: θ₂ = ${deg2}° < θ₁ = ${deg1}°. Transmitancia promedio = ${((p.Ts+p.Tp)/2*100).toFixed(1)}%. Ley de Snell: n₁ sin ${deg1}° = n₂ sin ${deg2}°.`;
    } else {
      nota = `<strong>Refracción alejándose de la normal:</strong> Como n₂ < n₁ (paso a un medio menos denso), el rayo se aleja de la normal: θ₂ = ${deg2}° > θ₁ = ${deg1}°. Al acercarte al ángulo crítico (${p.critAngle ? (p.critAngle*180/Math.PI).toFixed(1)+'°' : 'N/A'}), el rayo refractado tiende a 90°.`;
    }
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

  // Zona superior — aire (claro)
  ctx.fillStyle = '#f7f7fc';
  ctx.fillRect(0, 0, W, H/2);

  // Zona inferior — material con color según índice
  const matColors = [
    'rgba(180,230,220,0.55)',
    'rgba(200,215,240,0.55)',
    'rgba(200,195,245,0.55)',
    'rgba(210,225,235,0.55)',
    'rgba(215,200,245,0.55)',
    'rgba(200,235,245,0.55)',
  ];
  ctx.fillStyle = matColors[matIdx] || '#d0eae5';
  ctx.fillRect(0, H/2, W, H/2);

  // Etiquetas de medios
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.fillStyle = 'rgba(100,100,160,.6)';
  ctx.textAlign = 'left';
  ctx.fillText('Aire  n₁ = 1.00', 14, 22);
  ctx.fillStyle = 'rgba(10,100,85,.65)';
  ctx.fillText(`${MATS[matIdx].name}  n₂ = ${p.n2.toFixed(2)}`, 14, H/2 + 20);

  // Superficie (línea de interfaz)
  ctx.strokeStyle = 'rgba(10,120,100,.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
  ctx.setLineDash([]);

  const ix = W/2, iy = H/2;

  // Normal completa (solo una línea vertical)
  ctx.strokeStyle = 'rgba(100,100,180,.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6,8]);
  ctx.beginPath();
  ctx.moveTo(ix, iy - H*0.44);
  ctx.lineTo(ix, iy + H*0.44);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '9px IBM Plex Mono';
  ctx.fillStyle = 'rgba(100,100,180,.5)';
  ctx.textAlign = 'center';
  ctx.fillText('Normal', ix + 34, iy - H*0.38);

  // ── Onda incidente ──────────────────────────────────────
  const theta1 = p.theta1;
  const incDirX = -Math.sin(theta1);
  const incDirY = -Math.cos(theta1);
  const maxLenInc = Math.min(
    (theta1 > 0.001 ? ix / Math.abs(incDirX) : 9999),
    iy / Math.abs(incDirY)
  ) * 0.88;

  drawWave(ix, iy, incDirX, incDirY, maxLenInc, '#1a5fcc', phaseInc, 1.0);

  // Vector incidente — flecha apunta hacia la interfaz (dirección de propagación real)
  drawRayVector(ix + incDirX*maxLenInc, iy + incDirY*maxLenInc, -incDirX, -incDirY, maxLenInc, '#1a5fcc', 'rayo incidente', 'right');

  // Etiqueta 100%
  ctx.font = 'bold 10px IBM Plex Mono';
  ctx.fillStyle = '#1a5fcc';
  ctx.textAlign = 'right';
  ctx.fillText('100%', ix + incDirX*maxLenInc*0.5 - 6, iy + incDirY*maxLenInc*0.5 - 22);

  // Arco ángulo incidente
  drawArc(ix, iy, 52, Math.PI + theta1 - Math.PI/2, -Math.PI/2, '#1a5fcc',
          `θ₁ = ${(theta1*180/Math.PI).toFixed(0)}°`, -1);

  // ── Onda refractada ──────────────────────────────────────
  if (!p.tir && p.theta2 !== null) {
    const theta2   = p.theta2;
    const refrDirX = Math.sin(theta2);
    const refrDirY = Math.cos(theta2);
    const maxLenRefr = Math.min(
      (theta2 > 0.001 ? (W-ix) / Math.abs(refrDirX) : 9999),
      (H/2) / Math.abs(refrDirY)
    ) * 0.88;

    const Tavg = (p.Ts + p.Tp) / 2;
    drawWave(ix, iy, refrDirX, refrDirY, maxLenRefr, '#0a9a80', phaseRefr, Math.sqrt(Tavg));

    // Vector refractado — flecha sólida gruesa sobre la onda
    drawRayVector(ix, iy, refrDirX, refrDirY, maxLenRefr, '#0a9a80', 'rayo refractado', 'left');

    // Etiqueta % transmitido
    ctx.font = 'bold 10px IBM Plex Mono';
    ctx.fillStyle = '#0a9a80';
    ctx.textAlign = 'left';
    const rx = ix + refrDirX*maxLenRefr*0.5;
    const ry = iy + refrDirY*maxLenRefr*0.5 + 28;
    ctx.fillText(`T = ${(Tavg*100).toFixed(0)}%`, rx + 6, ry);

    // Arco ángulo refractado (debajo de la interfaz)
    drawArcBelow(ix, iy, 50, Math.PI/2, Math.PI/2 + theta2, '#0a9a80',
                 `θ₂ = ${(theta2*180/Math.PI).toFixed(0)}°`);
  } else if (p.tir) {
    // Indicador TIR visual
    ctx.save();
    ctx.strokeStyle = 'rgba(200,60,60,.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(0, H/2 + 16); ctx.lineTo(W, H/2 + 16); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '10px IBM Plex Mono';
    ctx.fillStyle = 'rgba(190,40,40,.75)';
    ctx.textAlign = 'center';
    ctx.fillText('Sin onda refractada — Reflexión total interna', W/2, H/2 + 32);
    ctx.restore();
  }

  // Punto de incidencia
  ctx.beginPath();
  ctx.arc(ix, iy, 5, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(10,130,100,.75)';
  ctx.fill();

  // Indicador ángulo crítico
  if (p.critAngle) {
    const critDeg = p.critAngle * 180 / Math.PI;
    const curDeg  = theta1 * 180 / Math.PI;
    if (Math.abs(curDeg - critDeg) < 1.5) {
      ctx.save();
      ctx.strokeStyle = 'rgba(200,100,20,.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4,5]);
      ctx.beginPath(); ctx.moveTo(0, iy-6); ctx.lineTo(W, iy-6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '10px IBM Plex Mono';
      ctx.fillStyle = 'rgba(180,80,10,.8)';
      ctx.textAlign = 'right';
      ctx.fillText(`⊕ Ángulo crítico — θ_c = ${critDeg.toFixed(1)}°`, W-10, iy-10);
      ctx.restore();
    }
  }
}

/* ── Onda transversal ── */
function drawWave(ox, oy, dx, dy, len, color, phase, ampScale) {
  const px   = -dy, py = dx;
  const amp  = 20 * ampScale;
  const wlen = 72;
  const cyc  = len / wlen;
  const N    = 400;

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

/* Arco en la zona SUPERIOR (ángulo incidente) */
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
    ctx.fillText(label, cx+Math.cos(mid)*(r+16), cy+Math.sin(mid)*(r+16));
  }
  ctx.restore();
}

/* Arco en la zona INFERIOR (ángulo refractado) */
function drawArcBelow(cx, cy, r, a0, a1, color, label) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = .6;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
  if (label) {
    const mid = (a0+a1)/2;
    ctx.globalAlpha = .85;
    ctx.font = '9px IBM Plex Mono';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx+Math.cos(mid)*(r+16), cy+Math.sin(mid)*(r+16));
  }
  ctx.restore();
}

/* ── Vector de rayo: línea sólida gruesa + punta + etiqueta ── */
function drawRayVector(ox, oy, dx, dy, len, color, label, labelSide) {
  const ex = ox + dx * len;
  const ey = oy + dy * len;

  // Línea sólida del vector
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Punta de flecha en el extremo
  const aSize = 13;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - dx*aSize + dy*5, ey - dy*aSize - dx*5);
  ctx.lineTo(ex - dx*aSize - dy*5, ey - dy*aSize + dx*5);
  ctx.closePath();
  ctx.fill();

  // Etiqueta del rayo (como en la imagen de referencia)
  const midX = ox + dx * len * 0.62;
  const midY = oy + dy * len * 0.62;
  // desplazamiento perpendicular para que no tape la onda
  const perpX = -dy * 18;
  const perpY =  dx * 18;
  const offsetX = labelSide === 'right' ? -perpX : perpX;
  const offsetY = labelSide === 'right' ? -perpY : perpY;

  ctx.font = 'bold 11px IBM Plex Mono, monospace';
  ctx.fillStyle = color;
  ctx.textAlign = labelSide === 'right' ? 'right' : 'left';
  ctx.fillText(label, midX + offsetX, midY + offsetY);

  ctx.restore();
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

/* LOOP */
(function loop() {
  if (animOn) {
    phaseInc  -= 0.052;
    phaseRefr -= 0.052 * (MATS[matIdx].n); // cambia velocidad según índice
  }
  draw();
  requestAnimationFrame(loop);
})();

/* EVENTOS */
document.getElementById('slAngle').addEventListener('input', update);

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
