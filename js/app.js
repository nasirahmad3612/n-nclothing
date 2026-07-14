// ============================================================
//  N&N Clothify — Main App
// ============================================================

let currentCategory = 'all';

// Category circle gradient backgrounds (editorial palette)
const CAT_GRADIENTS = {
  all:     'linear-gradient(135deg,#1A1A1A,#3D3D3D)',
  kurtis:  'linear-gradient(135deg,#C4483A,#E28A72)',
  sarees:  'linear-gradient(135deg,#8B3A3A,#B5524A)',
  tops:    'linear-gradient(135deg,#6B7A5E,#95AB80)',
  western: 'linear-gradient(135deg,#2B3A4A,#425A73)',
  bottoms: 'linear-gradient(135deg,#C79A3D,#E8C468)',
  mens:    'linear-gradient(135deg,#2F5D62,#437579)',
  kids:    'linear-gradient(135deg,#D98BAF,#F0B8D0)',
};

// ---- Data Sources ----
function getAllProducts() {
  try {
    const stored = localStorage.getItem('nn_products');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return PRODUCTS_DATA;
}

function getProductsByCategory(categoryId) {
  const all = getAllProducts();
  if (!categoryId || categoryId === 'all') return all;
  return all.filter(p => p.category === categoryId);
}

function getCategories() {
  try {
    const stored = localStorage.getItem('nn_categories');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return STORE_CONFIG.categories;
}

// ---- Cloud Sync (JSONBin.io) ----
async function loadProductsFromCloud() {
  const binId = STORE_CONFIG.jsonbinId || '';
  if (!binId) return false;
  try {
    const resp = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: { 'X-Bin-Meta': 'false' }
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    let updated = false;
    if (Array.isArray(data.products) && data.products.length >= 0) {
      localStorage.setItem('nn_products', JSON.stringify(data.products));
      updated = true;
    }
    if (Array.isArray(data.banners)) {
      localStorage.setItem('nn_banners', JSON.stringify(data.banners));
      updated = true;
    }
    return updated;
  } catch (e) {
    console.warn('JSONBin load failed, using cached products:', e.message);
  }
  return false;
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', async () => {
  applyConfig();
  buildCategoryCircles();
  // Show cached products immediately, then refresh from cloud
  switchCategory('all');
  initSearch();
  const synced = await loadProductsFromCloud();
  if (synced) {
    switchCategory(currentCategory);
    if (typeof refreshBannerCarousel === 'function') refreshBannerCarousel();
  }
});

// Auto-refresh when user returns to this tab (e.g. after saving in admin)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    switchCategory(currentCategory);
    if (typeof refreshBannerCarousel === 'function') refreshBannerCarousel();
  }
});

function applyConfig() {
  try {
    const saved = localStorage.getItem('nn_settings');
    if (saved) Object.assign(STORE_CONFIG, JSON.parse(saved));
  } catch (e) { /* ignore */ }
  const { storeName, whatsappNumber, instagramUrl } = STORE_CONFIG;
  document.title = `${storeName} — Fashion Store`;
  const nameEl = document.getElementById('header-store-name');
  if (nameEl) nameEl.textContent = storeName;
  const footerEl = document.getElementById('footer-store-name');
  if (footerEl) footerEl.textContent = storeName;
  const waLink = document.getElementById('footer-wa-link');
  if (waLink) waLink.href = `https://wa.me/${whatsappNumber}`;
  const igLink = document.getElementById('footer-ig-link');
  if (igLink && instagramUrl) igLink.href = instagramUrl;
}

// ---- Category Circles ----
function buildCategoryCircles() {
  const el = document.getElementById('category-circles');
  if (!el) return;
  el.innerHTML = getCategories().map(cat => `
    <div class="cat-circle-item" id="tab-${cat.id}" onclick="switchCategory('${cat.id}')">
      <div class="cat-circle" style="background:${CAT_GRADIENTS[cat.id] || CAT_GRADIENTS.all}">
        ${cat.icon}
      </div>
      <span class="cat-label">${cat.name}</span>
    </div>
  `).join('');
}

// ---- Category Switch ----
function switchCategory(categoryId) {
  currentCategory = categoryId;

  // Update circle active states
  document.querySelectorAll('.cat-circle-item').forEach(el => el.classList.remove('active'));
  const active = document.getElementById(`tab-${categoryId}`);
  if (active) {
    active.classList.add('active');
    active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  const cat = getCategories().find(c => c.id === categoryId);
  const titleEl = document.getElementById('active-category-title');
  if (titleEl) titleEl.textContent = cat ? `${cat.icon} ${cat.name}` : 'All Products';

  // Clear search on category switch
  const searchEl = document.getElementById('search-input');
  if (searchEl) searchEl.value = '';

  const products = getProductsByCategory(categoryId).map(enrichProduct);
  renderProducts(products);
}

// ---- Live Search ----
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) { switchCategory(currentCategory); return; }
      const results = getAllProducts()
        .map(enrichProduct)
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        );
      // Deactivate all circles during search
      document.querySelectorAll('.cat-circle-item').forEach(el => el.classList.remove('active'));
      const titleEl = document.getElementById('active-category-title');
      if (titleEl) titleEl.textContent = `🔍 Results for "${input.value.trim()}"`;
      renderProducts(results);
    }, 300);
  });
}

// ---- Render Product Cards ----
function renderProducts(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const countEl = document.getElementById('products-count');
  if (countEl) countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>No products found.</p>
        <small>Try a different category or <a href="admin.html">add products</a>.</small>
      </div>`;
    return;
  }

  const currency = STORE_CONFIG.currency || '₹';
  grid.innerHTML = items.map(item => {
    const discount = item.mrp && item.mrp > item.price
      ? Math.round((1 - item.price / item.mrp) * 100)
      : null;

    const imgHtml = item.thumbUrl
      ? `<img src="${item.thumbUrl}" alt="${escHtml(item.name)}" loading="lazy"
             onerror="this.parentNode.innerHTML='<div class=&quot;card-demo-img&quot; style=&quot;background:${item.demoColor || '#F5F0FF'}&quot;>👗</div>'">`
      : `<div class="card-demo-img" style="background:${item.demoColor || '#F5F0FF'}">👗</div>`;

    const sizesHtml = item.sizes?.length
      ? `<div class="card-sizes">${item.sizes.slice(0, 4).map(s => `<span>${s}</span>`).join('')}${item.sizes.length > 4 ? '<span>+</span>' : ''}</div>`
      : '';

    return `
    <div class="product-card" onclick="openProductDetail('${item.id}')">
      <div class="card-img-wrap">
        ${imgHtml}
        <button class="card-wishlist" onclick="event.stopPropagation()" aria-label="Wishlist">♡</button>
        ${discount ? `<span class="card-discount-chip">${discount}% off</span>` : ''}
        ${item.badge ? `<span class="card-badge-chip">${item.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <p class="card-name">${escHtml(item.name)}</p>
        <div class="card-price-row">
          <span class="card-price">${currency}${item.price.toLocaleString('en-IN')}</span>
          ${item.mrp ? `<span class="card-mrp">${currency}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
          ${discount ? `<span class="card-off">${discount}% off</span>` : ''}
        </div>
        ${sizesHtml}
        <button class="card-add-btn" onclick="event.stopPropagation(); quickAddToCart('${item.id}')">
          Add to Cart
        </button>
      </div>
    </div>`;
  }).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- Quick Add ----
function quickAddToCart(itemId) {
  const item = getAllProducts().map(enrichProduct).find(i => i.id === itemId);
  if (item) { addToCart(item); openCart(); }
}

// ---- Product Detail Modal ----
function openProductDetail(itemId) {
  const item = getAllProducts().map(enrichProduct).find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById('product-modal');
  const content = document.getElementById('product-modal-content');
  if (!modal || !content) { quickAddToCart(itemId); return; }

  const currency = STORE_CONFIG.currency || '₹';
  const discount = item.mrp && item.mrp > item.price
    ? Math.round((1 - item.price / item.mrp) * 100)
    : null;

  const images = item.images?.length ? item.images : (item.imageUrl ? [item.imageUrl] : []);
  const demoFallback = `<div class="modal-demo-img" style="background:${item.demoColor || '#1A1A1A'}">👗</div>`;
  const demoFallbackAttr = demoFallback.replace(/"/g, '&quot;').replace(/'/g, "\\'");

  const galleryHtml = images.length > 0 ? `
    <div class="modal-gallery">
      <div class="modal-gallery-main" id="modal-main-img">
        <img src="${images[0]}" alt="${escHtml(item.name)}" id="modal-main-img-el"
          onerror="this.parentNode.innerHTML='${demoFallbackAttr}'" >
      </div>
      ${images.length > 1 ? `
      <div class="modal-thumbs">
        ${images.map((src, i) => `
          <button class="modal-thumb ${i === 0 ? 'active' : ''}" onclick="switchModalImage(${i}, this)"
            data-src="${src}">
            <img src="${src.includes('res.cloudinary.com') ? src.replace('/upload/', '/upload/w_120,c_fill,q_auto/') : src}"
              onerror="this.parentNode.style.display='none'">
          </button>`).join('')}
      </div>` : ''}
    </div>` : demoFallback;

  content.innerHTML = `
    ${galleryHtml}
    <div class="modal-info">
      ${item.badge ? `<div class="modal-badge">${item.badge}</div>` : ''}
      <h2 class="modal-name">${escHtml(item.name)}</h2>
      <div class="modal-price">
        <span class="modal-price-main">${currency}${item.price.toLocaleString('en-IN')}</span>
        ${item.mrp ? `<span class="modal-price-mrp">${currency}${item.mrp.toLocaleString('en-IN')}</span>` : ''}
        ${discount ? `<span class="modal-price-discount">${discount}% off</span>` : ''}
      </div>
      ${item.description ? `<p class="modal-desc">${escHtml(item.description)}</p>` : ''}
      ${item.sizes?.length ? `
        <div class="modal-sizes">
          <div class="modal-sizes-label">Select Size</div>
          <div class="modal-sizes-grid">
            ${item.sizes.map((s, i) => `
              <button class="size-btn ${i === 0 ? 'active' : ''}"
                onclick="selectSize(this,'${item.id}','${s}')">${s}</button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="modal-add-btn" onclick="addFromModal('${item.id}')">🛍️ Add to Cart</button>
        <button class="modal-wa-btn" onclick="buyNowWhatsApp('${item.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Buy Now on WhatsApp
        </button>
      </div>
    </div>`;

  modal.dataset.itemId = item.id;
  modal.dataset.selectedSize = item.sizes?.[0] || '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function switchModalImage(index, btn) {
  const src = btn.dataset.src;
  const mainImg = document.getElementById('modal-main-img-el');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
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
  const item = getAllProducts().map(enrichProduct).find(i => i.id === itemId);
  if (item) { addToCart({ ...item, selectedSize }); closeProductModal(); openCart(); }
}

function buyNowWhatsApp(itemId) {
  const modal = document.getElementById('product-modal');
  const selectedSize = modal?.dataset.selectedSize || '';
  const item = getAllProducts().map(enrichProduct).find(i => i.id === itemId);
  if (!item) return;

  const currency = STORE_CONFIG.currency || '₹';
  const storeName = STORE_CONFIG.storeName;
  let msg = `🛍️ *Hi ${storeName}!*\n\nI want to buy:\n`;
  msg += `👗 *${item.name}*\n`;
  msg += `💰 Price: ${currency}${item.price.toLocaleString('en-IN')}\n`;
  if (selectedSize) msg += `📐 Size: ${selectedSize}\n`;
  if (item.driveFileId) msg += `🖼 Image: https://drive.google.com/file/d/${item.driveFileId}/view\n`;
  msg += `\nPlease confirm availability. Thank you!`;

  window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}
