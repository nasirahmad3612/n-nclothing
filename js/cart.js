// ============================================================
//  Cart & WhatsApp Order System
// ============================================================

let cart = [];

function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartUI();
  showCartToast(item.name);
}

function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  updateCartUI();
  renderCartPanel();
}

function updateQty(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(itemId);
  else {
    updateCartUI();
    renderCartPanel();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function showCartToast(name) {
  const toast = document.getElementById('cart-toast');
  if (!toast) return;
  toast.textContent = `✓ ${name} added to cart`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function openCart() {
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  renderCartPanel();
}

function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function renderCartPanel() {
  const body = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  const currency = STORE_CONFIG.currency;

  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty">
      <span>🛍️</span>
      <p>Your cart is empty</p>
    </div>`;
    total.textContent = `${currency}0`;
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.thumbUrl 
          ? `<img src="${item.thumbUrl}" alt="${item.name}" onerror="this.style.background='${item.demoColor||'#eee'}'">` 
          : `<div class="demo-img-small" style="background:${item.demoColor||'#eee'}">👗</div>`}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${currency}${item.price?.toLocaleString('en-IN') || 'N/A'}</div>
        <div class="cart-item-qty">
          <button onclick="updateQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty('${item.id}', +1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');

  total.textContent = `${currency}${getCartTotal().toLocaleString('en-IN')}`;
}

// Build WhatsApp message and open chat
function placeOrderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Show customer name/number form
  document.getElementById('order-form-overlay').classList.add('open');
}

function submitOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const sizeEl = document.getElementById('customer-size');
  const size = sizeEl ? sizeEl.value : '';

  if (!name || !phone) {
    alert("Please enter your name and phone number");
    return;
  }

  const currency = STORE_CONFIG.currency;
  const storeName = STORE_CONFIG.storeName;

  let message = `🛍️ *New Order — ${storeName}*\n\n`;
  message += `👤 *Customer:* ${name}\n`;
  message += `📱 *Phone:* ${phone}\n`;
  if (address) message += `📍 *Address:* ${address}\n`;
  if (size) message += `📐 *Size:* ${size}\n`;
  message += `\n*Order Details:*\n`;
  message += `─────────────────\n`;

  cart.forEach((item, i) => {
    const itemTotal = (item.price || 0) * item.qty;
    message += `${i + 1}. *${item.name}*\n`;
    message += `   Qty: ${item.qty} × ${currency}${item.price?.toLocaleString('en-IN') || 'N/A'} = ${currency}${itemTotal.toLocaleString('en-IN')}\n`;
    if (item.selectedSize) message += `   Size: ${item.selectedSize}\n`;
    if (item.driveFileId) message += `   🖼 Image: https://drive.google.com/file/d/${item.driveFileId}/view\n`;
  });

  message += `─────────────────\n`;
  message += `💰 *Total: ${currency}${getCartTotal().toLocaleString('en-IN')}*\n\n`;
  message += `_Order placed via ${storeName} website_`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMsg}`;

  // Open WhatsApp
  window.open(waUrl, '_blank');

  // Close panels
  document.getElementById('order-form-overlay').classList.remove('open');
  closeCart();

  // Clear cart
  cart = [];
  updateCartUI();

  // Show success
  setTimeout(() => {
    document.getElementById('success-overlay').classList.add('open');
  }, 500);
}

function closeOrderForm() {
  document.getElementById('order-form-overlay').classList.remove('open');
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('open');
}

// Close product modal when clicking the dark overlay (not the modal itself)
function handleModalClick(event) {
  if (event.target === document.getElementById('product-modal')) {
    closeProductModal();
  }
}
