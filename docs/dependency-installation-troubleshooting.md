# Dependency Installation Troubleshooting

## Network Timeout Issues

If you're experiencing `ETIMEDOUT` errors when installing npm packages, try these solutions:

---

## Solution 1: Increase npm Timeout (Recommended)

```bash
cd apps/web

# Increase timeout to 10 minutes
npm config set fetch-timeout 600000
npm config set fetch-retry-maxtimeout 1200000
npm config set fetch-retries 5

# Then try installing again
./install-dependencies.sh
```

---

## Solution 2: Install One Package at a Time

Use the slow installation script that installs packages individually:

```bash
cd apps/web
chmod +x install-dependencies-slow.sh
./install-dependencies-slow.sh
```

This will:
- Install each package one at a time
- Retry failed packages
- Take longer but is more reliable with poor connections

---

## Solution 3: Install Only Essential Packages First

Start with just the packages you need immediately:

```bash
cd apps/web

# Essential Radix UI components (most commonly used)
npm install \
  @radix-ui/react-accordion@1.2.2 \
  @radix-ui/react-dialog@1.1.4 \
  @radix-ui/react-dropdown-menu@2.1.4 \
  @radix-ui/react-select@2.1.4 \
  @radix-ui/react-tabs@1.1.2 \
  @radix-ui/react-toast@1.2.4 \
  @radix-ui/react-checkbox@1.1.3 \
  @radix-ui/react-slider@1.2.2 \
  @radix-ui/react-popover@1.1.4

# Essential utilities
npm install \
  class-variance-authority@^0.7.1 \
  cmdk@1.0.4 \
  sonner@^1.7.4
```

Then install others as needed when you use specific components.

---

## Solution 4: Use a Different Network

If possible:
- Try a different WiFi network
- Use a mobile hotspot
- Try from a different location
- Check if you're behind a corporate firewall/proxy

---

## Solution 5: Copy from v0 Codebase (If Available)

If the v0 codebase has `node_modules` installed:

```bash
# From v0 codebase
cd docs/source-files/v0-codebase-1
npm install  # If not already done

# Copy node_modules (large, but works)
cp -r node_modules ../../apps/web/
```

**Note**: This copies ALL dependencies, including ones you might not need.

---

## Solution 6: Use Yarn or pnpm Instead

Sometimes different package managers handle network issues better:

```bash
cd apps/web

# Install yarn
npm install -g yarn

# Or install pnpm
npm install -g pnpm

# Then use yarn/pnpm instead
yarn add @radix-ui/react-accordion@1.2.2
# or
pnpm add @radix-ui/react-accordion@1.2.2
```

---

## Solution 7: Check npm Registry

Verify npm can reach the registry:

```bash
npm ping
```

If this fails, there's a network/proxy issue.

---

## Solution 8: Use npm Cache

Clear and rebuild npm cache:

```bash
npm cache clean --force
npm cache verify
```

Then try installing again.

---

## Solution 9: Install During Off-Peak Hours

Network timeouts might be due to:
- High npm registry load
- Slow internet connection
- Network congestion

Try installing during off-peak hours (late night/early morning).

---

## Solution 10: Manual package.json Edit

As a last resort, manually add dependencies to `package.json`:

1. Open `apps/web/package.json`
2. Add dependencies to the `dependencies` section
3. Run `npm install` (it will try to install all at once, but might work)

Example:
```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-dialog": "1.1.4",
    // ... etc
  }
}
```

---

## Recommended Approach

1. **First**: Try Solution 1 (increase timeout)
2. **If that fails**: Try Solution 2 (install one at a time)
3. **If still failing**: Try Solution 3 (install essentials only)
4. **As last resort**: Try Solution 5 (copy from v0 codebase)

---

## Check What's Installed

After attempting installation, check what actually got installed:

```bash
cd apps/web
npm list --depth=0 | grep "@radix-ui\|class-variance\|cmdk\|sonner"
```

---

## Continue Without All Dependencies

You can start integrating v0 components even if not all dependencies are installed. When you try to use a component that requires a missing dependency, you'll get a clear error message telling you exactly which package is missing. Then you can install just that one package.

---

*Most components will work with just the essential Radix UI packages. Install others as you need them.*

