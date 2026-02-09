// Load header & footer
fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;
    initMenu();
  });

fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });

// Hamburger interaction
function initMenu() {
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      menu.classList.remove('open');
    });
  });
}