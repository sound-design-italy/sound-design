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
// AUDIO PLAYER PRO (FORMA D'ONDA STATICA E ANIMATA)
// ============================
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progress');
const progressThumb = document.getElementById('progressThumb');
const progressContainer = document.getElementById('progressContainer');
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

// Funzione per disegnare forma d'onda statica
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

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

// Disegna forma statica iniziale
drawStaticWaveform();

// PLAY / PAUSE + inizializza audio context
if (playBtn && audio && progressBar && canvas && ctx) {
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
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        drawWaveform();
      }
    } else {
      audio.pause();
      playBtn.textContent = 'PLAY';
      cancelAnimationFrame(animationId);
    }
  });

  // Aggiorna barra e puntino durante la riproduzione
  audio.addEventListener('timeupdate', () => {
    if (!isDragging) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = percent + '%';
      progressThumb.style.left = percent + '%';
    }
  });
}

// CLICK sulla barra per saltare
progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
});

// DRAG puntino (DESKTOP)
progressThumb.addEventListener('mousedown', (e) => {
  isDragging = true;
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = progressContainer.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    progressBar.style.width = (percent * 100) + '%';
    progressThumb.style.left = (percent * 100) + '%';
    audio.currentTime = percent * audio.duration;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// DRAG puntino (TOUCH MOBILE)
progressThumb.addEventListener('touchstart', () => isDragging = true);
progressThumb.addEventListener('touchmove', (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    const rect = progressContainer.getBoundingClientRect();
    let percent = (touch.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    progressBar.style.width = (percent * 100) + '%';
    progressThumb.style.left = (percent * 100) + '%';
    audio.currentTime = percent * audio.duration;
  }
});
progressThumb.addEventListener('touchend', () => isDragging = false);

// Funzione per disegnare waveform animata
function drawWaveform() {
  animationId = requestAnimationFrame(drawWaveform);
  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = 'rgba(5,5,5,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}