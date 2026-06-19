async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "header.html");
  loadComponent("footer", "footer.html");
});

document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".module-frame video");

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // DESKTOP: play on hover
  if (!isMobile) {
    videos.forEach(video => {
      video.pause();

      video.addEventListener("mouseenter", () => {
        video.play();
      });

      video.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0; // opzionale reset
      });
    });
  }

  // MOBILE: play only when in viewport
  if (isMobile) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.6 // 60% visibile
    });

    videos.forEach(video => observer.observe(video));
  }
});