# GSTSyncPro — Marketing Website

The official website for **GSTSyncPro**, an advanced GSTR-2B & IMS reconciliation Chrome extension by [Infitax Solution](https://www.infitaxsolution.com).

## About

GSTSyncPro automates GST return reconciliation by matching GSTR-2B, GSTR-3B, and IMS (Invoice Management System) Purchase & CN/DN data with Books of Accounts — directly inside Chrome. All processing is 100% local; no financial data leaves the browser.

This repository contains the **marketing/landing website** (homepage, features, pricing, FAQ, contact, policies). The Chrome extension itself is distributed via the [Chrome Web Store](https://chromewebstore.google.com/detail/gstsync-pro/aaclnkpbjahikebmjbdmiamlgdohfobl).

## Tech Stack

- **HTML5** — static pages, no build step
- **CSS3** — custom design system with CSS variables, responsive grid, dark mode
- **Vanilla JavaScript** — no frameworks, no dependencies

## Project Structure

```
├── index.html              # Homepage
├── features/               # Features page
├── how-it-works/           # How it works page
├── pricing/                # Pricing plans + comparison table
├── faq/                    # FAQ page
├── contact/                # Contact form (Cloudflare Worker backend)
├── products/               # Other products showcase
├── policies/               # Privacy, Refund, Terms, License policies
│   ├── privacy/
│   ├── refund/
│   ├── terms/
│   └── license/
├── assets/
│   ├── style.css           # Shared stylesheet
│   └── script.js           # Shared JavaScript
├── welcome.html            # Post-install welcome page (license sync)
├── sitemap.xml             # XML sitemap
├── robots.txt              # Robots directives
└── googledf2a08f0981d3569.html  # Google Search Console verification
```

## Local Development

No build tools required. Simply open `index.html` in a browser, or serve locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment

The site is hosted at [www.infitaxsolution.com](https://www.infitaxsolution.com). Deploy by uploading files to your hosting provider (Cloudflare Pages, Netlify, Vercel, or any static host).

### Contact Form Backend

The contact form posts to a Cloudflare Worker that stores submissions in a D1 database. To set up your own:

1. Deploy a Cloudflare Worker with a `/contact` POST endpoint
2. Update `WORKER_URL` in `assets/script.js` to your worker URL
3. Add an Origin header check on the worker side for security

## License

[MIT](LICENSE) — © 2026 Infitax Solution


## Final CTA

The site includes a responsive **Add to Chrome** CTA in the main navigation and homepage hero, linking directly to the GSTSyncPro Chrome Web Store listing.
