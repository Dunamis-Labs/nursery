#!/usr/bin/env tsx
/**
 * Inspect Product Detail Page
 * 
 * This script loads a specific product page and shows all available
 * data we can extract from it.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';

async function inspectProductDetail() {
  const productUrl = process.argv[2] || 'https://www.plantmark.com.au/abelia-grandiflora-kaleidoscope';
  
  console.log(`🔍 Inspecting product detail page: ${productUrl}\n`);

  const scraper = new PlantmarkScraper({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: 2000,
  });

  try {
    await scraper.initialize();
    
    const page = await scraper['browser'].newPage();
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract all available data from the page
    const pageData = await page.evaluate(() => {
      const data: Record<string, any> = {};
      
      // Get page title
      data.title = document.title;
      
      // Get all headings
      data.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map(h => ({ tag: h.tagName, text: h.textContent?.trim() }));
      
      // Get all data attributes
      const dataAttrs: Record<string, any> = {};
      document.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            const key = attr.name.replace('data-', '');
            if (!dataAttrs[key]) dataAttrs[key] = [];
            if (!dataAttrs[key].includes(attr.value)) {
              dataAttrs[key].push(attr.value);
            }
          }
        });
      });
      data.dataAttributes = dataAttrs;
      
      // Get all classes that might contain product info
      const classes = new Set<string>();
      document.querySelectorAll('[class*="product"], [class*="detail"], [class*="info"], [class*="spec"], [class*="attribute"]').forEach(el => {
        el.className.split(' ').forEach(c => {
          if (c.includes('product') || c.includes('detail') || c.includes('info') || c.includes('spec') || c.includes('attribute')) {
            classes.add(c);
          }
        });
      });
      data.relevantClasses = Array.from(classes);
      
      // Get all text content from common product sections
      const sections: Record<string, string> = {};
      
      // Look for common product info sections
      const sectionSelectors = [
        '.product-detail',
        '.product-info',
        '.product-specs',
        '.product-attributes',
        '.product-description',
        '.product-details',
        '[class*="specification"]',
        '[class*="attribute"]',
        '.detail',
        '.info',
      ];
      
      sectionSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, idx) => {
          const key = `${selector}-${idx}`;
          sections[key] = el.textContent?.trim() || '';
        });
      });
      data.sections = sections;
      
      // Get all table data
      const tables: any[] = [];
      document.querySelectorAll('table').forEach(table => {
        const rows: any[] = [];
        table.querySelectorAll('tr').forEach(tr => {
          const cells = Array.from(tr.querySelectorAll('td, th')).map(cell => cell.textContent?.trim());
          if (cells.length > 0) rows.push(cells);
        });
        if (rows.length > 0) tables.push(rows);
      });
      data.tables = tables;
      
      // Get all list items
      const lists: Record<string, string[]> = {};
      document.querySelectorAll('ul, ol').forEach((list, idx) => {
        const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
        if (items.length > 0) {
          lists[`list-${idx}`] = items;
        }
      });
      data.lists = lists;
      
      // Get all images with their alt text
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src') || img.getAttribute('data-src'),
        alt: img.getAttribute('alt'),
        title: img.getAttribute('title'),
      }));
      data.images = images;
      
      // Get all links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim(),
      }));
      data.links = links.slice(0, 20); // Limit to first 20
      
      // Get meta tags
      const meta: Record<string, string> = {};
      document.querySelectorAll('meta').forEach(metaTag => {
        const name = metaTag.getAttribute('name') || metaTag.getAttribute('property');
        const content = metaTag.getAttribute('content');
        if (name && content) {
          meta[name] = content;
        }
      });
      data.meta = meta;
      
      // Get structured data (JSON-LD)
      const jsonLd: any[] = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          const json = JSON.parse(script.textContent || '{}');
          jsonLd.push(json);
        } catch (e) {
          // Ignore parse errors
        }
      });
      data.jsonLd = jsonLd;
      
      return data;
    });
    
    console.log('📄 Page Structure Analysis:\n');
    console.log(JSON.stringify(pageData, null, 2));
    
    await page.close();
    await scraper.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await scraper.close();
    process.exit(1);
  }
}

inspectProductDetail();

