# MAS employee cards

Each employee card lives at `card/<slug>/index.html` and is built automatically. For example, `card/ceo/index.html` becomes `/card/ceo/`.

To add an employee:

1. Copy the `card/ceo` directory to a short lowercase slug such as `card/sara`.
2. Replace the name, role, links, metadata, and accessible labels in the copied HTML.
3. Add the matching contact file at `public/card/<slug>/contact.vcf` and update the HTML download link.
4. Add an approved employee portrait only when one is supplied; keep the MAS logo as the safe fallback.
5. Run `npm run build:deploy` before upload.

Employee cards use `noindex, follow` by default. Remove `noindex` only with the employee's approval; the deployment validator will then require the new page in `public/sitemap.xml`.
