# kaplan-software-labs

Landing page for Dojo early access signup.

## Save Signup Emails To Google Sheets

1. Create a Google Sheet with a tab named `Signups`.
2. In that Sheet, go to `Extensions -> Apps Script`.
3. Replace the default code with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Signups');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Signups');
    sheet.appendRow(['Timestamp', 'Email', 'Source']);
  }

  var payload = JSON.parse(e.postData.contents || '{}');
  var email = (payload.email || '').toString().trim();
  var source = (payload.source || 'website').toString().trim();

  if (!email) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: 'missing-email' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([new Date(), email, source]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click `Deploy -> New deployment`.
5. Type: `Web app`.
6. Execute as: `Me`.
7. Who has access: `Anyone`.
8. Deploy and copy the Web App URL.
9. In `script.js`, set:

```javascript
const SHEETS_WEBHOOK_URL = 'YOUR_WEB_APP_URL_HERE';
```

After that, each successful signup is appended to your `Signups` sheet.

## Free Hosting On GitHub Pages + Custom Domain

This repo is ready for a custom domain with the `CNAME` file set to:

```text
kaplansoftwarelabs.com
```

### 1. Push this repo to GitHub

1. Create a GitHub repository (for example: `kaplan-software-labs`).
2. Add your remote and push `main`:

```bash
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/kaplan-software-labs.git
git add .
git commit -m "Initial Dojo landing page"
git push -u origin main
```

### 2. Enable GitHub Pages

1. In GitHub, open `Settings -> Pages`.
2. Under `Build and deployment`:
Source: `Deploy from a branch`
Branch: `main`
Folder: `/ (root)`
3. Save.

### 3. Configure DNS for `kaplansoftwarelabs.com`

At your DNS provider, create these records:

For apex/root (`@`):
- `A` -> `185.199.108.153`
- `A` -> `185.199.109.153`
- `A` -> `185.199.110.153`
- `A` -> `185.199.111.153`

Optional IPv6 for apex/root (`@`):
- `AAAA` -> `2606:50c0:8000::153`
- `AAAA` -> `2606:50c0:8001::153`
- `AAAA` -> `2606:50c0:8002::153`
- `AAAA` -> `2606:50c0:8003::153`

For `www`:
- `CNAME` -> `YOUR_GITHUB_USERNAME.github.io`

### 4. Finalize in GitHub Pages

1. In `Settings -> Pages`, confirm custom domain is `kaplansoftwarelabs.com`.
2. Enable `Enforce HTTPS` once DNS resolves.
3. (Recommended) Set your DNS provider to redirect `www.kaplansoftwarelabs.com` to `kaplansoftwarelabs.com`, or vice versa, based on your preferred canonical domain.
