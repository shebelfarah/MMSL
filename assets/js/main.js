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
        var heroSection = document.querySelector('.hero');

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
        if (heroSection && data.hero && data.hero.backgroundImage) {
          heroSection.style.backgroundImage = "url('" + data.hero.backgroundImage + "')";
        }

        // Stats bar
        var statsBar = document.getElementById('stats-bar');
        if (statsBar && data.stats && data.stats.length > 0) {
          statsBar.innerHTML = data.stats.map(function (stat) {
            return '<div class="stat"><div class="stat__value">' + stat.value + '</div><div class="stat__label">' + stat.label + '</div></div>';
          }).join('');
        }

        // Homepage images — insert at specified positions
        if (data.images && data.images.length > 0) {
          var positionMap = {
            'after-hero': '.hero',
            'after-stats': '.stats-bar',
            'after-whatwedo': '#section-whatwedo',
            'after-iso': '.iso-banner',
            'after-values': '#section-values',
            'after-categories': '#section-categories',
            'after-csr': '#section-csr'
          };

          // Group images by position
          var grouped = {};
          data.images.forEach(function (img) {
            if (!img.url) return;
            if (!grouped[img.position]) grouped[img.position] = [];
            grouped[img.position].push(img);
          });

          Object.keys(grouped).forEach(function (pos) {
            var target = document.querySelector(positionMap[pos]);
            if (!target) return;

            var wrapper = document.createElement('section');
            wrapper.className = 'hp-dynamic-images fade-in';

            var container = document.createElement('div');
            container.className = 'container';

            var grid = document.createElement('div');
            grid.className = 'hp-images-grid';

            grouped[pos].forEach(function (img) {
              var widthClass = img.width === 'half' ? 'hp-img--half' : img.width === 'third' ? 'hp-img--third' : 'hp-img--full';

              var imgEl = document.createElement('div');
              imgEl.className = 'hp-img-item ' + widthClass;

              var inner = '';
              if (img.link) {
                inner = '<a href="' + img.link + '"><img src="' + img.url + '" alt="' + (img.label || '') + '"></a>';
              } else {
                inner = '<img src="' + img.url + '" alt="' + (img.label || '') + '">';
              }
              if (img.label) {
                inner += '<p class="hp-img-caption">' + img.label + '</p>';
              }
              imgEl.innerHTML = inner;
              grid.appendChild(imgEl);
            });

            container.appendChild(grid);
            wrapper.appendChild(container);
            target.parentNode.insertBefore(wrapper, target.nextSibling);
          });
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
