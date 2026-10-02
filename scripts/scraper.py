#!/usr/bin/env python3
"""
Facebook Product Scraper for Chhun Huong Store
Scrapes product posts and photos, extracts real product names, full descriptions,
auto-classifies categories (Khmer/English keywords), and outputs to both CSV and Next.js products.json.
"""

import os
import sys
import json
import time
import re
import argparse
from typing import List, Dict, Any
import pandas as pd
from playwright.sync_api import sync_playwright

PAGE_URL = "https://www.facebook.com/chhunhuong"
PAGE_PHOTOS_URL = "https://www.facebook.com/chhunhuong/photos"
AUTH_FILE = "fb_auth.json"
OUTPUT_CSV = "facebook_photos.csv"
OUTPUT_JSON = "src/data/products.json"


def classify_type(caption: str) -> str:
    """Infer product type from Cambodian snack/beverage/confectionery keywords."""
    if not caption:
        return "General"
    t = caption.lower()
    if any(k in t for k in ["ភេសជ្ជៈ", "ទឹក", "តែ", "drink", "tea", "beverage", "កាហ្វេ", "coffee", "juice"]):
        return "Beverage"
    elif any(k in t for k in ["ស្ករ", "candy", "sweet", "jelly", "ចាហ៊ួយ", "choco", "gummy", "gum", "marshmallow"]):
        return "Candy / Confectionery"
    elif any(k in t for k in ["នំ", "oreo", "snack", "biscuit", "cake", "cookie", "ដំឡូង", "សណ្ដែក", "pastry", "chips", "cracker"]):
        return "Snack / Biscuit"
    elif any(k in t for k in ["ប្រហិត", "ត្រី", "មី", "food", "squid", "ស្ក្វិត"]):
        return "Snack / Biscuit"
    return "General"


def clean_product_name(caption: str, fallback_idx: int = 1) -> str:
    """Extract a genuine product name from the post caption, filtering out address/store info."""
    if not caption:
        return f"Chhun Huong Product #{fallback_idx}"

    lines = [line.strip() for line in caption.split("\n") if line.strip()]
    ignore_prefixes = [
        "📍", "»មានចែកចាយ", "អាស័យដ្ឋាន", "📌", "ទីតាំង", "☎️", "Cellcard", "Smart",
        "http", "https", "#", "Tel", "ផ្ទះលេខ", "សង្កាត់", "ខណ្ឌ", "រាជធានី",
        "(ស្ថិតនៅ", "ចម្ងាយ", "អាចទាក់ទង", "ចូលស្តុក", "ចូលថ្មី", "See more", "… See more"
    ]

    for line in lines:
        if any(line.startswith(prefix) for prefix in ignore_prefixes):
            continue
        if any(kw in line for kw in ["ផ្លូវលេខ", "ផ្សារអូឡាំពិក", "Google Map", "Facebook Chat"]):
            continue
        cleaned = re.sub(r'#\S+', '', line)
        cleaned = cleaned.replace("… See more", "").replace("See more", "").replace("See less", "").strip()
        if len(cleaned) >= 2:
            return cleaned

    return f"ទំនិញបោះដុំ ឈុន ហួង #{fallback_idx}"


def run_login_flow():
    """Interactive login helper to save authenticated session state."""
    print("==================================================")
    print("Interactive Login Mode")
    print("A browser window will open. Please log in to Facebook.")
    print("Once logged in, press Enter in this terminal to save session.")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        page.goto("https://www.facebook.com/login")

        input(">>> Press Enter after you have successfully logged in in the browser window: ")

        context.storage_state(path=AUTH_FILE)
        print(f"Session saved successfully to {AUTH_FILE}!")
        browser.close()


def scrape_from_feed(max_items: int = 30, headless: bool = True, scrape_all: bool = False, overwrite: bool = False) -> List[Dict[str, Any]]:
    """Scrapes products from page timeline feed with auto-saving and duplicate skipping."""
    existing_catalog = [] if overwrite else load_existing_products()
    final_catalog = list(existing_catalog)
    new_in_session: List[Dict[str, Any]] = []

    target_display = "ALL available" if scrape_all else f"up to {max_items}"
    print(f"Targeting {target_display} products from {PAGE_URL}...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context_args = {
            "viewport": {"width": 1280, "height": 800},
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        if os.path.exists(AUTH_FILE):
            print(f"Using saved session from {AUTH_FILE}...")
            context_args["storage_state"] = AUTH_FILE

        context = browser.new_context(**context_args)
        page = context.new_page()

        print(f"Navigating to {PAGE_URL} timeline feed...")
        page.goto(PAGE_URL, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(3000)

        # Dismiss popups
        for selector in [
            'div[aria-label="Close"]', 'div[aria-label="បិទ"]',
            'div[role="dialog"] div[aria-label="Close"]',
            'button[data-cookiebanner="accept_button"]'
        ]:
            try:
                btn = page.locator(selector).first
                if btn.is_visible():
                    btn.click()
            except Exception:
                pass

        scroll_attempts = 0
        consecutive_no_progress = 0
        max_no_progress_limit = 10  # stop only if Facebook stops loading any new content after 10 consecutive scrolls
        last_save_count = len(final_catalog)
        skipped_existing_count = 0
        seen_identifiers = set()

        # Pre-seed seen identifiers from existing catalog
        for itm in existing_catalog:
            if itm.get("post_url"):
                seen_identifiers.add(itm["post_url"])
            if itm.get("image_url"):
                seen_identifiers.add(itm["image_url"])

        print(f"Resuming with {len(existing_catalog)} existing products in catalog.")

        try:
            while True:
                if not scrape_all and len(new_in_session) >= max_items:
                    print(f"Reached target limit of {max_items} products.")
                    break

                # 1. Single-pass high-performance in-browser extraction
                batch_articles = page.evaluate("""() => {
                    // Click visible 'See more' buttons without blocking
                    const buttons = document.querySelectorAll('div[role="button"], span[role="button"]');
                    for (const b of buttons) {
                        const txt = b.innerText || '';
                        if (txt === 'See more' || txt === 'មើលបន្ថែម' || txt.endsWith('See more') || txt.endsWith('មើលបន្ថែម')) {
                            try { b.click(); } catch(e) {}
                        }
                    }

                    // Extract all article data in one instant pass
                    const articles = document.querySelectorAll('div[role="article"]');
                    const results = [];
                    for (const art of articles) {
                        const msgEl = art.querySelector('div[data-ad-comet-preview="message"], div[data-ad-preview="message"]');
                        const caption = msgEl ? (msgEl.innerText || '').trim() : '';

                        const imgs = art.querySelectorAll('img[src*="fbcdn.net"]');
                        let validImg = '';
                        for (const img of imgs) {
                            const src = img.getAttribute('src') || '';
                            if (src.includes('scontent') && !src.includes('p50x50') && !src.includes('p100x100') && !src.includes('16x16')) {
                                validImg = src;
                                break;
                            }
                        }

                        const linkEl = art.querySelector('a[href*="/posts/"], a[href*="/photos/"], a[href*="fbid="]');
                        let postUrl = linkEl ? (linkEl.getAttribute('href') || '') : '';
                        if (postUrl.startsWith('/')) {
                            postUrl = 'https://www.facebook.com' + postUrl;
                        }

                        if (validImg && caption) {
                            results.push({ caption, image_url: validImg, post_url: postUrl });
                        }
                    }
                    return results;
                }""")

                dom_activity_detected = False

                for item in batch_articles:
                    if not scrape_all and len(new_in_session) >= max_items:
                        break

                    caption = item.get("caption", "").strip()
                    valid_img = item.get("image_url", "")
                    post_url = item.get("post_url", PAGE_URL)
                    post_url = post_url.split("&__cft__")[0].split("?__cft__")[0]

                    item_key = post_url if post_url != PAGE_URL else valid_img
                    if item_key in seen_identifiers and any(x["image_url"] == valid_img for x in new_in_session):
                        continue

                    dom_activity_detected = True

                    name = clean_product_name(caption, len(final_catalog) + 1)
                    item_type = classify_type(caption)

                    item_record = {
                        "id": str(len(final_catalog) + 1),
                        "name": name,
                        "type": item_type,
                        "image_url": valid_img,
                        "post_url": post_url,
                        "full_caption": caption
                    }

                    # Check duplicate against existing catalog
                    if not overwrite and is_duplicate(item_record, existing_catalog):
                        seen_identifiers.add(item_key)
                        skipped_existing_count += 1
                        continue

                    # Brand new product!
                    seen_identifiers.add(item_key)
                    new_in_session.append(item_record)
                    final_catalog.append(item_record)
                    print(f"  ✓ [{len(final_catalog)}] {name} ({item_type})")

                # Auto-save checkpoint every 10 new items
                if len(final_catalog) >= last_save_count + 10:
                    _persist_catalog(final_catalog)
                    last_save_count = len(final_catalog)

                # Reset activity counter if Facebook is still serving content
                if dom_activity_detected:
                    consecutive_no_progress = 0
                else:
                    consecutive_no_progress += 1
                    if consecutive_no_progress >= max_no_progress_limit:
                        print("\nReached the end of the page (no new posts loaded from Facebook after several scrolls).")
                        break

                page.evaluate("window.scrollBy(0, 1800);")
                page.wait_for_timeout(2000)
                scroll_attempts += 1

                if scroll_attempts % 5 == 0:
                    status_extra = f" | {skipped_existing_count} existing skipped" if skipped_existing_count else ""
                    print(f"  ...scrolled {scroll_attempts} times | {len(final_catalog)} products in catalog{status_extra}...")

        except KeyboardInterrupt:
            print("\nScraping interrupted by user. Saving all collected products...")
        finally:
            _persist_catalog(final_catalog)
            browser.close()

    return final_catalog


def _persist_catalog(catalog: List[Dict[str, Any]]):
    """Safely saves catalog to CSV and JSON."""
    if not catalog:
        return
    df = pd.DataFrame(catalog)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)


def scrape_from_photos(max_items: int = 30, headless: bool = True) -> List[Dict[str, Any]]:
    """Scrapes photos page with fallback to parent post for caption extraction."""
    scraped_data: List[Dict[str, Any]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context_args = {
            "viewport": {"width": 1280, "height": 800},
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        if os.path.exists(AUTH_FILE):
            print(f"Using saved session from {AUTH_FILE}...")
            context_args["storage_state"] = AUTH_FILE

        context = browser.new_context(**context_args)
        page = context.new_page()

        print(f"Navigating to {PAGE_PHOTOS_URL}...")
        page.goto(PAGE_PHOTOS_URL, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(3000)

        # Collect photo links
        photo_links = set()
        scroll_attempts = 0
        max_scrolls = max(8, max_items // 2)

        while len(photo_links) < max_items and scroll_attempts < max_scrolls:
            links = page.locator('a[href*="/photo"]').all()
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if href and ("fbid=" in href or "set=" in href or "/photos/" in href):
                        full_url = href if href.startswith("http") else f"https://www.facebook.com{href}"
                        clean_url = full_url.split("&__cft__")[0].split("?__cft__")[0]
                        photo_links.add(clean_url)
                except Exception:
                    pass

            page.evaluate("window.scrollBy(0, 1200);")
            page.wait_for_timeout(2000)
            scroll_attempts += 1

        print(f"Discovered {len(photo_links)} photo links. Extracting details...")

        for idx, url in enumerate(list(photo_links)[:max_items], start=1):
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(2500)

                # High-res image
                img_url = ""
                img_elem = page.locator('img[data-visualcompletion="media-vc-image"]').first
                if img_elem.count() > 0:
                    img_url = img_elem.get_attribute("src") or ""
                if not img_url:
                    fallback_img = page.locator('div[role="main"] img, img[src*="fbcdn.net"]').first
                    if fallback_img.count() > 0:
                        img_url = fallback_img.get_attribute("src") or ""

                # Expand See more
                for btn in page.locator('div[role="button"]:has-text("See more"), span:has-text("See more")').all():
                    try:
                        if btn.is_visible():
                            btn.click()
                    except Exception:
                        pass

                # Extract Caption from Photo view
                caption = ""
                # Check for "View Post" if photo has no caption
                view_post_link = page.locator('a:has-text("View Post"), a:has-text("view post")').first
                if view_post_link.count() > 0:
                    parent_post_href = view_post_link.get_attribute("href")
                    if parent_post_href:
                        full_post_url = parent_post_href if parent_post_href.startswith("http") else "https://www.facebook.com" + parent_post_href
                        # Open new tab or navigate to get post message
                        post_page = context.new_page()
                        try:
                            post_page.goto(full_post_url, wait_until="domcontentloaded", timeout=20000)
                            post_page.wait_for_timeout(2000)
                            pmsg = post_page.locator('div[data-ad-comet-preview="message"], div[data-ad-preview="message"]').first
                            if pmsg.count() > 0:
                                caption = pmsg.inner_text().strip()
                        except Exception:
                            pass
                        finally:
                            post_page.close()

                # If no parent post caption found, inspect spans and divs on current page
                if not caption:
                    candidate_spans = page.locator('div[dir="auto"], span[dir="auto"]').all()
                    for s in candidate_spans:
                        txt = s.inner_text().strip()
                        if len(txt) > 20 and not any(bad in txt for bad in ["Notifications", "Unread", "reactions", "comments", "See previous"]):
                            if len(txt) > len(caption):
                                caption = txt

                name = clean_product_name(caption, idx)
                item_type = classify_type(caption)

                if img_url:
                    scraped_data.append({
                        "id": str(idx),
                        "name": name,
                        "type": item_type,
                        "image_url": img_url,
                        "post_url": url,
                        "full_caption": caption
                    })
                    print(f"  ✓ [{idx}] {name} ({item_type})")

            except Exception as e:
                print(f"  ✗ Error on {url}: {e}")

        browser.close()

    return scraped_data


def load_existing_products() -> List[Dict[str, Any]]:
    """Loads existing products from JSON to avoid duplicates on reruns."""
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception:
            pass
    return []


def is_duplicate(new_item: Dict[str, Any], existing_items: List[Dict[str, Any]]) -> bool:
    """Checks whether a product already exists by URL, image, or name/caption."""
    for item in existing_items:
        # Match by Facebook post URL
        if item.get("post_url") and new_item.get("post_url") and item["post_url"] == new_item["post_url"]:
            return True
        # Match by identical name and caption
        if item.get("name") == new_item.get("name") and item.get("full_caption") == new_item.get("full_caption"):
            return True
    return False


def save_merged_products(new_scraped: List[Dict[str, Any]], overwrite: bool = False):
    """Merges new items with existing catalog, skipping duplicates."""
    if overwrite:
        final_list = new_scraped
        print(f"\n[Overwrite Mode] Overwriting catalog with {len(final_list)} items.")
    else:
        existing = load_existing_products()
        added_count = 0
        skipped_count = 0

        # We start with existing items and add only new unique ones
        final_list = list(existing)

        for item in new_scraped:
            if is_duplicate(item, final_list):
                skipped_count += 1
            else:
                item["id"] = str(len(final_list) + 1)
                final_list.append(item)
                added_count += 1

        print(f"\n[Deduplication Summary]")
        print(f"  • Existing products in catalog: {len(existing)}")
        print(f"  • Scraped in this run:         {len(new_scraped)}")
        print(f"  • Duplicates skipped:           {skipped_count}")
        print(f"  • New products added:           {added_count}")
        print(f"  • Total catalog size:           {len(final_list)}")

    # Save to CSV
    df = pd.DataFrame(final_list)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"✓ Saved to {OUTPUT_CSV}")

    # Save to Next.js JSON
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
    print(f"✓ Updated Next.js catalog at {OUTPUT_JSON}")


def main():
    parser = argparse.ArgumentParser(description="Chhun Huong Store Facebook Product Scraper")
    parser.add_argument("--login", action="store_true", help="Launch interactive browser to log in and save session")
    parser.add_argument("--all", action="store_true", help="Scrape all available products until the end of the page")
    parser.add_argument("--max", type=int, default=30, help="Maximum number of products to scrape per run (default: 30)")
    parser.add_argument("--no-headless", action="store_true", help="Show browser window during scraping")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing products instead of merging/skipping duplicates")
    parser.add_argument("--source", choices=["feed", "photos"], default="feed", help="Source: feed (recommended) or photos")

    args = parser.parse_args()

    if args.login:
        run_login_flow()
        return

    if args.source == "feed":
        final_catalog = scrape_from_feed(
            max_items=args.max,
            headless=not args.no_headless,
            scrape_all=args.all,
            overwrite=args.overwrite
        )
        print(f"\n✓ Completed! Total catalog size is now {len(final_catalog)} products.")
    else:
        data = scrape_from_photos(max_items=args.max, headless=not args.no_headless)
        if data:
            save_merged_products(data, overwrite=args.overwrite)
        else:
            print("No items could be extracted.")


if __name__ == "__main__":
    main()
