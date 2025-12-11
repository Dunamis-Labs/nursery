# Scripts

## Plantmark API Discovery

### `discover-plantmark-api.ts`

Discovers Plantmark API endpoints by monitoring network requests when browsing plantmark.com.au.

**Usage:**
```bash
npm run discover:plantmark
```

**What it does:**
1. Opens plantmark.com.au in a headless browser
2. Monitors all network requests (XHR, Fetch, etc.)
3. Identifies API endpoints that return JSON
4. Saves discovered endpoints to `scripts/plantmark-endpoints.json`
5. Generates code suggestions for `PlantmarkApiClient`

**Output:**
- `scripts/plantmark-endpoints.json` - Discovered endpoints with full details
- `scripts/plantmark-api-client-suggestions.ts` - Generated code for API client methods

**Note:** This script requires an Australian IP address to access plantmark.com.au. If you're running this from outside Australia, you'll need to use a VPN or proxy.

