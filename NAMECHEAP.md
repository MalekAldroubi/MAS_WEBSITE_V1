# Namecheap Stellar Plus deployment

The website is a Vite static build with one PHP endpoint at `/api/contact.php`. The PHP endpoint validates Cloudflare Turnstile before sending a contact email through the hosting account.

## 1. Set up the contact mailbox

In cPanel, create a real mailbox on the website domain, such as `website@example.com`. This is the address the PHP endpoint uses in its `From` header. The visitor's email is used only as `Reply-To`.

Use cPanel's **Email Deliverability** screen to install or copy the SPF and DKIM records. Add DMARC as well. If the domain uses Cloudflare or another external DNS provider, copy the Namecheap MX, SPF, DKIM, and DMARC records into that DNS provider rather than changing them only in cPanel.

## 2. Create the Turnstile widget

1. Create a Cloudflare Turnstile widget for the production domain and its `www` hostname if both are used.
2. Copy `.env.example` to `.env.production.local`.
3. Put the public Turnstile site key in `.env.production.local`:

```text
VITE_TURNSTILE_SITE_KEY=your_real_site_key
```

The site key is public. Never put the Turnstile secret in a Vite environment variable or anywhere inside `public_html`.

## 3. Add the private server configuration

Copy `hosting/mas-contact-config.example.php`, fill in the real values, and upload it as:

```text
/home/CPANEL_USERNAME/mas-contact-config.php
```

That location is one level above `public_html`. Do not upload the real configuration file into the website directory.

Use a real mailbox on the hosted domain for `from_email`. `recipient_email` can be the same mailbox or another address where enquiries should arrive. List every production hostname allowed by the Turnstile widget in `expected_hostnames`.

## 4. Build and upload

Run locally:

```bash
npm install
npm run build
```

Upload the **contents** of `dist/` into `public_html/`. Confirm that the deployed PHP file exists at `public_html/api/contact.php`.

In cPanel's **Select PHP Version** screen, use PHP 8.2 or newer and make sure the `curl` extension is enabled. The endpoint uses cURL to verify every Turnstile token before sending mail.

Enable the free SSL certificate in cPanel and force HTTPS after the domain resolves to the hosting account.

## 5. Test

Submit the production contact form once and confirm all three outcomes:

- The browser shows the success message.
- The enquiry arrives at `recipient_email`.
- Replying to that message addresses the visitor, not the website mailbox.

If the form says it is not configured, confirm the private file name and location. If the form succeeds but the message is missing, check cPanel's mail routing, Email Deliverability records, and the recipient's spam folder.
