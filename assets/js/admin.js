/* ============================================================
   MMSL — Admin Panel
   Client-side product & category management
   ============================================================ */

(function () {
  'use strict';

  var ADMIN_PASS = 'maisha2026';
  var DATA_URL = 'data/products.json';
  var STORAGE_KEY = 'mmsl_admin_data';

  var state = {
    categories: [],
    products: [],
    filterCategory: 'all'
  };

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
    loginGate.style.display = '';
    adminPanel.style.display = 'none';
    passwordInput.value = '';
  });

  function showAdmin() {
    loginGate.style.display = 'none';
    adminPanel.style.display = '';
    loadData();
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

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
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
