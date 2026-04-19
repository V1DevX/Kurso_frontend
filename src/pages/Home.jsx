import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Globe, Bot, Zap, BookOpen, UserPlus, Lock,
  Flame, ChevronDown, ChevronUp, Mail, Send,
} from 'lucide-react'
import useAuthStore from '../store/authStore'

// ── Static data ───────────────────────────────────────────────────────────────

const FLOAT_CARDS = [
  { initials: 'АК', name: 'Азамат К.',  meta: 'Разработчик', level: 24, xp: 2400, xpMax: 2600, streak: 12, course: 'Python',      progress: 67, cls: 'top-8 left-8    card-float-1' },
  { initials: 'АМ', name: 'Айгуль М.',  meta: 'Дизайнер',    level: 18, xp: 1800, xpMax: 2000, streak: 8,  course: 'UI/UX',       progress: 45, cls: 'top-2 right-4   card-float-2' },
  { initials: 'БТ', name: 'Бекзод Т.',  meta: 'Студент',     level: 31, xp: 3100, xpMax: 3200, streak: 21, course: 'Математика',  progress: 89, cls: 'bottom-8 left-12 card-float-3' },
  { initials: 'НА', name: 'Нуржан А.',  meta: 'Учитель',     level: 12, xp: 1200, xpMax: 1400, streak: 5,  course: 'История КР',  progress: 34, cls: 'bottom-2 right-6 card-float-4' },
]

const LEADERBOARD = [
  { medal: '🥇', initials: 'АК', name: 'Азамат К.',  level: 24, pct: 100, xp: '4,200' },
  { medal: '🥈', initials: 'АМ', name: 'Айгуль М.',  level: 21, pct: 88,  xp: '3,800' },
  { medal: '🥉', initials: 'БТ', name: 'Бекзод Т.',  level: 19, pct: 76,  xp: '3,200' },
  { medal: '4',  initials: 'НА', name: 'Нуржан А.',  level: 17, pct: 68,  xp: '2,900' },
  { medal: '5',  initials: 'МС', name: 'Медина С.',  level: 15, pct: 57,  xp: '2,400' },
]

const REVIEWS = [
  { initials: 'АД', quote: 'Наконец-то курсы на кыргызском. Понятно, без воды. Python за 2 недели.', name: 'Айбек Д.', city: 'Студент, Ош' },
  { initials: 'МА', quote: 'Опубликовал курс по математике за вечер. Уже 40 студентов.', name: 'Мирбек А.', city: 'Учитель, Бишкек' },
  { initials: 'СК', quote: 'Стрик 21 день. Раньше бросал на второй неделе. Теперь каждый день.', name: 'Самира К.', city: 'Дизайнер, Бишкек' },
]

const FEATURES = [
  { Icon: Globe,    title: 'Родной язык',     text: 'Курсы на кыргызском и русском. Автоперевод через ИИ.' },
  { Icon: Bot,      title: 'ИИ модерация',    text: 'Каждый курс проверяется ИИ перед публикацией.' },
  { Icon: Zap,      title: 'XP и уровни',     text: 'Зарабатывай опыт за уроки. Уровни 1–99. Стрики.' },
  { Icon: BookOpen, title: 'Короткие уроки',  text: 'Статьи, видео до 20 мин, тест после урока. Без воды.' },
  { Icon: UserPlus, title: 'Стань автором',   text: 'Опубликуй курс за 5 минут. Комиссия платформы 15%.' },
  { Icon: Lock,     title: 'Приватные курсы', text: 'Закрытый курс только для своих учеников.' },
]

const TEAM = [
  {
    initials: 'KU',
    name: 'Кунай',
    role: 'CEO & Co-founder',
    bio: 'Отвечает за презентацию продукта и стратегию развития платформы.',
    about: 'Ваш дружелюбный сосед Кунай.',
    email: '',
    tg: '@knyxo',
  },
  {
    initials: 'АK',
    name: 'Акель Нурланов',
    role: 'CTO & Co-founder',
    bio: 'Архитектура системы, бэкенд и инфраструктура.',
    about: 'Fullstack-разработчик с 6 годами опыта. Любит кофе =]',
    email: 'akel.nurlanov@gmail.com',
    tg: '@V1DevX',
  },
  {
    initials: 'N',
    name: 'Нурайым Асанканова',
    role: 'Lead Designer',
    bio: 'Дизайн продукта, UX и фирменный стиль.',
    about: 'У меня 25к кубков в бравл старс :3',
    email: 'nurayim.asankanova@gmail.com',
    tg: '@Iiiiuou',
  },
]

const BEFORE = [
  'Stepik и Udemy — на русском и английском. Кыргызского нет.',
  'Дорого. Подписка $15–30 в месяц — много для студента из Бишкека.',
  'Местный учитель не может удобно поделиться знаниями с учениками.',
  'Видео по 2 часа — клиповое мышление, никто не досматривает.',
]
const AFTER = [
  'Кыргызский и русский. Автоперевод на другие языки через ИИ — как на Reddit.',
  'Бесплатно для студентов. Авторы сами решают цену своих курсов.',
  'Любой может опубликовать курс за 5 минут. ИИ проверит качество.',
  'Короткие уроки, тесты, стрики — система которая удерживает внимание.',
]

// ── Sub-components ────────────────────────────────────────────────────────────

function FloatingCard({ card }) {
  const scale = 1.25;
  const xpPct = Math.round((card.xp / card.xpMax) * 100)
  return (
    <div
        className={`absolute rounded-2xl ${card.cls}`}
        style={{
          width: `${18 * scale}rem`,
          padding: `${1 * scale}rem`,
          background: 'rgba(22,22,22,0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 40px rgba(124,58,237,0.15)',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: `${0.75 * scale}rem` }}
        >
          <div
            className="flex items-center"
            style={{ gap: `${0.625 * scale}rem` }}
          >
            <div
              className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{
                width: `${2.25 * scale}rem`,
                height: `${2.25 * scale}rem`,
                fontSize: `${0.875 * scale}rem`,
                background: 'rgba(124,58,237,0.45)',
              }}
            >
              {card.initials}
            </div>

            <div>
              <p
                className="text-text font-semibold leading-tight"
                style={{ fontSize: `${0.875 * scale}rem` }}
              >
                {card.name}
              </p>
              <p
                className="text-muted"
                style={{ fontSize: `${0.75 * scale}rem` }}
              >
                {card.meta}
              </p>
            </div>
          </div>

          <span
            className="rounded-full shrink-0"
            style={{
              fontSize: `${0.75 * scale}rem`,
              padding: `${0.25 * scale}rem ${0.5 * scale}rem`,
              background: 'rgba(124,58,237,0.2)',
              color: '#A78BFA',
            }}
          >
            Ур.{card.level}
          </span>
        </div>

        <div style={{ marginBottom: `${0.75 * scale}rem` }}>
          <div
            className="flex justify-between"
            style={{
              fontSize: `${0.75 * scale}rem`,
              marginBottom: `${0.375 * scale}rem`,
            }}
          >
            <span className="text-muted">XP</span>
            <span className="text-text font-medium">
              {card.xp}/{card.xpMax}
            </span>
          </div>

          <div
            className="rounded-full"
            style={{
              height: `${0.5 * scale}rem`,
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          style={{ fontSize: `${0.75 * scale}rem` }}
        >
          <span
            className="flex items-center font-medium"
            style={{
              gap: `${0.375 * scale}rem`,
              color: '#F59E0B',
            }}
          >
            <Flame size={12 * scale} /> {card.streak} дней
          </span>

          <span
            className="flex items-center text-muted"
            style={{ gap: `${0.25 * scale}rem` }}
          >
            <BookOpen size={11 * scale} /> {card.course} {card.progress}%
          </span>
        </div>
      </div>
    // <div
    //   className={`absolute w-96 rounded-2xl p-4 ${card.cls}`}
    //   style={{
    //     background: 'rgba(22,22,22,0.9)',
    //     backdropFilter: 'blur(12px)',
    //     border: '1px solid rgba(255,255,255,0.1)',
    //     boxShadow: '0 0 40px rgba(124,58,237,0.15)',
    //   }}
    // >
    //   <div className="flex items-center justify-between mb-3">
    //     <div className="flex items-center gap-2.5">
    //       <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
    //         style={{ background: 'rgba(124,58,237,0.45)' }}>
    //         {card.initials}
    //       </div>
    //       <div>
    //         <p className="text-text text-sm font-semibold leading-tight">{card.name}</p>
    //         <p className="text-muted text-xs">{card.meta}</p>
    //       </div>
    //     </div>
    //     <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
    //       style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>
    //       Ур.{card.level}
    //     </span>
    //   </div>

    //   <div className="mb-3">
    //     <div className="flex justify-between text-xs mb-1.5">
    //       <span className="text-muted">XP</span>
    //       <span className="text-text font-medium">{card.xp}/{card.xpMax}</span>
    //     </div>
    //     <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
    //       <div className="h-full bg-primary rounded-full" style={{ width: `${xpPct}%` }} />
    //     </div>
    //   </div>

    //   <div className="flex items-center justify-between text-xs">
    //     <span className="flex items-center gap-1.5 font-medium" style={{ color: '#F59E0B' }}>
    //       <Flame size={12} /> {card.streak} дней
    //     </span>
    //     <span className="flex items-center gap-1 text-muted">
    //       <BookOpen size={11} /> {card.course} {card.progress}%
    //     </span>
    //   </div>
    // </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">{children}</p>
}

function TeamCard({ member }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-primary/40"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
          {member.initials}
        </div>
        <p className="text-text font-semibold text-base mb-1">{member.name}</p>
        <p className="text-accent text-sm mb-2">{member.role}</p>
        <p className="text-muted text-sm leading-relaxed">{member.bio}</p>
      </div>

      <div className="flex items-center justify-center gap-1 pb-4 text-xs text-muted">
        {open ? <><ChevronUp size={13} /> Скрыть</> : <><ChevronDown size={13} /> Подробнее</>}
      </div>

      {open && (
        <div
          className="border-t border-border px-6 py-5 flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-muted text-sm leading-relaxed">{member.about}</p>
          <div className="flex flex-col gap-2">
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail size={14} /> {member.email}
            </a>
            <span className="flex items-center gap-2 text-sm text-muted">
              <Send size={14} /> {member.tg}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // TODO: re-implement smooth mouse parallax on card hover
  // const handleCardsMouseMove = (e) => { ... }
  // const handleCardsMouseLeave = () => { ... }

  return (
    <div className="bg-bg text-text min-h-screen">

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-14 px-12 flex items-center justify-between border-b border-border transition-all duration-300 ${
        scrolled ? 'bg-bg/95 backdrop-blur-md' : 'bg-surface/90 backdrop-blur'
      }`}>
        <Link to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">K</span>
          <span className="text-text font-semibold text-lg">Kurso</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {['О нас', 'Курсы', 'Авторам', 'Команда'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-muted text-sm hover:text-text transition-colors">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/courses" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Перейти к курсам
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-muted hover:text-text text-sm transition-colors">Войти</Link>
              <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Начать бесплатно
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center px-12 pt-24 pb-16 relative overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)',
        }} />

        {/* Left */}
        <div className="flex-1 max-w-2xl relative z-10 pl-8">
          <div className="inline-flex items-center gap-2 border px-4 py-2 rounded-full mb-8 text-sm"
            style={{ background: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)', color: '#A78BFA' }}>
            <span className="w-2 h-2 rounded-full bg-accent" />
            Первая образовательная платформа Кыргызстана
          </div>

          <div className="text-[72px] font-bold leading-[1.05] mb-5">
            <div className="text-text">Kurso.</div>
            <div className="text-text italic">Учись. Делись.</div>
            <div className="text-primary italic">Расти.</div>
          </div>

          <p className="text-muted text-lg leading-relaxed max-w-lg mb-10">
            Платформа где любой житель Кыргызстана может учиться и делиться знаниями на родном языке.
            Без барьеров. Без посредников. Бесплатно.
          </p>

          <div className="flex gap-4 mb-12">
            <button onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-semibold text-base transition-colors">
              Начать бесплатно →
            </button>
            <button onClick={() => navigate('/courses')}
              className="border border-border text-text hover:border-accent px-8 py-3.5 rounded-lg text-base transition-colors">
              Смотреть курсы
            </button>
          </div>

          <div className="flex items-center gap-8">
            {[['2,400+', 'Студентов'], ['180+', 'Курсов'], ['4.8', 'Рейтинг']].map(([num, label], i) => (
              <div key={label} className="flex items-center gap-8">
                {i > 0 && <div className="w-px h-10 bg-border" />}
                <div>
                  <p className="text-2xl font-bold text-text">{num}</p>
                  <p className="text-sm text-muted">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div
          className="flex-[0.9] relative min-h-[580px] hidden lg:block"
        >
          <div className="absolute inset-0">
            {FLOAT_CARDS.map((card) => <FloatingCard key={card.name} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES ───────────────────────────────────────────── */}
      <div className="py-5 border-y border-border flex justify-center items-center gap-14 flex-wrap px-12">
        <span className="text-muted text-sm">Нам доверяют:</span>
        {['КГТУ', 'АУЦА', 'МУК', 'БГУ', 'НАРХОЗ', 'КНМУ'].map((u) => (
          <span key={u} className="text-base font-semibold tracking-wider cursor-default transition-colors"
            style={{ color: 'rgba(255,255,255,0.18)' }}
            onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.18)'}
          >{u}</span>
        ))}
      </div>

      {/* ── PROBLEM / SOLUTION ─────────────────────────────────────── */}
      <section id="о нас" className="py-24 px-12">
        <SectionLabel>Почему Kurso</SectionLabel>
        <h2 className="text-4xl font-semibold text-text mb-4">Сделано для Кыргызстана</h2>
        <p className="text-muted text-base max-w-xl leading-relaxed mb-12">
          Мы изучили как учатся люди в нашей стране и создали платформу которая решает реальные проблемы.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Before — red theme */}
          <div className="rounded-xl p-7" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)' }}>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-3 h-3 rounded-full bg-error" />
              <span className="text-error text-base font-semibold">Раньше</span>
            </div>
            {BEFORE.map((text) => (
              <div key={text} className="flex gap-3.5 mb-5 last:mb-0">
                <span className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.5)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                </span>
                <p className="text-muted text-base leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* After — green theme */}
          <div className="rounded-xl p-7" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.18)' }}>
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-success text-base font-semibold">Kurso</span>
            </div>
            {AFTER.map((text) => (
              <div key={text} className="flex gap-3.5 mb-5 last:mb-0">
                <span className="w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1.5px solid rgba(16,185,129,0.5)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                </span>
                <p className="text-muted text-base leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-24 px-12" style={{ background: 'rgba(22,22,22,0.4)' }}>
        <SectionLabel>Как это работает</SectionLabel>
        <h2 className="text-4xl font-semibold text-text mb-12">Просто. Быстро. Для всех.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '1', title: 'Зарегистрируйся',  text: 'Создай аккаунт за 30 секунд. Без карты. Бесплатно навсегда.' },
            { n: '2', title: 'Выбери курс',       text: 'Сотни курсов на кыргызском и русском. Фильтруй по теме и уровню.' },
            { n: '3', title: 'Учись и расти',     text: 'Зарабатывай XP, повышай уровень, держи стрик. Соревнуйся с другими.' },
          ].map(({ n, title, text }) => (
            <div key={n} className="bg-surface border border-border rounded-xl p-7">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base mb-5">{n}</div>
              <h3 className="text-text font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted text-base leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="авторам" className="py-24 px-12">
        <SectionLabel>Возможности</SectionLabel>
        <h2 className="text-4xl font-semibold text-text mb-12">Всё что нужно для обучения</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(124,58,237,0.15)' }}>
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="text-text font-semibold text-base mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LEADERBOARD ────────────────────────────────────────────── */}
      <section className="py-24 px-12 flex flex-col items-center" style={{ background: 'rgba(22,22,22,0.4)' }}>
        <div className="w-full max-w-2xl">
          <SectionLabel>Таблица лидеров</SectionLabel>
          <h2 className="text-4xl font-semibold text-text mb-3">Соревнуйся с лучшими</h2>
          <p className="text-muted text-base leading-relaxed mb-10">
            Каждую неделю — новый рейтинг. Кто учится больше всех?
          </p>
          <div className="bg-surface border border-border rounded-xl p-7">
            <div className="flex items-center justify-between mb-5">
              <span className="text-text font-semibold text-lg">Топ студентов</span>
              <span className="text-sm bg-surface-2 px-4 py-1.5 rounded-full text-muted">Эта неделя</span>
            </div>
            {LEADERBOARD.map((u, i) => (
              <div key={u.name} className={`flex items-center gap-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                <span className={`w-7 text-center text-base ${i < 3 ? '' : 'text-muted font-medium'}`}>{u.medal}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: 'rgba(124,58,237,0.6)' }}>
                  {u.initials}
                </div>
                <span className="text-base text-text flex-1 font-medium">{u.name}</span>
                <span className="text-sm text-muted mr-3">Ур.{u.level}</span>
                <div className="w-32">
                  <div className="h-1.5 bg-surface-2 rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${u.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted mt-1 text-right">{u.xp} XP</p>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/register')}
              className="w-full mt-5 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg text-base font-semibold transition-colors">
              Войти и занять место →
            </button>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ────────────────────────────────────────────────── */}
      <section className="py-24 px-12">
        <SectionLabel>Отзывы</SectionLabel>
        <h2 className="text-4xl font-semibold text-text mb-12">Что говорят студенты</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-surface border border-border rounded-xl p-6">
              <p className="text-primary text-lg mb-4">★★★★★</p>
              <p className="text-muted text-base italic leading-relaxed mb-5">"{r.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-accent shrink-0"
                  style={{ background: 'rgba(124,58,237,0.3)' }}>
                  {r.initials}
                </div>
                <div>
                  <p className="text-text text-sm font-semibold">{r.name}</p>
                  <p className="text-muted text-xs">{r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ───────────────────────────────────────────────────── */}
      <section id="команда" className="py-24 px-12" style={{ background: 'rgba(22,22,22,0.4)' }}>
        <SectionLabel>Команда</SectionLabel>
        <h2 className="text-4xl font-semibold text-text mb-4 whitespace-pre-line">
          {'Мы из Кыргызстана.\nМы знаем проблему изнутри.'}
        </h2>
        <p className="text-muted text-base max-w-xl leading-relaxed mb-12">
          Kurso создан людьми которые сами учились на платформах не адаптированных для нашей страны.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {TEAM.map((member) => <TeamCard key={member.role} member={member} />)}
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section className="py-28 px-12 text-center" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.13), rgba(109,40,217,0.06))',
        borderTop: '1px solid rgba(124,58,237,0.2)',
      }}>
        <h2 className="text-5xl font-semibold text-text mb-4">Готов начать?</h2>
        <p className="text-muted text-lg leading-relaxed mb-10 whitespace-pre-line">
          {'Зарегистрируйся бесплатно и начни учиться уже сегодня.\nПервый шаг — самый важный.'}
        </p>
        <button onClick={() => navigate('/register')}
          className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors">
          Начать бесплатно →
        </button>
        <p className="text-muted text-base mt-5">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-accent hover:underline">Войти</Link>
        </p>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-12 px-12 border-t border-border">
        <div className="flex gap-16 flex-wrap mb-10">
          <div className="flex-1 min-w-48">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">K</span>
              <span className="text-text font-semibold text-base">Kurso</span>
            </div>
            <p className="text-muted text-sm max-w-48">Знания на твоём языке</p>
          </div>
          {[
            { title: 'Платформа', links: ['О нас', 'Команда', 'Контакты'] },
            { title: 'Обучение',  links: ['Каталог курсов', 'Категории', 'Лидерборд'] },
            { title: 'Авторам',   links: ['Стать автором', 'Публикация курса', 'Правила'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs uppercase tracking-wider mb-4 font-medium"
                style={{ color: 'rgba(255,255,255,0.25)' }}>{title}</h4>
              {links.map((l) => (
                <a key={l} href="#" className="block text-sm mb-2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                >{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center border-t border-border pt-6">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2025 Kurso. Все права защищены.</span>
          <div className="flex gap-2">
            {['TG', 'IG', 'GH'].map((s) => (
              <button key={s} className="w-8 h-8 rounded-md bg-surface-2 border border-border flex items-center justify-center text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >{s}</button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
