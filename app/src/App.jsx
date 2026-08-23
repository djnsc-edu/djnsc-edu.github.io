import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import './App.css'
import logoMark from './assets/logo_s-w.png'
import logoDark from './assets/logo_s.png'
import s6Bg from './assets/debora-pilati-dOG0z4-gqp0-unsplash.webp'
import iconNaverMap from './assets/icon-naver-map.png'
import iconKakaoMap from './assets/icon-kakao-map.png'
import iconGoogleMap from './assets/icon-google-map.png'
import iconTmap from './assets/icon-tmap.png'

gsap.registerPlugin(ScrollTrigger)

// Lenis 인스턴스 참조(앵커 스무스 스크롤용) — App에서 주입
let lenisRef = null

const NAV_LEFT = [
  { label: '학원소개', href: '#about' },
  { label: '강사진', href: '#teachers' },
  { label: '교육과정', href: '#program' },
]
const NAV_RIGHT = [
  { label: '학습단계', href: '#process' },
  { label: '상담문의', href: '#contact' },
  { label: '오시는 길', href: '#location' },
]

// Lenis로 부드럽게 이동 (헤더는 아래로 스크롤 시 자동 숨김이라 오프셋 없이 상단에 딱 맞춤)
const scrollToHash = (e, href) => {
  e.preventDefault()
  const el = document.querySelector(href)
  if (!el) return
  if (lenisRef) lenisRef.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

// 원본과 동일하게 각 글자를 <span class="char">으로 분리
function SplitChars({ text }) {
  return text.split('\n').flatMap((line, i) => {
    const chars = [...line].map((ch, j) =>
      ch === ' '
        ? <span key={`${i}-s-${j}`} className="char char-space">&nbsp;</span>
        : <span key={`${i}-c-${j}`} className="char">{ch}</span>
    )
    if (i > 0) chars.unshift(<br key={`br-${i}`} />)
    return chars
  })
}

// 레퍼런스(SORO) 방식 글자 리빌: 진입 시 글자별로 blur(8px)→0 + opacity 0→1
// (transition-delay 0.03s stagger). 섹션 제목 등에 재사용.
function CharReveal({ text }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll('.char')
    chars.forEach((c, i) => { c.style.transitionDelay = `${i * 0.03}s` })

    const reveal = () => el.classList.add('is-in')
    // 초기화는 항상 '화면 밖'에서만 호출됨 → 트랜지션 없이 즉시 되돌려
    // '사라지는' 모션이 보이지 않게 함(다음 진입 시 다시 재생).
    const reset = () => {
      el.classList.add('no-anim')
      el.classList.remove('is-in')
      void el.offsetWidth // 강제 리플로우로 즉시 반영
      el.classList.remove('no-anim')
    }

    // 리빌: 진입(아래→위/위→아래 재진입) 시 재생
    const stReveal = ScrollTrigger.create({
      trigger: el, start: 'top 85%', end: 'bottom top',
      onEnter: reveal, onEnterBack: reveal,
    })
    // 초기화: 요소가 완전히 화면 밖으로 나갔을 때만(위/아래 모두) 조용히 리셋
    const stReset = ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onLeave: reset, onLeaveBack: reset,
    })
    return () => { stReveal.kill(); stReset.kill() }
  }, [])
  return <span className="char-rv" ref={ref}><SplitChars text={text} /></span>
}

function Header({ onOpenReservation }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let lastY = 0
    const onScroll = () => {
      const y = window.scrollY
      if (y > 50) {
        setScrolled(true)
        setHidden(y > lastY)
      } else {
        setScrolled(false)
        setHidden(false)
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}${hidden && !menuOpen ? ' hide' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <div className="header-wrap">
        <nav className="nav">
          <div className="nav-list">
            <div className="nav-brand">
              <a href="#" title="메인으로" className="brand-logo">
                <span className="brand-mark" aria-hidden="true">
                  <img className="brand-mark-w" src={logoMark} alt="" />
                  <img className="brand-mark-d" src={logoDark} alt="" />
                </span>
                <span className="brand-logo-ko">도전과성취</span>
              </a>
            </div>
            <div className="nav-center">
              {[...NAV_LEFT, ...NAV_RIGHT].map(({ label, href }) => (
                <a key={label} href={href} className="nav-link" onClick={(e) => scrollToHash(e, href)}>{label}</a>
              ))}
            </div>
            <div className="nav-right">
              <button type="button" className="reservation-btn" onClick={onOpenReservation}>
                <span>상담예약</span>
              </button>
              <button
                type="button"
                className={`nav-burger${menuOpen ? ' is-open' : ''}`}
                aria-label="메뉴 열기"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </nav>
      </div>
      <div className={`nav-mobile${menuOpen ? ' is-open' : ''}`}>
        <div className="nav-mobile-list">
          {[...NAV_LEFT, ...NAV_RIGHT].map(({ label, href }) => (
            <a key={label} href={href} className="nav-mobile-link" onClick={(e) => { scrollToHash(e, href); setMenuOpen(false) }}>{label}</a>
          ))}
          <button
            type="button"
            className="nav-mobile-cta"
            onClick={() => { setMenuOpen(false); onOpenReservation() }}
          >
            상담예약
          </button>
        </div>
      </div>
      <div
        className={`nav-mobile-dim${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      ></div>
    </header>
  )
}

// public 폴더 자산은 배포 base(/djnsc-edu/)를 붙여야 함 (루트 절대경로면 base가 빠짐)
const pub = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '')
const ICON_BASE = import.meta.env.BASE_URL + 'fq/'

// 상담 예약 폼 전송(Web3Forms) — https://web3forms.com 에서 rnrudgh@gmail.com 로 발급받은 키로 교체
// (이 키는 클라이언트에 노출돼도 안전: 지정 이메일로만 발송되며 스팸 보호 내장)
const WEB3FORMS_ACCESS_KEY = '95047e57-d2cf-4bd4-bacc-9278ae0c4880'

function FloatingMenu() {
  const [snsOpen, setSnsOpen] = useState(false)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const contactHref = '#contact'

  return (
    <aside className="footer-quick">
      <ul className="fq-list">
        {/* Kakao */}
        <li className="fq-item">
          <a
            href={contactHref}
            className="fq-circle"
            aria-label="도전과 성취 학원 상담"
          >
            <img src={`${ICON_BASE}icon-kakao.svg`} alt="상담" width={25} height={23} />
          </a>
        </li>

        {/* Phone */}
        <li className="fq-item">
          <a href={contactHref} className="fq-circle" aria-label="도전과 성취 학원 문의">
            <img src={`${ICON_BASE}icon-phone.svg`} alt="문의" width={20} height={20} />
          </a>
        </li>

        {/* SNS Toggle */}
        <li className="fq-item fq-sns">
          <button
            type="button"
            className="fq-circle fq-sns-toggle"
            onClick={() => setSnsOpen((v) => !v)}
            aria-expanded={snsOpen}
            aria-label="SNS 열기"
          >
            <span className="fq-sns-label">SNS</span>
            <img
              src={`${ICON_BASE}icon-lang-arrow.svg`}
              alt=""
              width={10}
              height={10}
              className={`fq-sns-arrow${snsOpen ? ' open' : ''}`}
            />
          </button>
          <div className={`fq-sns-panel${snsOpen ? ' open' : ''}`} aria-hidden={!snsOpen}>
            <div className="fq-sns-inner">
              <a href={contactHref} className="fq-circle fq-sns-item" aria-label="인스타그램 준비중">
                <img src={`${ICON_BASE}icon-instagram.svg`} alt="Instagram" width={20} height={20} />
              </a>
              <a href={contactHref} className="fq-circle fq-sns-item" aria-label="유튜브 준비중">
                <img src={`${ICON_BASE}icon-youtube.svg`} alt="YouTube" width={20} height={20} />
              </a>
              <a href="#" className="fq-circle fq-sns-item" aria-label="위챗">
                <img src={`${ICON_BASE}icon-wechat.svg`} alt="WeChat" width={20} height={20} />
              </a>
              <a href="#" className="fq-circle fq-sns-item" aria-label="라인">
                <img src={`${ICON_BASE}icon-line.svg`} alt="LINE" width={20} height={20} />
              </a>
            </div>
          </div>
        </li>

        {/* TOP */}
        <li className="fq-item">
          <button type="button" className="fq-circle fq-top" onClick={scrollToTop} aria-label="맨 위로 TOP">
            TOP
          </button>
        </li>
      </ul>
    </aside>
  )
}

const S3_ROADMAP = [
  { month: '3–4월', title: '학기 진단 · 레벨별 반편성', level: '전 학년' },
  { month: '5월', title: 'KMO 1차 · KJMO 예선', level: '중·고등' },
  { month: '6월', title: 'HME 학력평가 (상반기)', level: '초·중등' },
  { month: '7–8월', title: '여름 심화 · KMO 2차 대비', level: '중·고등' },
  { month: '9–10월', title: 'KMO 2차 · 대입 수리논술 대비', level: '고등' },
  { month: '11월', title: 'KMC · HME (하반기)', level: '초·중등' },
  { month: '12월', title: '겨울 심화 · 다음 시즌 설계', level: '전 학년' },
]

function Section3() {
  return (
    <section className="s3">
      <div className="s3-container">
        <div className="s3-title-bx">
          <p className="s3-cate">Competition Roadmap</p>
          <h2 className="s3-tit">연간 경시대회 로드맵</h2>
        </div>
        <p className="s3-road-lead">
          한 해 동안 준비하는 주요 경시·올림피아드 일정을 학년과 단계에 맞춰 설계합니다.
        </p>

        <ol className="s3-road">
          {S3_ROADMAP.map((it, i) => (
            <li className="s3-road-item" key={i}>
              <span className="s3-road-dot" aria-hidden="true" />
              <p className="s3-road-month">{it.month}</p>
              <p className="s3-road-tit">{it.title}</p>
              <span className="s3-road-level">{it.level}</span>
            </li>
          ))}
        </ol>
        <p className="s3-road-note">* 대회 일정은 매년 주최 측 공고에 따라 변동될 수 있습니다.</p>
      </div>
      <div className="s3-track">
        {[0,1,2,3,4,5,6,7].map(i => (
          <span key={i} className="s3-track-txt">CHALLENGE &amp; ACHIEVEMENT&nbsp;·&nbsp;</span>
        ))}
      </div>
    </section>
  )
}

// ⚠︎ 예시(임의) 학력·경력 — 실제 정보로 교체 필요
const S4_TEACHERS = [
  {
    photo: '/images/s4/gt.webp',
    role: 'Mathematics',
    name: '구경호',
    subject: '수학',
    position: 'Lead Teacher',
    title: '수학 교육 전문가',
    desc: [
      '정답보다 과정을 가르칩니다,',
      '스스로 해결하는 힘을 기르는 수업',
    ],
    quote: [
      '복잡한 문제를 해결하려면 먼저 조건을 정확히 이해하고,',
      '해결 과정을 논리적으로 설계한 뒤,',
      '도출한 결과가 올바른지 끊임없이 검증해야 합니다.',
    ],
    philosophy: [
      '그래서 저는 정답을 빠르게 알려주지 않습니다.',
      '스스로 해결의 실마리를 찾도록 돕습니다.',
    ],
    edu: ['카이스트 전기전자공학과 박사', '수학·물리·소프트웨어 교육 전문가', '영재고·대학 입시 전문가'],
    career: [
      'KMO · KJMO 등 수학 경시·올림피아드 대비 지도',
      '국제 유학 입시학원 수학 지도 경력',
      '대치동 수리논술 지도',
      '내신·수능 및 심화 수학 지도',
      '자체 수학 교재 연구·제작',
    ],
  },
  {
    photo: '/images/s4/bonsu-t.webp',
    role: 'Mathematics',
    name: '구본수',
    subject: '수학 · 수리논술',
    position: 'Lead Teacher',
    title: '수리논술 전문가',
    desc: [
      '생각을 정리하여 설명하고,',
      '논리로 답안을 완성하는 수업',
    ],
    quote: [
      '수학은 답이 아니라 과정으로 증명하는 과목입니다.',
      '그 과정을 파고드는 재미를 학생에게 전하고 싶습니다.',
    ],
    philosophy: [
      '그래서 저는 한 문제도 대충 넘기지 않습니다.',
      '학생이 스스로 납득할 때까지 함께 고민합니다.',
    ],
    edu: ['KAIST 수리과학과'],
    career: [
      '대치동 수리논술 지도',
      '중·고 수학 심화·개념 지도',
      '자체 수학 교재 연구·제작',
    ],
  },
]

function Section4() {
  const [active, setActive] = useState(0)
  const t = S4_TEACHERS[active]
  return (
    <section id="teachers" className="s4">
      <div
        className="s4-bg"
        aria-hidden="true"
        style={{ background: `linear-gradient(rgba(42,33,28,0.5), rgba(42,33,28,0.62)), url(${pub('/images/s4-bg.webp')}) center / cover no-repeat` }}
      />
      <div className="s4-container">
        <div className="s4-head">
          <p className="s4-cate"><CharReveal text="TEACHERS" /></p>
          <h2 className="s4-tit"><CharReveal text="KAIST 원장진의 이공계 영재·입시 전문교육" /></h2>
        </div>

        <div className="s4-tabs" role="tablist">
          {S4_TEACHERS.map((tt, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              className={`s4-tab${active === i ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {tt.name} 원장
            </button>
          ))}
        </div>

        <div className="s4-teachers">
          <div className="s4-row" key={active}>
            <div className="s4-left">
              <div className="s4-profile">
                {t.photo && (
                  <div className="s4-img-bx">
                    <img src={pub(t.photo)} loading="lazy" alt={`${t.name} 강사`} />
                  </div>
                )}
                <div className={`s4-profile-txt${t.photo ? ' has-photo' : ''}`}>
                  <p className="s4-name-en">{t.position}</p>
                  <h3 className="s4-name-ko">{t.name} T</h3>
                </div>
              </div>
            </div>
            <div className="s4-right">
              <div className="s4-title-bx">
                <h2 className="s4-t-tit">{t.title}</h2>
              </div>
              <p className="s4-t-desc">
                {t.desc.map((l, j) => <span key={j}>{l}<br /></span>)}
              </p>
              <div className="s4-t-quote-bx">
                <img src={pub('/icons/quote.svg')} loading="lazy" alt="" className="s4-t-quote-icon" />
                <p className="s4-t-quote">
                  {t.quote.map((l, j) => <span key={j}>{l}<br /></span>)}
                </p>
              </div>
              <p className="s4-t-body">
                {t.philosophy.map((l, j) => <span key={j}>{l}<br /></span>)}
              </p>
              <ul className="s4-t-list">
                {[...t.edu, ...t.career].map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 수업 사진 (src/assets/class-0?.webp)
const CLASS_MODULES = import.meta.glob('./assets/class-0?.webp', { eager: true, import: 'default' })
const classImg = (n) => CLASS_MODULES[`./assets/${n}.webp`]

const S5DATA = {
  i1: { img: classImg('class-05'), tit: '영재·심화수학', desc: '초등부터 시작하는 깊이 있는 수학적 사고로\n영재·심화 과정을 지도합니다.' },
  i2: { img: classImg('class-09'), tit: '수학경시', desc: 'HME·KMC 등 전국 수학경시를\n기초부터 실전까지 단계별로 대비합니다.' },
  i3: { img: classImg('class-06'), tit: '정보올림피아드', desc: '알고리즘적 사고를 바탕으로\n정보올림피아드를 체계적으로 준비합니다.' },
  i4: { img: classImg('class-07'), tit: '영재고·과학고 입시', desc: '최상위 수학과 과학 심화로\n영재고·과학고 입시를 대비합니다.' },
  i5: { img: classImg('class-08'), tit: '대입수학·수리논술', desc: '고등 최상위 수학과 대입 수리논술,\n국제학교 수학 입시까지 지도합니다.' },
}

function S5Text({ tit, desc, layout }) {
  return (
    <div className={`s5-txt s5-txt--${layout}`}>
      <div className="s5-txt-inner">
        <h4 className="s5-item-tit">{tit}</h4>
        <p className="s5-item-desc">
          {desc.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
        </p>
      </div>
    </div>
  )
}

function S5Image({ img, tit, num, pos }) {
  return (
    <div className={`s5-img s5-img--${pos}`}>
      <div className="s5-img-inner">
        <img src={img} loading="lazy" alt={tit} />
      </div>
      {num && <p className="s5-num">{num}</p>}
    </div>
  )
}

function Section5() {
  const d = S5DATA
  const secRef = useRef(null)

  useEffect(() => {
    const root = secRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      // 레퍼런스와 동일: 이미지 scale(1.15)→scale(1) 줌아웃 (.scale-on 토글, CSS 1.5s ease)
      gsap.utils.toArray('.s5-img-inner').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 82%', once: true,
          onEnter: () => el.classList.add('scale-on'),
        })
      })
      // 레퍼런스(AOS fade-up) 방식: 텍스트 블록(제목+설명) 전체 리빌
      gsap.utils.toArray('.s5-txt-inner').forEach((el) => {
        gsap.from(el, {
          y: 40, autoAlpha: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="program" className="s5" ref={secRef}>
      <div className="s5-frame" aria-hidden="true" />
      <div className="s5-container">
        <div className="s5-tophead">
          <div className="s5-title-bx">
            <p className="s5-cate"><CharReveal text="Programs" /></p>
            <h2 className="s5-tit"><CharReveal text="도전과성취의 교육과정" /></h2>
          </div>
          <div className="s5-topbox" aria-hidden="true" />
        </div>
        <div className="s5-board">
          {/* Row 1: 01 텍스트-위 | 02 이미지-위 */}
          <div className="s5-row">
            <div className="s5-item s5-i1">
              <S5Text {...d.i1} layout="inline" />
              <S5Image {...d.i1} num="01" pos="tr" />
            </div>
            <div className="s5-item s5-i2">
              <S5Image {...d.i2} num="02" pos="br" />
              <S5Text {...d.i2} layout="inline" />
            </div>
          </div>
          {/* Row 2: 03 텍스트-좌 / 이미지-우 (풀폭) */}
          <div className="s5-row">
            <div className="s5-item s5-i3">
              <S5Text {...d.i3} layout="stack" />
              <S5Image {...d.i3} num="03" pos="tl" />
            </div>
          </div>
          {/* Row 3: 04 이미지-좌 / 텍스트-우 | 05 이미지 */}
          <div className="s5-row">
            <div className="s5-item s5-i4">
              <S5Image {...d.i4} num="04" pos="tr" />
              <S5Text {...d.i4} layout="stack" />
            </div>
            <div className="s5-item s5-i5img s5-i5card">
              <S5Image {...d.i5} num="05" pos="tr2" />
              <div className="s5-i5txt-merged">
                <S5Text {...d.i5} layout="stack" />
              </div>
            </div>
          </div>
          {/* Row 4: 05 텍스트 (우측) */}
          <div className="s5-row s5-row--last">
            <div className="s5-item s5-i5txt s5-i5txt--desktop">
              <S5Text {...d.i5} layout="stack" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const RECORD_DATA = [
  { label: '수학 올림피아드', en: 'KMO · KJMO', results: ['1차 동상 · 은상 수상', '2차 동상 수상'] },
  { label: '내신 수학', en: 'School Record', results: ['정기고사 1등급 다수', '주요 학교 최상위권'] },
  { label: '수학 경시대회', en: 'KMC · HME', results: ['대상 · 금상 입상', '전국 상위권 성취'] },
  { label: '대학 진학', en: 'University', results: ['서울대 · 연세대 · 고려대 등', '서울 주요 대학 진학'] },
]

function SectionRecord() {
  return (
    <section className="srec">
      <div className="srec-container">
        <div className="srec-head">
          <p className="srec-cate">Track Record</p>
          <h2 className="srec-tit">지도 학생들의 실적</h2>
          <p className="srec-note">학원 설립 이전, 대표 원장이 직접 지도한 학생들이 이뤄낸 성과입니다.</p>
        </div>
        <ul className="srec-list">
          {RECORD_DATA.map(({ label, en, results }) => (
            <li key={en} className="srec-card">
              <p className="srec-card-en">{en}</p>
              <h3 className="srec-card-label">{label}</h3>
              <div className="srec-card-line" aria-hidden="true" />
              <ul className="srec-card-results">
                {results.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// 로컬 갤러리 이미지 (src/assets/s1.webp ~ s6.webp) 자동 로드·정렬
const S6_GALLERY_MODULES = import.meta.glob('./assets/s?.webp', { eager: true, import: 'default' })
const S6_GALLERY = Object.keys(S6_GALLERY_MODULES).sort().map((k) => S6_GALLERY_MODULES[k])

function Section6() {
  const mid = Math.floor(S6_GALLERY.length / 2)
  const GALLERY = S6_GALLERY.slice(Math.max(0, mid - 1), mid + 2) // 가운데 기준 3장만
  const CENTER = 1
  const secRef = useRef(null)

  useEffect(() => {
    const root = secRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      gsap.from('.s6-feature-item', {
        y: 48, autoAlpha: 0, duration: 1.4, ease: 'power2.out', stagger: 0.22,
        scrollTrigger: { trigger: '.s6-feature-list', start: 'top 85%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const FEATURES = [
    { icon: '/icons/feature1.svg', tit: '문제를 구조적으로 바라보는 힘', desc: '복잡한 문제도 조건을 정확히 이해하고 구조화하여, 스스로 해결의 실마리를 찾도록 지도합니다.' },
    { icon: '/icons/feature2.svg', tit: '원리를 깊이 이해하는 태도', desc: '공식을 외우는 데 그치지 않고 수학·물리·화학의 개념과 원리를 근본부터 이해하도록 가르칩니다.' },
    { icon: '/icons/feature3.svg', tit: '스스로 검증하는 습관', desc: '결과를 그대로 받아들이지 않고 근거를 확인하며, 더 나은 질문을 던지고 검증하는 습관을 기릅니다.' },
    { icon: '/icons/feature4.svg', tit: '다시 도전하는 경험', desc: '실패의 원인을 분석하고 다시 도전하며, 끝까지 해결책을 찾아가는 과정을 함께 경험합니다.' },
  ]
  return (
    <section className="s6" ref={secRef}>
      <div className="s6-bg" aria-hidden="true">
        <img src={s6Bg} alt="" loading="lazy" />
      </div>
      <div className="s6-container">
        <div className="s6-tit-wrap">
          <div className="s6-title-bx">
            <p className="s6-cate"><CharReveal text="HOW WE TEACH" /></p>
            <h2 className="s6-tit"><CharReveal text="정답이 아니라, 스스로 해결하는 힘을 가르칩니다." /></h2>
          </div>
        </div>
        <ul className="s6-feature-list">
          {FEATURES.map(({ icon, tit, desc }) => (
            <li key={tit} className="s6-feature-item">
              <div className="s6-feature-head">
                <div className="s6-feature-icon"><img src={pub(icon)} loading="lazy" alt="" /></div>
                <h4 className="s6-feature-tit">{tit}</h4>
              </div>
              <p className="s6-feature-desc">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="s6-gallery">
        <Swiper
          className="s6-cf"
          modules={[EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          initialSlide={CENTER}
          allowTouchMove={false}
          slidesPerView={2.4}
          coverflowEffect={{ rotate: 30, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
        >
          {GALLERY.map((img, i) => (
            <SwiperSlide key={i} className="s6-cf-slide">
              <img src={img} loading="lazy" alt="도전과 성취 학원 학습 공간" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

const S7_STEPS = [
  { num: '01', img: classImg('class-01'), tit: '레벨 진단 테스트', desc: '현재 실력과 사고 과정을 정확히 진단하고\n목표를 함께 설정합니다.' },
  { num: '02', img: classImg('class-03'), tit: '맞춤 커리큘럼 설계', desc: '학생별 수준과 목표에 맞춘\n중장기 학습 로드맵을 설계합니다.' },
  { num: '03', img: classImg('class-04'), tit: '심화 수업 & 훈련', desc: '원리 이해부터 심화·실전까지, 스스로 해결하는 훈련을 반복합니다.' },
  { num: '04', img: classImg('class-02'), tit: '피드백 & 검증', desc: '풀이 과정을 함께 검증하고 피드백하며\n다시 도전해 성취로 이끕니다.' },
]

function Section7() {
  const len = S7_STEPS.length
  const loopSteps = [...S7_STEPS, ...S7_STEPS, ...S7_STEPS] // 3배 복제: 양방향 무한 루프
  const [index, setIndex] = useState(len) // 가운데 세트에서 시작
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  // 슬라이드 폭 + gap을 실제 DOM에서 측정 → 반응형(모바일/태블릿) 대응
  const trackRef = useRef(null)
  const [step, setStep] = useState(541)

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      const slide = track?.querySelector('.s7-slide')
      if (!track || !slide) return
      const cs = getComputedStyle(track)
      const gap = parseFloat(cs.columnGap || cs.gap) || 0
      setStep(slide.getBoundingClientRect().width + gap)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const prev = () => setIndex((i) => i - 1)
  const next = () => setIndex((i) => i + 1)

  // 자동 슬라이드
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setIndex((i) => i + 1), 3500)
    return () => clearInterval(timer)
  }, [paused])

  // 끝에 도달하면 애니메이션 없이 가운데 세트로 스냅 → seamless 무한 루프
  const onTransitionEnd = () => {
    if (index >= len * 2) { setAnimate(false); setIndex((i) => i - len) }
    else if (index < len) { setAnimate(false); setIndex((i) => i + len) }
  }
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(id)
    }
  }, [animate])

  return (
    <section id="process" className="s7">
      <div className="s7-wrapper">
        <div className="s7-left">
          <div className="s7-title-bx">
            <p className="s7-cate"><CharReveal text="PROCESS" /></p>
            <h2 className="s7-tit"><CharReveal text="학습 단계 안내" /></h2>
          </div>
          <p className="s7-desc">학생의 현재 수준에서 시작해,<br />단계별로 실력을 쌓아갑니다.</p>
          <div className="s7-nav">
            <button type="button" className="s7-nav-btn" onClick={prev} aria-label="이전">
              <svg className="s7-nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="s7-nav-btn" onClick={next} aria-label="다음">
              <svg className="s7-nav-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="s7-right" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div
            ref={trackRef}
            className="s7-slides"
            style={{ transform: `translateX(-${index * step}px)`, transition: animate ? undefined : 'none' }}
            onTransitionEnd={onTransitionEnd}
          >
            {loopSteps.map(({ num, img, tit, desc }, i) => (
              <div key={i} className="s7-slide">
                <div className="s7-slide-img">
                  <img src={img} loading="lazy" alt={tit} />
                  <p className="s7-slide-num">{num}</p>
                </div>
                <div className="s7-slide-txt">
                  <h3 className="s7-slide-tit">{tit}</h3>
                  {desc && (
                    <p className="s7-slide-desc">
                      {desc.split('\n').map((l, k) => <span key={k}>{l}<br /></span>)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Section9({ onOpenReservation }) {
  return (
    <section id="contact" className="s9">
      <div className="s9-bg" aria-hidden="true">
        <img src={pub('/images/s9-bg.webp')} loading="lazy" alt="" />
      </div>
      <div className="s9-container">
        <div className="s9-cont">
          <div className="s9-title-bx">
            <p className="s9-cate">Admission Consulting</p>
            <h2 className="s9-tit">상담문의</h2>
          </div>
          <p className="s9-desc">모든 학습 계획은 충분한 상담과 레벨 진단 후, 학생별 목표에 맞게 개별 설계됩니다.</p>
          <div className="s9-btns">
            <button type="button" className="s9-btn s9-btn--kakao" onClick={onOpenReservation}>
              <img src={`${ICON_BASE}icon-kakao.svg`} alt="" width={25} height={23} />
              <span>방문 상담 안내</span>
            </button>
            <a href="#location" className="s9-btn s9-btn--tel">
              <img src={`${ICON_BASE}icon-phone.svg`} alt="" width={15} height={15} />
              <span>오시는 길 보기</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const NAVER_MAP_CLIENT_ID = '3m91eczfzm'
const ACADEMY_POS = { lat: 37.5037728, lng: 127.0099143 }
const ACADEMY_NAME = '도전과 성취 학원'
const ACADEMY_ADDR = '서울특별시 서초구 고무래로 6-3 삼공빌딩 6층'
const NAVER_MAP_LINK = `https://map.naver.com/p/search/${encodeURIComponent('서울특별시 서초구 고무래로 6-3')}`

// 지도 앱별 길찾기(목적지) 딥링크 — 지도 아래 네비게이션 버튼용
const MAP_APPS = [
  {
    key: 'naver',
    label: '네이버 지도',
    color: '#03C75A',
    icon: iconNaverMap,
    href: `https://map.naver.com/p/search/${encodeURIComponent(ACADEMY_ADDR)}`,
  },
  {
    key: 'kakao',
    label: '카카오맵',
    color: '#FEE500',
    icon: iconKakaoMap,
    href: `https://map.kakao.com/link/to/${encodeURIComponent(ACADEMY_NAME)},${ACADEMY_POS.lat},${ACADEMY_POS.lng}`,
  },
  {
    key: 'google',
    label: '구글 지도',
    color: '#4285F4',
    icon: iconGoogleMap,
    href: `https://www.google.com/maps/dir/?api=1&destination=${ACADEMY_POS.lat},${ACADEMY_POS.lng}`,
  },
  {
    key: 'tmap',
    label: '티맵',
    color: '#EB1C24',
    icon: iconTmap,
    href: `tmap://route?goalname=${encodeURIComponent(ACADEMY_NAME)}&goalx=${ACADEMY_POS.lng}&goaly=${ACADEMY_POS.lat}`,
  },
]

function loadNaverMaps(clientId) {
  if (window.naver?.maps) return Promise.resolve(window.naver)
  if (!window.__naverMapsPromise) {
    window.__naverMapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`
      s.async = true
      s.onload = () => resolve(window.naver)
      s.onerror = () => reject(new Error('naver maps load failed'))
      document.head.appendChild(s)
    })
  }
  return window.__naverMapsPromise
}

function NaverMap() {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let disposed = false
    loadNaverMaps(NAVER_MAP_CLIENT_ID)
      .then((naver) => {
        if (disposed || !ref.current) return
        const pos = new naver.maps.LatLng(ACADEMY_POS.lat, ACADEMY_POS.lng)
        const map = new naver.maps.Map(ref.current, {
          center: pos, zoom: 17, minZoom: 10,
          scaleControl: false, mapDataControl: false,
        })
        const marker = new naver.maps.Marker({ position: pos, map, title: ACADEMY_NAME })
        const infoWindow = new naver.maps.InfoWindow({
          content: `<div class="s10-map-iw"><strong>${ACADEMY_NAME}</strong><span>${ACADEMY_ADDR}</span></div>`,
          borderWidth: 0, backgroundColor: 'transparent', disableAnchor: false, pixelOffset: new naver.maps.Point(0, -4),
        })
        infoWindow.open(map, marker)
        naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap()) infoWindow.close()
          else infoWindow.open(map, marker)
        })
      })
      .catch(() => { if (!disposed) setFailed(true) })
    return () => { disposed = true }
  }, [])

  if (failed) {
    return (
      <a className="s10-map-placeholder" href={NAVER_MAP_LINK} target="_blank" rel="noreferrer">
        <p className="s10-map-label">{ACADEMY_NAME}</p>
        <p className="s10-map-address">{ACADEMY_ADDR}</p>
      </a>
    )
  }
  return <div ref={ref} className="s10-map-canvas" />
}

function Section10() {
  return (
    <section id="location" className="s10">
      <div className="s10-container">
        <div className="s10-colbx">
          <div className="s10-map">
            <div className="s10-map-box">
              <NaverMap />
            </div>
            <div className="s10-map-nav">
              <span className="s10-map-nav-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                길찾기
              </span>
              <div className="s10-map-apps">
                {MAP_APPS.map((app) => (
                  <a
                    key={app.key}
                    className={`s10-map-app s10-map-app--${app.key}`}
                    href={app.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ '--app-color': app.color }}
                  >
                    <img className="s10-map-app-icon" src={app.icon} alt="" width={20} height={20} />
                    {app.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="s10-right">
            <div className="s10-title-bx">
              <p className="s10-cate">Visit Us</p>
              <h3 className="s10-tit">오시는 길</h3>
            </div>
            <ul className="s10-info">
              <li className="s10-info-item">
                <h4 className="s10-info-head">Address</h4>
                <div className="s10-info-con">
                  <p className="s10-addr">서울특별시 서초구 고무래로 6-3 삼공빌딩 6층</p>
                </div>
              </li>
              <li className="s10-info-item">
                <h4 className="s10-info-head">Opening Hours</h4>
                <div className="s10-info-con">
                  <p className="s10-hours"><span className="s10-hours-label">· 월–금</span><span className="s10-hours-time">14:00 – 22:00</span></p>
                  <p className="s10-hours"><span className="s10-hours-label">· 토요일</span><span className="s10-hours-time">10:00 – 18:00</span></p>
                  <p className="s10-hours"><span className="s10-hours-label">· 일요일</span><span className="s10-hours-time">휴무</span></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <hr className="s10-hr" />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-wrap">
          <div className="footer-logo">
            <span className="footer-logo-ko">도전과성취</span>
            <span className="footer-logo-en">CHALLENGE &amp; ACHIEVEMENT</span>
          </div>
          <div className="footer-body">
            <div className="footer-info">
              <p className="footer-name">도전과성취학원</p>
              <div className="footer-row">
                <div className="footer-item"><span className="footer-tit">대표원장</span><span className="footer-txt">구민영</span></div>
                <span className="footer-bar" aria-hidden="true" />
                <div className="footer-item"><span className="footer-tit">연락처</span><span className="footer-txt">010-4667-9947</span></div>
                <span className="footer-bar" aria-hidden="true" />
                <div className="footer-item"><span className="footer-tit">사업자등록번호</span><span className="footer-txt">-</span></div>
              </div>
              <div className="footer-row">
                <div className="footer-item"><span className="footer-tit">주소</span><span className="footer-txt">서울특별시 서초구 고무래로 6-3 삼공빌딩 6층</span></div>
                <span className="footer-bar" aria-hidden="true" />
                <div className="footer-item"><span className="footer-tit">이메일</span><span className="footer-txt">-</span></div>
              </div>
            </div>
            <p className="footer-copyright">
              © 2026 도전과성취학원 (CHALLENGE &amp; ACHIEVEMENT). ALL RIGHTS RESERVED.<br />
              Today Challenge, <span className="footer-masstige">Lead Tomorrow.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Hero + Section2 통합 (인트로 → 핀 고정 텍스트 스왑 + 배경 크로스페이드) ──
// 제거: 원형 전환 / 동그라미 로고 낙하(EdgeMark) / 이미지 풀스크린 확장
// 유지: 학원 소개 문구가 fly-through로 교체 + 문구별 배경 크로스페이드
function ReservationModal({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleClose = () => {
    setSubmitted(false)
    setError('')
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = event.target
    const formData = new FormData(form)
    formData.append('access_key', WEB3FORMS_ACCESS_KEY)
    formData.append('subject', '[도전과성취] 새 상담 예약 접수')
    formData.append('from_name', '도전과성취 홈페이지')
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        form.reset()
      } else {
        setError('전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해주세요.')
      }
    } catch {
      setError('네트워크 오류로 전송하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="reservation-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-title">
      <button type="button" className="reservation-backdrop" aria-label="상담예약 닫기" onClick={handleClose} />
      <div className="reservation-panel">
        <button type="button" className="reservation-close" aria-label="상담예약 닫기" onClick={handleClose}>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        {submitted ? (
          <div className="reservation-complete">
            <p className="reservation-eyebrow">Reservation</p>
            <h2 id="reservation-title" className="reservation-title">상담 예약이 접수되었습니다.</h2>
            <p className="reservation-desc">
              남겨주신 내용이 정상적으로 전송되었습니다.<br />
              확인 후 순차적으로 연락드리겠습니다.
            </p>
            <button type="button" className="reservation-submit reservation-done" onClick={handleClose}>확인</button>
          </div>
        ) : (
          <>
            <div className="reservation-head">
              <p className="reservation-eyebrow">Reservation</p>
              <h2 id="reservation-title" className="reservation-title">상담 예약</h2>
              <p className="reservation-desc">
                학생의 현재 상황과 목표를 남겨주시면 맞춤 상담을 준비하겠습니다.
              </p>
            </div>
            <form className="reservation-form" onSubmit={handleSubmit}>
              <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />
              <label className="reservation-field">
                <span>학생 이름</span>
                <input name="studentName" type="text" placeholder="예: 김도전" required />
              </label>
              <label className="reservation-field">
                <span>학부모 연락처</span>
                <input name="phone" type="tel" placeholder="010-0000-0000" required />
              </label>
              <label className="reservation-field">
                <span>학년</span>
                <select name="grade" defaultValue="" required>
                  <option value="" disabled>선택해주세요</option>
                  <optgroup label="── 초등 ──">
                    <option>초등 1학년</option>
                    <option>초등 2학년</option>
                    <option>초등 3학년</option>
                    <option>초등 4학년</option>
                    <option>초등 5학년</option>
                    <option>초등 6학년</option>
                  </optgroup>
                  <optgroup label="── 중등 ──">
                    <option>중등 1학년</option>
                    <option>중등 2학년</option>
                    <option>중등 3학년</option>
                  </optgroup>
                  <optgroup label="── 고등 ──">
                    <option>고등 1학년</option>
                    <option>고등 2학년</option>
                    <option>고등 3학년</option>
                  </optgroup>
                  <option>기타</option>
                </select>
              </label>
              <label className="reservation-field">
                <span>관심 과정</span>
                <select name="program" defaultValue="" required>
                  <option value="" disabled>선택해주세요</option>
                  <option>영재·심화수학</option>
                  <option>내신 수학</option>
                  <option>수학경시</option>
                  <option>정보올림피아드</option>
                  <option>국제학교 수학</option>
                  <option>영재고·과학고 입시</option>
                  <option>고등 최상위·수능수학</option>
                  <option>대입 수리논술</option>
                  <option>상담 후 결정</option>
                </select>
              </label>
              <label className="reservation-field">
                <span>상담 희망 일자</span>
                <input name="preferredDate" type="date" />
              </label>
              <label className="reservation-field">
                <span>연락 가능 시간</span>
                <select name="contactTime" defaultValue="">
                  <option value="" disabled>선택해주세요</option>
                  <option>오전 (09:00~12:00)</option>
                  <option>오후 (12:00~18:00)</option>
                  <option>저녁 (18:00~22:00)</option>
                  <option>시간 무관</option>
                </select>
              </label>
              <label className="reservation-field reservation-field--full">
                <span>상담 내용</span>
                <textarea name="message" rows="3" placeholder="현재 학습 상황과 목표를 남겨주세요." />
              </label>
              <p className="reservation-note">
                남겨주신 내용은 학원 상담 담당자 이메일로 바로 전달됩니다.
              </p>
              {error && <p className="reservation-error">{error}</p>}
              <button type="submit" className="reservation-submit" disabled={submitting}>
                {submitting ? '전송 중…' : '상담 예약 남기기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function MergedHero() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // 새로고침 시 브라우저의 스크롤 위치 복원을 끄고 항상 최상단에서 시작.
    // (핀+scrub 히어로가 중간 위치에서 로드되면 인트로/스크롤 힌트가
    //  이미 지나간 상태로 계산돼 표시가 들쭉날쭉해지는 문제 방지)
    const prevRestoration = 'scrollRestoration' in window.history ? window.history.scrollRestoration : null
    if (prevRestoration !== null) window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const $ = (sel) => Array.from(root.querySelectorAll(sel))
    const one = (sel) => root.querySelector(sel)

    const mark = one('.mh-mark')
    const line = one('.mh-line')
    const titChars = $('.mh-tit .char')
    const descChars = $('.mh-desc .char')
    const scrollHint = one('.mh-scroll')
    const slides = $('.mh-slide')   // [intro, p1, p2, p3, p4]
    const bgs = $('.mh-bg')         // [video]
    const pin = one('.mh-pin')

    // ── 모바일 배경 영상 자동재생 보강 ──
    // muted+playsInline이면 대부분 자동재생되지만, iOS 저전력 모드 등에서 막힐 수 있어
    // 첫 사용자 상호작용(터치/클릭/스크롤) 시 재생을 한 번 더 시도한다.
    const heroVideo = one('.mh-bg--video video')
    const tryPlayVideo = () => { heroVideo?.play?.().catch(() => {}) }
    const onFirstInteract = () => {
      tryPlayVideo()
      window.removeEventListener('touchstart', onFirstInteract)
      window.removeEventListener('click', onFirstInteract)
      window.removeEventListener('scroll', onFirstInteract)
    }
    if (heroVideo) {
      tryPlayVideo()
      window.addEventListener('touchstart', onFirstInteract, { passive: true })
      window.addEventListener('click', onFirstInteract)
      window.addEventListener('scroll', onFirstInteract, { passive: true })
    }

    // ── 초기 상태 ──
    gsap.set(mark, { opacity: 0 })
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(scrollHint, { opacity: 0 })
    // 인트로 슬라이드는 보이게(글자는 from으로 개별 제어), 나머지는 아래에서 대기
    slides.forEach((s, i) =>
      gsap.set(s, i === 0 ? { y: 0, opacity: 1 } : { y: 150, opacity: 0 })
    )
    // 배경: 첫 영상만 표시
    bgs.forEach((b, i) => gsap.set(b, { opacity: i === 0 ? 1 : 0 }))

    // ── 인트로 (로드 시 1회) ──
    // 컨테이너를 먼저 보이게 → from()의 immediateRender가 각 글자를 opacity:0으로 고정
    const intro = gsap.timeline({ delay: 0.15 })
    intro
      .to(mark, { opacity: 1, duration: 0.9, ease: 'power2.out' })
      .to(line, { scaleX: 1, duration: 0.7, ease: 'power1.inOut' }, '-=0.25')
      .from(titChars, { opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'expo.out', stagger: 0.03 })
      .from(descChars, { opacity: 0, x: 28, duration: 0.64, ease: 'power3.out', stagger: 0.026 }, '-=0.35')
      .to(scrollHint, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2')

    // ── 스크롤 핀 시퀀스 ──
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: '+=2300',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    })

    // 스크롤 힌트: 시작과 함께 사라짐
    tl.to(scrollHint, { opacity: 0, duration: 3 }, 0)

    // 인트로 헤드라인 → 위로 완전히 퇴장 (로고 포함)
    tl.to(slides[0], { y: -150, opacity: 0, duration: 8 }, 3) // 3→11

    // 문구 1: 인트로가 완전히 사라진 뒤 등장 → 유지 → 퇴장
    tl.to(slides[1], { y: 0, opacity: 1, duration: 8 }, 12)     // 12→20
      .to(slides[1], { y: -150, opacity: 0, duration: 8 }, 27)  // 27→35

    // 문구 2: 문구1이 완전히 사라진 뒤 등장 → 유지 → 퇴장
    tl.to(slides[2], { y: 0, opacity: 1, duration: 8 }, 37)     // 37→45
      .to(slides[2], { y: -150, opacity: 0, duration: 8 }, 52)  // 52→60

    // 배경 전환 없이 배경 영상만 유지 (bg2 크로스페이드 제거)

    // 마지막 문구 퇴장 후 잠깐 유지한 뒤 핀 해제
    tl.to({}, { duration: 2 }, 62)

    return () => {
      intro.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
      window.removeEventListener('touchstart', onFirstInteract)
      window.removeEventListener('click', onFirstInteract)
      window.removeEventListener('scroll', onFirstInteract)
      if (prevRestoration !== null) window.history.scrollRestoration = prevRestoration
    }
  }, [])

  return (
    <section ref={rootRef} className="mh">
      <div className="mh-pin">
        {/* 배경 영상 레이어 */}
        <div className="mh-bgs" aria-hidden="true">
          <div className="mh-bg mh-bg--video">
            <video
              poster={pub('/videos/hero-poster.jpg')}
              autoPlay muted loop playsInline
            >
              <source src={pub('/videos/hero.webm')} type="video/webm" />
              <source src={pub('/videos/hero.mp4')} type="video/mp4" />
            </video>
          </div>
          <div className="mh-dim" />
        </div>

        {/* 텍스트 스테이지 */}
        <div className="mh-stage">
          {/* 인트로 (로고 포함 — 헤드라인과 함께 자연스럽게 퇴장) */}
          <div className="mh-slide mh-intro">
            <img
              className="mh-mark"
              src={logoMark}
              alt="" width={160} height={160}
            />
            <span className="mh-line" />
            <h2 className="mh-tit">
              <SplitChars text={'Today Challenge,\nLead Tomorrow.'} />
            </h2>
            <p className="mh-desc">
              <SplitChars text={'오늘의 도전이, 내일을 이끌어갑니다.\n스스로 도전하고 성취하는 교육, 도전과성취.'} />
            </p>
          </div>

          {/* 문구 1 */}
          <div className="mh-slide">
            <p className="mh-lead">학생의 다음 도전을 설계하는<br />최상위 수학 전문교육</p>
          </div>

          {/* 문구 2 */}
          <div className="mh-slide">
            <p className="mh-lead">학생의 가능성을<br />끝까지 끌어올립니다</p>
          </div>

        </div>

        {/* 스크롤 힌트 */}
        <div className="mh-scroll">
          <span className="mh-scroll-dot" aria-hidden="true" />
          <p className="label">Scroll to explore</p>
        </div>
      </div>
    </section>
  )
}

// 레퍼런스 section-main3 = "결과로 증명하는 전문성" (히어로 아래)
function Section2() {
  const secRef = useRef(null)

  useEffect(() => {
    const root = secRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.s3-count-list li').forEach((li) => {
        gsap.from(li, {
          y: 40, autoAlpha: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: li, start: 'top 88%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" className="s3" ref={secRef}>
      <div className="s3-container">
        <div className="s3-title-bx">
          <p className="s3-cate">Learning Begins with Challenge</p>
          <h2 className="s3-tit">도전에서 시작되는 배움</h2>
        </div>
        <div className="s3-point-txt">
          <p>
            <span>배움은 정답이 아니라, 스스로 부딪쳐보는 작은 도전에서 시작됩니다.</span><br />
            <span>탄탄한 기본기와 깊이 있는 사고로, 스스로 해결하는 힘을 기릅니다.</span>
          </p>
        </div>
        <div className="s3-colbx">
          <div className="s3-left" style={{ backgroundImage: `url(${S6_GALLERY[1]})` }}>
            <div className="s3-left-txt">
              <p className="s3-dec">도전과성취는 수학의 원리를 깊이 이해하고,<br />스스로 문제를 분석하고 해결하는 교육을 연구하는 학원입니다.</p>
              <p className="s3-sci">Today Challenge, Lead Tomorrow.</p>
            </div>
          </div>
          <div className="s3-right">
            <ul className="s3-count-list">
              <li>
                <p className="s3-point-title">초등부터 대입까지 이어지는 수학</p>
                <p className="s3-count-desc">학생의 수준과 목표에 따라 다음 단계를 설계합니다.</p>
              </li>
              <li>
                <p className="s3-point-title">소수정예 정원</p>
                <p className="s3-count-desc">한 명 한 명 밀착 관리합니다.</p>
              </li>
              <li>
                <p className="s3-point-title">개별 첨삭</p>
                <p className="s3-count-desc">막힐 때 언제든 함께합니다.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

const FAQ_DATA = [
  { q: '레벨 진단 테스트는 어떻게 진행되나요?', a: '현재 실력과 사고 과정을 함께 점검하는 1:1 진단으로 진행됩니다. 결과를 바탕으로 학생별 목표와 학습 방향을 함께 설계합니다.' },
  { q: '어떤 과목과 과정을 지도하나요?', a: '영재·심화수학부터 수학경시, 정보올림피아드, 국제학교 수학, 영재고·과학고 입시, 고등 최상위 수학과 대입 수리논술까지 학생의 단계와 목표에 맞춰 지도합니다.' },
  { q: '수업은 개별 지도인가요, 그룹 수업인가요?', a: '학생의 수준과 목표에 맞춰 맞춤 커리큘럼으로 운영되며, 막히는 문제는 언제든 1:1로 질문하고 스스로 해결하도록 돕습니다.' },
  { q: '학부모와의 소통은 어떻게 이루어지나요?', a: '학습 상황과 성장 과정을 정기적으로 점검해 리포트로 공유하고, 정기 상담을 통해 학부모와 긴밀하게 소통합니다.' },
  { q: '수업 시간과 등록 절차가 궁금합니다.', a: '상담 예약 후 레벨 진단 → 커리큘럼 설계 → 등록 순으로 진행됩니다. 자세한 시간표와 일정은 상담 시 안내해 드립니다.' },
  { q: '오픈 전인데 지금도 상담이 가능한가요?', a: '네, 사전 상담을 받고 있습니다. 상단의 상담예약 버튼 또는 하단 연락처로 문의하시면 순차적으로 안내해 드립니다.' },
]

function SectionFAQ({ onOpenReservation }) {
  const [open, setOpen] = useState(0)
  const rootRef = useRef(null)
  const pausedRef = useRef(false)

  // ── 자동 슬라이드: 4.5초마다 다음 질문으로 자동 전환(호버 중엔 정지) ──
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return
      setOpen((prev) => (prev + 1) % FAQ_DATA.length)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="sfaq" ref={rootRef}>
      <div className="sfaq-wrapper">
        <div className="sfaq-left">
          <p className="sfaq-cate"><CharReveal text="FAQ" /></p>
          <h2 className="sfaq-tit"><CharReveal text={'등록 전\n가장 많이 묻는 질문'} /></h2>
          <button type="button" className="sfaq-cta" onClick={onOpenReservation}>
            상담 예약하기
            <span className="sfaq-cta-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
        <ul
          className="sfaq-list"
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
        >
          {FAQ_DATA.map(({ q, a }, i) => {
            const isOpen = open === i
            return (
              <li
                key={i}
                className={`sfaq-item${isOpen ? ' is-open' : ''}`}
                onMouseEnter={() => setOpen(i)}
              >
                <button
                  type="button"
                  className="sfaq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="sfaq-q-txt">{q}</span>
                  <span className="sfaq-q-mark" aria-hidden="true" />
                </button>
                <div className="sfaq-a-wrap" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div className="sfaq-a-inner"><p className="sfaq-a">{a}</p></div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

// ── 공지 팝업 (이미지 1장 + 닫기 / 오늘 하루 보지 않기) ──
// 이미지 교체: public/images/popup/notice.png 파일만 바꾸면 됩니다.
function NoticePopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const until = localStorage.getItem('dcs-notice-hide-until')
      if (until && Date.now() < Number(until)) return
    } catch { /* localStorage 불가 시 무시 */ }
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null

  const hideToday = () => {
    try {
      const now = new Date()
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
      localStorage.setItem('dcs-notice-hide-until', String(end))
    } catch { /* 무시 */ }
    setOpen(false)
  }

  return (
    <div className="notice-modal" role="dialog" aria-modal="true" aria-label="공지 팝업">
      <button type="button" className="notice-backdrop" aria-label="팝업 닫기" onClick={() => setOpen(false)} />
      <div className="notice-panel">
        <button type="button" className="notice-close" aria-label="팝업 닫기" onClick={() => setOpen(false)}>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div className="notice-img-bx">
          <img src={pub('/images/popup/notice.png')} alt="공지" />
        </div>
        <div className="notice-bar">
          <button type="button" className="notice-today" onClick={hideToday}>오늘 하루 보지 않기</button>
          <button type="button" className="notice-dismiss" onClick={() => setOpen(false)}>닫기</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [reservationOpen, setReservationOpen] = useState(false)

  useEffect(() => {
    // 레퍼런스처럼 부드러운 관성 스크롤 (sticky/pin 구간 매끄럽게)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef = lenis
    // Lenis 스크롤에 맞춰 ScrollTrigger 갱신
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef = null
    }
  }, [])

  return (
    <>
      <Header onOpenReservation={() => setReservationOpen(true)} />
      <main>
        <MergedHero />
      </main>
      <Section2 />
      {/* 통합 전 원본 (되돌리기용): <Hero /> + <EdgeMark /> + <Section2 /> */}
      {/* 숨김(중복): 전문성+숫자 섹션 — S6/Record와 메시지 겹침. 되살리려면 주석 해제 */}
      {/* <Section3 /> 히어로 직후 구체 정보(경시 로드맵/전문성)는 흐름상 보류 — 필요 시 s5~s7 구간에서 재활용 */}
      <Section4 />
      <Section5 />
      {/* 숨김: 지도실적(Track Record) 섹션. 되살리려면 주석 해제 */}
      {/* <SectionRecord /> */}
      <Section6 />
      <Section7 />
      <SectionFAQ onOpenReservation={() => setReservationOpen(true)} />
      <Section9 onOpenReservation={() => setReservationOpen(true)} />
      <div className="bottom-wrap">
        <Section10 />
        <Footer />
      </div>
      <FloatingMenu />
      <ReservationModal open={reservationOpen} onClose={() => setReservationOpen(false)} />
      <NoticePopup />
    </>
  )
}
