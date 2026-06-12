// ============================================================
//  espectro_em.js — Simulador del Espectro Electromagnético
//  Proyecto educativo · Física Moderna
// ============================================================

// ── Constantes físicas universales ──────────────────────────
const C   = 299792458;       // Velocidad de la luz en el vacío (m/s)
const H_P = 6.62607015e-34;  // Constante de Planck (J·s)
const EV  = 1.602176634e-19; // Carga del electrón / 1 eV en Julios (J)

// ── Datos de las 7 bandas del espectro ──────────────────────
/**
 * BANDS — Array con la información de cada banda electromagnética.
 * Cada objeto contiene:
 *   name  : Nombre de la banda
 *   col   : Color representativo (hex) usado en la UI
 *   pBg   : Color de fondo de las píldoras de aplicaciones
 *   pFg   : Color de texto de las píldoras de aplicaciones
 *   fMin  : Frecuencia mínima de la banda (Hz)
 *   fMax  : Frecuencia máxima de la banda (Hz)
 *   sMin  : Valor mínimo del slider que corresponde a esta banda (0–10000)
 *   sMax  : Valor máximo del slider que corresponde a esta banda (0–10000)
 *   apps  : Lista de aplicaciones tecnológicas representativas
 *   fact  : Texto de curiosidad/dato científico detallado
 *   phys  : Explicación física simplificada para mostrar en la nota
 */
const BANDS = [
  {name:"Radio", col:"#4040b8", pBg:"#e8e8f8", pFg:"#2020a0",
   fMin:3e3, fMax:3e8, sMin:0, sMax:2000,
   apps:["AM (535–1605 kHz)","FM (88–108 MHz)","Televisión analógica","WiFi / Bluetooth","GPS (1.575 GHz)","Radar de largo alcance"],
   fact:"Las ondas de radio abarcan desde 3 kHz hasta 300 MHz, con longitudes de onda que van de 1 metro a cientos de kilómetros. A bajas frecuencias pueden seguir la curvatura terrestre (onda de superficie); a frecuencias medias rebotan en la ionosfera (onda de cielo), alcanzando miles de kilómetros sin repetidores. Cuanto mayor es la longitud de onda, mayor es su capacidad de difractarse alrededor de obstáculos como montañas y edificios. Heinrich Hertz generó y detectó estas oscilaciones en 1887, confirmando experimentalmente las ecuaciones de campo de Maxwell formuladas en 1865.",
   phys:"Las ondas de radio se generan haciendo oscilar corrientes eléctricas en una antena. Cuanto mayor es la longitud de onda, más fácil le resulta a la onda rodear obstáculos. Su energía por fotón es tan baja que no tiene ningún efecto sobre las moléculas del cuerpo humano."},

  {name:"Microondas", col:"#7020a8", pBg:"#f3e8fc", pFg:"#5010a0",
   fMin:3e8, fMax:3e11, sMin:2000, sMax:3200,
   apps:["Horno microondas (2.45 GHz)","WiFi 802.11 / Bluetooth","5G mmWave (28–40 GHz)","Radar meteorológico","Fondo cósmico (CMB)","Comunicaciones por satélite"],
   fact:"Las microondas ocupan el rango entre 300 MHz y 300 GHz (λ de 1 mm a 1 m). El horno microondas opera a 2.45 GHz porque esa frecuencia coincide con modos de vibración y rotación de la molécula de agua, transfiriendo energía cinética al fluido. El Fondo Cósmico de Microondas (CMB) es la radiación térmica residual del Big Bang: un cuerpo negro a T = 2.725 K cuyo pico de emisión cae a λ ≈ 1.9 mm, según la Ley de desplazamiento de Wien (λmax·T = 2.898×10⁻³ m·K).",
   phys:"Las microondas hacen vibrar y rotar las moléculas de agua, generando calor por fricción interna. Por eso el horno microondas calienta los alimentos desde adentro. En radar, el tiempo que tarda el pulso en rebotar y volver indica la distancia al objeto detectado."},

  {name:"Infrarrojo", col:"#c03000", pBg:"#fdeee8", pFg:"#a02000",
   fMin:3e11, fMax:4.3e14, sMin:3200, sMax:5600,
   apps:["Radiación térmica corporal","Mando a distancia (940 nm)","Termografía médica e industrial","Visión nocturna (NIR)","Espectroscopía FTIR","Fibra óptica (1310 / 1550 nm)"],
   fact:"Todo objeto con temperatura T > 0 K emite radiación infrarroja. La potencia total irradiada obedece la ley de Stefan-Boltzmann: P = σAT⁴ (σ = 5.67×10⁻⁸ W/m²K⁴). La piel humana (T ≈ 310 K) emite con pico en λmax ≈ 9.35 µm; el Sol (T ≈ 5778 K) en λmax ≈ 502 nm (verde). El infrarrojo cercano (NIR, 750–1400 nm) tiene la menor atenuación en fibras de sílice, con ventanas de transmisión a 1310 nm (dispersión nula) y 1550 nm (atenuación mínima ≈ 0.2 dB/km), base de todas las telecomunicaciones ópticas modernas.",
   phys:"El infrarrojo es básicamente calor radiante: todo objeto con temperatura emite esta radiación. Los enlaces moleculares absorben IR a frecuencias específicas, lo que permite identificar sustancias químicas. Las fibras ópticas aprovechan las longitudes de onda donde el vidrio es más transparente (1310 y 1550 nm) para transmitir datos con mínima pérdida."},

  {name:"Visible", col:"#555500", pBg:"#fdfde8", pFg:"#444400",
   fMin:4.3e14, fMax:7.5e14, sMin:5600, sMax:6600,
   apps:["Visión humana (380–700 nm)","Fotografía digital (CCD/CMOS)","LED y láseres de estado sólido","Fibra óptica de corta distancia","Fotosíntesis (clorofila a/b)","Microscopía óptica"],
   fact:"La ventana visible (380–700 nm, 1.8–3.1 eV) es el único rango que el ojo humano puede detectar directamente. Los bastones de la retina (rodopsina, pico 498 nm) operan en condiciones de baja luz; los tres tipos de conos responden a longitudes de onda corta —azul, S, 420 nm—, media —verde, M, 530 nm— y larga —rojo, L, 560 nm—. La visión del color emerge de la relación entre sus señales. La clorofila-a absorbe en 430 nm (banda de Soret) y 680 nm (banda Q roja), convirtiendo fotones en energía química con eficiencia cuántica cercana al 100% por fotón absorbido.",
   phys:"Cada fotón de luz visible tiene la energía exacta para activar los pigmentos del ojo y desencadenar la señal nerviosa que percibimos como color. Esa misma energía es la que aprovechan las plantas para la fotosíntesis y los paneles solares para generar electricidad."},

  {name:"Ultravioleta", col:"#7008c0", pBg:"#f3e8fc", pFg:"#5500bb",
   fMin:7.5e14, fMax:3e16, sMin:6600, sMax:7900,
   apps:["UV-A bronceado (315–400 nm)","UV-B síntesis vitamina D (280–315 nm)","UV-C esterilización germicida","Análisis forense (fluorescencia)","Astronomía UV (telescopios espaciales)","Litografía UV en microelectrónica"],
   fact:"El ultravioleta se clasifica en tres subregiones según su interacción con la materia viva. El UV-A (3.1–3.9 eV) penetra hasta la dermis y activa la melanina. El UV-B (3.9–4.4 eV) induce la síntesis de vitamina D₃ en la piel, pero también forma dímeros de ciclobutano entre bases de timina adyacentes en el ADN, lesiones mutagénicas si no son reparadas. El UV-C (<280 nm, >4.4 eV) es absorbido casi completamente por el ozono estratosférico mediante el ciclo de Chapman: O₃ + hν → O₂ + O*, protegiendo la vida en la superficie.",
   phys:"El UV tiene suficiente energía para romper enlaces químicos. El UV-B daña el ADN de las células de la piel formando enlaces anormales entre bases; la mayoría se reparan, pero los acumulados pueden causar mutaciones. La capa de ozono absorbe casi todo el UV-C y buena parte del UV-B antes de que llegue a la superficie terrestre."},

  {name:"Rayos X", col:"#0850c8", pBg:"#e8f0fc", pFg:"#0030b0",
   fMin:3e16, fMax:3e19, sMin:7900, sMax:9300,
   apps:["Radiografía diagnóstica (60–120 kVp)","Tomografía computada (TAC)","Cristalografía de rayos X (Bragg)","Control de seguridad aeroportuaria","Telescopio Chandra (rayos X blandos)","Fluorescencia de rayos X (XRF)"],
   fact:"Descubiertos por Wilhelm Röntgen en noviembre de 1895, los rayos X (0.01–10 nm, 100 eV – 100 keV) interactúan con la materia a través de tres procesos: efecto fotoeléctrico (dominante a bajas energías, σ ∝ Z⁴/E³), dispersión Compton (100 keV – 10 MeV, electrones prácticamente libres) y producción de pares (>1.022 MeV, cerca de núcleos). La Ley de Bragg (nλ = 2d·sinθ) relaciona la difracción de rayos X con la distancia interatómica: Rosalind Franklin la usó en 1952 para obtener la fotografía 51, clave para revelar la estructura de doble hélice del ADN.",
   phys:"Los rayos X atraviesan los tejidos blandos pero son absorbidos por estructuras densas como los huesos, lo que permite obtener imágenes internas del cuerpo. A mayor número atómico del material, más rayos X absorbe. En dosis altas son ionizantes: pueden arrancar electrones de las moléculas y dañar el ADN."},

  {name:"Rayos Gamma", col:"#0a8020", pBg:"#e8f8ea", pFg:"#065018",
   fMin:3e19, fMax:3e22, sMin:9300, sMax:10000,
   apps:["Radioterapia con Co-60 (1.17 / 1.33 MeV)","PET scan (511 keV por aniquilación)","Espectroscopía nuclear gamma","Gamma-Ray Bursts (GRBs)","Esterilización industrial de alimentos","Detección de materiales nucleares"],
   fact:"Los rayos gamma nacen en transiciones entre niveles nucleares excitados y en procesos de aniquilación materia-antimateria: e⁺ + e⁻ → 2γ, produciendo dos fotones de exactamente 511 keV cada uno (energía en reposo del electrón, m_e·c²), emitidos en direcciones opuestas para conservar el momento. Este principio sustenta la tomografía PET. Los Gamma-Ray Bursts (GRBs) son las explosiones electromagnéticas más energéticas del universo conocido, con luminosidades de hasta 10⁴⁷ W durante segundos a horas, asociadas a colapsos estelares y fusiones de estrellas de neutrones.",
   phys:"Son la forma de radiación electromagnética más energética que existe. Provienen del núcleo atómico, no de los electrones. Pueden atravesar varios centímetros de plomo. En medicina, esa misma capacidad destructiva se usa de forma controlada para eliminar tumores, apuntando los haces con precisión al tejido que se quiere destruir."}
];

// ── Funciones de lógica de bandas ────────────────────────────

/**
 * getBand(s) — Devuelve el objeto de banda correspondiente al valor del slider.
 * Recorre el array BANDS y retorna la primera banda cuyo rango sMin–sMax
 * contiene el valor s. Si ninguna coincide, retorna la última banda (Rayos Gamma).
 *
 * @param {number} s - Valor del slider (0 a 10000)
 * @returns {object} Objeto de banda del array BANDS
 */
function getBand(s) {
  for (const b of BANDS) if (s >= b.sMin && s <= b.sMax) return b;
  return BANDS[BANDS.length-1];
}

/**
 * sliderToFreq(s) — Convierte el valor del slider a frecuencia en Hz.
 * Usa interpolación logarítmica dentro del rango fMin–fMax de la banda actual,
 * lo que produce una escala perceptualmente uniforme para el espectro.
 * Fórmula: f = 10^( log10(fMin) + t * (log10(fMax) - log10(fMin)) )
 * donde t = (s - sMin) / (sMax - sMin)
 *
 * @param {number} s - Valor del slider (0 a 10000)
 * @returns {number} Frecuencia en Hz correspondiente al valor del slider
 */
function sliderToFreq(s) {
  const b = getBand(s);
  const t = (s - b.sMin) / (b.sMax - b.sMin);
  return Math.pow(10, Math.log10(b.fMin) + t * (Math.log10(b.fMax) - Math.log10(b.fMin)));
}

// ── Funciones de formateo de magnitudes físicas ──────────────

/**
 * toSci(val, unit, sigFigs) — Formatea un número en notación científica HTML.
 * Si el exponente está entre -2 y 4, usa notación decimal normal.
 * Para exponentes fuera de ese rango, genera HTML con <sup> para el exponente.
 * Retorna un objeto con múltiples representaciones del mismo valor.
 *
 * @param {number} val     - Valor numérico a formatear
 * @param {string} unit    - Unidad física (ej: 'Hz', 'nm', 'J')
 * @param {number} sigFigs - Cifras significativas (por defecto 3)
 * @returns {object} { html, modalHtml, text, u, v, exp }
 */
function toSci(val, unit, sigFigs) {
  sigFigs = sigFigs || 3;
  if (val === 0) return {html: '0', text: '0', u: unit};
  const exp = Math.floor(Math.log10(Math.abs(val)));
  const coeff = +(val / Math.pow(10, exp)).toPrecision(sigFigs);
  // Si el exponente es 0,1,-1 no hace falta notación científica
  if (exp >= -2 && exp <= 4) {
    const plain = +(val.toPrecision(sigFigs));
    return {html: plain + ' ' + unit, modalHtml: plain + ' <span class="mph-unit">' + unit + '</span>', text: plain + ' ' + unit, u: unit, v: plain};
  }
  return {
    html: coeff + ' ×10<sup>' + exp + '</sup> ' + unit,
    modalHtml: coeff + ' ×10<sup>' + exp + '</sup> <span class="mph-unit">' + unit + '</span>',
    text: coeff + ' ×10' + exp + ' ' + unit,
    u: unit, v: coeff, exp: exp
  };
}

/**
 * fmtF(f) — Formatea la frecuencia f (en Hz) con 4 cifras significativas.
 * Siempre usa Hz como unidad. Delega en toSci() para la notación científica.
 *
 * @param {number} f - Frecuencia en Hz
 * @returns {object} { v, u, html, mhtml, text }
 */
function fmtF(f) {
  const s = toSci(f, 'Hz', 4);
  return {v: s.v || +(f.toPrecision(4)), u: 'Hz', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtL(l) — Formatea la longitud de onda l (en metros) convirtiéndola a nanómetros.
 * Usa toSci() para producir notación científica cuando el valor en nm
 * requiere exponente fuera del rango -2 a 4 (ej: ondas de radio).
 *
 * @param {number} l - Longitud de onda en metros
 * @returns {object} { v, u:'nm', html, mhtml, text }
 */
function fmtL(l) {
  const nm = l * 1e9;
  const s = toSci(nm, 'nm', 3);
  return {v: s.v !== undefined ? s.v : +(nm.toPrecision(3)), u: 'nm', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtLSci(l) — Versión alternativa de fmtL para el display principal del slider.
 * Separa coeficiente y exponente para permitir renderizado HTML personalizado
 * con el exponente en superíndice y la unidad 'm' aparte.
 *
 * @param {number} l - Longitud de onda en metros
 * @returns {object} { coeff, exp, plain } — plain es string si no necesita notación científica
 */
function fmtLSci(l) {
  const nm = l * 1e9;
  const s = toSci(nm, 'nm', 3);
  if (s.exp === undefined) {
    return {coeff: null, exp: null, plain: (s.v !== undefined ? s.v : +(nm.toPrecision(3))) + ' nm'};
  }
  return {coeff: s.v, exp: s.exp, plain: null};
}

/**
 * fmtT(T) — Formatea el período T (en segundos) con notación científica.
 * Para frecuencias altas (rayos gamma), T puede ser del orden de 10⁻²² s.
 *
 * @param {number} T - Período en segundos (T = 1/f)
 * @returns {object} { v, u:'s', html, mhtml, text }
 */
function fmtT(T) {
  const s = toSci(T, 's', 3);
  return {v: s.v !== undefined ? s.v : +(T.toPrecision(3)), u: 's', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtE(f) — Calcula y formatea la energía del fotón E = h·f en Julios.
 * Usa la constante de Planck H_P. Para visualización se muestra en J
 * con notación científica (ej: 1.32 ×10⁻¹⁹ J para la luz visible).
 *
 * @param {number} f - Frecuencia en Hz
 * @returns {object} { v, u:'J', html, mhtml, text }
 */
function fmtE(f) {
  const J = H_P * f;
  const s = toSci(J, 'J', 3);
  return {v: s.v !== undefined ? s.v : +(J.toPrecision(3)), u: 'J', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtK(f) — Calcula y formatea el número de onda k = 2π·f/c en m⁻¹.
 * El número de onda indica cuántos ciclos completos hay por metro de distancia.
 *
 * @param {number} f - Frecuencia en Hz
 * @returns {object} { v, u:'m⁻¹', html, mhtml, text }
 */
function fmtK(f) {
  const k = 2 * Math.PI * f / C;
  const s = toSci(k, 'm⁻¹', 3);
  return {v: s.v !== undefined ? s.v : +(k.toPrecision(3)), u: 'm⁻¹', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtW(f) — Calcula y formatea la frecuencia angular ω = 2π·f en rad/s.
 * Representa la velocidad de oscilación del campo electromagnético en radianes por segundo.
 *
 * @param {number} f - Frecuencia en Hz
 * @returns {object} { v, u:'rad/s', html, mhtml, text }
 */
function fmtW(f) {
  const w = 2 * Math.PI * f;
  const s = toSci(w, 'rad/s', 3);
  return {v: s.v !== undefined ? s.v : +(w.toPrecision(3)), u: 'rad/s', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * fmtB() — Calcula y formatea la amplitud del campo magnético B₀ = E₀/c.
 * Asume E₀ = 1 V/m. El resultado es constante (3.336 ×10⁻⁹ T por cada V/m)
 * ya que la relación |B₀|/|E₀| = 1/c es una propiedad del vacío (Maxwell).
 *
 * @returns {object} { v, u:'T/(V/m)', html, mhtml, text }
 */
function fmtB() {
  const B = 1 / C;
  const s = toSci(B, 'T/(V/m)', 3);
  return {v: s.v !== undefined ? s.v : +(B.toPrecision(3)), u: 'T/(V/m)', html: s.html, mhtml: s.modalHtml || s.html, text: s.text};
}

/**
 * freqToRGB(f) — Convierte una frecuencia de luz visible a su color RGB perceptual.
 * Solo funciona para longitudes de onda entre 380 nm y 700 nm (espectro visible).
 * Usa un modelo de color por segmentos que imita la respuesta de los conos del ojo.
 * Aplica corrección gamma (^0.78) y atenuación en los extremos UV/rojo.
 *
 * @param {number} f - Frecuencia en Hz
 * @returns {number[]|null} Array [R, G, B] (0–255) o null si no es visible
 */
function freqToRGB(f) {
  const nm = (C/f)*1e9;
  if (nm < 380 || nm > 700) return null;
  let r, g, b;
  if      (nm < 440) { r=(440-nm)/60; g=0; b=1 }
  else if (nm < 490) { r=0; g=(nm-440)/50; b=1 }
  else if (nm < 510) { r=0; g=1; b=(510-nm)/20 }
  else if (nm < 580) { r=(nm-510)/70; g=1; b=0 }
  else if (nm < 645) { r=1; g=(645-nm)/65; b=0 }
  else               { r=1; g=0; b=0 }
  const fac = nm < 420 ? 0.3 + 0.7*(nm-380)/40 : (nm > 700 ? 0 : 1);
  return [Math.round(255*Math.pow(r*fac, 0.78)),
          Math.round(255*Math.pow(g*fac, 0.78)),
          Math.round(255*Math.pow(b*fac, 0.78))];
}

// ── Canvas del espectro (barra superior) ─────────────────────
const specCvs = document.getElementById('specCvs');
const sCtx    = specCvs.getContext('2d');

/**
 * drawSpec() — Dibuja la barra del espectro electromagnético con gradiente de colores.
 * Escala el canvas al devicePixelRatio para pantallas retina.
 * Usa un gradiente lineal con paradas de color que representan visualmente
 * cada banda del espectro (radio → gamma, de izquierda a derecha).
 * También agrega un brillo sutil en la parte superior con un rectángulo blanco semitransparente.
 */
function drawSpec() {
  const dpr = window.devicePixelRatio || 1;
  const W = specCvs.offsetWidth, H = 80;
  specCvs.width  = W * dpr;
  specCvs.height = H * dpr;
  sCtx.scale(dpr, dpr);

  const g = sCtx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0.00, '#2222a0');
  g.addColorStop(0.18, '#5028a8');
  g.addColorStop(0.28, '#c03010');
  g.addColorStop(0.53, '#ff0000');
  g.addColorStop(0.57, '#ff8800');
  g.addColorStop(0.595,'#ffee00');
  g.addColorStop(0.613,'#00cc00');
  g.addColorStop(0.630,'#0033ff');
  g.addColorStop(0.655,'#5500cc');
  g.addColorStop(0.79, '#6010b8');
  g.addColorStop(0.93, '#0848c0');
  g.addColorStop(1.00, '#0d8a22');
  sCtx.fillStyle = g;
  sCtx.beginPath();
  sCtx.roundRect(0, 0, W, H, 18);
  sCtx.fill();
  sCtx.fillStyle = 'rgba(255,255,255,0.08)';
  sCtx.beginPath();
  sCtx.roundRect(0, 0, W, H*0.42, [18,18,0,0]);
  sCtx.fill();
}

// ── Pestañas de bandas (btabs) ───────────────────────────────
/**
 * Generación dinámica de las pestañas de banda.
 * Por cada banda en BANDS se crea un div.btab con el nombre de la banda.
 * Al hacer clic, el slider salta al centro de esa banda y se llama update().
 */
const btabsEl = document.getElementById('btabs');
BANDS.forEach((b, i) => {
  const el = document.createElement('div');
  el.className = 'btab';
  el.id = 'bt' + i;
  el.textContent = b.name;
  el.onclick = () => {
    document.getElementById('sl').value = Math.floor((b.sMin + b.sMax) / 2);
    update();
  };
  btabsEl.appendChild(el);
});

// ── Canvas de la onda pequeña (panel principal) ──────────────
const wCvs = document.getElementById('wCvs');
const wCtx = wCvs.getContext('2d');
let phase = 0; // Fase de la animación de la onda (se decrementa en cada frame)

/**
 * drawWave(freq, eColor) — Dibuja la onda electromagnética transversal en el canvas pequeño.
 * Representa el campo eléctrico E (eje Z) como una sinusoide coloreada
 * y el campo magnético B (eje Y) como una sinusoide desplazada en perspectiva.
 * El número de ciclos aumenta logarítmicamente con la frecuencia.
 * Los lóbulos superiores e inferiores de E se rellenan con color semitransparente.
 * También dibuja líneas de campo verticales, etiquetas de campo y la flecha de propagación.
 *
 * @param {number} freq   - Frecuencia actual en Hz (determina densidad de ciclos)
 * @param {string} eColor - Color hex del campo eléctrico (cambia según la banda o λ visible)
 */
function drawWave(freq, eColor) {
  const dpr = window.devicePixelRatio || 1;
  const W = wCvs.offsetWidth, H = 190;
  wCvs.width  = W * dpr;
  wCvs.height = H * dpr;
  wCtx.scale(dpr, dpr);
  wCtx.clearRect(0, 0, W, H);

  const marginLeft = 72;
  const marginRight = 16;
  const marginTop = 20;
  const marginBot = 30;
  const ww = W - marginLeft - marginRight;
  const hh = H - marginTop - marginBot;
  const cy = marginTop + hh / 2;
  const ampE = hh * 0.42;
  const ampB = hh * 0.42;

  const logF   = Math.log10(freq);
  const logMin = Math.log10(3e3), logMax = Math.log10(3e22);
  const t      = (logF - logMin) / (logMax - logMin);
  const cycles = 0.5 + t * 13;

  const ec   = eColor || '#1a5fcc';
  const ecRgb = hexToRgb(ec);
  const bcStr = '60,80,200';

  wCtx.fillStyle = '#f7f7fc';
  wCtx.fillRect(0, 0, W, H);

  wCtx.strokeStyle = 'rgba(180,180,210,0.35)';
  wCtx.lineWidth = 0.5;
  wCtx.setLineDash([4, 8]);
  [cy - ampE * 0.98, cy, cy + ampE * 0.98].forEach(y => {
    wCtx.beginPath(); wCtx.moveTo(marginLeft, y); wCtx.lineTo(marginLeft + ww, y); wCtx.stroke();
  });
  wCtx.setLineDash([]);

  wCtx.strokeStyle = '#333355';
  wCtx.lineWidth = 1.6;
  wCtx.beginPath();
  wCtx.moveTo(marginLeft, cy);
  wCtx.lineTo(marginLeft + ww + 10, cy);
  wCtx.stroke();
  wCtx.fillStyle = '#333355';
  wCtx.beginPath();
  wCtx.moveTo(marginLeft + ww + 14, cy);
  wCtx.lineTo(marginLeft + ww + 6,  cy - 5);
  wCtx.lineTo(marginLeft + ww + 6,  cy + 5);
  wCtx.closePath(); wCtx.fill();
  wCtx.font = '10px DM Sans, sans-serif';
  wCtx.fillStyle = '#333355';
  wCtx.fillText('Dirección de propagación →', marginLeft + ww - 120, H - 6);

  wCtx.strokeStyle = '#aaaacc';
  wCtx.lineWidth = 1;
  wCtx.beginPath();
  wCtx.moveTo(marginLeft, marginTop + 4);
  wCtx.lineTo(marginLeft, marginTop + hh - 4);
  wCtx.stroke();

  const steps = 400;
  wCtx.fillStyle = `rgba(${ecRgb},0.13)`;
  let inLobe = false;
  let lobePath;
  for (let i = 0; i <= steps; i++) {
    const px = marginLeft + (i / steps) * ww;
    const angle = (i / steps) * cycles * 2 * Math.PI + phase;
    const ey = cy - Math.sin(angle) * ampE;
    const above = ey < cy;
    if (above && !inLobe) {
      inLobe = true;
      lobePath = new Path2D();
      lobePath.moveTo(px, cy);
    }
    if (inLobe) lobePath.lineTo(px, ey);
    if (!above && inLobe) {
      inLobe = false;
      lobePath.lineTo(px, cy);
      lobePath.closePath();
      wCtx.fill(lobePath);
    }
  }
  if (inLobe) { lobePath.lineTo(marginLeft + ww, cy); lobePath.closePath(); wCtx.fill(lobePath); }

  wCtx.fillStyle = `rgba(${ecRgb},0.08)`;
  inLobe = false;
  for (let i = 0; i <= steps; i++) {
    const px = marginLeft + (i / steps) * ww;
    const angle = (i / steps) * cycles * 2 * Math.PI + phase;
    const ey = cy - Math.sin(angle) * ampE;
    const below = ey > cy;
    if (below && !inLobe) {
      inLobe = true;
      lobePath = new Path2D();
      lobePath.moveTo(px, cy);
    }
    if (inLobe) lobePath.lineTo(px, ey);
    if (!below && inLobe) {
      inLobe = false;
      lobePath.lineTo(px, cy);
      lobePath.closePath();
      wCtx.fill(lobePath);
    }
  }
  if (inLobe) { lobePath.lineTo(marginLeft + ww, cy); lobePath.closePath(); wCtx.fill(lobePath); }

  const nLines = Math.round(cycles * 8);
  for (let li = 0; li <= nLines; li++) {
    const px = marginLeft + (li / nLines) * ww;
    const angle = (px - marginLeft) / ww * cycles * 2 * Math.PI + phase;
    const ey = cy - Math.sin(angle) * ampE;
    if (Math.abs(ey - cy) > 3) {
      wCtx.strokeStyle = `rgba(${ecRgb},0.20)`;
      wCtx.lineWidth = 0.7;
      wCtx.beginPath(); wCtx.moveTo(px, cy); wCtx.lineTo(px, ey); wCtx.stroke();
    }
  }

  wCtx.beginPath();
  wCtx.strokeStyle = ec;
  wCtx.lineWidth = 2.2;
  wCtx.lineJoin = 'round';
  for (let i = 0; i <= steps; i++) {
    const px = marginLeft + (i / steps) * ww;
    const ey = cy - Math.sin((i / steps) * cycles * 2 * Math.PI + phase) * ampE;
    i === 0 ? wCtx.moveTo(px, ey) : wCtx.lineTo(px, ey);
  }
  wCtx.stroke();

  const bShiftX = 0.28;
  const bShiftY = 0.55;

  wCtx.fillStyle = `rgba(${bcStr},0.10)`;
  inLobe = false;
  for (let i = 0; i <= steps; i++) {
    const px    = marginLeft + (i / steps) * ww;
    const angle = (i / steps) * cycles * 2 * Math.PI + phase;
    const bMag  = Math.sin(angle) * ampB * 0.58;
    const rx = px + bMag * bShiftX;
    const ry = cy - bMag * bShiftY;
    const above = ry < cy;
    if (above && !inLobe) {
      inLobe = true;
      lobePath = new Path2D();
      lobePath.moveTo(px + 0 * bShiftX, cy - 0 * bShiftY);
    }
    if (inLobe) lobePath.lineTo(rx, ry);
    if (!above && inLobe) {
      inLobe = false;
      lobePath.lineTo(rx, cy - bMag * bShiftY * 0);
      lobePath.closePath();
      wCtx.fill(lobePath);
    }
  }
  wCtx.fillStyle = `rgba(${bcStr},0.06)`;
  inLobe = false;
  for (let i = 0; i <= steps; i++) {
    const px    = marginLeft + (i / steps) * ww;
    const angle = (i / steps) * cycles * 2 * Math.PI + phase;
    const bMag  = Math.sin(angle) * ampB * 0.58;
    const rx = px + bMag * bShiftX;
    const ry = cy - bMag * bShiftY;
    const below = ry > cy;
    if (below && !inLobe) {
      inLobe = true;
      lobePath = new Path2D();
      lobePath.moveTo(px, cy);
    }
    if (inLobe) lobePath.lineTo(rx, ry);
    if (!below && inLobe) {
      inLobe = false;
      lobePath.lineTo(rx, cy);
      lobePath.closePath();
      wCtx.fill(lobePath);
    }
  }

  wCtx.beginPath();
  wCtx.strokeStyle = `rgba(${bcStr},0.75)`;
  wCtx.lineWidth = 1.8;
  wCtx.setLineDash([6,4]);
  for (let i = 0; i <= steps; i++) {
    const px    = marginLeft + (i / steps) * ww;
    const angle = (i / steps) * cycles * 2 * Math.PI + phase;
    const bMag  = Math.sin(angle) * ampB * 0.58;
    const rx = px + bMag * bShiftX;
    const ry = cy - bMag * bShiftY;
    i === 0 ? wCtx.moveTo(rx, ry) : wCtx.lineTo(rx, ry);
  }
  wCtx.stroke();
  wCtx.setLineDash([]);

  wCtx.font = 'bold 10px DM Sans, sans-serif';
  wCtx.fillStyle = ec;
  wCtx.textAlign = 'right';
  wCtx.fillText('Campo', marginLeft - 6, cy - ampE * 0.58);
  wCtx.fillText('eléctrico E', marginLeft - 6, cy - ampE * 0.58 + 13);
  wCtx.fillStyle = `rgb(${bcStr})`;
  wCtx.fillText('Campo', marginLeft - 6, cy + ampB * 0.35);
  wCtx.fillText('magnético B', marginLeft - 6, cy + ampB * 0.35 + 13);
  wCtx.textAlign = 'left';

  wCtx.font = '9px IBM Plex Mono, monospace';
  wCtx.fillStyle = 'rgba(80,80,140,0.5)';
  wCtx.fillText('E y B en fase · |B|=|E|/c', marginLeft + ww - 148, marginTop + 13);
}

/**
 * hexToRgb(hex) — Convierte un color hexadecimal '#RRGGBB' al formato 'R,G,B'.
 * Se usa para construir cadenas rgba() en el canvas, como en
 * `rgba(${hexToRgb('#1a5fcc')}, 0.5)`.
 * Si el valor no es un hex válido, retorna un azul de fallback.
 *
 * @param {string} hex - Color en formato '#RRGGBB'
 * @returns {string} Cadena 'R,G,B' con valores decimales (0–255)
 */
function hexToRgb(hex) {
  if (!hex || hex[0] !== '#') return '100,100,230';
  return [
    parseInt(hex.slice(1,3),16),
    parseInt(hex.slice(3,5),16),
    parseInt(hex.slice(5,7),16)
  ].join(',');
}

/**
 * INVISIBLE_LABELS — Objeto de etiquetas para el swatch cuando la longitud de onda
 * no es visible al ojo humano. Cada clave es el nombre de la banda y su valor
 * contiene un ícono y un texto descriptivo para mostrar en el swatch gris.
 */
const INVISIBLE_LABELS = {
  Radio:         { icon: '📡', text: 'Radio · no visible' },
  Microondas:    { icon: '〰', text: 'Microondas · no visible' },
  Infrarrojo:    { icon: '🌡', text: 'Infrarrojo · calor radiante · no visible' },
  Ultravioleta:  { icon: '☀', text: 'Ultravioleta · no visible' },
  'Rayos X':     { icon: '☢', text: 'Rayos X · ionizante · no visible' },
  'Rayos Gamma': { icon: '⚛', text: 'Rayos Gamma · altamente ionizante · no visible' }
};

/**
 * update() — Función principal de actualización de la interfaz.
 * Se llama cada vez que el usuario mueve el slider o hace clic en el espectro.
 * Realiza las siguientes acciones en orden:
 *   1. Lee el valor del slider y calcula frecuencia, λ, T, E, k, ω, B
 *   2. Actualiza el display de λ con notación científica en el encabezado del slider
 *   3. Actualiza los 7 parámetros físicos del panel de métricas
 *   4. Actualiza el swatch de color (visible o invisible según la λ)
 *   5. Mueve la aguja sobre el espectro
 *   6. Actualiza el color de fondo del slider
 *   7. Resalta la pestaña de banda activa
 *   8. Actualiza la barra de energía logarítmica
 *   9. Actualiza la nota física y el panel de datos de la banda
 *
 * @returns {string} waveColor — Color hex de la onda actual (para uso externo)
 */
function update() {
  const s    = parseInt(document.getElementById('sl').value);
  const freq = sliderToFreq(s);
  const band = getBand(s);
  const lambda = C / freq;
  const T      = 1 / freq;

  const fF = fmtF(freq), lF = fmtL(lambda), tF = fmtT(T);
  const eF = fmtE(freq), kF = fmtK(freq), wF = fmtW(freq);
  const bF = fmtB();
  const lSci = fmtLSci(lambda);

  // Display principal: longitud de onda
  if (lSci.plain !== null) {
    document.getElementById('fVal').innerHTML  = lSci.plain;
    document.getElementById('fUnit').textContent = '';
  } else {
    document.getElementById('fVal').innerHTML =
      lSci.coeff + ' ×10<sup>' + lSci.exp + '</sup>';
    document.getElementById('fUnit').textContent = ' m';
  }

  document.getElementById('mF').innerHTML  = fF.html; document.getElementById('mFu').textContent = '';
  document.getElementById('mL').innerHTML  = lF.html; document.getElementById('mLu').textContent = '';
  document.getElementById('mT').innerHTML  = tF.html; document.getElementById('mTu').textContent = '';
  document.getElementById('mE').innerHTML  = eF.html; document.getElementById('mEu').textContent = '';
  document.getElementById('mK').innerHTML  = kF.html; document.getElementById('mKu').textContent = '';
  document.getElementById('mW').innerHTML  = wF.html; document.getElementById('mWu').textContent = '';
  document.getElementById('mB').innerHTML  = bF.html; document.getElementById('mBu').textContent = '';

  const rgb = freqToRGB(freq);
  const sw  = document.getElementById('swatch');
  let waveColor;

  if (rgb) {
    const hex = '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('');
    waveColor = hex;
    document.getElementById('ldotE').style.background = hex;
    const br = (rgb[0]*299 + rgb[1]*587 + rgb[2]*114) / 1000;
    sw.className = 'swatch';
    sw.style.background = hex;
    sw.style.color = br > 110 ? 'rgba(0,0,0,0.75)' : '#fff';
    sw.style.border = '1px solid rgba(0,0,0,0.1)';
    sw.innerHTML = 'Luz visible &nbsp;·&nbsp; ' + lF.html;
  } else {
    waveColor = band.col;
    document.getElementById('ldotE').style.background = band.col;
    sw.className = 'swatch invisible';
    sw.style.background = '';
    sw.style.color = '';
    sw.style.border = '';
    const lbl = INVISIBLE_LABELS[band.name] || { icon: '—', text: 'No visible' };
    sw.innerHTML = '<span class="sw-dot"></span>' + lbl.text;
  }

  const needle = document.getElementById('needle');
  needle.style.left = (s / 10000 * specCvs.offsetWidth) + 'px';

  const pct = (s / 10000) * 100;
  document.getElementById('sl').style.background =
    `linear-gradient(to right, ${band.col} 0%, ${band.col} ${pct}%, var(--dim) ${pct}%, var(--dim) 100%)`;

  BANDS.forEach((b, i) => {
    const el = document.getElementById('bt' + i);
    const on = b.name === band.name;
    el.classList.toggle('on', on);
    el.style.borderTopColor = on ? band.col : 'var(--border)';
    el.style.color = on ? band.col : '';
  });

  const logF   = Math.log10(freq);
  const logMin = Math.log10(3e3), logMax = Math.log10(3e22);
  const pctE   = Math.max(0.5, ((logF - logMin) / (logMax - logMin)) * 100);
  const fill   = document.getElementById('ebarFill');
  fill.style.width      = pctE + '%';
  fill.style.background = `linear-gradient(to right, #a0a0ff, ${band.col})`;
  document.getElementById('ebarVal').innerHTML = eF.html;

  const note = document.getElementById('physNote');
  note.innerHTML = band.phys;
  note.style.borderLeftColor = band.col;

  document.getElementById('bName').textContent = band.name;
  document.getElementById('bName').style.color = band.col;
  // Rango en nm
  const lMinNm = fmtL(C / band.fMax), lMaxNm = fmtL(C / band.fMin);
  document.getElementById('bRange').innerHTML = 'λ: ' + lMinNm.html + ' — ' + lMaxNm.html;
  const pEl = document.getElementById('bPills');
  pEl.innerHTML = '';
  band.apps.forEach(a => {
    const p = document.createElement('span');
    p.className = 'bpill';
    p.textContent = a;
    p.style.background = band.pBg;
    p.style.color = band.pFg;
    pEl.appendChild(p);
  });
  document.getElementById('bFact').textContent = band.fact;

  return waveColor;
}

// ── Modal de onda ampliada ───────────────────────────────────
const wModal    = document.getElementById('wModal');
const wModalCvs = document.getElementById('wModalCvs');
const wMCtx     = wModalCvs.getContext('2d');
let   modalPhase = 0;    // Fase de animación del modal (se decrementa en loopModal)
let   modalAnimId = null; // ID del requestAnimationFrame del modal (para cancelarlo)
let   modalOpen  = false; // Estado de visibilidad del modal

/**
 * drawWaveOnCtx(ctx, cvs, freq, eColor, ph, opts) — Versión genérica de drawWave
 * que acepta un contexto y canvas externos como parámetros.
 * Se usa para dibujar la onda en el modal ampliado con dimensiones configurables.
 * Dibuja los mismos elementos que drawWave() pero más grande y con más resolución
 * (600 pasos vs 400), y acepta opciones como márgenes, altura y fontSize.
 *
 * @param {CanvasRenderingContext2D} ctx    - Contexto 2D del canvas destino
 * @param {HTMLCanvasElement}        cvs    - Canvas destino
 * @param {number}                   freq   - Frecuencia en Hz
 * @param {string}                   eColor - Color hex del campo eléctrico
 * @param {number}                   ph     - Fase actual de la animación (radianes)
 * @param {object}                   opts   - Opciones: { H, marginLeft, marginRight, marginTop, marginBot, maxCycles, fontSize }
 */
function drawWaveOnCtx(ctx, cvs, freq, eColor, ph, opts) {
  const dpr  = window.devicePixelRatio || 1;
  const W    = cvs.offsetWidth;
  const H    = opts.H || 320;
  cvs.width  = W * dpr;
  cvs.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const marginLeft  = opts.marginLeft  || 82;
  const marginRight = opts.marginRight || 20;
  const marginTop   = opts.marginTop   || 28;
  const marginBot   = opts.marginBot   || 36;
  const ww  = W - marginLeft - marginRight;
  const hh  = H - marginTop - marginBot;
  const cy  = marginTop + hh / 2;
  const ampE = hh * 0.42;
  const ampB = hh * 0.42;

  const logF   = Math.log10(freq);
  const logMin = Math.log10(3e3), logMax = Math.log10(3e22);
  const t      = (logF - logMin) / (logMax - logMin);
  const cycles = opts.cycles || (0.5 + t * (opts.maxCycles || 10));

  const ec    = eColor || '#1a5fcc';
  const ecRgb = hexToRgb(ec);
  const bcStr = '60,80,200';
  const steps = 600;

  ctx.fillStyle = '#f7f7fc';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(180,180,210,0.3)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4,10]);
  [cy - ampE*0.98, cy, cy + ampE*0.98].forEach(y => {
    ctx.beginPath(); ctx.moveTo(marginLeft, y); ctx.lineTo(marginLeft+ww, y); ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.strokeStyle = '#2a2a4a'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(marginLeft, cy); ctx.lineTo(marginLeft+ww+12, cy); ctx.stroke();
  ctx.fillStyle = '#2a2a4a';
  ctx.beginPath();
  ctx.moveTo(marginLeft+ww+17, cy);
  ctx.lineTo(marginLeft+ww+8,  cy-6);
  ctx.lineTo(marginLeft+ww+8,  cy+6);
  ctx.closePath(); ctx.fill();
  ctx.font = `${opts.fontSize||11}px DM Sans, sans-serif`;
  ctx.fillStyle = '#555577';
  ctx.textAlign = 'right';
  ctx.fillText('Dirección de propagación →', marginLeft+ww, H-8);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#c0c0dd'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(marginLeft, marginTop+4); ctx.lineTo(marginLeft, marginTop+hh-4); ctx.stroke();

  function drawLobes(positive, fillColor) {
    ctx.fillStyle = fillColor;
    let inLobe = false, lobePath;
    for (let i = 0; i <= steps; i++) {
      const px    = marginLeft + (i/steps)*ww;
      const angle = (i/steps)*cycles*2*Math.PI + ph;
      const ey    = cy - Math.sin(angle)*ampE;
      const cond  = positive ? (ey < cy) : (ey > cy);
      if (cond && !inLobe) {
        inLobe = true; lobePath = new Path2D(); lobePath.moveTo(px, cy);
      }
      if (inLobe) lobePath.lineTo(px, ey);
      if (!cond && inLobe) {
        inLobe = false; lobePath.lineTo(px, cy); lobePath.closePath(); ctx.fill(lobePath);
      }
    }
    if (inLobe) { lobePath.lineTo(marginLeft+ww, cy); lobePath.closePath(); ctx.fill(lobePath); }
  }

  drawLobes(true,  `rgba(${ecRgb},0.14)`);
  drawLobes(false, `rgba(${ecRgb},0.08)`);

  const nL = Math.round(cycles * 9);
  for (let li = 0; li <= nL; li++) {
    const px    = marginLeft + (li/nL)*ww;
    const angle = (px-marginLeft)/ww*cycles*2*Math.PI + ph;
    const ey    = cy - Math.sin(angle)*ampE;
    if (Math.abs(ey-cy) > 3) {
      ctx.strokeStyle = `rgba(${ecRgb},0.18)`; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,ey); ctx.stroke();
    }
  }

  ctx.beginPath(); ctx.strokeStyle = ec; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  for (let i = 0; i <= steps; i++) {
    const px = marginLeft+(i/steps)*ww;
    const ey = cy - Math.sin((i/steps)*cycles*2*Math.PI+ph)*ampE;
    i===0 ? ctx.moveTo(px,ey) : ctx.lineTo(px,ey);
  }
  ctx.stroke();

  const bSX = 0.28, bSY = 0.55;
  ctx.fillStyle = `rgba(${bcStr},0.10)`;
  let inLobe = false, lobePath;
  for (let i = 0; i <= steps; i++) {
    const px    = marginLeft+(i/steps)*ww;
    const angle = (i/steps)*cycles*2*Math.PI+ph;
    const bMag  = Math.sin(angle)*ampB*0.55;
    const rx = px+bMag*bSX, ry = cy-bMag*bSY;
    const above = ry < cy;
    if (above && !inLobe) { inLobe=true; lobePath=new Path2D(); lobePath.moveTo(px,cy); }
    if (inLobe) lobePath.lineTo(rx,ry);
    if (!above && inLobe) { inLobe=false; lobePath.lineTo(rx,cy); lobePath.closePath(); ctx.fill(lobePath); }
  }
  ctx.fillStyle = `rgba(${bcStr},0.06)`;
  inLobe=false;
  for (let i = 0; i <= steps; i++) {
    const px    = marginLeft+(i/steps)*ww;
    const angle = (i/steps)*cycles*2*Math.PI+ph;
    const bMag  = Math.sin(angle)*ampB*0.55;
    const rx=px+bMag*bSX, ry=cy-bMag*bSY;
    const below = ry>cy;
    if (below&&!inLobe) { inLobe=true; lobePath=new Path2D(); lobePath.moveTo(px,cy); }
    if (inLobe) lobePath.lineTo(rx,ry);
    if (!below&&inLobe) { inLobe=false; lobePath.lineTo(rx,cy); lobePath.closePath(); ctx.fill(lobePath); }
  }
  ctx.beginPath(); ctx.strokeStyle=`rgba(${bcStr},0.7)`; ctx.lineWidth=2; ctx.setLineDash([7,5]);
  for (let i=0; i<=steps; i++) {
    const px=marginLeft+(i/steps)*ww;
    const angle=(i/steps)*cycles*2*Math.PI+ph;
    const bMag=Math.sin(angle)*ampB*0.55;
    const rx=px+bMag*bSX, ry=cy-bMag*bSY;
    i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
  }
  ctx.stroke(); ctx.setLineDash([]);

  const fs = opts.fontSize || 11;
  ctx.font = `bold ${fs}px DM Sans, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = ec;
  ctx.fillText('Campo', marginLeft-8, cy-ampE*0.56);
  ctx.fillText('eléctrico E', marginLeft-8, cy-ampE*0.56+fs+2);
  ctx.fillStyle = `rgb(${bcStr})`;
  ctx.fillText('Campo', marginLeft-8, cy+ampB*0.32);
  ctx.fillText('magnético B', marginLeft-8, cy+ampB*0.32+fs+2);
  ctx.textAlign = 'left';

  ctx.font = `${fs-1}px IBM Plex Mono, monospace`;
  ctx.fillStyle = 'rgba(80,80,140,0.45)';
  ctx.fillText('E ⊥ B ⊥ k̂  ·  E y B en fase (vacío)  ·  |B₀|=|E₀|/c', marginLeft+8, marginTop+16);
}

/**
 * openModal() — Abre el modal con la onda ampliada y actualiza sus métricas.
 * Lee el estado actual del slider, rellena los 6 campos de parámetros del modal
 * (f, λ, T, E, k, |B|) y arranca su propio loop de animación independiente
 * con requestAnimationFrame. El loop interno (loopModal) se detiene cuando
 * modalOpen se pone en false.
 */
function openModal() {
  modalOpen = true;
  wModal.classList.add('open');
  const s    = parseInt(document.getElementById('sl').value);
  const freq = sliderToFreq(s);
  const band = getBand(s);
  const fF=fmtF(freq), lF=fmtL(C/freq), tF=fmtT(1/freq), eF=fmtE(freq), kF=fmtK(freq), bF=fmtB();
  document.getElementById('mTitle').textContent = band.name + ' — Onda EM Transversal';
  document.getElementById('mmF').innerHTML=fF.mhtml; document.getElementById('mmFu').textContent='';
  document.getElementById('mmL').innerHTML=lF.mhtml; document.getElementById('mmLu').textContent='';
  document.getElementById('mmT').innerHTML=tF.mhtml; document.getElementById('mmTu').textContent='';
  document.getElementById('mmE').innerHTML=eF.mhtml; document.getElementById('mmEu').textContent='';
  document.getElementById('mmK').innerHTML=kF.mhtml; document.getElementById('mmKu').textContent='';
  document.getElementById('mmB').innerHTML=bF.mhtml; document.getElementById('mmBu').textContent='';
  function loopModal() {
    if (!modalOpen) return;
    modalPhase -= 0.04;
    const sv   = parseInt(document.getElementById('sl').value);
    const fr   = sliderToFreq(sv);
    const bd   = getBand(sv);
    const rgb  = freqToRGB(fr);
    const wc   = rgb ? '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('') : bd.col;
    drawWaveOnCtx(wMCtx, wModalCvs, fr, wc, modalPhase, {
      H: 320, marginLeft: 88, marginRight: 22, marginTop: 30, marginBot: 38,
      maxCycles: 8, fontSize: 12
    });
    modalAnimId = requestAnimationFrame(loopModal);
  }
  loopModal();
}

/**
 * closeModal() — Cierra el modal y detiene su animación.
 * Pone modalOpen en false (lo que frena loopModal en el siguiente frame),
 * cancela el requestAnimationFrame pendiente y quita la clase CSS 'open'.
 */
function closeModal() {
  modalOpen = false;
  wModal.classList.remove('open');
  if (modalAnimId) cancelAnimationFrame(modalAnimId);
}

// ── Event listeners ──────────────────────────────────────────

// Cierra el modal al pulsar el botón X
document.getElementById('wModalClose').addEventListener('click', closeModal);

// Cierra el modal al hacer clic en el fondo oscuro (fuera del cuadro)
wModal.addEventListener('click', e => { if (e.target === wModal) closeModal(); });

// Cierra el modal al pulsar la tecla Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Clic en el canvas del espectro: mueve el slider a la posición X del clic
specCvs.addEventListener('click', e => {
  const r = specCvs.getBoundingClientRect();
  document.getElementById('sl').value = Math.round(((e.clientX - r.left) / r.width) * 10000);
  update();
});

// Clic en el canvas de la onda pequeña: abre el modal ampliado
wCvs.addEventListener('click', openModal);

// Cambio del slider: actualiza todos los displays
document.getElementById('sl').addEventListener('input', update);

// Redimensionamiento de ventana: redibuja el espectro y actualiza la UI
window.addEventListener('resize', () => { drawSpec(); update(); });

// ── Loop de animación principal ──────────────────────────────

let lastWaveColor = '#6060ee'; // Color de onda anterior (reservado para transiciones futuras)

/**
 * loop() — Loop principal de animación de la onda pequeña.
 * IIFE (Immediately Invoked Function Expression) que se auto-llama con
 * requestAnimationFrame a ~60 fps. En cada frame:
 *   1. Decrementa `phase` para animar el movimiento de la onda hacia la derecha
 *   2. Lee el valor actual del slider
 *   3. Determina el color de la onda (color real si es visible, color de banda si no)
 *   4. Llama a drawWave() para repintar el canvas
 */
(function loop() {
  phase -= 0.052;
  const s    = parseInt(document.getElementById('sl').value);
  const freq = sliderToFreq(s);
  const band = getBand(s);
  const rgb  = freqToRGB(freq);
  const wc   = rgb ? '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('') : band.col;
  drawWave(freq, wc);
  requestAnimationFrame(loop);
})();

// ── Inicialización ───────────────────────────────────────────

// Dibuja la barra del espectro al cargar la página
drawSpec();

// Actualiza toda la UI con el valor inicial del slider (posición 4700 = Visible)
update();