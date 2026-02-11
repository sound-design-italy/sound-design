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
        link.offsetHeight; // trigger reflow
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
// VIDEO PLAY ON HOVER / VIEWPORT
// ============================
const packVideos = document.querySelectorAll('.packs-page .pack-card video');

if (packVideos.length) {
  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop) {
    // Desktop: play on hover, pause on mouse leave
    packVideos.forEach(video => {
      video.pause();        // fermo di default
      video.muted = true;   // necessario per play senza click
      video.addEventListener('mouseenter', () => {
        video.currentTime = 0;  // riparte dall'inizio
        video.play().catch(e => console.log('Play failed:', e));
      });
      video.addEventListener('mouseleave', () => video.pause());
    });
  } else {
    // Mobile: play/pause quando entra nel viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.muted = true;
          entry.target.play().catch(e => console.log('Play failed:', e));
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.5 });

    packVideos.forEach(video => {
      video.pause();
      observer.observe(video);
    });
  }
}

// ============================
// AUDIO PLAYER PRO (WHATSAPP STYLE)
// ============================
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const canvas = document.getElementById('waveform');
const ctx = canvas ? canvas.getContext('2d') : null;
const timeEl = document.getElementById('time');

let audioCtx, source, analyser, dataArray;
let animationId;
let isDragging = false;

// Ridimensiona canvas
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Play / Pause
if (playBtn && audio) {
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        drawWaveform();
      }
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
  });
}

// Aggiorna tempo
if (audio) {
  audio.addEventListener('timeupdate', () => {
    const minutes = Math.floor(audio.currentTime / 60);
    const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;
  });
}

// Disegna waveform
function drawWaveform() {
  animationId = requestAnimationFrame(drawWaveform);

  if (!ctx || !analyser) return;

  analyser.getByteTimeDomainData(dataArray);

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const percent = audio.currentTime / audio.duration;

  ctx.beginPath();
  ctx.moveTo(0, h/2);
  for (let i = 0; i < dataArray.length; i++) {
    const x = (i / dataArray.length) * w;
    const y = (dataArray[i] / 128.0) * h/2;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h/2);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, '#00fff0');
  gradient.addColorStop(percent, '#00fff0');
  gradient.addColorStop(percent, '#333');
  gradient.addColorStop(1, '#333');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#00fff0';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Seek tramite click o drag
function seek(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let percent = (clientX - rect.left) / rect.width;
  percent = Math.max(0, Math.min(1, percent));
  audio.currentTime = percent * audio.duration;
}

// Drag e click interattivo
if (canvas) {
  canvas.addEventListener('mousedown', e => { isDragging = true; seek(e); });
  canvas.addEventListener('mousemove', e => { if (isDragging) seek(e); });
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);

  canvas.addEventListener('touchstart', e => { isDragging = true; seek(e); });
  canvas.addEventListener('touchmove', e => { if (isDragging) seek(e); });
  canvas.addEventListener('touchend', () => isDragging = false);
}