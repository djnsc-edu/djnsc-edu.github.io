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
  // NOTE: `.section-lead` is intentionally omitted — it always lives inside
  // `.section-head`, so it fades in together with its parent as one block.
  // Giving it its own AOS caused a nested double-animation (e.g. the
  // "학원 둘러보기" link appearing out of sync in LEARNING ENVIRONMENT).
  const simple = [
    '.section-head', '.road-copy', '.admission-form',
    '.detail-feature', '.detail-quote .container', '.cta-band .container',
    '.page-eyebrow', '.page-title', '.page-lead', '.global-list li',
  ];
  simple.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      // skip elements nested inside an already-animated ancestor to avoid
      // parent/child double-animations that fall out of sync
      if (!el.hasAttribute('data-aos') && !el.closest('[data-aos]')) {
        el.setAttribute('data-aos', 'fade-up');
      }
    });
  });

  AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 90, anchorPlacement: 'top-bottom' });
}

// ===== Reservation modal (popup) =====
const reserveModal = document.getElementById('reserveModal');
if (reserveModal) {
  let lastFocused = null;
  const openReserve = () => {
    lastFocused = document.activeElement;
    if (typeof mobileMenu !== 'undefined' && mobileMenu.classList.contains('open')) toggleMenu(false);
    reserveModal.classList.add('open');
    reserveModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = reserveModal.querySelector('input:not([type="checkbox"]), select, textarea');
    if (first) setTimeout(() => first.focus(), 60);
  };
  const closeReserve = () => {
    reserveModal.classList.remove('open');
    reserveModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  document.querySelectorAll('[data-reserve-open]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); openReserve(); });
  });
  reserveModal.querySelectorAll('[data-reserve-close]').forEach((el) => {
    el.addEventListener('click', closeReserve);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reserveModal.classList.contains('open')) closeReserve();
  });

  // Open automatically when arriving from another page with #reserve
  if (location.hash === '#reserve') openReserve();
  window.addEventListener('hashchange', () => { if (location.hash === '#reserve') openReserve(); });

  window.openReserve = openReserve;
  window.closeReserve = closeReserve;
}

// ===== Reservation form (Web3Forms → 연결된 이메일로 전송) =====
const RESERVE_ACCESS_KEY = '95047e57-d2cf-4bd4-bacc-9278ae0c4880';
const reserveForm = document.getElementById('reserveForm');
if (reserveForm) {
  const note = document.getElementById('reserveNote');
  const submitBtn = document.getElementById('reserveSubmit');
  const setNote = (msg, type) => { note.textContent = msg; note.className = 'rf-note' + (type ? ' ' + type : ''); };

  // 학생 이름: 한글·영문·공백만 허용
  const nameEl = reserveForm.elements['name'];
  if (nameEl) {
    nameEl.addEventListener('input', () => {
      const cleaned = nameEl.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\s]/g, '');
      if (cleaned !== nameEl.value) nameEl.value = cleaned;
    });
  }

  // 연락처: 숫자만 입력받아 자동 하이픈
  const phoneEl = reserveForm.elements['phone'];
  const formatPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (/^01/.test(d)) {                                  // 휴대폰(010 등) → 3-4-4
      if (d.length <= 3) return d;
      if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
      return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    }
    if (d.startsWith('02')) {                              // 서울 지역번호
      if (d.length <= 2) return d;
      if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
      return `${d.slice(0, 2)}-${d.slice(2, d.length - 4)}-${d.slice(d.length - 4)}`;
    }
    if (d.length <= 3) return d;                           // 그 외 지역번호
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(d.length - 4)}`;
  };
  const ageEl = reserveForm.elements['age'];
  if (phoneEl) {
    phoneEl.addEventListener('input', () => {
      const atEnd = phoneEl.selectionStart === phoneEl.value.length;
      phoneEl.value = formatPhone(phoneEl.value);
      if (atEnd) phoneEl.setSelectionRange(phoneEl.value.length, phoneEl.value.length);
      // 11자리(숫자 기준)가 채워지면 다음 입력칸으로 자동 이동
      if (phoneEl.value.replace(/\D/g, '').length >= 11 && ageEl) ageEl.focus();
    });
  }

  // 상담신청 완료 토스트
  const toast = document.getElementById('reserveToast');
  let toastTimer = null;
  const showToast = () => {
    if (!toast) return;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast.setAttribute('aria-hidden', 'true');
    }, 2200);
  };

  reserveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const els = reserveForm.elements;
    const name = els['name'].value.trim();
    const phone = els['phone'].value.trim();
    const achievement = els['achievement'].value.trim();
    const preferred = els['preferred'].value.trim();
    if (!name || !phone) {
      setNote('학생 이름과 연락처를 입력해 주세요.', 'error');
      return;
    }
    if (!achievement) {
      setNote('성취도를 선택해 주세요.', 'error');
      els['achievement'].focus();
      return;
    }
    if (!preferred) {
      setNote('희망 상담 시간을 입력해 주세요.', 'error');
      els['preferred'].focus();
      return;
    }
    if (!els['privacy'].checked) {
      setNote('개인정보 수집·이용에 동의해 주세요.', 'error');
      els['privacy'].focus();
      return;
    }

    const fd = new FormData(reserveForm);
    fd.append('access_key', RESERVE_ACCESS_KEY);
    fd.append('subject', '[도전과성취] 새 상담예약 접수');
    fd.append('from_name', '도전과성취 홈페이지');

    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중…';
    setNote('', '');
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        reserveForm.reset();
        setNote('', '');
        if (window.closeReserve) window.closeReserve();
        showToast();
      } else {
        setNote('전송에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'error');
      }
    } catch {
      setNote('네트워크 오류로 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
}

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
    if (a.hasAttribute('data-reserve-open')) return; // handled by reservation modal
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
