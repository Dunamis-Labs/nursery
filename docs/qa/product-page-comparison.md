# Product Detail Page - v0 vs Current Implementation Comparison

## Critical Issues Found

### 1. ❌ Botanical Name Display
**v0 Design:** Always displays botanical name (line 30 in v0 product-info.tsx)
```tsx
<p className="font-mono italic text-lg text-muted-foreground">{product.botanical}</p>
```

**Current Implementation:** Only displays if `product.botanicalName` exists (conditional)
```tsx
{product.botanicalName && (
  <p className="font-mono italic text-lg text-muted-foreground">{product.botanicalName}</p>
)}
```

**Issue:** Botanical name may not display even when data exists, or shows nothing when missing.

---

### 2. ❌ Size Selector Visibility
**v0 Design:** Always displays size selector (lines 52-66)
```tsx
<div className="space-y-2">
  <label className="text-sm font-semibold text-foreground">Select Size</label>
  <Select value={selectedSize} onValueChange={setSelectedSize}>
    ...
  </Select>
</div>
```

**Current Implementation:** Only displays if `sizes.length > 0` (conditional)
```tsx
{sizes.length > 0 && (
  <div className="space-y-2">
    ...
  </div>
)}
```

**Issue:** Size selector completely missing when no variants exist, breaking UI consistency.

---

### 3. ❌ CRITICAL: White Text on Light Background
**Issue:** `--muted-foreground` is set to white (`0 0% 100%`) in `globals.css` line 19
```css
--muted-foreground: 0 0% 100%;    /* White */
```

**Impact:** All `text-muted-foreground` text appears white on light background, making it invisible.

**Expected:** Should be dark gray like `#6b7280` (HSL: `220 13% 46%`)

---

### 4. ❌ Font Configuration Issues

**v0 Design:**
- Uses `--font-playfair` for serif/headings
- Uses `--font-inter` for body
- Uses `--font-jetbrains` for mono/botanical names
- All three fonts loaded in layout.tsx

**Current Implementation:**
- Only loads Playfair Display and Inter
- **Missing:** JetBrains Mono font import
- Tailwind config references `JetBrains Mono` but font not loaded
- `font-serif` class may not map correctly to `font-heading`

**Impact:** Botanical names may not use correct font, and `font-serif` may not work as expected.

---

### 5. ❌ Font Size Inconsistencies

**Product Name:**
- v0: `text-4xl md:text-5xl` ✅ (matches current)
- Current: `text-4xl md:text-5xl` ✅

**Botanical Name:**
- v0: `text-lg` ✅
- Current: `text-lg` ✅

**Price:**
- v0: `text-4xl` ✅
- Current: `text-4xl` ✅

**FAQ Heading:**
- v0: `text-3xl md:text-4xl` ✅
- Current: `text-3xl md:text-4xl` ✅

**Description:**
- v0: Standard body text
- Current: `text-base md:text-lg` (may be too large)

---

### 6. ❌ Missing "Ideal For / Not Ideal For" Section
**v0 Design:** Includes "Ideal For" and "Not Ideal For" lists (lines 97-126)
**Current Implementation:** Missing entirely

---

## Summary of Required Fixes

1. **Fix muted-foreground color** - Change from white to dark gray
2. **Add JetBrains Mono font** - Import and configure in layout.tsx
3. **Always show botanical name** - Display with fallback if missing
4. **Always show size selector** - Display with default "Standard" if no sizes
5. **Fix font-serif mapping** - Ensure it maps to font-heading correctly
6. **Add "Ideal For / Not Ideal For" section** - Extract from metadata and display
7. **Verify all text colors** - Ensure no white text on light backgrounds

