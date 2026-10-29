document.documentElement.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navigation: mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
}));

// Highlight the nav link for the section currently in the middle of the viewport
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const current = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionObserver.observe(section);
  });
}

// Fade content in as it scrolls into view
const revealItems = document.querySelectorAll('.service-card, .bento-tile, .reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

// Hero: gentle parallax on the background photo
const heroMedia = document.querySelector('.hero-media');
if (heroMedia && !reduceMotion) {
  let heroTicking = false;
  window.addEventListener('scroll', () => {
    if (heroTicking) return;
    heroTicking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroMedia.style.setProperty('--hero-shift', `${y * 0.25}px`);
      heroTicking = false;
    });
  }, { passive: true });
}

// Gallery: every photo (the large one and the community strip) opens in one viewer
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxThumbs = document.querySelector('#lightbox-thumbs');
const pad = n => String(n).padStart(2, '0');
const lightboxItems = [...document.querySelectorAll('#gallery [data-gallery-item]')].map(button => {
  const image = button.querySelector('img');
  return {
    button,
    src: image.getAttribute('src'),
    alt: image.alt,
    kicker: button.dataset.kicker || '',
    caption: button.dataset.caption || image.alt
  };
});
let lightboxIndex = 0;
const thumbButtons = lightboxItems.map((item, index) => {
  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'lightbox-thumb';
  thumb.setAttribute('aria-label', `Show photo ${index + 1}: ${item.alt}`);
  thumb.innerHTML = `<img src="${item.src}" alt="">`;
  thumb.addEventListener('click', () => showPhoto(index));
  lightboxThumbs.append(thumb);
  return thumb;
});
const showPhoto = index => {
  lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
  const item = lightboxItems[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  document.querySelector('#lightbox-kicker').textContent = item.kicker;
  document.querySelector('#lightbox-caption').textContent = item.caption;
  document.querySelector('#lightbox-count').textContent = `${pad(lightboxIndex + 1)} / ${pad(lightboxItems.length)}`;
  thumbButtons.forEach((thumb, i) => {
    const current = i === lightboxIndex;
    thumb.classList.toggle('is-current', current);
    if (current) thumb.setAttribute('aria-current', 'true');
    else thumb.removeAttribute('aria-current');
  });
  if (!reduceMotion) lightboxImage.animate([{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
};
lightboxItems.forEach((item, index) => item.button.addEventListener('click', () => {
  showPhoto(index);
  lightbox.showModal();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(lightboxIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(lightboxIndex + 1));
lightbox.addEventListener('click', event => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-figure')) lightbox.close();
});
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPhoto(lightboxIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(lightboxIndex + 1);
});
let touchStartX = null;
lightbox.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(deltaX) > 50) showPhoto(lightboxIndex + (deltaX < 0 ? 1 : -1));
  touchStartX = null;
});

// Listing search: price formatting, quick-start presets, and hand-off to IDX results
const searchForm = document.querySelector('#home-search');
const searchMessage = document.querySelector('#search-message');
const priceValue = value => Number(String(value || '').replace(/\D/g, ''));
searchForm.querySelectorAll('.price-input input').forEach(input => input.addEventListener('input', () => {
  const digits = input.value.replace(/\D/g, '').slice(0, 9);
  input.value = digits ? Number(digits).toLocaleString('en-US') : '';
}));

// Popular starting points fill the form, then flash it so the change is noticed
document.querySelectorAll('.quick-search').forEach(button => button.addEventListener('click', () => {
  searchForm.reset();
  Object.entries(JSON.parse(button.dataset.preset)).forEach(([name, value]) => { searchForm.elements[name].value = value; });
  searchForm.classList.remove('is-updated');
  void searchForm.offsetWidth;
  searchForm.classList.add('is-updated');
  if (window.innerWidth <= 900) searchForm.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
}));

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(searchForm);
  const min = priceValue(data.get('min'));
  const max = priceValue(data.get('max'));
  if (min && max && min > max) {
    searchMessage.textContent = 'Min price is higher than max price. Adjust the range and try again.';
    searchForm.querySelector('[name="min"]').focus();
    return;
  }

  // These standard IDX query fields are supported directly. City and property-type
  // values need account-specific IDs, so the visitor can finish those on IDX.
  const resultsUrl = new URL('https://theridgerealty.idxbroker.com/idx/results/listings');
  resultsUrl.searchParams.set('idxID', 'c015');
  if (min) resultsUrl.searchParams.set('lp', String(min));
  if (max) resultsUrl.searchParams.set('hp', String(max));
  const beds = Number.parseInt(String(data.get('beds') || '').replace('+', ''), 10);
  const baths = Number.parseInt(String(data.get('baths') || '').replace('+', ''), 10);
  if (Number.isFinite(beds) && beds > 0) resultsUrl.searchParams.set('bd', String(beds));
  if (Number.isFinite(baths) && baths > 0) resultsUrl.searchParams.set('tb', String(baths));
  const sortCodes = {
    'Newest': 'newest',
    'Oldest': 'oldest',
    'Least Expensive to Most': 'pra',
    'Most Expensive to Least': 'prd',
    'Bedrooms (Low to High)': 'bda',
    'Bedrooms (High to Low)': 'bdd',
    'Bathrooms (Low to High)': 'tba',
    'Bathrooms (High to Low)': 'tbd'
  };
  const sort = sortCodes[data.get('sort')];
  if (sort) resultsUrl.searchParams.set('srt', sort);

  searchMessage.textContent = 'Your price, bedroom, bath, and sort choices are carried over. Choose location and property type on the IDX search page.';
  window.open(resultsUrl.toString(), '_blank', 'noopener,noreferrer');
});

// Contact form: open the visitor's email app with the message filled in
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Website inquiry from ${data.get('name')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}
Email: ${data.get('email')}

${data.get('message') || ''}`);
  document.querySelector('#contact-message').textContent = 'Your email app is opening with your message ready to send.';
  window.location.href = `mailto:info@marcimetzger.com?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
