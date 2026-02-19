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
// FIREBASE CONFIG
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDavwOB1jpD2B-Z-NTZlFJ3kjM9L7kdEYA",
  authDomain: "sito-pietro-sound.firebaseapp.com",
  projectId: "sito-pietro-sound",
  storageBucket: "sito-pietro-sound.firebasestorage.app",
  messagingSenderId: "986860817147",
  appId: "1:986860817147:web:ed26f6b043f26634313e5e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

// ============================
// LOAD MODULE CARDS FROM FIRESTORE (LIVE)
// ============================
function loadCards() {
  const grid = document.querySelector('.packs-grid');
  grid.innerHTML = '';

  // onSnapshot per aggiornamento live
  onSnapshot(collection(db, "prodotti"), snapshot => {
    grid.innerHTML = ''; // reset
    snapshot.forEach(docSnap => {
      const item = docSnap.data();

      const card = document.createElement('div');
      card.className = 'pack-card';
      card.dataset.link = item.LinkPagina;

      card.innerHTML = `
        <div class="media">
          <video src="${item.MediaURL}" muted loop playsinline></video>
          <span class="neon"></span>
        </div>
        <div class="info">
          <h2>${item.Title}</h2>
          <p>${item.Description}</p>
          <a class="btn-get-terminal" href="${item.LinkPagina}">GET</a>
        </div>
      `;

      card.addEventListener('click', () => {
        setTimeout(() => window.location.href = item.LinkPagina, 600);
      });

      grid.appendChild(card);
    });

    // Hover/play video
    initPackVideos();
  }, err => console.error('Errore Firestore live:', err));
}

// ============================
// VIDEO HOVER / PLAY ON VIEWPORT
// ============================
function initPackVideos() {
  const packVideos = document.querySelectorAll('.packs-page .pack-card video');
  if (!packVideos.length) return;

  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop) {
    packVideos.forEach(video => {
      video.pause();
      video.muted = true;
      video.preload = "auto";

      const card = video.closest('.pack-card');
      card.addEventListener('mouseenter', async () => {
        try { video.currentTime = 0; await video.play(); } 
        catch(e){ console.log('Play failed:', e); }
      });
      card.addEventListener('mouseleave', () => video.pause());
    });
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.play().catch(e => console.log('Play failed:', e));
        else entry.target.pause();
      });
    }, { threshold: 0.5 });

    packVideos.forEach(video => observer.observe(video));
  }
}

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
// INITIAL CALLS
// ============================
loadCards();