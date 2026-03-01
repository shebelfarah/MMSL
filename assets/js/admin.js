/* ============================================================
   MMSL — Admin Panel
   Client-side product & category management
   ============================================================ */

(function () {
  'use strict';

  var ADMIN_PASS = 'maisha2026';
  var DATA_URL = 'data/products.json';
  var CONTENT_URL = 'data/content.json';
  var STORAGE_KEY = 'mmsl_admin_data';
  var CONTENT_STORAGE_KEY = 'mmsl_admin_content';

  var state = {
    categories: [],
    products: [],
    filterCategory: 'all'
  };

  var homeState = null;

  // ---- DOM refs ----
  var loginGate = document.getElementById('login-gate');
  var adminPanel = document.getElementById('admin-panel');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var passwordInput = document.getElementById('admin-password');

  // Products
  var productsTbody = document.getElementById('products-tbody');
  var productCount = document.getElementById('product-count');
  var filterCategory = document.getElementById('filter-category');
  var btnAddProduct = document.getElementById('btn-add-product');

  // Categories
  var categoriesList = document.getElementById('categories-list');
  var categoryCount = document.getElementById('category-count');

  // Product modal
  var productModal = document.getElementById('product-modal');
  var productForm = document.getElementById('product-form');
  var modalTitle = document.getElementById('modal-title');
  var editProductId = document.getElementById('edit-product-id');
  var editName = document.getElementById('edit-name');
  var editDescription = document.getElementById('edit-description');
  var editCategory = document.getElementById('edit-category');
  var editOrder = document.getElementById('edit-order');
  var editImage = document.getElementById('edit-image');
  var editFeatured = document.getElementById('edit-featured');
  var imagePreview = document.getElementById('image-preview');
  var imagePreviewImg = document.getElementById('image-preview-img');

  // Category modal
  var categoryModal = document.getElementById('category-modal');
  var categoryForm = document.getElementById('category-form');
  var editCatId = document.getElementById('edit-cat-id');
  var editCatName = document.getElementById('edit-cat-name');
  var editCatDescription = document.getElementById('edit-cat-description');
  var editCatIcon = document.getElementById('edit-cat-icon');
  var editCatImage = document.getElementById('edit-cat-image');
  var iconPreviewI = document.getElementById('icon-preview-i');

  // Actions
  var btnSaveJson = document.getElementById('btn-save-json');
  var btnLogout = document.getElementById('btn-logout');

  // Tabs
  var tabs = document.querySelectorAll('.admin-tab');
  var tabProducts = document.getElementById('tab-products');
  var tabCategories = document.getElementById('tab-categories');

  // ============================================================
  // AUTH
  // ============================================================

  function checkAuth() {
    if (localStorage.getItem('mmsl_admin_auth') === 'true') {
      showAdmin();
    }
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (passwordInput.value === ADMIN_PASS) {
      localStorage.setItem('mmsl_admin_auth', 'true');
      loginError.style.display = 'none';
      showAdmin();
    } else {
      loginError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  btnLogout.addEventListener('click', function () {
    localStorage.removeItem('mmsl_admin_auth');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONTENT_STORAGE_KEY);
    loginGate.style.display = '';
    adminPanel.style.display = 'none';
    passwordInput.value = '';
  });

  function showAdmin() {
    loginGate.style.display = 'none';
    adminPanel.style.display = '';
    loadData();
    loadHomepageData();
  }

  // ============================================================
  // DATA LOADING
  // ============================================================

  function loadData() {
    // Check localStorage for unsaved work first
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        var parsed = JSON.parse(saved);
        state.categories = parsed.categories || [];
        state.products = parsed.products || [];
        renderAll();
        return;
      } catch (e) { /* fall through to fetch */ }
    }

    fetch(DATA_URL + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.categories = data.categories || [];
        state.products = data.products || [];
        saveToStorage();
        renderAll();
      })
      .catch(function () {
        productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--color-mid-gray);">Failed to load products data.</td></tr>';
      });
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      categories: state.categories,
      products: state.products
    }));
  }

  // ============================================================
  // RENDERING
  // ============================================================

  function renderAll() {
    renderFilterDropdown();
    renderProductsTable();
    renderCategories();
  }

  function renderFilterDropdown() {
    var html = '<option value="all">All Categories</option>';
    state.categories.forEach(function (cat) {
      html += '<option value="' + cat.id + '">' + cat.name + '</option>';
    });
    filterCategory.innerHTML = html;
    filterCategory.value = state.filterCategory;

    // Also update the edit form category dropdown
    var catHtml = '';
    state.categories.forEach(function (cat) {
      catHtml += '<option value="' + cat.id + '">' + cat.name + '</option>';
    });
    editCategory.innerHTML = catHtml;
  }

  function renderProductsTable() {
    var filtered = state.filterCategory === 'all'
      ? state.products
      : state.products.filter(function (p) { return p.categoryId === state.filterCategory; });

    productCount.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
      productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--color-mid-gray);">No products found.</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (product) {
      var cat = state.categories.find(function (c) { return c.id === product.categoryId; });
      var catName = cat ? cat.name : product.categoryId;
      var catIcon = cat ? cat.icon : 'fas fa-box';

      var imgCell = product.image
        ? '<img src="' + escHtml(product.image) + '" alt="" class="admin-thumb">'
        : '<div class="admin-thumb admin-thumb--placeholder"><i class="' + catIcon + '"></i></div>';

      html += '<tr data-id="' + product.id + '">' +
        '<td>' + imgCell + '</td>' +
        '<td><strong>' + escHtml(product.name) + '</strong></td>' +
        '<td><span class="admin-cat-badge"><i class="' + catIcon + '"></i> ' + escHtml(catName) + '</span></td>' +
        '<td>' + (product.featured ? '<i class="fas fa-star" style="color:#E65100;"></i>' : '<i class="far fa-star" style="color:var(--color-light-gray);"></i>') + '</td>' +
        '<td>' + product.order + '</td>' +
        '<td class="admin-actions">' +
        '<button class="admin-btn-edit" data-id="' + product.id + '" title="Edit"><i class="fas fa-pen"></i></button>' +
        '<button class="admin-btn-delete" data-id="' + product.id + '" title="Delete"><i class="fas fa-trash"></i></button>' +
        '</td></tr>';
    });

    productsTbody.innerHTML = html;

    // Attach edit/delete handlers
    productsTbody.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { openEditProduct(btn.dataset.id); });
    });
    productsTbody.querySelectorAll('.admin-btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteProduct(btn.dataset.id); });
    });
  }

  function renderCategories() {
    categoryCount.textContent = state.categories.length + ' categor' + (state.categories.length !== 1 ? 'ies' : 'y');

    var html = '';
    state.categories.forEach(function (cat) {
      var count = state.products.filter(function (p) { return p.categoryId === cat.id; }).length;
      html += '<div class="admin-category-card">' +
        '<div class="admin-category-card__icon"><i class="' + cat.icon + '"></i></div>' +
        '<div class="admin-category-card__info">' +
        '<h4>' + escHtml(cat.name) + '</h4>' +
        '<p>' + escHtml(cat.description) + '</p>' +
        '<span class="admin-cat-badge" style="margin-top:8px;display:inline-block;">' + count + ' product' + (count !== 1 ? 's' : '') + '</span>' +
        '</div>' +
        '<button class="admin-btn-edit" data-cat-id="' + cat.id + '" title="Edit category"><i class="fas fa-pen"></i></button>' +
        '</div>';
    });

    categoriesList.innerHTML = html;

    categoriesList.querySelectorAll('.admin-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () { openEditCategory(btn.dataset.catId); });
    });
  }

  // ============================================================
  // PRODUCT CRUD
  // ============================================================

  function openEditProduct(id) {
    var product = state.products.find(function (p) { return p.id === id; });
    if (!product) return;

    modalTitle.textContent = 'Edit Product';
    editProductId.value = product.id;
    editName.value = product.name;
    editDescription.value = product.description;
    editCategory.value = product.categoryId;
    editOrder.value = product.order;
    editImage.value = product.image || '';
    editFeatured.checked = product.featured;
    updateImagePreview();
    showModal(productModal);
  }

  function openAddProduct() {
    modalTitle.textContent = 'Add Product';
    editProductId.value = '';
    editName.value = '';
    editDescription.value = '';
    editCategory.value = state.categories.length > 0 ? state.categories[0].id : '';
    editOrder.value = 1;
    editImage.value = '';
    editFeatured.checked = false;
    updateImagePreview();
    showModal(productModal);
  }

  productForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = editProductId.value;
    var data = {
      categoryId: editCategory.value,
      name: editName.value.trim(),
      description: editDescription.value.trim(),
      image: editImage.value.trim(),
      featured: editFeatured.checked,
      order: parseInt(editOrder.value, 10) || 1
    };

    if (id) {
      // Edit existing
      var product = state.products.find(function (p) { return p.id === id; });
      if (product) {
        Object.assign(product, data);
      }
    } else {
      // Add new
      data.id = generateId(data.categoryId);
      state.products.push(data);
    }

    saveToStorage();
    renderAll();
    hideModal(productModal);
  });

  function deleteProduct(id) {
    var product = state.products.find(function (p) { return p.id === id; });
    if (!product) return;
    if (!confirm('Delete "' + product.name + '"? This cannot be undone.')) return;

    state.products = state.products.filter(function (p) { return p.id !== id; });
    saveToStorage();
    renderAll();
  }

  function generateId(categoryId) {
    var prefix = categoryId.substring(0, 2);
    var existing = state.products
      .filter(function (p) { return p.id.startsWith(prefix + '-'); })
      .map(function (p) { return parseInt(p.id.split('-')[1], 10) || 0; });
    var next = (existing.length > 0 ? Math.max.apply(null, existing) : 0) + 1;
    return prefix + '-' + String(next).padStart(3, '0');
  }

  // ============================================================
  // CATEGORY EDIT
  // ============================================================

  function openEditCategory(id) {
    var cat = state.categories.find(function (c) { return c.id === id; });
    if (!cat) return;

    editCatId.value = cat.id;
    editCatName.value = cat.name;
    editCatDescription.value = cat.description;
    editCatIcon.value = cat.icon;
    editCatImage.value = cat.image || '';
    iconPreviewI.className = cat.icon;
    showModal(categoryModal);
  }

  categoryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = editCatId.value;
    var cat = state.categories.find(function (c) { return c.id === id; });
    if (!cat) return;

    cat.name = editCatName.value.trim();
    cat.description = editCatDescription.value.trim();
    cat.icon = editCatIcon.value.trim();
    cat.image = editCatImage.value.trim();

    saveToStorage();
    renderAll();
    hideModal(categoryModal);
  });

  // ============================================================
  // MODALS
  // ============================================================

  function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Product modal close
  document.getElementById('modal-close').addEventListener('click', function () { hideModal(productModal); });
  document.getElementById('modal-cancel').addEventListener('click', function () { hideModal(productModal); });
  productModal.querySelector('.admin-modal__overlay').addEventListener('click', function () { hideModal(productModal); });

  // Category modal close
  document.getElementById('cat-modal-close').addEventListener('click', function () { hideModal(categoryModal); });
  document.getElementById('cat-modal-cancel').addEventListener('click', function () { hideModal(categoryModal); });
  categoryModal.querySelector('.admin-modal__overlay').addEventListener('click', function () { hideModal(categoryModal); });

  // Close modals with Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideModal(productModal);
      hideModal(categoryModal);
    }
  });

  // ============================================================
  // IMAGE & ICON PREVIEW
  // ============================================================

  editImage.addEventListener('input', updateImagePreview);

  function updateImagePreview() {
    var val = editImage.value.trim();
    if (val) {
      imagePreviewImg.src = val;
      imagePreview.style.display = 'block';
      imagePreviewImg.onerror = function () { imagePreview.style.display = 'none'; };
    } else {
      imagePreview.style.display = 'none';
    }
  }

  editCatIcon.addEventListener('input', function () {
    iconPreviewI.className = editCatIcon.value.trim();
  });

  // ============================================================
  // TABS
  // ============================================================

  var tabHomepage = document.getElementById('tab-homepage');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      tabHomepage.style.display = target === 'homepage' ? '' : 'none';
      tabProducts.style.display = target === 'products' ? '' : 'none';
      tabCategories.style.display = target === 'categories' ? '' : 'none';
    });
  });

  // ============================================================
  // FILTER
  // ============================================================

  filterCategory.addEventListener('change', function () {
    state.filterCategory = filterCategory.value;
    renderProductsTable();
  });

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  btnAddProduct.addEventListener('click', openAddProduct);

  // ============================================================
  // EXPORT JSON
  // ============================================================

  btnSaveJson.addEventListener('click', function () {
    var data = {
      lastUpdated: new Date().toISOString(),
      categories: state.categories,
      products: state.products
    };
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ============================================================
  // HOMEPAGE EDITING
  // ============================================================

  var hpHeadline = document.getElementById('hp-headline');
  var hpSubtitle = document.getElementById('hp-subtitle');
  var hpHeroImage = document.getElementById('hp-hero-image');
  var hpHeroImagePreview = document.getElementById('hp-hero-image-preview');
  var hpHeroImagePreviewImg = document.getElementById('hp-hero-image-preview-img');
  var hpCta1Text = document.getElementById('hp-cta1-text');
  var hpCta1Url = document.getElementById('hp-cta1-url');
  var hpCta2Text = document.getElementById('hp-cta2-text');
  var hpCta2Url = document.getElementById('hp-cta2-url');
  var hpStatsList = document.getElementById('hp-stats-list');
  var hpImagesList = document.getElementById('hp-images-list');
  var btnAddStat = document.getElementById('btn-add-stat');
  var btnAddImage = document.getElementById('btn-add-image');
  var btnSaveHomepage = document.getElementById('btn-save-homepage');

  var IMAGE_POSITIONS = [
    { value: 'after-hero', label: 'After Hero Section' },
    { value: 'after-stats', label: 'After Stats Bar' },
    { value: 'after-whatwedo', label: 'After What We Do' },
    { value: 'after-iso', label: 'After ISO Banner' },
    { value: 'after-values', label: 'After Our Values' },
    { value: 'after-categories', label: 'After Product Categories' },
    { value: 'after-csr', label: 'After CSR Section' }
  ];

  function loadHomepageData() {
    var saved = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (saved) {
      try {
        homeState = JSON.parse(saved);
        renderHomepageForm();
        return;
      } catch (e) { /* fall through */ }
    }

    fetch(CONTENT_URL + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        homeState = data;
        if (!homeState.images) homeState.images = [];
        if (!homeState.hero.backgroundImage) homeState.hero.backgroundImage = 'assets/images/hero/hero-bg.jpg';
        saveHomepageToStorage();
        renderHomepageForm();
      })
      .catch(function () {
        hpStatsList.innerHTML = '<p style="color:var(--color-mid-gray);padding:1rem;">Failed to load homepage data.</p>';
      });
  }

  function saveHomepageToStorage() {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(homeState));
  }

  function renderHomepageForm() {
    if (!homeState) return;

    // Hero fields
    hpHeadline.value = homeState.hero.headline || '';
    hpSubtitle.value = homeState.hero.subheadline || '';
    hpHeroImage.value = homeState.hero.backgroundImage || '';
    hpCta1Text.value = homeState.hero.ctaPrimary ? homeState.hero.ctaPrimary.text : '';
    hpCta1Url.value = homeState.hero.ctaPrimary ? homeState.hero.ctaPrimary.url : '';
    hpCta2Text.value = homeState.hero.ctaSecondary ? homeState.hero.ctaSecondary.text : '';
    hpCta2Url.value = homeState.hero.ctaSecondary ? homeState.hero.ctaSecondary.url : '';
    updateHeroImagePreview();

    // Stats
    renderStatsEditor();

    // Images
    renderImagesEditor();
  }

  function updateHeroImagePreview() {
    var val = hpHeroImage.value.trim();
    if (val) {
      hpHeroImagePreviewImg.src = val;
      hpHeroImagePreview.style.display = 'block';
      hpHeroImagePreviewImg.onerror = function () { hpHeroImagePreview.style.display = 'none'; };
    } else {
      hpHeroImagePreview.style.display = 'none';
    }
  }

  hpHeroImage.addEventListener('input', updateHeroImagePreview);

  // --- Stats Editor ---
  function renderStatsEditor() {
    if (!homeState || !homeState.stats) return;

    var html = '';
    homeState.stats.forEach(function (stat, i) {
      html += '<div class="hp-stat-row" data-index="' + i + '">' +
        '<div class="admin-form-row" style="gap:12px;align-items:flex-end;">' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Value</label>' +
        '<input type="text" class="form-control hp-stat-value" data-index="' + i + '" value="' + escHtml(stat.value) + '" placeholder="e.g. 500+">' +
        '</div>' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Label</label>' +
        '<input type="text" class="form-control hp-stat-label" data-index="' + i + '" value="' + escHtml(stat.label) + '" placeholder="e.g. Products Available">' +
        '</div>' +
        '<button type="button" class="btn btn--sm hp-stat-remove" data-index="' + i + '" style="background:#dc3545;color:#fff;margin-bottom:16px;padding:8px 12px;" title="Remove">' +
        '<i class="fas fa-trash"></i>' +
        '</button>' +
        '</div></div>';
    });

    if (homeState.stats.length === 0) {
      html = '<p style="color:var(--color-mid-gray);padding:0.5rem;">No stats. Click "Add Stat" to add one.</p>';
    }

    hpStatsList.innerHTML = html;

    // Attach remove handlers
    hpStatsList.querySelectorAll('.hp-stat-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        homeState.stats.splice(parseInt(btn.dataset.index, 10), 1);
        saveHomepageToStorage();
        renderStatsEditor();
      });
    });

    // Live update on input
    hpStatsList.querySelectorAll('.hp-stat-value').forEach(function (input) {
      input.addEventListener('input', function () {
        homeState.stats[parseInt(input.dataset.index, 10)].value = input.value;
      });
    });
    hpStatsList.querySelectorAll('.hp-stat-label').forEach(function (input) {
      input.addEventListener('input', function () {
        homeState.stats[parseInt(input.dataset.index, 10)].label = input.value;
      });
    });
  }

  btnAddStat.addEventListener('click', function () {
    if (!homeState) return;
    homeState.stats.push({ value: '', label: '' });
    saveHomepageToStorage();
    renderStatsEditor();
    // Focus the new value input
    var inputs = hpStatsList.querySelectorAll('.hp-stat-value');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  });

  // --- Images Editor ---
  function renderImagesEditor() {
    if (!homeState || !homeState.images) return;

    var html = '';
    homeState.images.forEach(function (img, i) {
      var posLabel = IMAGE_POSITIONS.find(function (p) { return p.value === img.position; });
      posLabel = posLabel ? posLabel.label : img.position;

      // Position dropdown options
      var posOpts = IMAGE_POSITIONS.map(function (p) {
        return '<option value="' + p.value + '"' + (p.value === img.position ? ' selected' : '') + '>' + p.label + '</option>';
      }).join('');

      html += '<div class="hp-image-row" data-index="' + i + '">' +
        '<div class="hp-image-row__preview">' +
        (img.url ? '<img src="' + escHtml(img.url) + '" alt="' + escHtml(img.label || '') + '" onerror="this.style.display=\'none\'">' : '<div class="hp-image-placeholder"><i class="fas fa-image"></i></div>') +
        '</div>' +
        '<div class="hp-image-row__fields">' +
        '<div class="form-group">' +
        '<label>Image URL</label>' +
        '<input type="text" class="form-control hp-img-url" data-index="' + i + '" value="' + escHtml(img.url || '') + '" placeholder="assets/images/...">' +
        '</div>' +
        '<div class="admin-form-row" style="gap:12px;">' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Label / Caption</label>' +
        '<input type="text" class="form-control hp-img-label" data-index="' + i + '" value="' + escHtml(img.label || '') + '" placeholder="Optional caption">' +
        '</div>' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Position on Page</label>' +
        '<select class="form-control hp-img-position" data-index="' + i + '">' + posOpts + '</select>' +
        '</div>' +
        '</div>' +
        '<div class="admin-form-row" style="gap:12px;">' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Width</label>' +
        '<select class="form-control hp-img-width" data-index="' + i + '">' +
        '<option value="full"' + (img.width === 'full' ? ' selected' : '') + '>Full Width</option>' +
        '<option value="half"' + (img.width === 'half' ? ' selected' : '') + '>Half Width</option>' +
        '<option value="third"' + (img.width === 'third' ? ' selected' : '') + '>One Third</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group" style="flex:1;">' +
        '<label>Link URL <small>(optional)</small></label>' +
        '<input type="text" class="form-control hp-img-link" data-index="' + i + '" value="' + escHtml(img.link || '') + '" placeholder="e.g. products.html">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<button type="button" class="btn btn--sm hp-img-remove" data-index="' + i + '" style="background:#dc3545;color:#fff;align-self:flex-start;padding:8px 12px;" title="Remove">' +
        '<i class="fas fa-trash"></i>' +
        '</button>' +
        '</div>';
    });

    if (homeState.images.length === 0) {
      html = '<p style="color:var(--color-mid-gray);padding:0.5rem;">No images added. Click "Add Image" to place an image on the homepage.</p>';
    }

    hpImagesList.innerHTML = html;

    // Attach remove handlers
    hpImagesList.querySelectorAll('.hp-img-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        homeState.images.splice(parseInt(btn.dataset.index, 10), 1);
        saveHomepageToStorage();
        renderImagesEditor();
      });
    });

    // Live update on input
    hpImagesList.querySelectorAll('.hp-img-url').forEach(function (input) {
      input.addEventListener('input', function () {
        homeState.images[parseInt(input.dataset.index, 10)].url = input.value;
      });
    });
    hpImagesList.querySelectorAll('.hp-img-label').forEach(function (input) {
      input.addEventListener('input', function () {
        homeState.images[parseInt(input.dataset.index, 10)].label = input.value;
      });
    });
    hpImagesList.querySelectorAll('.hp-img-position').forEach(function (sel) {
      sel.addEventListener('change', function () {
        homeState.images[parseInt(sel.dataset.index, 10)].position = sel.value;
      });
    });
    hpImagesList.querySelectorAll('.hp-img-width').forEach(function (sel) {
      sel.addEventListener('change', function () {
        homeState.images[parseInt(sel.dataset.index, 10)].width = sel.value;
      });
    });
    hpImagesList.querySelectorAll('.hp-img-link').forEach(function (input) {
      input.addEventListener('input', function () {
        homeState.images[parseInt(input.dataset.index, 10)].link = input.value;
      });
    });
  }

  btnAddImage.addEventListener('click', function () {
    if (!homeState) return;
    homeState.images.push({
      url: '',
      label: '',
      position: 'after-hero',
      width: 'full',
      link: ''
    });
    saveHomepageToStorage();
    renderImagesEditor();
    // Focus the new URL input
    var inputs = hpImagesList.querySelectorAll('.hp-img-url');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  });

  // --- Save Homepage ---
  btnSaveHomepage.addEventListener('click', function () {
    if (!homeState) return;

    // Collect hero fields
    homeState.hero.headline = hpHeadline.value.trim();
    homeState.hero.subheadline = hpSubtitle.value.trim();
    homeState.hero.backgroundImage = hpHeroImage.value.trim();
    homeState.hero.ctaPrimary = { text: hpCta1Text.value.trim(), url: hpCta1Url.value.trim() };
    homeState.hero.ctaSecondary = { text: hpCta2Text.value.trim(), url: hpCta2Url.value.trim() };
    homeState.lastUpdated = new Date().toISOString();

    saveHomepageToStorage();

    // Download content.json
    var json = JSON.stringify(homeState, null, 2);
    var blob = new Blob([json + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success feedback
    btnSaveHomepage.innerHTML = '<i class="fas fa-check"></i> Saved! File Downloaded';
    btnSaveHomepage.style.background = '#2E7D32';
    setTimeout(function () {
      btnSaveHomepage.innerHTML = '<i class="fas fa-save"></i> Save Homepage Changes';
      btnSaveHomepage.style.background = '';
    }, 3000);
  });

  // ============================================================
  // UTILS
  // ============================================================

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================================
  // INIT
  // ============================================================

  checkAuth();

})();
