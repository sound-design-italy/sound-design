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
      // animazione neon sequenziale
      links.forEach((link, index) => {
        link.style.animation = 'none';  // reset
        link.offsetHeight;              // trigger reflow
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
// AUDIO PLAYER PRO (FORMA D'ONDA)
// ============================
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progress');
const canvas = document.getElementById('waveform');
const ctx = canvas ? canvas.getContext('2d') : null;

let audioCtx, source, analyser, dataArray, animationId;

// Ridimensiona canvas
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Funzione per disegnare la waveform
function drawWaveform() {
  animationId = requestAnimationFrame(drawWaveform);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // dati audio reali se in play, altrimenti dati casuali
  if (audioCtx && analyser && !audio.paused) {
    analyser.getByteTimeDomainData(dataArray);
  } else {
    // forma d'onda statica casuale
    if (!dataArray) dataArray = new Uint8Array(128);
    for (let i = 0; i < dataArray.length; i++) {
      dataArray[i] = 128 + Math.random() * 20 - 10; // picchi casuali
    }
  }

  // disegna linea neon glow
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00fff0';
  ctx.shadowColor = '#00fff0';
  ctx.shadowBlur = 10;
  ctx.beginPath();

  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

// avvia la waveform anche senza play
drawWaveform();

// PLAY / PAUSE audio
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
      }
    } else {
      audio.pause();
      playBtn.textContent = 'PLAY';
    }
  });

  audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
  });
}