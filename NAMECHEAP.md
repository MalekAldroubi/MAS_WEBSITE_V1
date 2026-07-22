# Namecheap production deployment — mascaregroup.com

The uploadable website is generated in `dist/` and includes static HTML, self-hosted fonts, SVG/WebP assets, favicons, SEO files, Apache rules, and one PHP contact endpoint. Upload the **contents** of `dist/`, not the source repository.

## 1. Prepare the Namecheap account

1. In cPanel → **Domains**, confirm the document root for `mascaregroup.com`. For a primary domain it is normally `public_html`; an addon domain may use a different folder.
2. In cPanel → **Email Accounts**, create `info@mascaregroup.com` if it does not already exist.
3. In cPanel → **Email Deliverability**, repair/install SPF and DKIM. Add a DMARC record after mail delivery is confirmed.
4. In **Namecheap SSL**, wait for the certificate to become Active and enable **HTTPS Redirect**. The packaged `.htaccess` deliberately does not duplicate this control-panel redirect.
5. In cPanel → **Select PHP Version**, use PHP 8.2 or newer and enable `curl` and `mbstring`.

## 2. Configure Cloudflare Turnstile

Create a Turnstile widget that allows both:

- `mascaregroup.com`
- `www.mascaregroup.com`

Copy `.env.example` to `.env.production.local` on the development computer and set the public browser key:

```text
VITE_TURNSTILE_SITE_KEY=your_real_site_key
```

Never put the Turnstile secret in a Vite variable or in `public_html`.

Copy `hosting/mas-contact-config.example.php`, add the real secret, and upload the completed file to:

```text
/home/CPANEL_USERNAME/mas-contact-config.php
```

This private file must sit one level above the website document root. Recommended production values are already shown in the example:

```php
'expected_hostnames' => ['mascaregroup.com', 'www.mascaregroup.com'],
'recipient_email' => 'info@mascaregroup.com',
'from_email' => 'info@mascaregroup.com',
```

## 3. Build and validate locally

```bash
npm install
npm run build:deploy
```

The validation checks every built page for one H1, title, description, canonical URL, social metadata, favicons, internal asset references, SVG symbols, font files, and sitemap coverage.

## 4. Upload the prepared archive

1. In cPanel → **File Manager**, open the domain document root.
2. Click **Settings** and enable **Show Hidden Files (dotfiles)** so `.htaccess` remains visible.
3. Back up any current live files before replacing them.
4. Upload `release/mascaregroup-namecheap.zip`.
5. Extract the archive directly into the document root.
6. Confirm `index.html`, `.htaccess`, `robots.txt`, `sitemap.xml`, `fonts/`, `assets/`, and `api/` are directly inside the document root—not inside an extra `dist` folder.
7. Use permissions `644` for files and `755` for directories. The private config above `public_html` should be `600` where supported.

## 5. Production checks

Open these URLs after DNS and SSL are active:

- `https://mascaregroup.com/`
- `https://mascaregroup.com/ar/`
- `https://mascaregroup.com/robots.txt`
- `https://mascaregroup.com/sitemap.xml`
- `https://mascaregroup.com/favicon.ico`
- `https://mascaregroup.com/card/ceo/`
- A deliberately missing URL, which should show the branded 404 page and return HTTP 404.

Also verify:

- `http://mascaregroup.com` redirects once to HTTPS.
- `https://www.mascaregroup.com` redirects once to `https://mascaregroup.com`.
- Fonts render with no browser-console 404 or MIME errors.
- The Saudi Arabia, Egypt, and Syria links open WhatsApp with a prefilled “Website enquiry” message, and `info@mascaregroup.com` opens the mail client.
- The Executive Office card opens cleanly on mobile and its “Save contact” button downloads `contact.vcf`.
- A contact-form submission succeeds and arrives at `info@mascaregroup.com`.
- Replying to the enquiry addresses the visitor.

Finally, submit `https://mascaregroup.com/sitemap.xml` to Google Search Console and Bing Webmaster Tools. Keep the apex domain (`mascaregroup.com`) as the canonical property.
