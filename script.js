/* Ohsoluvly — Midnight Patisserie */
'use strict';

/* ------------------------------------------------------------------
   SITE CONFIG — fill these in before launch
   ------------------------------------------------------------------ */
const SITE_CONFIG = {
  // Where inquiry form submissions go. Easiest option: FormSubmit —
  // replace hello@ohsoluvly.com with Jesse's real email, submit the form
  // once from the live site, and click the activation email FormSubmit sends.
  // (File uploads are supported.) Docs: https://formsubmit.co
  formEndpoint: 'https://formsubmit.co/ajax/hello@ohsoluvly.com',
};

/* ---------- mobile menu ---------- */
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- header shadow on scroll ---------- */
const header = document.querySelector('.site-header');
addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', scrollY > 12);
}, { passive: true });

/* ---------- lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxBody = document.getElementById('lightbox-body');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeButton = lightbox?.querySelector('.lightbox-close');

document.querySelectorAll('.gallery-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!lightbox || !lightboxBody) return;
    // Clone the card's visual (photo slot today, real <img> tomorrow)
    lightboxBody.innerHTML = '';
    const visual = card.querySelector('.photo-slot, img')?.cloneNode(true);
    if (visual) lightboxBody.appendChild(visual);
    if (lightboxCaption) lightboxCaption.textContent = card.dataset.alt || '';
    lightbox.showModal();
  });
});
closeButton?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) lightbox.close();
});
addEventListener('keydown', event => {
  if (event.key === 'Escape' && lightbox?.open) lightbox.close();
});

/* ---------- reveal on scroll ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ---------- footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- inquiry form ---------- */
const form = document.getElementById('inquiry-form');
const formError = document.getElementById('form-error');
const formSuccess = document.getElementById('form-success');

// Event date can't be in the past
const dateInput = document.getElementById('f-date');
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
}

function showError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function clearError() {
  if (!formError) return;
  formError.hidden = true;
  formError.textContent = '';
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  clearError();

  // Honeypot: bots fill this, humans don't
  if (document.getElementById('f-company')?.value) return;

  const data = new FormData(form);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const eventDate = (data.get('event_date') || '').toString();
  const eventType = (data.get('event_type') || '').toString();
  const servings = (data.get('servings') || '').toString();

  if (!name || !email || !eventDate || !eventType || !servings) {
    showError('Please fill in your name, email, event date, event type, and servings.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('That email doesn\u2019t look quite right \u2014 mind double-checking it?');
    return;
  }

  const submitButton = form.querySelector('.form-submit');
  submitButton.disabled = true;
  const originalLabel = submitButton.textContent;
  submitButton.textContent = 'Sending\u2026';

  try {
    const response = await fetch(SITE_CONFIG.formEndpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('bad response: ' + response.status);
    form.reset();
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (err) {
    showError('Something went wrong sending your inquiry. Please try again \u2014 or email us directly and we\u2019ll take it from there.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});
