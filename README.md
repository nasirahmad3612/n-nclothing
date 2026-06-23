# N&N Clothify — Clothing Store Website

A free, no-backend clothing store hosted on **GitHub Pages**.  
Customers browse clothes and place orders directly on **WhatsApp**.  
You manage products via a built-in **Admin Panel** — no coding needed.

**Total cost: ₹0/month**

---

## Deploy to GitHub Pages (First Time)

1. Create a free account at [github.com](https://github.com)
2. Create a new repository named `clothing-store` — set it to **Public**
3. Upload all files from this folder to the repository
4. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
5. Click **Save** — your site is live in ~1 minute at:  
   `https://YOUR-GITHUB-USERNAME.github.io/clothing-store/`

---

## First Setup (Do Once)

### 1. Set Your WhatsApp Number

1. Open `admin.html` in your browser (or visit `yoursite.github.io/admin.html`)
2. Login — default password is `admin123` (change it in the Settings tab after first login)
3. Go to **Settings** tab
4. Enter your WhatsApp number (country code + number, no + or spaces)  
   Example for India: `919876543210`
5. Click **Save Settings**
6. Go to **Export & Deploy** → download `config.js` → commit to GitHub

### 2. Change Your Admin Password

In the **Settings** tab, enter a new password and click **Save Settings**.  
The password is stored only in your browser — it is never in the public code.

---

## How to Add Products (Daily Use)

1. Take a photo of your clothing item
2. Upload the photo to **Google Drive**
3. Right-click → **Share** → "Anyone with the link" → Viewer → **Done**
4. Right-click → Share → **Copy link**
5. Open `admin.html` → Login → **Products** tab → **+ Add Product**
6. Paste the Google Drive link — a preview will appear
7. Fill in: Name, Price, Category, Sizes, Description
8. Click **Save Product**
9. Go to **Export & Deploy** tab → **Download products-data.js**
10. On GitHub: open `js/products-data.js` → click ✏️ Edit → paste downloaded content → **Commit**
11. Your live website updates within 1 minute!

---

## How WhatsApp Orders Work

1. Customer visits your site, browses by category
2. Clicks a product → sees details + sizes
3. Adds to cart → clicks **Order on WhatsApp**
4. Fills in name, phone, delivery address
5. WhatsApp opens with a pre-filled order message like:

```
🛍️ New Order — N&N Clothify

👤 Customer: Priya Sharma
📱 Phone: 9876543210
📍 Address: 123 MG Road, Mumbai

Order Details:
─────────────────
1. Blue Floral Kurta
   Qty: 1 × ₹799 = ₹799
─────────────────
💰 Total: ₹799
```

You receive this message and confirm/process the order.

---

## File Structure

```
clothing-store/
├── index.html           ← Main store (customers see this)
├── admin.html           ← Admin panel (you manage products here)
├── .nojekyll            ← Required for GitHub Pages
├── css/style.css        ← All website styling
└── js/
    ├── config.js        ← Store name, WhatsApp number, categories
    ├── products-data.js ← Your product list (exported from admin)
    ├── drive.js         ← Google Drive image helpers
    ├── app.js           ← Main website logic
    └── cart.js          ← Cart & WhatsApp order system
```

---

## FAQ

**Do I need to pay for anything?**  
No — Google Drive (free), GitHub Pages (free), WhatsApp (free).

**How many products can I add?**  
Unlimited.

**Can I change prices or remove products?**  
Yes — use the Admin Panel. Edit/delete any product, then export and commit.

**Images not showing?**  
Make sure your Google Drive photo is shared as "Anyone with the link can view".

**Can I use Python Django instead?**  
Django needs a paid server to run. GitHub Pages only hosts static files (HTML/CSS/JS),
which is exactly what this site is. This approach is free, faster, and simpler for your needs.
