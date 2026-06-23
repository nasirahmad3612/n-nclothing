// ============================================================
//  Google Drive Image Helpers
//  No API key needed — works with publicly shared files only.
//
//  How to share a Google Drive image:
//  1. Right-click the file → Share
//  2. Change to "Anyone with the link" → Viewer → Done
//  3. Copy the link and paste it in admin.html
// ============================================================

// Extract the file ID from any Google Drive share URL
function extractDriveFileId(url) {
  if (!url) return null;
  url = url.trim();

  // Already just an ID (no slashes)
  if (/^[\w-]{25,}$/.test(url)) return url;

  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([\w-]{20,})/);
  if (fileMatch) return fileMatch[1];

  // https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([\w-]{20,})/);
  if (openMatch) return openMatch[1];

  // https://drive.google.com/uc?export=view&id=FILE_ID
  const ucMatch = url.match(/uc\?.*id=([\w-]{20,})/);
  if (ucMatch) return ucMatch[1];

  // https://docs.google.com/... (rare)
  const docsMatch = url.match(/\/d\/([\w-]{20,})/);
  if (docsMatch) return docsMatch[1];

  return null;
}

// Thumbnail URL — fast, works for product cards
function getDriveThumbUrl(fileId, width = 400) {
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

// Full image URL — use for detail views
function getDriveImageUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// Enrich a product with Drive URLs from its driveFileId
function enrichProduct(product) {
  if (product.driveFileId) {
    return {
      ...product,
      thumbUrl: getDriveThumbUrl(product.driveFileId),
      imageUrl: getDriveImageUrl(product.driveFileId),
      isDemo: false
    };
  }
  return { ...product, thumbUrl: null, imageUrl: null };
}

// Demo placeholder colors for categories
const DEMO_COLORS = {
  kurtis:  "#F5E6D3",
  sarees:  "#E8D5F0",
  tops:    "#D5E8F0",
  western: "#F0D5D5",
  bottoms: "#D5F0E8",
  mens:    "#E8EBD5",
  kids:    "#F0EBD5",
  all:     "#EBD5F0"
};
