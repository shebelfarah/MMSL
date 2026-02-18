/* ============================================================
   MMSL — Main JavaScript
   Navigation, scroll effects, animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navList.classList.toggle('open');
    });

    // Close mobile nav when clicking a link
    navList.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navList.classList.remove('open');
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header')) {
        navToggle.classList.remove('active');
        navList.classList.remove('open');
      }
    });
  }

  // --- Sticky Header Shadow on Scroll ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- Active Nav Link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Scroll Animations (Intersection Observer) ---
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  }

  // --- Load Homepage Content from content.json ---
  if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
    fetch('data/content.json?t=' + Date.now())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Hero section
        var headline = document.getElementById('hero-headline');
        var subtitle = document.getElementById('hero-subtitle');
        var ctaPrimary = document.getElementById('hero-cta-primary');
        var ctaSecondary = document.getElementById('hero-cta-secondary');

        if (headline && data.hero) headline.textContent = data.hero.headline;
        if (subtitle && data.hero) subtitle.textContent = data.hero.subheadline;
        if (ctaPrimary && data.hero && data.hero.ctaPrimary) {
          ctaPrimary.textContent = data.hero.ctaPrimary.text;
          ctaPrimary.href = data.hero.ctaPrimary.url;
        }
        if (ctaSecondary && data.hero && data.hero.ctaSecondary) {
          ctaSecondary.textContent = data.hero.ctaSecondary.text;
          ctaSecondary.href = data.hero.ctaSecondary.url;
        }

        // Stats bar
        var statsBar = document.getElementById('stats-bar');
        if (statsBar && data.stats && data.stats.length > 0) {
          statsBar.innerHTML = data.stats.map(function (stat) {
            return '<div class="stat"><div class="stat__value">' + stat.value + '</div><div class="stat__label">' + stat.label + '</div></div>';
          }).join('');
        }
      })
      .catch(function (err) {
        console.error('Error loading content:', err);
      });
  }

  // --- Back to Top Button ---
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
