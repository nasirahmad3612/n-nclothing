// ============================================================
//  N&N CLOTHIFY — Store Configuration
//  Edit this file to update your store details
// ============================================================

const STORE_CONFIG = {

  // Your WhatsApp number — country code + number, no spaces or +
  // Example: India number 98765 43210 → "919876543210"
  whatsappNumber: "919665768743",

  // Store identity
  storeName: "N&N Clothify",
  tagline:   "Fresh fashion, every season",
  currency:  "₹",

  // Admin panel password — stored in localStorage only, never in public code.
  adminPassword: "",

  // Cloudinary image upload (unsigned preset only — never put API Key/Secret here)
  cloudinaryCloudName:    "lmi7ul1b",
  cloudinaryUploadPreset: "ml_default",

  // JSONBin.io cloud sync — Bin ID (public read, safe in code)
  jsonbinId: "6a4665c0f5f4af5e29540a20",

  // -------------------------------------------------------
  //  CATEGORIES
  //  id    → used internally (no spaces)
  //  name  → shown on the website
  //  icon  → emoji on the tab
  // -------------------------------------------------------
  categories: [
    { id: "all",      name: "All",               icon: "🛍️" },
    { id: "kurtis",   name: "Kurtis & Sets",      icon: "👘" },
    { id: "sarees",   name: "Sarees",             icon: "🥻" },
    { id: "tops",     name: "Tops & Shirts",       icon: "👚" },
    { id: "western",  name: "Western Wear",        icon: "👗" },
    { id: "bottoms",  name: "Pants & Palazzos",    icon: "👖" },
    { id: "mens",     name: "Men's Collection",    icon: "👔" },
    { id: "kids",     name: "Kids' Wear",          icon: "🧒" }
  ]
};
