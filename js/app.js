// ============================================================
//  N&N Clothify — Main App
//  Reads products from localStorage (admin session) or
//  falls back to PRODUCTS_DATA in products-data.js
// ============================================================

let currentCategory = "all";

// ---- Product Source ----
// Admin saves products to localStorage under 'nn_products'.
// On every page load, the site reads from there first.
function getAllProducts() {
  try {
    const stored = localStorage.getItem('nn_products');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return PRODUCTS_DATA; // fallback to static file
}

function getProductsByCategory(categoryId) {
  const all = getAllProducts();
  if (!categoryId || categoryId === "all") return all;
  return all.filter(p => p.category === categoryId);
}

// ---- Category Source ----
// Admin saves categories to localStorage under 'nn_categories'.
function getCategories() {
  try {
    const stored = localStorage.getItem('nn_categories');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return STORE_CONFIG.categories;
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  buildCategoryTabs();
  switchCategory("all");
});

// Apply config values to static elements
// Merges localStorage settings saved from admin panel over the static config
function applyConfig() {
  try {
    const saved = localStorage.getItem('nn_settings');
    if (saved) Object.assign(STORE_CONFIG, JSON.parse(saved));
  } catch (e) { /* ignore */ }
  const { storeName, whatsappNumber } = STORE_CONFIG;
  document.title = `${storeName} — Fashion Store`;
  document.getElementById('header-store-name').textContent = storeName;
  document.getElementById('footer-store-name').textContent = storeName;
  const waLink = document.getElementById('footer-wa-link');
  if (waLink) waLink.href = `https://wa.me/${whatsappNumber}`;
}

// Build category tabs from localStorage (admin-saved) or config
function buildCategoryTabs() {
  const tabsEl = document.getElementById('category-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = getCategories().map(cat => `
    <li class="cat-tab" id="tab-${cat.id}" onclick="switchCategory('${cat.id}')">
      ${cat.icon} ${cat.name}
    </li>
  `).join('');
}

// Switch active category
function switchCategory(categoryId) {
  currentCategory = categoryId;

  // Update tab UI
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.getElementById(`tab-${categoryId}`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  const cat = getCategories().find(c => c.id === categoryId);
  const titleEl = document.getElementById('active-category-title');
  if (titleEl) titleEl.textContent = cat ? `${cat.icon} ${cat.name}` : 'All Products';

  const products = getProductsByCategory(categoryId).map(enrichProduct);
  renderProducts(products);
}

// Show loading skeletons
function showSkeletons() {
  const grid = document.getElementById('product-grid');
  if (grid) grid.innerHTML = Array(8).fill('<div class="skeleton skeleton-card"></div>').join('');
}

// Render product cards
function renderProducts(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const countEl = document.getElementById('products-count');
  if (countEl) countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No products in this category yet.</p>
        <small>Add products via the <a href="admin.html">Admin Panel</a>.</small>
      </div>`;
    return;
  }

  const currency = STORE_CONFIG.currency;
  grid.innerHTML = items.map(item => {
    const discount = item.mrp && item.mrp > item.price
      ? Math.round((1 - item.price / item.mrp) * 100)
      : null;

    const imgHtml = item.thumbUrl
      ? `<img src="${item.thumbUrl}" alt="${item.name}" loading="lazy"
             onerror="this.parentNode.innerHTML='<div class=\\"demo-img\\" style=\\"background:${item.demoColor || '#F2EDE8'}\\">👗</div>'">`
      : `<div class="demo-img" style="background:${item.demoColor || '#F2EDE8'}">👗</div>`;

    return `
    <div class="product-card" onclick="openProductDetail('${item.id}')">
      <div class="product-img">
        ${imgHtml}
        ${item.badge ? `<div class="product-badge">${item.badge}</div>` : ''}
        ${discount ? `<div class="product-discount">-${discount}%</div>` : ''}
        <button class="wishlist-btn" onclick="event.stopPropagation()" title="Wishlist">♡</button>
      </div>
      <div class="product-info">
        <div class="product-name">${item.name}</div>
        <div class="product-price">
          ${currency}${item.price.toLocaleString('en-IN')}
          ${item.mrp ? `<span>${currency}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
        </div>
        ${item.sizes && item.sizes.length > 0
          ? `<div class="product-sizes">${item.sizes.slice(0, 4).map(s => `<span>${s}</span>`).join('')}${item.sizes.length > 4 ? '<span>+</span>' : ''}</div>`
          : ''}
        <button class="add-btn" onclick="event.stopPropagation(); quickAddToCart('${item.id}')">
          + Add to Cart
        </button>
      </div>
    </div>`;
  }).join('');
}

// Quick add to cart from grid
function quickAddToCart(itemId) {
  const products = getProductsByCategory(currentCategory).map(enrichProduct);
  const allProducts = getAllProducts().map(enrichProduct);
  const item = allProducts.find(i => i.id === itemId);
  if (item) {
    addToCart(item);
    openCart();
  }
}

// Open product detail modal
function openProductDetail(itemId) {
  const allProducts = getAllProducts().map(enrichProduct);
  const item = allProducts.find(i => i.id === itemId);
  if (!item) return;

  const currency = STORE_CONFIG.currency;
  const discount = item.mrp && item.mrp > item.price
    ? Math.round((1 - item.price / item.mrp) * 100)
    : null;

  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  if (!modal || !modalContent) {
    quickAddToCart(itemId);
    return;
  }

  modalContent.innerHTML = `
    <div class="modal-img">
      ${item.imageUrl
        ? `<img src="${item.imageUrl}" alt="${item.name}"
               onerror="this.parentNode.innerHTML='<div class=\\"modal-demo-img\\" style=\\"background:${item.demoColor || '#F2EDE8'}\\">👗</div>'">`
        : `<div class="modal-demo-img" style="background:${item.demoColor || '#F2EDE8'}">👗</div>`}
    </div>
    <div class="modal-info">
      ${item.badge ? `<div class="modal-badge">${item.badge}</div>` : ''}
      <h2 class="modal-name">${item.name}</h2>
      <div class="modal-price">
        <span class="modal-price-main">${currency}${item.price.toLocaleString('en-IN')}</span>
        ${item.mrp ? `<span class="modal-price-mrp">${currency}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
        ${discount ? `<span class="modal-price-discount">${discount}% OFF</span>` : ''}
      </div>
      ${item.description ? `<p class="modal-desc">${item.description}</p>` : ''}
      ${item.sizes && item.sizes.length > 0 ? `
        <div class="modal-sizes">
          <div class="modal-sizes-label">Select Size</div>
          <div class="modal-sizes-grid">
            ${item.sizes.map((s, i) => `
              <button class="size-btn ${i === 0 ? 'active' : ''}" onclick="selectSize(this, '${itemId}', '${s}')">${s}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="modal-add-btn" onclick="addFromModal('${item.id}')">
          🛍️ Add to Cart
        </button>
        <button class="modal-wa-btn" onclick="buyNowWhatsApp('${item.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Buy Now on WhatsApp
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // store selected size
  modal.dataset.itemId = item.id;
  modal.dataset.selectedSize = item.sizes?.[0] || '';
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function selectSize(btn, itemId, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const modal = document.getElementById('product-modal');
  if (modal) modal.dataset.selectedSize = size;
}

function addFromModal(itemId) {
  const modal = document.getElementById('product-modal');
  const selectedSize = modal?.dataset.selectedSize || '';
  const allProducts = getAllProducts().map(enrichProduct);
  const item = allProducts.find(i => i.id === itemId);
  if (item) {
    addToCart({ ...item, selectedSize });
    closeProductModal();
    openCart();
  }
}

function buyNowWhatsApp(itemId) {
  const modal = document.getElementById('product-modal');
  const selectedSize = modal?.dataset.selectedSize || '';
  const allProducts = getAllProducts().map(enrichProduct);
  const item = allProducts.find(i => i.id === itemId);
  if (!item) return;

  const currency = STORE_CONFIG.currency;
  const storeName = STORE_CONFIG.storeName;
  let message = `🛍️ *Hi ${storeName}!*\n\n`;
  message += `I want to buy:\n`;
  message += `👗 *${item.name}*\n`;
  message += `💰 Price: ${currency}${item.price.toLocaleString('en-IN')}\n`;
  if (selectedSize) message += `📐 Size: ${selectedSize}\n`;
  if (item.driveFileId) message += `🖼 Image: https://drive.google.com/file/d/${item.driveFileId}/view\n`;
  message += `\nPlease confirm availability.`;

  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
