// ===== Header scroll state =====
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const toggleMenu = (open) => {
  hamburger.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};
hamburger.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

// ===== AOS fade-in (whole site) =====
if (window.AOS) {
  // staggered groups (delay repeats within each grid/row)
  const staggered = [
    ['.hall-card', 90],
    ['.why-item', 90],
    ['.director-card', 120],
    ['.road-step', 70],
    ['.env-item', 80],
    ['.prog-card', 100],
    ['.map-app', 60],
    ['.loc-row', 90],
    ['.steps li', 70],
  ];
  staggered.forEach(([sel, step]) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.setAttribute('data-aos', 'fade-up');
      el.setAttribute('data-aos-delay', String((i % 4) * step));
    });
  });
  // simple fade-up (no stagger)
  const simple = [
    '.section-head', '.section-lead', '.road-copy', '.admission-form',
    '.detail-feature', '.detail-quote .container', '.cta-band .container',
    '.page-eyebrow', '.page-title', '.page-lead', '.global-list li',
  ];
  simple.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (!el.hasAttribute('data-aos')) el.setAttribute('data-aos', 'fade-up');
    });
  });

  AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 90, anchorPlacement: 'top-bottom' });
}

// ===== Admission form (demo — no backend yet) =====
const form = document.getElementById('admissionForm');
const note = document.getElementById('formNote');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  if (!name || !phone) {
    note.textContent = '이름과 연락처를 입력해 주세요.';
    return;
  }
  note.textContent = `${name} 학생 상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.`;
  form.reset();
});

// ===== Quick menu: scroll to top =====
document.querySelectorAll('.quick-top').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ===== Lenis smooth scroll =====
let lenis = null;
if (window.Lenis) {
  document.documentElement.style.scrollBehavior = 'auto';
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
  window.lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

// Smooth in-page anchor navigation
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ===== GSAP hero entrance =====
if (window.gsap && document.querySelector('.hero-inner')) {
  const heroEls = ['.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-halls', '.hero-cta']
    .map((s) => document.querySelector(s))
    .filter(Boolean);
  gsap.set(heroEls, { opacity: 0, y: 26 });
  gsap.to(heroEls, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.11, delay: 0.15 });
}

// ===== Swiper — IN CLASS gallery =====
if (window.Swiper && document.querySelector('.class-swiper')) {
  new Swiper('.class-swiper', {
    slidesPerView: 1.12,
    spaceBetween: 16,
    grabCursor: true,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    pagination: { el: '.class-swiper .swiper-pagination', clickable: true },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}
