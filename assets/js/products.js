/* ============================================================
   MMSL — Products Page
   Fetches data/products.json and renders premium product catalog
   ============================================================ */

(function () {
  const DATA_URL = 'data/products.json';

  const filtersContainer = document.getElementById('product-filters');
  const productsGrid = document.getElementById('products-grid');

  if (!productsGrid) return;

  let allProducts = [];
  let allCategories = [];
  let activeCategory = 'all';

  async function loadProducts() {
    try {
      const response = await fetch(DATA_URL + '?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();

      allCategories = data.categories || [];
      allProducts = data.products || [];

      renderFilters();
      renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      renderFallback();
    }
  }

  function renderFilters() {
    if (!filtersContainer) return;

    // Update "All" button with count
    const allBtn = filtersContainer.querySelector('[data-category="all"]');
    if (allBtn) {
      allBtn.innerHTML = 'All Products <span class="filter-count">' + allProducts.length + '</span>';
      allBtn.addEventListener('click', function () {
        activeCategory = 'all';
        updateActiveFilter();
        renderProducts();
      });
    }

    // Add category buttons with counts
    allCategories.forEach(function (cat) {
      var count = allProducts.filter(function (p) { return p.categoryId === cat.id; }).length;
      var btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat.id;
      btn.innerHTML = '<i class="' + cat.icon + '" style="margin-right:6px;font-size:0.85em;"></i>' +
        cat.name + ' <span class="filter-count">' + count + '</span>';
      btn.addEventListener('click', function () {
        activeCategory = cat.id;
        updateActiveFilter();
        renderProducts();
      });
      filtersContainer.appendChild(btn);
    });
  }

  function updateActiveFilter() {
    filtersContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });
  }

  function renderProducts() {
    var filtered = activeCategory === 'all'
      ? allProducts
      : allProducts.filter(function (p) { return p.categoryId === activeCategory; });

    if (filtered.length === 0) {
      productsGrid.innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-mid-gray);">' +
        '<i class="fas fa-box-open" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>' +
        '<p>No products found in this category.</p></div>';
      return;
    }

    var html = '';

    // If showing a specific category, show category banner
    if (activeCategory !== 'all') {
      var cat = allCategories.find(function (c) { return c.id === activeCategory; });
      if (cat) {
        html += renderCategoryBanner(cat, filtered.length);
      }
    }

    // Render products count
    if (activeCategory === 'all') {
      html += '<div class="products-count" style="grid-column:1/-1;">Showing <strong>' +
        filtered.length + '</strong> products across <strong>' +
        allCategories.length + '</strong> categories</div>';
    }

    // Render product cards
    html += filtered.map(function (product) {
      var category = allCategories.find(function (c) { return c.id === product.categoryId; });
      var categoryName = category ? category.name : '';
      var categoryIcon = category ? category.icon : 'fas fa-box';

      var imageHtml = product.image
        ? '<img class="card__image" src="' + product.image + '" alt="' + product.name + '" loading="lazy">'
        : '<div class="card__image-placeholder"><i class="' + categoryIcon + '"></i></div>';

      var featuredHtml = product.featured
        ? '<span class="featured-badge"><i class="fas fa-star" style="margin-right:3px;"></i>Featured</span>'
        : '';

      return '<div class="card product-card fade-in visible">' +
        featuredHtml +
        imageHtml +
        '<div class="card__body">' +
        '<span class="card__badge"><i class="' + categoryIcon + '" style="margin-right:4px;font-size:0.8em;"></i>' + categoryName + '</span>' +
        '<h4 class="card__title">' + product.name + '</h4>' +
        '<p class="card__text">' + product.description + '</p>' +
        '<button class="btn btn--secondary btn--sm quote-btn" style="margin-top:var(--space-md);width:100%;" ' +
        'data-product="' + product.name.replace(/"/g, '&quot;') + '" data-category="' + categoryName.replace(/"/g, '&quot;') + '" data-icon="' + categoryIcon + '">' +
        '<i class="fas fa-file-invoice" style="margin-right:4px;"></i> Request Quote</button>' +
        '</div></div>';
    }).join('');

    productsGrid.innerHTML = html;
  }

  function renderCategoryBanner(category, productCount) {
    var imageHtml = category.image
      ? '<div class="category-banner__image"><img src="' + category.image + '" alt="' + category.name + '" loading="lazy"></div>'
      : '';

    return '<div class="category-banner fade-in visible" style="grid-column:1/-1;">' +
      '<div class="category-banner__info">' +
      '<h3><i class="' + category.icon + '" style="margin-right:10px;"></i>' + category.name + '</h3>' +
      '<p>' + category.description + '</p>' +
      '<div class="category-banner__stats">' +
      '<div class="category-banner__stat">' +
      '<span class="category-banner__stat-value">' + productCount + '</span>' +
      '<span class="category-banner__stat-label">Products</span>' +
      '</div>' +
      '<div class="category-banner__stat">' +
      '<span class="category-banner__stat-value"><i class="fas fa-check-circle"></i></span>' +
      '<span class="category-banner__stat-label">ISO Certified</span>' +
      '</div>' +
      '<div class="category-banner__stat">' +
      '<span class="category-banner__stat-value"><i class="fas fa-shipping-fast"></i></span>' +
      '<span class="category-banner__stat-label">Fast Delivery</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      imageHtml +
      '</div>';
  }

  function renderFallback() {
    productsGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-mid-gray);">' +
      '<i class="fas fa-exclamation-circle" style="font-size:2rem;margin-bottom:1rem;display:block;"></i>' +
      '<h3>Unable to load products</h3>' +
      '<p>Please contact us at <a href="mailto:info@maishamedicals.com">info@maishamedicals.com</a> for our product catalog.</p>' +
      '</div>';
  }

  // ============================================================
  // QUOTE REQUEST MODAL
  // ============================================================

  var quoteModal = document.getElementById('quote-modal');
  var quoteForm = document.getElementById('quote-form');
  var quoteSuccess = document.getElementById('quote-success');
  var quoteSubmit = document.getElementById('quote-submit');
  var quoteProductName = document.getElementById('quote-product-name');
  var quoteProductCategory = document.getElementById('quote-product-category');
  var quoteProductField = document.getElementById('quote-product-field');
  var quoteProductIcon = quoteModal ? quoteModal.querySelector('.quote-product-info__icon i') : null;

  // Open quote modal when clicking "Request Quote" button
  if (productsGrid) {
    productsGrid.addEventListener('click', function (e) {
      var btn = e.target.closest('.quote-btn');
      if (!btn) return;
      e.preventDefault();
      openQuoteModal(btn.dataset.product, btn.dataset.category, btn.dataset.icon);
    });
  }

  function openQuoteModal(name, category, icon) {
    if (!quoteModal) return;
    quoteProductName.textContent = name;
    quoteProductCategory.innerHTML = '<i class="' + icon + '" style="margin-right:4px;"></i> ' + category;
    quoteProductField.value = name;
    if (quoteProductIcon) quoteProductIcon.className = icon;
    quoteForm.style.display = '';
    quoteSuccess.classList.remove('show');
    quoteModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  window.closeQuoteModal = function () {
    if (!quoteModal) return;
    quoteModal.style.display = 'none';
    document.body.style.overflow = '';
    quoteForm.reset();
    quoteForm.style.display = '';
    quoteSuccess.classList.remove('show');
    if (quoteSubmit) {
      quoteSubmit.disabled = false;
      quoteSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
    }
  };

  // Close handlers
  if (quoteModal) {
    document.getElementById('quote-close').addEventListener('click', window.closeQuoteModal);
    quoteModal.querySelector('.quote-modal__overlay').addEventListener('click', window.closeQuoteModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && quoteModal.style.display !== 'none') {
        window.closeQuoteModal();
      }
    });
  }

  // Form submission
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      quoteSubmit.disabled = true;
      quoteSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      var formData = new FormData(quoteForm);

      fetch(quoteForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            quoteForm.style.display = 'none';
            quoteSuccess.classList.add('show');
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          alert('Something went wrong. Please try again or contact info@maishamedicals.com directly.');
          quoteSubmit.disabled = false;
          quoteSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
        });
    });
  }

  loadProducts();
})();
