// This file contains the browser-side code for scraping product details
// It's kept as plain JavaScript to avoid TypeScript compilation issues in page.evaluate()
function scrapeProductDetail() {
  // Plantmark product page structure
  const nameEl = document.querySelector('h1, .product-title, [data-product-name], .product-name');
  const descriptionEl = document.querySelector('.description, .product-description, [data-description], .product-detail, .detail');
  
  // Look for price in various locations
  const priceEl = document.querySelector('.price, [data-price], .product-price, [class*="price"]');
  
  // Find all images (main and gallery)
  const imageEls = document.querySelectorAll('.product-images img, .product-gallery img, [data-image], .photo img, img[src*="thumbs"], .product-image img');
  
  // Extract structured product attributes from itemprop attributes (most reliable)
  let botanicalName = null;
  let commonNames = null;
  let native = null;
  let foliageType = null;
  let plantType = null;
  let plantHabit = null;
  
  // Look for attribute-pair divs with itemprop attributes
  const attributePairs = document.querySelectorAll('.attribute-pair, [class*="attribute"]');
  attributePairs.forEach(pair => {
    const botanicalEl = pair.querySelector('[itemprop="botanical-name"]');
    const commonNamesEl = pair.querySelector('[itemprop="common-names"]');
    const nativeEl = pair.querySelector('[itemprop="native"]');
    const foliageEl = pair.querySelector('[itemprop="foliage"]');
    const plantTypeEl = pair.querySelector('[itemprop="plant-type"]');
    const habitEl = pair.querySelector('[itemprop="habit"]');
    
    if (botanicalEl && !botanicalName) {
      botanicalName = botanicalEl.textContent?.trim() || null;
    }
    if (commonNamesEl && !commonNames) {
      const namesText = commonNamesEl.textContent?.trim() || '';
      // Split by comma and clean up, remove duplicates
      const namesArray = namesText.split(',').map(n => n.trim()).filter(n => n.length > 0);
      // Remove duplicates while preserving order
      commonNames = [...new Set(namesArray)];
      if (commonNames.length === 0) commonNames = null;
    }
    if (nativeEl && native === null) {
      const nativeText = nativeEl.textContent?.trim() || '';
      native = nativeText.toLowerCase() === 'yes' || nativeText.toLowerCase() === 'true';
    }
    if (foliageEl && !foliageType) {
      foliageType = foliageEl.textContent?.trim() || null;
    }
    if (plantTypeEl && !plantType) {
      plantType = plantTypeEl.textContent?.trim() || null;
    }
    if (habitEl && !plantHabit) {
      const habitText = habitEl.textContent?.trim() || '';
      // Can be multiple values separated by comma
      plantHabit = habitText.split(',').map(h => h.trim()).filter(h => h.length > 0);
      if (plantHabit.length === 0) plantHabit = null;
    }
  });
  
  // Fallback: Look for botanical and common names in other locations
  if (!botanicalName) {
    const botanicalEl = document.querySelector('[data-botanical-name], .botanical-name, [class*="botanical"], [id*="botanical-name"]');
    botanicalName = botanicalEl?.textContent?.trim() || null;
  }
  if (!commonNames) {
    const commonEl = document.querySelector('[data-common-name], .common-name, [class*="common"], [id*="common-names"]');
    const commonText = commonEl?.textContent?.trim() || '';
    if (commonText) {
      commonNames = commonText.split(',').map(n => n.trim()).filter(n => n.length > 0);
      if (commonNames.length === 0) commonNames = null;
    }
  }
  
  // Extract category from breadcrumbs or URL
  let category = null;
  const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumbs a, nav[aria-label="breadcrumb"] a, [class*="breadcrumb"] a');
  if (breadcrumbs.length > 1) {
    // Usually second-to-last breadcrumb is the category (skip Home and Plant Finder)
    const breadcrumbArray = Array.from(breadcrumbs);
    // Find the last breadcrumb that's not "Home" or "Plant Finder"
    for (let i = breadcrumbArray.length - 1; i >= 0; i--) {
      const breadcrumbText = breadcrumbArray[i].textContent?.trim() || '';
      const lowerText = breadcrumbText.toLowerCase();
      if (lowerText !== 'home' && lowerText !== 'plant finder' && lowerText !== '') {
        category = breadcrumbText;
        break;
      }
    }
  }
  
  // Fallback: try URL path (but only if we didn't find a valid breadcrumb)
  if (!category) {
    const urlParts = window.location.pathname.split('/').filter(p => p);
    // Skip the product slug (last part) and look for category
    if (urlParts.length > 1) {
      // Category is usually the first part after domain
      const categorySlug = urlParts[0];
      if (categorySlug !== 'plant-finder') {
        category = categorySlug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }
  }

  // Extract product ID from URL or page
  const urlParts = window.location.pathname.split('/');
  const slug = urlParts[urlParts.length - 1];
  const productIdEl1 = document.querySelector('[data-product-id]');
  const productIdEl2 = document.querySelector('[data-productid]');
  const productId = (productIdEl1 ? productIdEl1.getAttribute('data-product-id') : null) || 
                   (productIdEl2 ? productIdEl2.getAttribute('data-productid') : null) || '';

  if (!nameEl) {
    // Try to get name from page title or URL
    const titleParts = document.title.split('|');
    const pageTitle = titleParts[0] ? titleParts[0].trim() : '';
    if (!pageTitle) return null;
  }

  const nameElText = nameEl ? (nameEl.textContent || '').trim() : '';
  const titleText = document.title.split('|')[0] ? document.title.split('|')[0].trim() : '';
  const name = nameElText || titleText || slug.split('-').map(function(w) { 
    return w.charAt(0).toUpperCase() + w.slice(1); 
  }).join(' ');

  // Extract all images from gallery (full quality - remove size suffixes like _400, _750)
  const images = [];
  const seenImages = new Set();
  // Look for gallery images specifically (cloudzoom-gallery, product-gallery, etc.)
  const galleryImages = document.querySelectorAll('.cloudzoom-gallery img, .product-gallery img, .cloudzoom img, .picture-img, img[class*="gallery"], img[class*="cloudzoom"]');
  const allProductImages = galleryImages.length > 0 ? galleryImages : imageEls;
  
  for (let i = 0; i < allProductImages.length; i++) {
    const img = allProductImages[i];
    let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-lazyloadsrc') || '';
    // Skip placeholder images, logos, banners
    if (src.includes('data:image') || src.includes('placeholder') || src.includes('blank') || 
        src.includes('logo') || src.includes('banner') || src.includes('web thin banner')) continue;
    // Make relative URLs absolute
    if (src && !src.startsWith('http')) {
      if (src.startsWith('/')) {
        src = 'https://www.plantmark.com.au' + src;
      } else {
        src = 'https://www.plantmark.com.au/' + src;
      }
    }
    // Remove size suffix to get full quality image (_400, _750, etc.)
    if (src && src.length > 0 && !src.includes('data:image')) {
      // Remove size suffixes like _400, _750 to get original quality
      const fullQualitySrc = src.replace(/_[0-9]+\.(jpg|jpeg|png|gif)$/i, '.$1');
      // Use normalized URL for deduplication, but store full quality URL
      if (!seenImages.has(fullQualitySrc)) {
        seenImages.add(fullQualitySrc);
        images.push(fullQualitySrc);
      }
    }
  }

  // Extract price variants (multiple sizes/prices)
  const variants = [];
  let price;
  const variantMap = new Map(); // Key by size to deduplicate
  
  // Look for size variants with combo IDs
  const sizeVariants = document.querySelectorAll('.size.combo, [class*="size"][class*="combo"], .location-box.combo');
  
  sizeVariants.forEach(el => {
    const comboId = el.id ? el.id.replace(/^(mobile-)?size-/, '') : null;
    const sizeText = el.textContent?.trim() || '';
    const size = sizeText.replace(/^Size:\s*/i, '').trim();
    const stockMatch = el.className.match(/stock-(\d+)/);
    const stock = stockMatch ? parseInt(stockMatch[1]) : null;
    const isVisible = el.offsetParent !== null && window.getComputedStyle(el).display !== 'none';
    
    // Only process if it looks like a valid size (contains cm or L)
    if (comboId && size && (size.match(/\d+cm/i) || size.match(/\d+L/i))) {
      // Use size as key to deduplicate (keep variant with stock if available)
      if (!variantMap.has(size) || (stock && stock > 0 && (!variantMap.get(size).stock || variantMap.get(size).stock === 0))) {
        variantMap.set(size, {
          id: comboId,
          size: size,
          stock: stock,
          availability: stock && stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'
        });
      }
    }
  });
  
  // Try to find prices - look in table structure first (category listing page)
  const tableRows = document.querySelectorAll('table tbody tr, .product-row');
  tableRows.forEach(row => {
    const sizeCell = row.querySelector('td:nth-child(2), .size, [class*="size"]');
    const sizeText = sizeCell?.textContent?.trim() || '';
    
    if (sizeText && variantMap.has(sizeText)) {
      // Look for price in price columns
      const priceCells = row.querySelectorAll('td');
      priceCells.forEach(cell => {
        const cellText = cell.textContent || '';
        // Match patterns like "$29.40 ex GST" or "$32.34 inc GST"
        const exGstMatch = cellText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
        const incGstMatch = cellText.match(/\$?(\d+\.?\d*)\s*(?:inc|including)\s*gst/i);
        const priceMatch = cellText.match(/\$(\d+\.?\d*)/);
        
        if (exGstMatch && variantMap.has(sizeText)) {
          const priceValue = parseFloat(exGstMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(sizeText).price = priceValue;
          }
        } else if (priceMatch && variantMap.has(sizeText) && !variantMap.get(sizeText).price) {
          const priceValue = parseFloat(priceMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(sizeText).price = priceValue;
          }
        }
      });
    }
  });
  
  // Try to find prices using combo ID matching (Plantmark structure)
  // Prices are in elements with IDs: price-exgst-{comboId} and price-incgst-{comboId}
  sizeVariants.forEach(el => {
    const comboId = el.id ? el.id.replace(/^(mobile-)?size-/, '') : 
                    el.className.match(/combo-(\d+)/)?.[1] || null;
    const sizeText = el.textContent?.trim() || '';
    const size = sizeText.replace(/^Size:\s*/i, '').trim();
    
    if (comboId && variantMap.has(size)) {
      // Find price elements by combo ID
      const priceExGstEl = document.getElementById('price-exgst-' + comboId);
      const priceIncGstEl = document.getElementById('price-incgst-' + comboId);
      
      // Prefer EX GST price, fallback to INC GST
      if (priceExGstEl) {
        const priceText = priceExGstEl.textContent || '';
        const exGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
        if (exGstMatch) {
          const priceValue = parseFloat(exGstMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(size).price = priceValue;
          }
        }
      } else if (priceIncGstEl) {
        const priceText = priceIncGstEl.textContent || '';
        const incGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:inc|including)\s*gst/i);
        if (incGstMatch) {
          // Convert INC GST to EX GST (divide by 1.1)
          const incGstPrice = parseFloat(incGstMatch[1]);
          if (!isNaN(incGstPrice)) {
            variantMap.get(size).price = Math.round((incGstPrice / 1.1) * 100) / 100;
          }
        }
      }
    }
    
    // Fallback: Check for data-price attribute
    const dataPrice = el.getAttribute('data-price') || el.closest('[data-price]')?.getAttribute('data-price');
    if (dataPrice && variantMap.has(size) && !variantMap.get(size).price) {
      const priceValue = parseFloat(dataPrice);
      if (!isNaN(priceValue)) {
        variantMap.get(size).price = priceValue;
      }
    }
    
    // Fallback: Look for price in same row
    const parentRow = el.closest('.row, tr');
    if (parentRow && variantMap.has(size) && !variantMap.get(size).price) {
      const priceCol = parentRow.querySelector('.price, [class*="price"], [class*="col"][class*="price"], td[class*="price"]');
      if (priceCol) {
        const priceText = priceCol.textContent || '';
        const exGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
        const priceMatch = priceText.match(/\$(\d+\.?\d*)/);
        
        if (exGstMatch) {
          const priceValue = parseFloat(exGstMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(size).price = priceValue;
          }
        } else if (priceMatch) {
          const priceValue = parseFloat(priceMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(size).price = priceValue;
          }
        }
      }
    }
  });
  
  // Also look for prices in a separate price column structure
  const allRows = document.querySelectorAll('.row, tr');
  allRows.forEach(row => {
    const sizeCol = row.querySelector('.size.combo, td:nth-child(2)');
    const priceCol = row.querySelector('.price, [class*="price"]:not(.size), td[class*="price"]');
    
    if (sizeCol && priceCol) {
      const sizeText = sizeCol.textContent?.trim().replace(/^Size:\s*/i, '') || '';
      const priceText = priceCol.textContent || '';
      
      if (sizeText && variantMap.has(sizeText)) {
        const exGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
        const priceMatch = priceText.match(/\$(\d+\.?\d*)/);
        
        if (exGstMatch) {
          const priceValue = parseFloat(exGstMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(sizeText).price = priceValue;
          }
        } else if (priceMatch && !variantMap.get(sizeText).price) {
          const priceValue = parseFloat(priceMatch[1]);
          if (!isNaN(priceValue)) {
            variantMap.get(sizeText).price = priceValue;
          }
        }
      }
    }
  });
  
  // Convert map to array and sort by size
  const variantArray = Array.from(variantMap.values());
  variantArray.sort((a, b) => {
    // Sort by size (extract numbers for comparison)
    const aNum = parseFloat(a.size) || 0;
    const bNum = parseFloat(b.size) || 0;
    return aNum - bNum;
  });
  variants.push(...variantArray);
  
  // Set default price from first variant with price, or from main price element
  if (variants.length > 0) {
    const variantWithPrice = variants.find(v => v.price);
    if (variantWithPrice) {
      price = variantWithPrice.price;
    }
  }
  
  // Fallback: extract single price if no variants found
  if (!price && priceEl) {
    const priceText = priceEl.textContent || '';
    // Try to match price patterns
    const exGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
    const priceMatch = priceText.match(/\$(\d+\.?\d*)/);
    
    if (exGstMatch) {
      price = parseFloat(exGstMatch[1]);
    } else if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    } else {
      // Fallback to extracting numbers
      const numbersOnly = priceText.replace(/[^0-9.]/g, '');
      if (numbersOnly) {
        price = parseFloat(numbersOnly);
      }
    }
  }

  // Identify the main product content area (exclude header, footer, sidebar)
  const mainContent = document.querySelector('.product-detail, .product-info, main, .main-content, [role="main"]') || document.body;
  
  // Helper to check if element is in main content (not footer/header)
  function isInMainContent(el) {
    const footer = document.querySelector('footer, .footer');
    const header = document.querySelector('header, .header, .site-header');
    const sidebar = document.querySelector('aside, .sidebar');
    
    if (footer && footer.contains(el)) return false;
    if (header && header.contains(el)) return false;
    if (sidebar && sidebar.contains(el)) return false;
    
    // Check if it's in a script tag
    if (el.closest('script')) return false;
    
    return mainContent.contains(el);
  }

  // Get full description text (clean and filter noise)
  let description = descriptionEl ? (descriptionEl.textContent || '').trim() : '';
  if (!description || description.length < 20) {
    // Try to get description from multiple paragraphs in main content
    const descParagraphs = [];
    const paragraphEls = mainContent.querySelectorAll('.product-detail p, .detail p, .description p, .product-info p');
    for (let i = 0; i < paragraphEls.length; i++) {
      const p = paragraphEls[i];
      if (!isInMainContent(p)) continue;
      let text = (p.textContent || '').trim();
      // Clean up text
      text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
      // Filter out noise
      if (text.length >= 10 && text.length <= 1000 && 
          !text.includes('function(') && !text.includes('document.ready') &&
          !text.includes('Copyright') && !text.includes('Privacy Policy')) {
        descParagraphs.push(text);
      }
    }
    description = descParagraphs.length > 0 ? descParagraphs.join('\n\n') : (description || undefined);
  }
  
  // Clean description if it exists
  if (description) {
    description = description
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
      .replace(/\s+/g, ' ')
      .replace(/BACK TO RESULTS/gi, '')
      .substring(0, 2000)
      .trim();
  }

  // Extract specifications from tables, lists, or structured data
  const specifications = {};
  
  // First, try to extract from label/value pairs (most reliable for structured data)
  // Plantmark uses a structure where labels are in one div and values in the next sibling div
  const labelElements = mainContent.querySelectorAll('.label, [class*="label"], dt, th');
  
  // Special handling for paired labels (Mature Height/Width, Position/Soil Type)
  const heightLabel = Array.from(labelElements).find(l => 
    isInMainContent(l) && (l.textContent || '').trim().toLowerCase().includes('mature height') && 
    !(l.textContent || '').trim().toLowerCase().includes('width')
  );
  const widthLabel = Array.from(labelElements).find(l => 
    isInMainContent(l) && ((l.textContent || '').trim().toLowerCase().includes('mature width') || 
    (l.textContent || '').trim().toLowerCase().includes('spread'))
  );
  const positionLabel = Array.from(labelElements).find(l => 
    isInMainContent(l) && (l.textContent || '').trim().toLowerCase().includes('position') &&
    !(l.textContent || '').trim().toLowerCase().includes('soil')
  );
  const soilLabel = Array.from(labelElements).find(l => 
    isInMainContent(l) && (l.textContent || '').trim().toLowerCase().includes('soil type')
  );
  
  // Extract height and width (they're in the same parent div, values in next sibling)
  if (heightLabel && heightLabel.parentElement) {
    const parentNext = heightLabel.parentElement.nextElementSibling;
    if (parentNext && parentNext.textContent) {
      const valuesText = (parentNext.textContent || '').trim();
      // Values are separated by multiple spaces (e.g., "4-10m   4-10m")
      const values = valuesText.split(/\s{2,}/).map(v => v.trim()).filter(v => v.length > 0);
      if (values.length >= 1) {
        // First value is height
        specifications.matureHeight = values[0];
      }
      if (values.length >= 2) {
        // Second value is width
        specifications.matureWidth = values[1];
      } else if (values.length === 1 && widthLabel) {
        // If only one value and we have width label, it might be width
        specifications.matureWidth = values[0];
      }
    }
  }
  
  // Extract position and soil type (they're in the same parent div, values in next sibling)
  if (positionLabel && positionLabel.parentElement) {
    const parentNext = positionLabel.parentElement.nextElementSibling;
    if (parentNext && parentNext.textContent) {
      const valuesText = (parentNext.textContent || '').trim();
      // Position comes first, then soil type (separated by multiple spaces or comma)
      // Try splitting by multiple spaces first
      let parts = valuesText.split(/\s{2,}/);
      if (parts.length < 2) {
        // Try splitting by comma if no double spaces
        parts = valuesText.split(',').map(p => p.trim());
      }
      
      if (parts.length >= 1) {
        // First part is position - can have multiple values separated by commas
        const positionValues = parts[0].split(',').map(v => v.trim()).filter(v => v.length > 0);
        if (positionValues.length > 0 && !positionValues[0].toLowerCase().includes('loam') && 
            !positionValues[0].toLowerCase().includes('sandy') && 
            !positionValues[0].toLowerCase().includes('drained')) {
          specifications.position = positionValues.length === 1 ? positionValues[0] : positionValues;
        }
      }
      
      if (parts.length >= 2) {
        // Second part is soil type - can have multiple values
        const soilValues = parts[1].split(',').map(v => v.trim()).filter(v => v.length > 0);
        if (soilValues.length > 0) {
          specifications.soilType = soilValues.length === 1 ? soilValues[0] : soilValues;
        }
      } else if (parts.length === 1 && soilLabel) {
        // If only one part and it contains soil-related terms, it's soil type
        const text = parts[0].toLowerCase();
        if (text.includes('loam') || text.includes('sandy') || text.includes('drained') || 
            text.includes('clay') || text.includes('peat')) {
          const soilValues = parts[0].split(',').map(v => v.trim()).filter(v => v.length > 0);
          if (soilValues.length > 0) {
            specifications.soilType = soilValues.length === 1 ? soilValues[0] : soilValues;
          }
        }
      }
    }
  }
  
  // Fallback: Extract from other label structures
  labelElements.forEach(label => {
    if (!isInMainContent(label)) return;
    if (label === heightLabel || label === widthLabel || label === positionLabel || label === soilLabel) return;
    
    const labelText = (label.textContent || '').trim().toLowerCase().replace(/[:\s]+$/, '');
    if (!labelText) return;
    
    // Try multiple strategies to find the value
    let value = null;
    
    // Strategy 1: Next sibling element
    let nextSibling = label.nextElementSibling;
    if (nextSibling && nextSibling.textContent && !nextSibling.classList.contains('label')) {
      value = (nextSibling.textContent || '').trim();
    }
    
    // Strategy 2: If label is in a row, look for next cell
    const row = label.closest('tr');
    if (row && !value) {
      const cells = row.querySelectorAll('td, th');
      for (let i = 0; i < cells.length; i++) {
        if (cells[i] === label && i + 1 < cells.length) {
          value = (cells[i + 1].textContent || '').trim();
          break;
        }
      }
    }
    
    // Strategy 3: If label is dt, look for next dd
    if (label.tagName === 'DT' && !value) {
      const dd = label.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        value = (dd.textContent || '').trim();
      }
    }
    
    // Strategy 4: Look in parent's next sibling
    if (!value && label.parentElement) {
      const parentNext = label.parentElement.nextElementSibling;
      if (parentNext && parentNext.textContent && !parentNext.querySelector('.label')) {
        value = (parentNext.textContent || '').trim();
      }
    }
    
    if (!value || value.length === 0 || value.length > 200) return;
    
    // Clean value - remove duplicates and normalize
    value = value.replace(/\s+/g, ' ').trim();
    // Remove duplicate values (e.g., "4-10m 4-10m" -> "4-10m")
    value = value.replace(/\b(\S+)\s+\1\b/g, '$1');
    
    // Extract based on label text (only if not already set)
    if (labelText.includes('mature height') && !labelText.includes('width') && !specifications.matureHeight) {
      const values = value.split(',').map(v => v.trim()).filter(v => v.length > 0 && !v.includes(':'));
      if (values.length > 0 && !values[0].toLowerCase().includes('width')) {
        specifications.matureHeight = values.length === 1 ? values[0] : values;
      }
    } else if ((labelText.includes('mature width') || labelText.includes('spread')) && 
               !labelText.includes('height') && !specifications.matureWidth) {
      const values = value.split(',').map(v => v.trim()).filter(v => v.length > 0 && !v.includes(':'));
      if (values.length > 0 && !values[0].toLowerCase().includes('height')) {
        specifications.matureWidth = values.length === 1 ? values[0] : values;
      }
    } else if (labelText.includes('position') && !labelText.includes('soil') && 
               !labelText.includes('type') && !specifications.position) {
      const values = value.split(',').map(v => v.trim()).filter(v => v.length > 0 && !v.includes(':'));
      if (values.length > 0 && !values[0].toLowerCase().includes('soil')) {
        specifications.position = values.length === 1 ? values[0] : values;
      }
    } else if (labelText.includes('soil type') && !specifications.soilType) {
      const values = value.split(',').map(v => v.trim()).filter(v => v.length > 0 && !v.includes(':'));
      if (values.length > 0) {
        specifications.soilType = values.length === 1 ? values[0] : values;
      }
    }
  });
  
  // Look for specification tables only in main content
  const allTables = mainContent.querySelectorAll('table');
  const specTables = [];
  
  for (let tableIdx = 0; tableIdx < allTables.length; tableIdx++) {
    const table = allTables[tableIdx];
    if (!isInMainContent(table)) continue;
    
    // Skip tables that are clearly not product specs (too many rows, contains navigation, etc.)
    const rowCount = table.querySelectorAll('tr').length;
    const text = table.textContent || '';
    
    // Skip if table has too many rows (likely navigation or footer)
    if (rowCount > 20) continue;
    
    // Skip if contains common footer/header keywords
    if (text.includes('Copyright') || text.includes('Privacy Policy') || 
        text.includes('Terms') || text.includes('Menu') || 
        text.includes('Login') || text.includes('Register')) continue;
    
    // Skip if contains JavaScript code
    if (text.includes('function(') || text.includes('document.ready') || 
        text.includes('addEventListener')) continue;
    
    specTables.push(table);
  }
  
  for (let tableIdx = 0; tableIdx < specTables.length; tableIdx++) {
    const table = specTables[tableIdx];
    const rows = table.querySelectorAll('tr');
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      const cells = [];
      const cellEls = row.querySelectorAll('td, th');
      for (let cellIdx = 0; cellIdx < cellEls.length; cellIdx++) {
        cells.push(cellEls[cellIdx]);
      }
      if (cells.length >= 2) {
        const keyCell = (cells[0].textContent || '').trim();
        const valueCell = (cells[1].textContent || '').trim();
        
        // Skip if value is too long (likely not a spec)
        if (valueCell.length > 200) continue;
        
        // Skip if contains JavaScript or HTML
        if (valueCell.includes('function(') || valueCell.includes('<script') || 
            valueCell.includes('document.')) continue;
        
        const key = keyCell.toLowerCase().replace(/[^a-z0-9]/g, '');
        const value = valueCell.replace(/\s+/g, ' ').trim();
        
        if (key && value && value.length < 200) {
          // Map common keys to our schema
          const keyMap = {
            'height': 'height',
            'matureheight': 'height',
            'width': 'width',
            'maturewidth': 'width',
            'spread': 'width',
            'growthrate': 'growthRate',
            'growth': 'growthRate',
            'maturesize': 'matureSize',
            'mature': 'matureSize',
            'sun': 'sunRequirements',
            'sunlight': 'sunRequirements',
            'exposure': 'sunRequirements',
            'position': 'sunRequirements',
            'water': 'waterRequirements',
            'watering': 'waterRequirements',
            'soil': 'soilType',
            'soiltype': 'soilType',
            'hardiness': 'hardinessZone',
            'zone': 'hardinessZone',
            'bloom': 'bloomTime',
            'bloomtime': 'bloomTime',
            'flowering': 'bloomTime',
            'flowercolor': 'flowerColor',
            'foliagecolor': 'foliageColor',
            'foliage': 'foliageColor',
            'foliagetype': 'foliageColor',
            'evergreen': 'evergreen',
            'deciduous': 'deciduous',
            'native': 'native',
            'planttype': 'plantType',
            'planthabit': 'plantHabit',
          };
          
          const mappedKey = keyMap[key];
          if (mappedKey) {
            if (mappedKey === 'evergreen' || mappedKey === 'deciduous' || mappedKey === 'native') {
              specifications[mappedKey] = value.toLowerCase().includes('yes') || 
                                          value.toLowerCase().includes('true') ||
                                          value.toLowerCase() === mappedKey;
            } else {
              specifications[mappedKey] = value;
            }
          }
        }
      }
    }
  }

  // Look for definition lists (dl/dt/dd) only in main content
  const dlElements = mainContent.querySelectorAll('dl');
  for (let dlIdx = 0; dlIdx < dlElements.length; dlIdx++) {
    const dl = dlElements[dlIdx];
    if (!isInMainContent(dl)) continue;
    
    const terms = dl.querySelectorAll('dt');
    const definitions = dl.querySelectorAll('dd');
    for (let termIdx = 0; termIdx < terms.length; termIdx++) {
      const term = terms[termIdx];
      const def = definitions[termIdx];
      const key = ((term.textContent || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')) || '';
      const value = (def ? (def.textContent || '').trim() : '') || '';
      
      // Skip if value is too long or contains noise
      if (!key || !value || value.length > 200) continue;
      if (value.includes('function(') || value.includes('<script')) continue;
      
      if (!specifications[key]) {
        specifications[key] = value.replace(/\s+/g, ' ').trim();
      }
    }
  }

  // Look for structured text patterns in main content only
  // Extract common plant attributes from text patterns
  const mainText = mainContent.textContent || '';
  
  // Clean text - remove script content and excessive whitespace
  const cleanText = mainText
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 5000); // Limit to first 5000 chars to avoid noise
  
        // Try to extract key-value pairs from clean text using improved regex patterns
        // Split by common delimiters first to avoid concatenation
        function extractSpec(pattern, key, maxLength) {
          maxLength = maxLength || 100;
          const match = cleanText.match(pattern);
          if (match) {
            let value = match[1].trim();
            // Clean up the value - stop at common delimiters
            value = value.split(/[,\n\r;|]/)[0].trim();
            value = value.replace(/\s+/g, ' ')
                        .replace(/BACK TO RESULTS/i, '')
                        .replace(/PLANTMARK/i, '')
                        .replace(/Mature Width:/i, '')
                        .replace(/Position:/i, '')
                        .replace(/Soil Type:/i, '')
                        .substring(0, maxLength)
                        .trim();
            
            // Validate value
            if (value.length >= 2 && value.length <= maxLength && 
                !value.includes('function(') && !value.includes('document.') &&
                !value.match(/^[A-Z\s:]+$/) && // Not all caps with colons (likely header)
                value !== key.toLowerCase()) {
              if (!specifications[key] || specifications[key] === '') {
                specifications[key] = value;
              }
            }
          }
        }
        
        // Extract with better patterns and length limits
        extractSpec(/mature\s+height[:\s]+([^\n\.;,|]+)/i, 'height', 50);
        extractSpec(/height[:\s]+([^\n\.;,|]+)/i, 'height', 50);
        extractSpec(/mature\s+width[:\s]+([^\n\.;,|]+)/i, 'width', 50);
        extractSpec(/width[:\s]+([^\n\.;,|]+)/i, 'width', 50);
        extractSpec(/spread[:\s]+([^\n\.;,|]+)/i, 'width', 50);
        extractSpec(/growth\s+rate[:\s]+([^\n\.;,|]+)/i, 'growthRate', 30);
        extractSpec(/position[:\s]+([^\n\.;,|]+)/i, 'sunRequirements', 50);
        extractSpec(/sun[:\s]+([^\n\.;,|]+)/i, 'sunRequirements', 50);
        extractSpec(/exposure[:\s]+([^\n\.;,|]+)/i, 'sunRequirements', 50);
        extractSpec(/soil\s+type[:\s]+([^\n\.;,|]+)/i, 'soilType', 50);
        extractSpec(/soil[:\s]+([^\n\.;,|]+)/i, 'soilType', 50);
        extractSpec(/hardiness[:\s]+([^\n\.;,|]+)/i, 'hardinessZone', 20);
        extractSpec(/zone[:\s]+([^\n\.;,|]+)/i, 'hardinessZone', 20);
        extractSpec(/bloom\s+time[:\s]+([^\n\.;,|]+)/i, 'bloomTime', 50);
        extractSpec(/flower\s+color[:\s]+([^\n\.;,|]+)/i, 'flowerColor', 30);
        extractSpec(/foliage\s+color[:\s]+([^\n\.;,|]+)/i, 'foliageColor', 30);

  // Extract care instructions (only from main content)
  let careInstructions;
  const careSections = mainContent.querySelectorAll('.care, .care-instructions, [class*="care"], .planting-care, .maintenance');
  if (careSections.length > 0) {
    const careTexts = [];
    for (let i = 0; i < careSections.length; i++) {
      const section = careSections[i];
      if (!isInMainContent(section)) continue;
      let text = (section.textContent || '').trim();
      // Remove script tags and clean
      text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
      if (text && text.length > 20 && text.length < 2000 &&
          !text.includes('function(') && !text.includes('document.ready')) {
        careTexts.push(text);
      }
    }
    if (careTexts.length > 0) {
      careInstructions = careTexts.join('\n\n').substring(0, 2000);
    }
  }

  // Extract planting instructions (only from main content)
  let plantingInstructions;
  const plantingSections = mainContent.querySelectorAll('.planting, .planting-instructions, [class*="planting"], .how-to-plant');
  if (plantingSections.length > 0) {
    const plantingTexts = [];
    for (let i = 0; i < plantingSections.length; i++) {
      const section = plantingSections[i];
      if (!isInMainContent(section)) continue;
      let text = (section.textContent || '').trim();
      // Remove script tags and clean
      text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/function\s*\([^)]*\)\s*\{[^}]*\}/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
      if (text && text.length > 20 && text.length < 2000 &&
          !text.includes('function(') && !text.includes('document.ready')) {
        plantingTexts.push(text);
      }
    }
    if (plantingTexts.length > 0) {
      plantingInstructions = plantingTexts.join('\n\n').substring(0, 2000);
    }
  }

  // Check availability
  let availability;
  const availabilityText = (document.body.textContent || '').toLowerCase();
  if (availabilityText.includes('out of stock') || availabilityText.includes('unavailable')) {
    availability = 'OUT_OF_STOCK';
  } else if (availabilityText.includes('pre-order') || availabilityText.includes('preorder')) {
    availability = 'PRE_ORDER';
  } else if (availabilityText.includes('discontinued')) {
    availability = 'DISCONTINUED';
  } else {
    availability = 'IN_STOCK';
  }

  // Use extracted botanical/common names from itemprop if available, otherwise fallback
  let botanicalNameText = botanicalName;
  let commonNameText = commonNames && commonNames.length > 0 ? commonNames[0] : null;
  
  // If not found in itemprop, try to extract from other elements
  if (!botanicalNameText) {
    const botanicalEl = document.querySelector('[data-botanical-name], .botanical-name, [class*="botanical"], [id*="botanical-name"]');
    botanicalNameText = botanicalEl ? (botanicalEl.textContent || '').trim() : '';
  }
  
  if (!commonNameText) {
    const commonEl = document.querySelector('[data-common-name], .common-name, [class*="common"], [id*="common-names"]');
    const commonText = commonEl ? (commonEl.textContent || '').trim() : '';
    if (commonText) {
      commonNameText = commonText.split(',')[0].trim(); // Use first common name
    }
  }
  
  // If still not found, try to extract from name or description
  if (!botanicalNameText && name) {
    // Botanical names are usually italicized or in specific format
    const italicEl = document.querySelector('i, em, [class*="botanical"], [class*="scientific"]');
    if (italicEl) {
      botanicalNameText = italicEl.textContent?.trim() || '';
    }
    // Check if name itself looks like botanical name (two words, capitalized)
    const nameParts = name.split(' ');
    if (nameParts.length >= 2 && nameParts[0][0] === nameParts[0][0].toUpperCase() && 
        nameParts[1][0] === nameParts[1][0].toLowerCase()) {
      botanicalNameText = nameParts.slice(0, 2).join(' ');
      if (!commonNameText) {
        commonNameText = nameParts.slice(2).join(' ') || null;
      }
    }
  }
  
  // Add extracted attributes to specifications if not already present
  if (native !== null && !specifications.native) {
    specifications.native = native;
  }
  if (foliageType && !specifications.foliageType) {
    specifications.foliageType = foliageType;
  }
  if (plantType && !specifications.plantType) {
    specifications.plantType = plantType;
  }
  if (plantHabit && !specifications.plantHabit) {
    specifications.plantHabit = plantHabit;
  }
  
  // Determine overall availability from variants
  let overallAvailability = availability;
  if (variants.length > 0) {
    const hasInStock = variants.some(v => v.availability === 'IN_STOCK');
    overallAvailability = hasInStock ? 'IN_STOCK' : 'OUT_OF_STOCK';
  }
  
  return {
    id: productId || slug,
    name: name || '',
    slug: slug || '',
    description: description || undefined,
    botanicalName: botanicalNameText || undefined,
    commonName: commonNameText || undefined,
    commonNames: commonNames && commonNames.length > 0 ? commonNames : undefined,
    price: price || undefined,
    availability: overallAvailability || undefined,
    variants: variants.length > 0 ? variants : undefined,
    imageUrl: images[0] || undefined,
    images: images.length > 0 ? images : undefined,
    sourceUrl: window.location.href,
    sourceId: productId || slug,
    category: category || undefined,
    specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
    careInstructions: careInstructions || undefined,
    plantingInstructions: plantingInstructions || undefined,
  };
}

