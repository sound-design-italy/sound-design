// ============================
// LOAD HEADER & FOOTER
// ============================

// Load header
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header').innerHTML = html;
    initMenu();
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

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburger.classList.toggle('open');

    if (isOpen) {
      links.forEach((link, index) => {
        link.style.animation = 'none';
        link.offsetHeight; // force reflow
        link.style.animation = `neonIn 0.6s ease forwards`;
        link.style.animationDelay = `${index * 0.12}s`;
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

  function resetLinks() {
    links.forEach(link => {
      link.style.opacity = 0;
      link.style.animation = 'none';
      link.style.animationDelay = '0s';
    });
  }
}

// ============================
// PACK CARD INTERACTION
// ============================
document.querySelectorAll('.pack-card').forEach(card => {
  card.addEventListener('click', () => {
    const overlay = document.querySelector('.page-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }

    setTimeout(() => {
      window.location.href = card.dataset.link;
    }, 600);
  });
});

// ============================
// AUDIO PLAYER PRO
// ============================
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progress');

if (playBtn && audio && progressBar) {
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = 'PAUSE';
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