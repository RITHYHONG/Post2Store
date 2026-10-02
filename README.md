# 🛍️ Post2Store

> **Turn any Facebook Business Page into a blazing-fast, searchable web product catalog.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Automation-2EAD33?style=flat&logo=playwright)](https://playwright.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Overview

Across Southeast Asia and emerging markets, millions of micro and small merchants (MSMEs) run their retail and wholesale businesses exclusively via social media feeds. While Facebook Pages are convenient for posting updates, they make terrible product catalogs:
- Products get buried under chronological timeline feeds.
- Customers cannot easily search, filter by category, or check past stock.
- High-intent buyers are forced to endlessly scroll or message support for basic inquiries.

**Post2Store** bridges this gap. It provides an automated, headless crawler that extracts products and photo albums from a Facebook Page, cleans messy post captions, auto-categorizes inventory, and generates an elegant, ultra-fast web showcase.

---

## ✨ Features

- **Automated Social Crawler**: Headless Playwright engine that navigates Facebook timeline feeds, loads lazy content, and manages infinite scrolling.
- **Session Persistence**: Built-in interactive authentication tool to save cookies and session states (`fb_auth.json`), eliminating login walls and rate limits.
- **Intelligent Caption Parsing**: Strips phone numbers, store locations, Google Maps links, and hashtags to extract genuine product names and clean descriptions.
- **Localized Multi-Language Tagging**: Classifies products into distinct categories using localized keywords (e.g. Khmer and English for snacks, confectionery, and beverages).
- **Modern Next.js 16 Showcase**:
  - Instant live keyword search.
  - Dynamic category filters.
  - Interactive product inspection modal with high-res photo viewer.
  - Direct "View original Facebook post" deep-links for buyer inquiries.
- **Incremental Merging & Export**: Automatically skips existing products to prevent duplicates; outputs simultaneously to `facebook_photos.csv` and Next.js `src/data/products.json`.

---

## 🛠️ Architecture & Tech Stack

```text
┌─────────────────────────┐
│   Facebook Page Feed    │
└────────────┬────────────┘
             │ Playwright Crawler (scripts/scraper.py)
             ▼
┌─────────────────────────┐
│  Cleaner & Categorizer  │ ──> Outputs facebook_photos.csv
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  src/data/products.json │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│   Next.js 16 Storefront │ (React 19 + Tailwind CSS v4)
└─────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack/Webpack) |
| **UI Library** | [React 19](https://react.dev/) + [Lucide Icons](https://lucide.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Crawler & Extraction** | Python 3 + [Playwright](https://playwright.dev/python/) |
| **Data Processing** | [Pandas](https://pandas.pydata.org/) |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.18 or higher)
- **Python** (v3.10 or higher)
- **npm**, **yarn**, or **pnpm**

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/post2store.git
   cd post2store
   ```

2. **Install web dependencies:**
   ```bash
   npm install
   ```

3. **Set up the Python environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install playwright pandas
   playwright install chromium
   ```

---

## 🕷️ Scraping Facebook Products

### 1. (Optional) Save Facebook Login Session
Facebook often limits visibility or prompts for login when browsing timelines. You can save your session once:

```bash
npm run scrape:login
```
*A browser window will launch. Log into Facebook manually, then hit Enter in your terminal. Your session will be securely saved to `fb_auth.json` (git-ignored).*

### 2. Extract Products

You can run predefined npm scripts depending on your goal:

```bash
# Quick scrape (default: 30 latest products)
npm run scrape

# Scrape all available products on the timeline
npm run scrape:all

# Scrape with visible browser window (for debugging)
npm run scrape:visible

# Fresh crawl (overwrite existing products instead of merging)
npm run scrape:fresh
```

#### Advanced CLI Flags:
```bash
python3 scripts/scraper.py [options]

Options:
  --max INT          Maximum number of products to extract (default: 30)
  --all              Continue scraping until end of timeline is reached
  --login            Run interactive login session to generate fb_auth.json
  --no-headless      Show browser window during crawling
  --overwrite        Overwrite catalog instead of appending new items
  --source {feed,photos} Select source (default: feed)
```

---

## 💻 Running the Web Storefront

Once products are scraped into `src/data/products.json`, start the Next.js local development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

To build for production:
```bash
npm run build
npm run start
```

---

## ⚙️ Customization

### Scraping a Different Facebook Page
Edit the target URLs in `scripts/scraper.py`:

```python
PAGE_URL = "https://www.facebook.com/your-page-slug"
PAGE_PHOTOS_URL = "https://www.facebook.com/your-page-slug/photos"
```

### Customizing Category Classification & Filters
In `scripts/scraper.py`, adapt the `classify_type` function to match your store's language, vocabulary, and product domain:

```python
def classify_type(caption: str) -> str:
    t = caption.lower()
    if any(k in t for k in ["drink", "coffee", "tea", "ភេសជ្ជៈ"]):
        return "Beverage"
    elif any(k in t for k in ["snack", "cookie", "chips", "នំ"]):
        return "Snacks"
    return "General"
```

---

## 📂 Project Structure

```text
├── scripts/
│   └── scraper.py            # Playwright crawler, text cleaner & JSON/CSV exporter
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind CSS v4 styling
│   │   ├── layout.tsx        # Root layout & font configuration
│   │   └── page.tsx          # Storefront catalog, search & category filters
│   ├── components/
│   │   ├── BackToTop.tsx     # Floating back-to-top button
│   │   ├── ProductCard.tsx   # Catalog product card item
│   │   └── ProductModal.tsx  # Product details & image modal
│   ├── data/
│   │   └── products.json     # Extracted product catalog consumed by Next.js
│   └── types/
│       └── product.ts        # TypeScript data definitions
├── facebook_photos.csv       # Flat CSV export for Excel / Sheets
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

- [ ] Multi-platform adapters: Support Instagram feeds and Telegram channels.
- [ ] AI-assisted parsing: Use Gemini / OpenAI to extract exact price, SKU, and dimensions from ambiguous captions.
- [ ] Direct checkout button: Send pre-filled order messages directly to Facebook Messenger or Telegram bot.
- [ ] Scheduled synchronization via GitHub Actions or cron.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
