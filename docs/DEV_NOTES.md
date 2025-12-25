# Dev Notes - Nursery Project

**Last Updated:** December 2024

This document captures critical development notes, common pitfalls, and solutions discovered during development. **Read this before making significant changes.**

## Table of Contents

1. [Build System Issues](#build-system-issues)
2. [Database Connection Issues](#database-connection-issues)
3. [React Runtime Errors](#react-runtime-errors)
4. [Next.js Image Component](#nextjs-image-component)
5. [Prisma Client Configuration](#prisma-client-configuration)
6. [Vercel Deployment](#vercel-deployment)
7. [Monorepo Configuration](#monorepo-configuration)
8. [Common Pitfalls](#common-pitfalls)

---

## Build System Issues

### ⚠️ Turbopack File System Bugs (Next.js 16.0.10)

**Problem:** Turbopack in Next.js 16.0.10 has a critical bug where it tries to write to directories that don't exist, causing `ENOENT` errors:
```
Error: ENOENT: no such file or directory, open '/path/to/.next/dev/static/development/_buildManifest.js.tmp.xxx'
```

**Root Cause:** Next.js deletes the `.next` directory on startup, then Turbopack tries to write files before creating the directory structure.

**Solution:** Use Webpack instead of Turbopack for development:
```json
// apps/web/package.json
"dev": "next dev --webpack"
```

**Why This Works:** Webpack doesn't have this file system race condition. Turbopack is faster but has stability issues in Next.js 16.0.10.

**DO NOT:**
- Try to pre-create directories (Next.js deletes them on startup)
- Use workarounds like `ensure-dirs.js` scripts (they don't work)
- Upgrade Next.js expecting it to fix this (it may not be fixed yet)

**Status:** Known issue with Turbopack. Use Webpack until fixed.

### ⚠️ Middleware/Prerender Manifest ENOENT Errors (Next.js 16.0.10)

**Problem:** Next.js 16.0.10 tries to read manifest files (`middleware-manifest.json`, `prerender-manifest.json`, `routes-manifest.json`) during server startup before they're created by compilation, causing `ENOENT` errors:
```
Error: ENOENT: no such file or directory, open '/path/to/.next/dev/server/middleware-manifest.json'
Error: ENOENT: no such file or directory, open '/path/to/.next/dev/prerender-manifest.json'
```

**Root Cause:** 
- Next.js deletes the `.next` directory on startup
- Then tries to read manifest files before the first compilation creates them
- This is a race condition bug in Next.js 16.0.10

**Solution:** Ensure TypeScript compilation succeeds. The manifest files are created during compilation, so if compilation fails due to TypeScript errors, the manifest files never get created, causing these errors.

**Common TypeScript Errors That Cause This:**
- Missing enum exports from `@nursery/db` (add to `packages/db/src/index.ts`)
- Readonly arrays used with Prisma `in` operator (use `[...ARRAY]` to convert to mutable)
- Optional properties accessed without null checks (use non-null assertions `!` or proper guards)
- Type mismatches from Decimal/Date transformations (use type assertions `as any` for client components)

**DO NOT:**
- Pre-create manifest files (Next.js deletes `.next` on startup)
- Try to work around by creating files in scripts (they get deleted)
- Assume the errors are about middleware itself (they're about missing compilation artifacts)

**Status:** Known Next.js 16.0.10 bug. Fix TypeScript errors to allow compilation to complete, which creates the manifest files.

---

## Database Connection Issues

### ⚠️ Pooler Connection Failures

**Problem:** The Supabase pooler connection (port 6543) is unreliable and often fails with:
```
Can't reach database server at `aws-1-ap-southeast-2.pooler.supabase.com:6543`
```

**Root Cause:** 
- Pooler connections can be blocked by VPNs/firewalls
- Pooler has connection limits and can be unavailable
- Network issues can prevent pooler access

**Solution:** The Prisma client in `packages/db/src/index.ts` already has fallback logic:
```typescript
const databaseUrl = 
  process.env.DATABASE_URL ||           // Pooler (port 6543)
  process.env.DATABASE_URL_NON_POOLING || // Direct (port 5432)
  process.env.POSTGRES_URL_NON_POOLING;
```

**Best Practices:**
- Always set `DATABASE_URL_NON_POOLING` in `.env` as a fallback
- For API routes with heavy queries, consider using non-pooling connection
- Test database connections before assuming they work

**DO NOT:**
- Create separate Prisma clients for different connections (use the shared instance)
- Remove the fallback logic in `packages/db/src/index.ts`
- Assume pooler connection will always work

---

## React Runtime Errors

### ⚠️ "Objects are not valid as a React child"

**Problem:** React throws this error when trying to render objects directly as children.

**Common Causes:**
1. **Returning arrays from helper functions** - React doesn't handle arrays returned from functions well in certain contexts
2. **SSR/Client mismatch** - Rendering Context Providers during SSR
3. **React elements stored in data** - Accidentally storing React elements in props/data instead of component functions

**Solutions:**

#### 1. Markdown Rendering
```typescript
// ❌ BAD - Returns array from function
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => <p key={i}>{line}</p>);
}

// ✅ GOOD - Map directly in JSX
function renderMarkdown(text: string) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </>
  );
}
```

#### 2. Icon Components
```typescript
// ❌ BAD - Storing React elements
const icon = categoryIcons[name]; // This might be a React element
<icon /> // Error: Objects are not valid as a React child

// ✅ GOOD - Store component functions
const Icon = categoryIcons[name] || Leaf; // Component function
<Icon className="..." /> // Works correctly
```

#### 3. SSR Context Providers
```typescript
// ❌ BAD - Rendering Context Provider during SSR
{mounted ? <Sheet>...</Sheet> : <button>...</button>}

// ✅ GOOD - Early return to avoid SSR rendering
if (!mounted) {
  return <SimplifiedNav />;
}
return <Sheet>...</Sheet>;
```

**DO NOT:**
- Return arrays from helper functions that are used as children
- Store React elements in data structures (store component functions instead)
- Render Context Providers during SSR without proper guards

---

## Next.js Image Component

### ⚠️ Image Quality Configuration

**Problem:** Next.js warns when using quality values not in the configured list:
```
Image with src "..." is using quality "85" which is not configured in images.qualities [75]
```

**Solution:** Add all quality values you use to `next.config.js`:
```javascript
images: {
  qualities: [75, 85], // Add all quality values you use
  // ... other config
}
```

### ⚠️ SVG Images with Next.js Image

**Problem:** Next.js Image component has issues with SVG files when CSS modifies dimensions:
```
Image with src "/logo.svg" has either width or height modified, but not the other
```

**Solution:** Use regular `<img>` tags for SVG files instead of Next.js `Image`:
```tsx
// ❌ BAD - Next.js Image with SVG
<Image src="/logo.svg" width={120} height={40} className="h-10" />

// ✅ GOOD - Regular img tag for SVG
<img src="/logo.svg" className="h-10 w-auto" />
```

**Why:** SVGs don't benefit from Next.js image optimization, and the component has issues with SVG dimension handling.

### ⚠️ Missing `sizes` Prop

**Problem:** Next.js warns when using `fill` prop without `sizes`:
```
Image with src "..." has "fill" but is missing "sizes" prop
```

**Solution:** Always add `sizes` prop when using `fill`:
```tsx
<Image
  src={imageUrl}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="object-cover"
/>
```

---

## Prisma Client Configuration

### ⚠️ CommonJS/ESM Export Warnings

**Problem:** Turbopack warns about `export *` with CommonJS modules:
```
unexpected export * used with module [externals]/@prisma/client
```

**Solution:** Explicitly export types instead of using `export *`:
```typescript
// ❌ BAD
export * from '@prisma/client';

// ✅ GOOD
export { PrismaClient } from '@prisma/client';
export type {
  Prisma,
  Decimal,
  JsonValue,
  InputJsonValue,
  // ... other types you need
} from '@prisma/client';
```

**Location:** `packages/db/src/index.ts`

---

## Vercel Deployment

### ⚠️ Puppeteer/Playwright in Production

**Problem:** `puppeteer` and `playwright` cause build failures on Vercel because:
1. They're heavy dependencies that slow down builds
2. They have native binaries that don't work on Vercel's build environment
3. They're not needed in production (scraping only happens locally)

**Solution:**
1. Move to `optionalDependencies` in `packages/data-import/package.json`
2. Use dynamic imports with `Function` constructor to prevent static analysis:
```typescript
// Prevent Turbopack from analyzing the import
const dynamicImport = (moduleName: string) => {
  const importFunc = new Function('moduleName', 'return import(moduleName)');
  return importFunc(moduleName);
};

const puppeteer = await dynamicImport('puppeteer');
```

3. Add environment checks to prevent execution on Vercel:
```typescript
if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
  throw new Error('Scraper is disabled in Vercel environments.');
}
```

4. Add to `serverExternalPackages` in `next.config.js`:
```javascript
serverExternalPackages: ['@nursery/data-import', 'puppeteer', 'playwright'],
```

### ⚠️ LightningCSS Native Module

**Problem:** Tailwind CSS v4 uses `lightningcss` which has native bindings that fail on Vercel:
```
Error: Cannot find module '../lightningcss.linux-x64-gnu.node'
```

**Solution:**
1. Add as optional dependency: `apps/web/package.json`
```json
"optionalDependencies": {
  "lightningcss-linux-x64-gnu": "^1.30.2"
}
```

2. Install explicitly in Vercel build: `vercel.json`
```json
{
  "installCommand": "npm ci --omit=optional && npm install --no-save --platform=linux --arch=x64 lightningcss || true"
}
```

---

## Monorepo Configuration

### ⚠️ Environment Variables

**Problem:** Next.js doesn't automatically load `.env` from monorepo root.

**Solution:** Explicitly load in `apps/web/next.config.js`:
```javascript
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
```

**Also:** Create symlink for Next.js to find `.env`:
```bash
ln -s ../../.env apps/web/.env
```

### ⚠️ Prisma Client Generation

**Problem:** Prisma client must be generated before building.

**Solution:** Update root `package.json` build script:
```json
{
  "scripts": {
    "build": "npm run db:generate && npm run build --workspace=apps/web"
  }
}
```

---

## Common Pitfalls

### ❌ Don't: Create Separate Prisma Clients

**Why:** The shared instance in `packages/db/src/index.ts` handles connection pooling, error handling, and environment variable fallbacks correctly.

**Instead:** Always use `import { prisma } from '@nursery/db'`

### ❌ Don't: Use `console.error` for Debug Logging

**Why:** `console.error` shows up as errors in browser console, confusing debugging.

**Instead:** Use `console.log` for debug info, or remove debug statements entirely.

### ❌ Don't: Return Arrays from Helper Functions Used as Children

**Why:** React doesn't handle arrays returned from functions well in certain contexts.

**Instead:** Map directly in JSX or wrap in `React.Fragment` at the call site.

### ❌ Don't: Store React Elements in Data Structures

**Why:** React elements are objects, not component functions. Storing them causes "Objects are not valid as a React child" errors.

**Instead:** Store component functions (the actual component, not an instance).

### ❌ Don't: Render Context Providers During SSR

**Why:** Context Providers can't be rendered during SSR, causing hydration mismatches.

**Instead:** Use early returns or dynamic imports with `ssr: false`:
```typescript
const Component = dynamic(() => import('./Component'), { ssr: false });
```

### ❌ Don't: Assume Database Connections Always Work

**Why:** Network issues, VPNs, and connection limits can cause failures.

**Instead:** Always wrap database calls in try-catch and provide fallbacks:
```typescript
let categories = [];
try {
  categories = await prisma.category.findMany({...});
} catch (error) {
  console.error('Database error:', error);
  // Continue with empty array
}
```

### ❌ Don't: Use Turbopack in Next.js 16.0.10

**Why:** Known file system bugs cause build failures.

**Instead:** Use `--webpack` flag until Turbopack is fixed.

### ❌ Don't: Hardcode Database URLs or Connection Logic

**Why:** Different environments need different connection strategies.

**Instead:** Use the fallback logic in `packages/db/src/index.ts` that tries pooler, then non-pooling, then direct connection.

---

## Quick Reference

### Build Commands
```bash
# Development (use Webpack, not Turbopack)
npm run dev

# Build (generates Prisma client first)
npm run build

# Database
npm run db:generate  # Generate Prisma client
npm run db:studio   # Open Prisma Studio
```

### Environment Variables
- `DATABASE_URL` - Pooler connection (port 6543) - may fail
- `DATABASE_URL_NON_POOLING` - Direct connection (port 5432) - more reliable
- `POSTGRES_URL_NON_POOLING` - Alternative direct connection

### File Locations
- Prisma client: `packages/db/src/index.ts`
- Next.js config: `apps/web/next.config.js`
- Vercel config: `vercel.json`
- Environment: `.env` (root) and `apps/web/.env` (symlink)

---

## Debugging Checklist

When something breaks, check:

1. ✅ Is the dev server using Webpack? (`npm run dev` should show "webpack" not "Turbopack")
2. ✅ Is Prisma client generated? (`npm run db:generate`)
3. ✅ Are environment variables loaded? (Check `apps/web/next.config.js` dotenv loading)
4. ✅ Is database connection working? (Check pooler vs non-pooling)
5. ✅ Are there React element objects in data? (Check for `$$typeof` in console)
6. ✅ Are Context Providers being rendered during SSR? (Check for hydration errors)
7. ✅ Are image components configured correctly? (Check quality, sizes, SVG handling)

---

## Lessons Learned

1. **Always test build system changes** - Turbopack bugs can break everything
2. **Database connections are fragile** - Always have fallbacks and error handling
3. **React is strict about children** - Don't return arrays from functions, don't store elements
4. **Next.js Image has quirks** - SVGs need special handling, always add sizes prop
5. **Monorepo env vars need explicit loading** - Don't assume Next.js finds them
6. **Heavy dependencies break Vercel builds** - Use optional dependencies and dynamic imports
7. **Debug logging pollutes console** - Use console.log or remove entirely

---

## Future Improvements

- [ ] Upgrade Next.js when Turbopack bugs are fixed
- [ ] Consider using Prisma Accelerate for better connection handling
- [ ] Set up proper error boundaries for better error handling
- [ ] Add monitoring/alerting for database connection issues
- [ ] Document API endpoints and their requirements
- [ ] Create development setup script to automate environment setup

---

**Remember:** When in doubt, check this document first. Most issues we've encountered are documented here with solutions.

