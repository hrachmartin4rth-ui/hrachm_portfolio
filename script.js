// ============================================================
// Martin Hrach — portfolio interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- mobile nav ---------- */
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('nav.links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---------- scroll-spy active nav ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navA = document.querySelectorAll('nav.links a[href^="#"]');
  if (sections.length && navA.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navA.forEach(a => a.classList.remove('active'));
          const match = document.querySelector(`nav.links a[href="#${entry.target.id}"]`);
          if (match) match.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- shared: split text into animated letter spans ---------- */
  function splitIntoChars(el, text, delayStep) {
    delayStep = delayStep || 0.035;
    el.textContent = '';
    let charIdx = 0;
    const words = text.split(' ');
    words.forEach((word, wIdx) => {
      // wrap each word so the browser can only break lines *between* words,
      // never mid-word (letter spans are inline-block, which otherwise lets
      // the layout snap a break in between any two letters).
      const wordWrap = document.createElement('span');
      wordWrap.style.display = 'inline-block';
      [...word].forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.className = 'char';
        span.style.animationDelay = `${charIdx * delayStep}s`;
        wordWrap.appendChild(span);
        charIdx++;
      });
      el.appendChild(wordWrap);
      if (wIdx < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
        charIdx++;
      }
    });
  }

  /* ---------- hero role cycler ---------- */
  const roleEl = document.querySelector('.roles');
  if (roleEl) {
    const roles = JSON.parse(roleEl.dataset.roles || '[]');
    let i = 0;
    if (roles.length > 1) {
      setInterval(() => {
        i = (i + 1) % roles.length;
        splitIntoChars(roleEl, roles[i], 0.03);
      }, 2800);
    }
  }

  /* ---------- skills filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item, .gallery-label');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (f === 'all' || item.dataset.category === f) {
          item.classList.remove('hide');
        } else {
          item.classList.add('hide');
        }
      });
    });
  });

  /* ---------- reel carousel ---------- */
  document.querySelectorAll('.reel-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-arrow.prev');
    const nextBtn = carousel.querySelector('.carousel-arrow.next');
    if (!track || !slides.length) return;

    let active = slides.findIndex(s => s.classList.contains('is-active'));
    if (active === -1) active = 0;

    function render() {
      slides.forEach((s, i) => {
        const wasActive = s.classList.contains('is-active');
        const isActive = i === active;
        s.classList.toggle('is-active', isActive);
        const v = s.querySelector('video');
        if (v && wasActive && !isActive) v.pause();
      });
      track.style.transform = 'none';
      requestAnimationFrame(() => {
        const activeSlide = slides[active];
        const carouselRect = carousel.getBoundingClientRect();
        const slideRect = activeSlide.getBoundingClientRect();
        const delta = (carouselRect.left + carouselRect.width / 2) - (slideRect.left + slideRect.width / 2);
        track.style.transform = `translateX(${delta}px)`;
      });
      if (prevBtn) prevBtn.disabled = active === 0;
      if (nextBtn) nextBtn.disabled = active === slides.length - 1;
    }

    slides.forEach((s, i) => {
      s.addEventListener('click', () => {
        if (i === active) return;
        active = i;
        render();
      });
    });
    prevBtn?.addEventListener('click', () => { if (active > 0) { active--; render(); } });
    nextBtn?.addEventListener('click', () => { if (active < slides.length - 1) { active++; render(); } });
    window.addEventListener('resize', render);
    render();
  });

  /* ---------- lightbox ---------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.dataset.lightbox;
        if (!src) return;
        lightboxImg.src = src;
        lightbox.classList.add('open');
      });
    });
    const closeLb = () => lightbox.classList.remove('open');
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLb);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
  }

  /* ---------- custom cursor ---------- */
  const cursor = document.querySelector('.cursor-dot');
  if (cursor && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    document.querySelectorAll('a, button, .gallery-item').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
    let clickTimeout;
    window.addEventListener('mousedown', () => {
      cursor.classList.remove('clicked');
      void cursor.offsetWidth; // restart animation
      cursor.classList.add('clicked');
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => cursor.classList.remove('clicked'), 450);
    });
    /* hide cursor while scrolling (no mousemove fires, so it would otherwise linger in place) */
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      cursor.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => cursor.classList.remove('scrolling'), 120);
    }, { passive: true });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---------- header background on scroll ---------- */
  const header = document.querySelector('header.site-nav');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) header.style.background = 'rgba(10,12,9,0.92)';
      else header.style.background = 'linear-gradient(to bottom, rgba(10,12,9,.92), rgba(10,12,9,0))';
    });
  }

  /* ---------- hero name letter-split reveal ---------- */
  const nameSplit = document.querySelector('.name-split');
  if (nameSplit) {
    splitIntoChars(nameSplit, nameSplit.textContent, 0.035);
  }

  /* ---------- magnetic buttons ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.btn, .nav-cta').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt on work cards ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = (py * -8).toFixed(2);
        const ry = (px * 10).toFixed(2);
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.015)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- cinematic grain overlay ---------- */
  const grain = document.createElement('div');
  grain.className = 'grain-overlay';
  document.body.appendChild(grain);

  /* ---------- hero parallax on scroll ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    const layers = [
      { el: hero.querySelector('.eyebrow'), depth: .18 },
      { el: hero.querySelector('h1'), depth: .12 },
      { el: hero.querySelector('.lede'), depth: .26 },
      { el: hero.querySelector('.hero-actions'), depth: .34 },
    ].filter(l => l.el);
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 260) {
          layers.forEach(l => {
            const drift = Math.min(y * l.depth, 40); // cap lag so it can never drift into the next section
            l.el.style.transform = `translateY(${drift}px)`;
            l.el.style.opacity = Math.max(1 - y / 220, 0);
          });
        } else {
          layers.forEach(l => { l.el.style.opacity = 0; });
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- metric count-up ---------- */
  const metricEls = document.querySelectorAll('.metric-count');
  if (metricEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };
    const metricObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          metricObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    metricEls.forEach(el => metricObserver.observe(el));
  }

});
