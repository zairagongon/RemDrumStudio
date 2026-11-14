import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './landingpage.css';

const API_BASE = '/api/landingpage';

const NAV = [['top', 'Home'], ['about', 'About'], ['tutors', 'Tutors'], ['instruments', 'Instruments'], ['rate', 'Rate'], ['contact', 'Contact']];

const DEFAULT_TUTORS = [
  { id: 1, name: 'Rem Diaz', instrument: 'Drums', image_url: 'images/rem.jpg',
    bio: 'Founder of the studio and a drummer for more than 27 years. Patient with first-timers and demanding with performers.' },
  { id: 2, name: 'Pedro Penduco', instrument: 'Guitar & Bass', image_url: 'images/pedro.jpg',
    bio: 'Builds strong fundamentals first, then helps students play the songs they actually want to play.' },
  { id: 3, name: 'Mang Kepweng', instrument: 'Voice', image_url: 'images/mang.jpg',
    bio: 'Works on breath, pitch, and stage confidence, from first-time singers to seasoned performers.' },
  { id: 4, name: 'Ana Reyes', instrument: 'Piano', image_url: 'images/ana.jpg',
    bio: 'Makes reading and theory feel simple. Clear, encouraging, and always prepared for every lesson.' }
];

const INSTRUMENTS = [
  { name: 'Drums', color: '#e0453a', glyph: '♪', text: 'Rhythm, coordination, and groove from the very first lesson.' },
  { name: 'Piano', color: '#4a6fe0', glyph: '♫', text: 'Reading, theory, and technique for every level.' },
  { name: 'Voice', color: '#a855f7', glyph: '♪', text: 'Breath, pitch, and confidence on stage.' },
  { name: 'Guitar', color: '#4caf50', glyph: '♫', text: 'Chords, riffs, and playing along with your favorite songs.' },
  { name: 'Bass', color: '#e0a820', glyph: '♪', text: 'Lock in with the drums and hold the band together.' }
];

const STEPS = [
  ['Create your account', 'Sign up as a student, or log in if you already have an account.'],
  ['Book a session', 'Choose your instrument, your tutor, and an open time slot, then confirm.'],
  ['Show up and play', 'Get reminders before your lesson, then pay in cash after you play.']
];

const hideBroken = e => { e.currentTarget.hidden = true; };
const imgSrc = p => (p ? '/' + p.replace(/^\/+/, '') : '');
const scrollToTop = e => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Reveal({ className = '', children }) {
  const [ref, seen] = useInView();
  return <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`}>{children}</div>;
}

function CountUp({ to, suffix = '' }) {
  const [ref, seen] = useInView();
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!seen) return;
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 1200, 1);
      setV(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <strong ref={ref}>{v}{suffix}</strong>;
}

const Logo = () => (
  <>
    <span className="logo__rem">Rem</span><span className="logo__drum">Drum</span><span className="logo__studio">Studio</span>
  </>
);

function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  // Highlight the section currently in view (Home when at the top of the page)
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.45;
      let current = 'top';
      NAV.forEach(([id]) => {
        if (id === 'top') return;
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className="nav" id="top">
      <a href="#top" className="logo" aria-label="RemDrumStudio home">
        <img src="/images/RemDrumStudiologo.png" alt="" className="logo__img" onError={hideBroken} /><Logo />
      </a>
      <button className="nav__toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><span /><span /><span /></button>
      <nav className={`nav__links ${open ? 'open' : ''}`}>
        {NAV.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className={active === id ? 'active' : ''}
            onClick={e => { if (id === 'top') scrollToTop(e); setOpen(false); }}
          >
            {label}
          </a>
        ))}
        <Link to="/login" className="btn btn--pill">Log In</Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg"><img src="/images/forlandingpage.png" /></div>
      <div className="hero__content">
        <p className="eyebrow">Established 1999 · Balayan, Philippines</p>
        <h1>Where every <em>note</em> finds its voice.</h1>
        <div className="hero__cta">
          <Link to="/login" state={{ intent: 'booking' }} className="btn btn--yellow">Book a Session</Link>
          <a href="#about" className="btn btn--outline">Learn More</a>
        </div>
      </div>
    </section>
  );
}

function Tile({ cls, label, img, children }) {
  return (
    <div className={`tile ${cls}`}>
      {children}<span>{label}</span>
      <img src={`/images/${img}`} alt={label} onError={hideBroken} />
    </div>
  );
}

function About() {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <Reveal className="about__text">
          <p className="eyebrow">About</p>
          <h2>Music lessons that feel like <em>home.</em></h2>
          <p>For over 27 years, RemDrumStudio has been a place where beginners find their first note and seasoned players sharpen their sound. Every lesson is one-on-one, paced to the student, and taught by tutors who love the instrument they teach.</p>
          <ul className="stats">
            <li><CountUp to={27} suffix="+" /><span>Years of teaching</span></li>
            <li><CountUp to={5} /><span>Instruments offered</span></li>
            <li><strong>1:1</strong><span>Private lessons</span></li>
          </ul>
        </Reveal>
        <Reveal>
          <div className="collage">
            <Tile cls="tile--a" label="Studio photo" img="studio.jpg">
              <svg viewBox="0 0 64 64" {...stroke}><ellipse cx="32" cy="30" rx="22" ry="8" /><path d="M10 30v14c0 5 10 9 22 9s22-4 22-9V30M22 37l4 14M42 37l-4 14M14 8l16 14M50 8L34 22" /></svg>
            </Tile>
            <Tile cls="tile--b" label="Lesson room" img="lessonroom.jpg">
              <svg viewBox="0 0 64 64" {...stroke}><path d="M22 46V16l26-4v30M22 26l26-4" /><circle cx="17" cy="46" r="5" fill="currentColor" /><circle cx="43" cy="42" r="5" fill="currentColor" /></svg>
            </Tile>
            <Tile cls="tile--c" label="Performance night" img="performance.jpg">
              <svg viewBox="0 0 64 64" {...stroke}><circle cx="32" cy="32" r="22" /><circle cx="32" cy="32" r="12" /><circle cx="32" cy="32" r="3" fill="currentColor" /></svg>
            </Tile>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Tutors() {
  const [tutors, setTutors] = useState(DEFAULT_TUTORS);
  useEffect(() => {
    fetch(`${API_BASE}/tutors`)
      .then(r => { if (!r.ok) throw new Error('Request failed'); return r.json(); })
      .then(res => { if (res.data?.length) setTutors(res.data); })
      .catch(() => console.warn('Backend offline: showing default tutors.'));
  }, []);
  return (
    <section className="section tutors" id="tutors">
      <div className="container">
        <p className="eyebrow">Tutors</p>
        <div className="tutors__head">
          <h2>Meet the people <em>behind</em> the music.</h2>
        </div>
        <div className="tutors__grid">
          {tutors.map(t => (
            <article className="card tutor" key={t.id}>
              <div className="tutor__photo">{initials(t.name)}<img src={imgSrc(t.image_url)} alt={t.name} onError={hideBroken} /></div>
              <h3>{t.name}</h3>
              <span className="tag">{t.instrument}</span>
              <p>{t.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Instruments() {
  return (
    <section className="section instruments" id="instruments">
      <div className="container">
        <p className="eyebrow center">Instruments</p>
        <h2 className="center">Pick your <em>sound.</em></h2>
        <p className="center lead">Choose an instrument when you book. Lessons are 60 minutes, one student at a time.</p>
        <div className="instruments__grid">
          {INSTRUMENTS.map(i => (
            <article className="inst" key={i.name}>
              <div className="inst__icon" style={{ background: i.color }}>{i.glyph}</div>
              <h3>{i.name}</h3>
              <p>{i.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rate() {
  return (
    <section className="rate" id="rate">
      <div className="container rate__grid">
        <div>
          <p className="eyebrow">Rate</p>
          <h2>Fair rate. <em>No surprises.</em></h2>
          <p className="rate__lead">Every lesson costs the same, whichever instrument you choose.</p>
          <ul className="checks">
            <li>Pay in cash to your tutor, who marks the lesson as paid in the system</li>
            <li>See which lessons are paid or unpaid on your Payments page</li>
            <li>Need a different time? Request a reschedule at least 1 day before your lesson</li>
          </ul>
        </div>
        <div className="fee">
          <p className="fee__label">LESSON FEE</p>
          <p className="fee__price"><span>₱</span>500</p>
          <p className="fee__per">per lesson</p>
          <dl>
            <div><dt>Format</dt><dd>One-on-one</dd></div>
            <div><dt>Payment</dt><dd>Cash</dd></div>
            <div><dt>Reschedule</dt><dd>1 day before</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section how">
      <div className="container">
        <p className="eyebrow center">How it works</p>
        <h2 className="center" style={{ marginBottom: 56 }}>From first click to <em>first lesson.</em></h2>
        <div className="steps">
          {STEPS.map(([title, text], i) => (
            <div className="step" key={title}><b>{i + 1}</b><h3>{title}</h3><p>{text}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="cta">
      <div className="container cta__inner">
        <div><h2>Ready to find your <em style={{ color: 'var(--navy)' }}>voice?</em></h2><p>Open slots fill up quickly. Book your first lesson today.</p></div>
        <Link to="/login" state={{ intent: 'booking' }} className="btn btn--navy">Book a Session</Link>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [invalid, setInvalid] = useState({});
  const [status, setStatus] = useState({ text: '', ok: false });
  const [sending, setSending] = useState(false);
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    const bad = { name: !form.name.trim(), email: !/^\S+@\S+\.\S+$/.test(form.email.trim()), message: !form.message.trim() };
    setInvalid(bad);
    if (Object.values(bad).some(Boolean)) return setStatus({ text: 'Please fill in your name, a valid email, and a message.', ok: false });
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), message: form.message.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong.');
      setStatus({ text: 'Thanks! Your message was sent. We will reply soon.', ok: true });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ text: err.message === 'Failed to fetch' ? 'Cannot reach the server. Please try again later.' : err.message, ok: false });
    } finally { setSending(false); }
  };

  return (
    <section className="section contact" id="contact">
      <div className="container contact__grid">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Questions? <em>Say hello.</em></h2>
          <p className="contact__intro">Message the studio and we will get back to you as soon as we can.</p>
          <ul className="contact__list">
            <li><span className="ico">⌂</span><div><strong>Studio address</strong><small>Street, City, Philippines</small></div></li>
            <li><span className="ico">✆</span><div><strong>Phone</strong><small>0900 000 0000</small></div></li>
            <li><span className="ico">✉</span><div><strong>Email</strong><small>hello@remdrumstudio.example</small></div></li>
          </ul>
        </div>
        <form className="form" onSubmit={onSubmit} noValidate>
          <label>Your name<input name="name" value={form.name} onChange={onChange} placeholder="Juan Dela Cruz" className={invalid.name ? 'is-invalid' : ''} /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@email.com" className={invalid.email ? 'is-invalid' : ''} /></label>
          <label>Message<textarea name="message" rows="5" value={form.message} onChange={onChange} placeholder="Tell us which instrument you want to learn..." className={invalid.message ? 'is-invalid' : ''} /></label>
          <p className={`form__status ${status.text ? (status.ok ? 'ok' : 'err') : ''}`} role="status" aria-live="polite">{status.text}</p>
          <button type="submit" className="btn btn--yellow" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div><div className="logo"><Logo /></div><p className="footer__tag">Where every note finds its voice.</p></div>
          <nav>{NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
        </div>
        <div className="footer__bottom">
          <span>© 2026 RemDrumStudio. All rights reserved.</span>
          <span><Link to="/login">Log In</Link> · <Link to="/signup">Sign Up</Link></span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero /><About /><Tutors /><Instruments /><Rate /><HowItWorks /><CallToAction /><Contact />
      </main>
      <Footer />
    </>
  );
}