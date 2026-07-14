// ============================================================
//  N&N Clothify — Home Page Banner Carousel
//  Banners are managed from admin.html → Banners tab.
//  Falls back to BANNERS_DATA (js/banners-data.js) when no
//  custom banners have been saved yet.
// ============================================================

// Fallback gradient + icon for banners that don't have an image yet
const BANNER_FALLBACK_STYLES = [
  { gradient: "linear-gradient(135deg,#C4483A,#E28A72)", icon: "👗" },
  { gradient: "linear-gradient(135deg,#2F5D62,#437579)", icon: "🎉" },
  { gradient: "linear-gradient(135deg,#C79A3D,#E8C468)", icon: "✨" },
  { gradient: "linear-gradient(135deg,#6B7A5E,#95AB80)", icon: "🛍️" },
  { gradient: "linear-gradient(135deg,#8B3A3A,#B5524A)", icon: "👘" }
];

let bannerIndex = 0;
let bannerTimer = null;
let currentBanners = [];

document.addEventListener('DOMContentLoaded', () => {
  refreshBannerCarousel();
});

// Re-read banner data and rebuild the carousel (used after cloud sync / tab refocus)
function refreshBannerCarousel() {
  bannerIndex = 0;
  buildBannerCarousel();
  startBannerAutoplay();
}

function getAllBanners() {
  try {
    const stored = localStorage.getItem('nn_banners');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* ignore */ }
  return (typeof BANNERS_DATA !== 'undefined') ? BANNERS_DATA : [];
}

function buildBannerCarousel() {
  const section = document.getElementById('banner-carousel');
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!section || !track || !dots) return;

  currentBanners = getAllBanners();
  stopBannerAutoplay();

  if (currentBanners.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  track.innerHTML = currentBanners.map((banner, i) => {
    const fallback = BANNER_FALLBACK_STYLES[i % BANNER_FALLBACK_STYLES.length];
    const hasImage = !!banner.image;
    const hasText = !!(banner.tag || banner.title || banner.subtitle || banner.ctaText);

    const textHtml = hasText ? `
      <div class="banner-slide-body">
        ${banner.tag ? `<span class="banner-eyebrow">${escBanner(banner.tag)}</span>` : ''}
        ${banner.title ? `<h3 class="banner-title">${escBanner(banner.title)}</h3>` : ''}
        ${banner.subtitle ? `<p class="banner-sub">${escBanner(banner.subtitle)}</p>` : ''}
        ${banner.ctaText ? `<button class="banner-cta" onclick="event.stopPropagation(); triggerBannerAction(${i})">${escBanner(banner.ctaText)} →</button>` : ''}
      </div>` : '';

    if (hasImage) {
      return `
      <div class="banner-slide has-image" data-index="${i}" onclick="triggerBannerAction(${i})">
        <img class="banner-slide-img" src="${banner.image}" alt="${escBanner(banner.title || 'Promotion')}" loading="${i === 0 ? 'eager' : 'lazy'}">
        ${hasText ? `<div class="banner-slide-scrim"></div>` : ''}
        ${textHtml}
      </div>`;
    }

    return `
      <div class="banner-slide" style="background:${fallback.gradient}" data-index="${i}" onclick="triggerBannerAction(${i})">
        <div class="banner-slide-icon">${fallback.icon}</div>
        ${textHtml}
      </div>`;
  }).join('');

  dots.innerHTML = currentBanners.map((_, i) => `
    <button class="banner-dot ${i === 0 ? 'active' : ''}" onclick="goToBannerSlide(${i})" aria-label="Go to slide ${i + 1}"></button>
  `).join('');

  updateBannerPosition();

  section.removeEventListener('mouseenter', stopBannerAutoplay);
  section.removeEventListener('mouseleave', startBannerAutoplay);
  section.addEventListener('mouseenter', stopBannerAutoplay);
  section.addEventListener('mouseleave', startBannerAutoplay);
}

function escBanner(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateBannerPosition() {
  const track = document.getElementById('banner-track');
  if (track) track.style.transform = `translateX(-${bannerIndex * 100}%)`;
  document.querySelectorAll('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === bannerIndex);
  });
}

function goToBannerSlide(i) {
  bannerIndex = i;
  updateBannerPosition();
  startBannerAutoplay();
}

function bannerNext() {
  if (currentBanners.length === 0) return;
  bannerIndex = (bannerIndex + 1) % currentBanners.length;
  updateBannerPosition();
}

function bannerPrev() {
  if (currentBanners.length === 0) return;
  bannerIndex = (bannerIndex - 1 + currentBanners.length) % currentBanners.length;
  updateBannerPosition();
}

function startBannerAutoplay() {
  stopBannerAutoplay();
  if (currentBanners.length > 1) bannerTimer = setInterval(bannerNext, 4500);
}

function stopBannerAutoplay() {
  if (bannerTimer) clearInterval(bannerTimer);
}

// ---- Banner CTA actions ----
function triggerBannerAction(i) {
  const banner = currentBanners[i];
  if (!banner) return;
  if (banner.ctaType === 'category' && banner.ctaValue) {
    filterBannerCategory(banner.ctaValue);
  } else if (banner.ctaType === 'new') {
    filterBannerNewArrivals();
  } else if (banner.ctaType === 'all') {
    filterBannerCategory('all');
  } else if (banner.ctaType === 'url' && banner.ctaValue) {
    if (/^https?:\/\//i.test(banner.ctaValue)) {
      window.open(banner.ctaValue, '_blank', 'noopener');
    } else {
      window.location.href = banner.ctaValue;
    }
  }
}

function filterBannerCategory(categoryId) {
  switchCategory(categoryId);
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

function filterBannerNewArrivals() {
  currentCategory = '';
  document.querySelectorAll('.cat-circle-item').forEach(el => el.classList.remove('active'));
  const titleEl = document.getElementById('active-category-title');
  if (titleEl) titleEl.textContent = '✨ New Arrivals';
  const items = getAllProducts().map(enrichProduct).filter(p => p.badge === 'New');
  renderProducts(items);
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}
