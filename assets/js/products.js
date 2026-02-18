/* ============================================================
   MMSL — Products Page
   Fetches data/products.json and renders product cards with filtering
   ============================================================ */

(function () {
  // Update this to your raw GitHub URL after deploying:
  // const DATA_URL = 'https://raw.githubusercontent.com/shebelfarah/MMSL/main/data/products.json';
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

    // "All" button already exists in HTML, add category buttons
    allCategories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat.id;
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        activeCategory = cat.id;
        updateActiveFilter();
        renderProducts();
      });
      filtersContainer.appendChild(btn);
    });

    // Attach click to "All" button
    const allBtn = filtersContainer.querySelector('[data-category="all"]');
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        activeCategory = 'all';
        updateActiveFilter();
        renderProducts();
      });
    }
  }

  function updateActiveFilter() {
    filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });
  }

  function renderProducts() {
    const filtered = activeCategory === 'all'
      ? allProducts
      : allProducts.filter(p => p.categoryId === activeCategory);

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-mid-gray);">
          <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          <p>No products found in this category.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(product => {
      const category = allCategories.find(c => c.id === product.categoryId);
      const categoryName = category ? category.name : '';
      const categoryIcon = category ? category.icon : 'fas fa-box';

      const imageHtml = product.image
        ? `<img class="card__image" src="${product.image}" alt="${product.name}" loading="lazy">`
        : `<div class="card__image" style="display: flex; align-items: center; justify-content: center; background: var(--color-off-white);">
             <i class="${categoryIcon}" style="font-size: 3rem; color: var(--color-primary); opacity: 0.3;"></i>
           </div>`;

      return `
        <div class="card product-card fade-in visible">
          ${imageHtml}
          <div class="card__body">
            <span class="card__badge">${categoryName}</span>
            <h4 class="card__title">${product.name}</h4>
            <p class="card__text">${product.description}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderFallback() {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-mid-gray);">
        <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        <h3>Unable to load products</h3>
        <p>Please contact us at <a href="mailto:info@maishamedicals.com">info@maishamedicals.com</a> for our product catalog.</p>
      </div>
    `;
  }

  loadProducts();
})();
