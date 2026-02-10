// ============================
// LOAD HEADER & FOOTER
// ============================

// Load header
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header').innerHTML = html;
    initMenu(); // inizializza menu dopo il caricamento
  });

// Load footer
fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer').innerHTML = html;
  });

// ============================
// HAMBURGER MENU + NEON LINKS
// ============================
function initMenu() {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  const links = menu.querySelectorAll('a');

  function resetLinks() {
    links.forEach(link => {
      link.style.opacity = 0;
      link.style.animation = 'none';
      link.style.animationDelay = '0s';
    });
  }

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburger.classList.toggle('open');

    if (isOpen) {
      links.forEach((link, index) => {
        link.style.animation = 'none';
        link.offsetHeight;
        link.style.animation = `neonIn 0.6s ease forwards`;
        link.style.animationDelay = `${index * 0.25}s`;
      });
    } else {
      resetLinks();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      resetLinks();
    });
  });
}

// ============================
// PACK CARD INTERACTION
// ============================
document.querySelectorAll('.pack-card').forEach(card => {
  card.addEventListener('click', () => {
    const overlay = document.querySelector('.page-overlay');
    if (overlay) overlay.classList.add('active');

    setTimeout(() => {
      window.location.href = card.dataset.link;
    }, 600);
  });
});

// ============================
// AUDIO PLAYER PRO (WAVEFORM + PLAYHEAD)
// ============================
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const canvas = document.getElementById('waveform');
const ctx = canvas ? canvas.getContext('2d') : null;

let audioCtx, source, analyser, dataArray, animationId;
let isDragging = false;

// Ridimensiona canvas
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Funzione per disegnare waveform statica iniziale
function drawStaticWaveform() {
  if (!canvas || !ctx) return;

  ctx.fillStyle = 'rgba(5,5,5,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00fff0';
  ctx.beginPath();

  const bufferLength = 64;
  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const y = canvas.height / 2; // linea piatta al centro
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceWidth;
  }

  ctx.stroke();
}

// Disegna waveform statica all'inizio
drawStaticWaveform();

// PLAY / PAUSE + inizializza audio context
if (playBtn && audio && canvas && ctx) {
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = 'PAUSE';

      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        drawWaveform();
      }
    } else {
      audio.pause();
      playBtn.textContent = 'PLAY';
      cancelAnimationFrame(animationId);
    }
  });
}

// Disegna waveform animata + playhead interattivo
function drawWaveform() {
  animationId = requestAnimationFrame(drawWaveform);
  analyser.getByteTimeDomainData(dataArray);

  // Sfondo
  ctx.fillStyle = 'rgba(5,5,5,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Waveform
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00fff0';
  ctx.beginPath();
  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    x += sliceWidth;
  }
  ctx.stroke();

  // Playhead rosso
  const percent = audio.currentTime / audio.duration;
  const playheadX = percent * canvas.width;
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playheadX, 0);
  ctx.lineTo(playheadX, canvas.height);
  ctx.stroke();
}

// FUNZIONE PER SEEK TRAMITE CLICK O DRAG
function seek(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let percent = (clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  audio.currentTime = percent * audio.duration;
}

// Drag e click interattivo
canvas.addEventListener('mousedown', () => isDragging = true);
canvas.addEventListener('mousemove', e => { if(isDragging) seek(e); });
canvas.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('touchstart', () => isDragging = true);
canvas.addEventListener('touchmove', e => { if(isDragging) seek(e); });
canvas.addEventListener('touchend', () => isDragging = false);