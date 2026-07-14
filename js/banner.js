// ============================================================
//  N&N Clothify — Home Page Banner Carousel
//  Edit BANNER_SLIDES below to change promo banners.
// ============================================================

const BANNER_SLIDES = [
  {
    eyebrow: "Just Dropped",
    title: "New Dress Collection",
    sub: "Fresh western & ethnic dresses, made for every mood.",
    cta: "Shop Dresses",
    icon: "👗",
    gradient: "linear-gradient(135deg,#C4483A,#E28A72)",
    action: () => filterBannerCategory('western')
  },
  {
    eyebrow: "Limited Time",
    title: "Festive Season Event",
    sub: "Big discounts on sarees & kurtis for the celebration season.",
    cta: "Explore Event",
    icon: "🎉",
    gradient: "linear-gradient(135deg,#2F5D62,#437579)",
    action: () => filterBannerCategory('sarees')
  },
  {
    eyebrow: "Just In",
    title: "New Products Added",
    sub: "Be the first to grab our latest arrivals across every category.",
    cta: "View New Arrivals",
    icon: "✨",
    gradient: "linear-gradient(135deg,#C79A3D,#E8C468)",
    action: () => filterBannerNewArrivals()
  }
];

let bannerIndex = 0;
let bannerTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  buildBannerCarousel();
  startBannerAutoplay();
});

function buildBannerCarousel() {
  const track = document.getElementById('banner-track');
  const dots = document.getElementById('banner-dots');
  if (!track || !dots) return;

  track.innerHTML = BANNER_SLIDES.map((slide, i) => `
    <div class="banner-slide" style="background:${slide.gradient}" data-index="${i}">
      <div class="banner-slide-icon">${slide.icon}</div>
      <div class="banner-slide-body">
        <span class="banner-eyebrow">${slide.eyebrow}</span>
        <h3 class="banner-title">${slide.title}</h3>
        <p class="banner-sub">${slide.sub}</p>
        <button class="banner-cta" onclick="bannerSlides[${i}].action()">${slide.cta} →</button>
      </div>
    </div>
  `).join('');

  dots.innerHTML = BANNER_SLIDES.map((_, i) => `
    <button class="banner-dot ${i === 0 ? 'active' : ''}" onclick="goToBannerSlide(${i})" aria-label="Go to slide ${i + 1}"></button>
  `).join('');

  const carousel = document.getElementById('banner-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopBannerAutoplay);
    carousel.addEventListener('mouseleave', startBannerAutoplay);
  }
}

// Exposed for inline onclick handlers
window.bannerSlides = BANNER_SLIDES;

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
  bannerIndex = (bannerIndex + 1) % BANNER_SLIDES.length;
  updateBannerPosition();
}

function bannerPrev() {
  bannerIndex = (bannerIndex - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length;
  updateBannerPosition();
}

function startBannerAutoplay() {
  stopBannerAutoplay();
  bannerTimer = setInterval(bannerNext, 4500);
}

function stopBannerAutoplay() {
  if (bannerTimer) clearInterval(bannerTimer);
}

// ---- Banner CTA actions ----
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
