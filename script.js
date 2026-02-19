// ============================
// LOAD HEADER & FOOTER
// ============================

// Load header
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('header').innerHTML = html;
    if (typeof initMenu === 'function') initMenu(); // inizializza menu se presente
  });

// Load footer
fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer').innerHTML = html;
  });

// ============================
// FIREBASE CONFIG & LOAD MODULE CARDS
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

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

// Carica prodotti da Firestore
async function loadCards() {
  try {
    const querySnapshot = await getDocs(collection(db, "prodotti"));
    const grid = document.querySelector('.packs-grid');
    grid.innerHTML = '';

    querySnapshot.forEach(docSnap => {
      const item = docSnap.data();

      const card = document.createElement('div');
      card.className = 'pack-card';
      card.dataset.link = item.LinkPagina;

      card.innerHTML = `
        <div class="media">
          ${item.MediaURL.endsWith('.mp4') ? 
            `<video src="${item.MediaURL}" muted loop playsinline></video>` :
            `<img src="${item.MediaURL}" alt="${item.Title}" />`
          }
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

    initPackVideos();

  } catch (err) {
    console.error('Errore caricamento Firestore:', err);
  }
}

// ============================
// VIDEO PLAY ON HOVER / VIEWPORT
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
// INIT PAGE
// ============================
window.addEventListener('DOMContentLoaded', loadCards);