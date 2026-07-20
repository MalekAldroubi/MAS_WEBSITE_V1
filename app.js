import logoUrl from './assets/mas-logo.svg';

const isAr = (document.documentElement.lang || '').startsWith('ar');
const P = isAr ? '/ar' : '';

const phIcon = (name, { className = '', size = 20 } = {}) => {
  const symbol = `ph-duotone-${name}`;
  const classes = `ph-icon${className ? ` ${className}` : ''}`;
  return `<svg class="${classes}" width="${size}" height="${size}" viewBox="0 0 256 256" aria-hidden="true"><use href="/assets/icons/phosphor.svg#${symbol}"></use></svg>`;
};

// Counterpart URL in the other language (for the switcher + hreflang)
const path = location.pathname;
const altPath = isAr ? (path.replace(/^\/ar(\/|$)/, '/') || '/') : `/ar${path === '/' ? '/' : path}`;
const enPath = isAr ? altPath : path;
const arPath = isAr ? path : altPath;

// hreflang alternates so Google indexes each language separately.
// Once the final domain is live these should also be hard-coded into the HTML.
[['en', enPath], ['ar', arPath], ['x-default', enPath]].forEach(([code, href]) => {
  if (document.querySelector(`link[hreflang="${code}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'alternate';
  link.hreflang = code;
  link.href = location.origin + href;
  document.head.append(link);
});

const T = isAr
  ? {
      skip: 'تخطَّ إلى المحتوى',
      navHome: 'الرئيسية',
      navServices: 'خدماتنا',
      navMarkets: 'الأسواق',
      navAbout: 'من نحن',
      navContact: 'تواصل معنا',
      dropdownSmall: 'خدماتنا',
      dropdownTitle: 'من الدخول إلى التشغيل.',
      dropdownText: 'خمس خدمات تُدخل منتجك إلى السوق.',
      menu: 'القائمة',
      openMenu: 'افتح القائمة',
      closeMenu: 'أغلق القائمة',
      langSwitch: 'English',
      langSwitchLang: 'en',
      langSwitchDir: 'ltr',
      fields: [
        ['دخول السوق والوكالة المحلية', 'market-entry'],
        ['تسجيل المنتجات والمناقصات الحكومية', 'regulatory'],
        ['التوزيع والمبيعات والمستثمرون', 'commercial'],
        ['المنشآت الصحية والتشغيل', 'projects'],
        ['التصنيع المحلي', 'localization'],
      ],
      footerKicker: 'خطوتك القادمة',
      footerBridgeKicker: 'حضور إقليمي',
      footerBridgeTitle: 'شريك محلي واحد في أربعة أسواق.',
      footerTitle: 'أخبرنا عن منتجك وسوقك المستهدف. <em>وسنخبرك بطريق الدخول.</em>',
      footerText: 'رسالة قصيرة واحدة تكفي للبدء. سنعود إليك بتقييم صادق وخطوة أولى واضحة.',
      footerButton: 'تواصل معنا',
      footerReply: 'عادةً نرد خلال يوم عمل واحد',
      footerBrand: 'وكيلك المحلي لدخول السوق الصحي، تسجيل المنتجات، المناقصات الحكومية، التوزيع، والتشغيل في الشرق الأوسط.',
      footerColServices: 'خدماتنا',
      footerServiceLinks: [
        ['دخول السوق والوكالة المحلية', 'market-entry'],
        ['تسجيل المنتجات والمناقصات', 'regulatory'],
        ['التوزيع والمبيعات والمستثمرون', 'commercial'],
        ['المنشآت الصحية والتشغيل', 'projects'],
        ['التصنيع المحلي', 'localization'],
      ],
      footerColExplore: 'استكشف',
      footerHome: 'الرئيسية',
      footerAllServices: 'كل الخدمات',
      footerMarkets: 'الأسواق',
      footerAbout: 'من نحن',
      footerColContact: 'تواصل',
      footerCountries: 'السعودية · الإمارات · مصر · سوريا',
      footerEnquiry: 'أرسل رسالة آمنة',
      footerRights: 'جميع الحقوق محفوظة',
      maps: {
        saudi: ['السعودية', 'تسجيل المنتجات لدى هيئة الغذاء والدواء، منصة اعتماد والمناقصات الحكومية، التصنيع المحلي، والتوزيع في كل المملكة.'],
        uae: ['الإمارات', 'تسجيل المنتجات لدى الجهات الصحية، الانطلاق الإقليمي من دبي، وشركاء التوزيع في الخليج.'],
        egypt: ['مصر', 'تسجيل المنتجات، التصنيع المحلي، تطوير التوزيع، والمشاريع الصحية.'],
        syria: ['سوريا', 'تمثيل محلي، توريد المستلزمات الطبية، بناء الشراكات، وتنسيق المشاريع.'],
      },
      formUnavailable: 'خدمة التحقق غير متاحة حالياً. يرجى مراسلتنا مباشرة.',
      formExpired: 'انتهت صلاحية التحقق الأمني. حاول مرة أخرى.',
      formLoadFailedRetry: 'تعذّر تحميل التحقق الأمني. حاول مرة أخرى.',
      formLoadFailedEmail: 'تعذّر تحميل التحقق الأمني. يرجى مراسلتنا مباشرة.',
      formComplete: 'يرجى إكمال التحقق الأمني قبل إرسال رسالتك.',
      formCouldNotSend: 'تعذّر إرسال رسالتك. حاول مرة أخرى.',
      formSending: 'جارٍ الإرسال…',
      formReceived: 'تم استلام رسالتك',
      formSend: 'إرسال الطلب',
    }
  : {
      skip: 'Skip to content',
      navHome: 'Home',
      navServices: 'Services',
      navMarkets: 'Markets',
      navAbout: 'About',
      navContact: 'Contact us',
      dropdownSmall: 'OUR SERVICES',
      dropdownTitle: 'From entry to operations.',
      dropdownText: 'Five services that move your product into the market.',
      menu: 'MENU',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      langSwitch: 'العربية',
      langSwitchLang: 'ar',
      langSwitchDir: 'rtl',
      fields: [
        ['Market Entry & Local Agency', 'market-entry'],
        ['Product Registration & Tenders', 'regulatory'],
        ['Distribution, Sales & Investors', 'commercial'],
        ['Healthcare Facilities & Operations', 'projects'],
        ['Local Manufacturing', 'localization'],
      ],
      footerKicker: 'Your next move',
      footerBridgeKicker: 'Regional presence',
      footerBridgeTitle: 'One local partner across four markets.',
      footerTitle: 'Tell us your product and target market. <em>We’ll tell you the way in.</em>',
      footerText: 'One short message is enough to start. We’ll come back with an honest assessment and a clear first step.',
      footerButton: 'Get in touch',
      footerReply: 'Typical reply within one business day',
      footerBrand: 'Your local agent for healthcare market entry, product registration, government tenders, distribution, and operations across the Middle East.',
      footerColServices: 'Services',
      footerServiceLinks: [
        ['Market entry & local agency', 'market-entry'],
        ['Product registration & tenders', 'regulatory'],
        ['Distribution, sales & investors', 'commercial'],
        ['Facilities & operations', 'projects'],
        ['Local manufacturing', 'localization'],
      ],
      footerColExplore: 'Explore',
      footerHome: 'Home',
      footerAllServices: 'All services',
      footerMarkets: 'Markets',
      footerAbout: 'About MAS',
      footerColContact: 'Contact',
      footerCountries: 'Saudi Arabia · UAE · Egypt · Syria',
      footerEnquiry: 'Send a secure enquiry',
      footerRights: 'All rights reserved',
      maps: {
        saudi: ['Saudi Arabia', 'SFDA product registration, Etimad and government tenders, local manufacturing, and nationwide distribution.'],
        uae: ['United Arab Emirates', 'Health-authority registration, regional launch from Dubai, and Gulf distribution partners.'],
        egypt: ['Egypt', 'Product registration, local manufacturing, distribution development, and healthcare projects.'],
        syria: ['Syria', 'Local representation, medical supply and imports, partnerships, and project coordination.'],
      },
      formUnavailable: 'Security verification is unavailable. Please email us directly.',
      formExpired: 'Security verification expired. Please try again.',
      formLoadFailedRetry: 'Security verification failed to load. Please try again.',
      formLoadFailedEmail: 'Security verification failed to load. Please email us directly.',
      formComplete: 'Please complete the security check before sending your enquiry.',
      formCouldNotSend: 'We could not send your enquiry. Please try again.',
      formSending: 'Sending…',
      formReceived: 'Message received',
      formSend: 'Send enquiry',
    };

const main = document.querySelector('main');

if (main && !main.id) main.id = 'content';

if (!document.querySelector('.skip') && main) {
  const skip = document.createElement('a');
  skip.className = 'skip';
  skip.href = '#content';
  skip.textContent = T.skip;
  document.body.prepend(skip);
}

const langSwitchHTML = `<a class="lang-switch" href="${altPath}" lang="${T.langSwitchLang}" dir="${T.langSwitchDir}" hreflang="${T.langSwitchLang}">${T.langSwitch}</a>`;

const fieldMenuLinks = T.fields
  .map(
    ([label, slug], index) =>
      `<a href="${P}/fields/${slug}.html"><span>0${index + 1}</span>${label} <b>${phIcon('arrow-square-out', { className: 'ph-icon--direction', size: 16 })}</b></a>`,
  )
  .join('');

const mobileFieldLinks = T.fields
  .map(([label, slug]) => `<a href="${P}/fields/${slug}.html">${label}</a>`)
  .join('');

const header = document.querySelector('#header');
if (header) {
  header.innerHTML = `
    <a class="brand" href="${P}/">
      <img src="${logoUrl}" alt="MAS International Care">
      <span>INTERNATIONAL CARE</span>
    </a>
    <nav aria-label="Primary navigation">
      <a href="${P}/">${T.navHome}</a>
      <div class="nav-fields">
        <a href="${P}/services.html">${T.navServices} ${phIcon('caret-down', { className: 'ph-icon--nav', size: 14 })}</a>
        <div class="dropdown">
          <div>
            <small>${T.dropdownSmall}</small>
            <h3>${T.dropdownTitle}</h3>
            <p>${T.dropdownText}</p>
          </div>
          <div>${fieldMenuLinks}</div>
        </div>
      </div>
      <a href="${P}/markets.html">${T.navMarkets}</a>
      <a href="${P}/about.html">${T.navAbout}</a>
    </nav>
    <div class="nav-actions">
      ${langSwitchHTML}
      <a class="nav-contact" href="${P}/contact.html">${T.navContact}</a>
      <button class="menu-button" aria-expanded="false" aria-label="${T.openMenu}"><i></i><i></i></button>
    </div>`;
}

const mobile = document.querySelector('#mobile-menu');
if (mobile) {
  mobile.className = 'mobile-menu';
  mobile.innerHTML = `
    <div><span>${T.menu}</span><button aria-label="${T.closeMenu}">${phIcon('x', { className: 'ph-icon--menu', size: 24 })}</button></div>
    <nav>
      <a href="${P}/">${T.navHome}</a>
      <details>
        <summary>${T.navServices} <span>${phIcon('caret-down', { className: 'ph-icon--menu', size: 20 })}</span></summary>
        ${mobileFieldLinks}
      </details>
      <a href="${P}/markets.html">${T.navMarkets}</a>
      <a href="${P}/about.html">${T.navAbout}</a>
      <a href="${P}/contact.html">${T.navContact}</a>
    </nav>
    ${langSwitchHTML}`;
}

const menuButton = document.querySelector('.menu-button');
const menuClose = document.querySelector('.mobile-menu > div button');

function setMenuOpen(open) {
  mobile?.classList.toggle('open', open);
  document.body.classList.toggle('locked', open);
  menuButton?.setAttribute('aria-expanded', String(open));
}

menuButton?.addEventListener('click', () => setMenuOpen(true));
menuClose?.addEventListener('click', () => setMenuOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

const footer = document.querySelector('#footer');
document.body.classList.toggle('has-page-cta', Boolean(document.querySelector('main > .cta')));

const footerServiceLinks = T.footerServiceLinks
  .map(([label, slug]) => `<a href="${P}/fields/${slug}.html">${label}</a>`)
  .join('');

if (footer) {
  footer.innerHTML = `
    <div class="footer-bridge">
      <span class="footer-bridge-icon" aria-hidden="true">${phIcon('globe-hemisphere-east', { className: 'ph-icon--bridge', size: 28 })}</span>
      <div class="footer-bridge-copy">
        <small>${T.footerBridgeKicker}</small>
        <strong>${T.footerBridgeTitle}</strong>
      </div>
      <div class="footer-bridge-markets" role="list" aria-label="${T.footerCountries}">
        <span role="listitem">KSA</span><span role="listitem">UAE</span><span role="listitem">EGY</span><span role="listitem">SYR</span>
      </div>
    </div>
    <div class="footer-shell">
      <div class="footer-cta">
        <div class="footer-cta-copy">
          <span class="footer-cta-kicker"><i></i>${T.footerKicker}</span>
          <h2>${T.footerTitle}</h2>
        </div>
        <div class="footer-cta-action">
          <p>${T.footerText}</p>
          <div>
            <a href="${P}/contact.html">${T.footerButton} <span>${phIcon('paper-plane-tilt', { className: 'ph-icon--action', size: 20 })}</span></a>
            <small>${phIcon('clock', { className: 'ph-icon--small', size: 17 })}${T.footerReply}</small>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="${logoUrl}" alt="MAS International Care">
          <p>${T.footerBrand}</p>
          <div class="footer-markets"><span>KSA</span><span>UAE</span><span>EGY</span><span>SYR</span></div>
        </div>
        <div class="footer-column">
          <h3>${T.footerColServices}</h3>
          ${footerServiceLinks}
        </div>
        <div class="footer-column">
          <h3>${T.footerColExplore}</h3>
          <a href="${P}/">${T.footerHome}</a>
          <a href="${P}/services.html">${T.footerAllServices}</a>
          <a href="${P}/markets.html">${T.footerMarkets}</a>
          <a href="${P}/about.html">${T.footerAbout}</a>
        </div>
        <div class="footer-column footer-contact">
          <h3>${T.footerColContact}</h3>
          <p>MAS International Care</p>
          <span>${T.footerCountries}</span>
          <a class="footer-contact-link" href="${P}/contact.html">${phIcon('lock-simple', { className: 'ph-icon--small', size: 16 })}${T.footerEnquiry}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 MAS INTERNATIONAL CARE</span>
        <div><span>${T.footerRights}</span></div>
      </div>
    </div>`;
}

const maps = T.maps;

const marketControls = document.querySelectorAll('[data-market]');

const previewMarket = (element) => {
    const selected = maps[element.dataset.market];
    if (!selected) return;

    marketControls.forEach((market) =>
      market.classList.toggle('active', market.dataset.market === element.dataset.market),
    );

    const mapName = document.querySelector('#map-name');
    const mapCopy = document.querySelector('#map-copy');
    if (mapName && mapCopy) {
      mapName.textContent = selected[0];
      mapCopy.textContent = selected[1];
    }
};

marketControls.forEach((element) => {
  element.addEventListener('mouseenter', () => previewMarket(element));
  element.addEventListener('focus', () => previewMarket(element));
});

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('shown')),
  { threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const submitButton = contactForm.querySelector('.submit');
  const submitLabel = submitButton.querySelector('span');
  const successMessage = contactForm.querySelector('.form-success');
  const errorMessage = contactForm.querySelector('.form-error');
  const turnstileContainer = contactForm.querySelector('#turnstile-widget');
  const developmentSiteKey = '1x00000000000000000000AA';
  const turnstileSiteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    (import.meta.env.DEV ? developmentSiteKey : '');
  let turnstileApi;
  let turnstileWidgetId;

  const setFormError = (message = '') => {
    errorMessage.textContent = message;
    errorMessage.hidden = !message;
  };

  const setVerificationReady = (ready) => {
    submitButton.disabled = !ready;
    turnstileContainer.dataset.state = ready ? 'verified' : 'waiting';
  };

  const loadTurnstile = () =>
    new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => resolve(window.turnstile), { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });

  if (!turnstileSiteKey) {
    turnstileContainer.dataset.state = 'error';
    setFormError(T.formUnavailable);
  } else {
    loadTurnstile()
      .then((api) => {
        turnstileApi = api;
        turnstileWidgetId = api.render(turnstileContainer, {
          sitekey: turnstileSiteKey,
          action: 'contact',
          appearance: 'interaction-only',
          size: 'flexible',
          theme: 'light',
          language: isAr ? 'ar' : 'en',
          callback: () => {
            setFormError();
            setVerificationReady(true);
          },
          'expired-callback': () => {
            setVerificationReady(false);
            setFormError(T.formExpired);
          },
          'error-callback': () => {
            setVerificationReady(false);
            setFormError(T.formLoadFailedRetry);
          },
        });
      })
      .catch(() => {
        turnstileContainer.dataset.state = 'error';
        setFormError(T.formLoadFailedEmail);
      });
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    successMessage.classList.remove('show');
    setFormError();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    if (!formData.get('cf-turnstile-response')) {
      setVerificationReady(false);
      setFormError(T.formComplete);
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitLabel.textContent = T.formSending;

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.message || T.formCouldNotSend);
      }

      contactForm.reset();
      submitLabel.textContent = T.formReceived;
      successMessage.classList.add('show');
    } catch (error) {
      submitLabel.textContent = T.formSend;
      setFormError(error.message || T.formCouldNotSend);
    } finally {
      submitButton.removeAttribute('aria-busy');
      setVerificationReady(false);
      if (turnstileApi && turnstileWidgetId !== undefined) {
        turnstileApi.reset(turnstileWidgetId);
      }
    }
  });
}
