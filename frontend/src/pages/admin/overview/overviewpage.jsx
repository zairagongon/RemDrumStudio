import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../../services/api.js';
import './overviewpage.css';

const peso = n => `₱${Number(n).toLocaleString('en-PH')}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const today = new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

function Stat({ label, value, sub }) {
  return (
    <div className="ov__stat">
      <div className="ov__statlabel">{label}</div>
      <div className="ov__statvalue">{value}</div>
      <div className="ov__statsub">{sub}</div>
    </div>
  );
}

export default function OverviewPage() {
  const { setAlerts } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/overview').then(d => { setData(d); setAlerts(d.attention.length); }).catch(e => setError(e.message));
  }, [setAlerts]);

  if (error) return <p className="ov__alert" role="alert">{error}</p>;
  if (!data) return <p className="ov__muted">Loading overview...</p>;

  const { people, lessons, bandRequests, attention, bookingsPerCoach, payments, ratings } = data;
  const max = Math.max(1, bookingsPerCoach.band, ...bookingsPerCoach.coaches.map(c => c.count));
  const rows = [...bookingsPerCoach.coaches.map(c => [c.name, c.count]), ['Band', bookingsPerCoach.band]];
  const split = payments.solo + payments.band;

  return (
    <div className="ov">
      <div className="ov__eyebrow">Overview</div>
      <h1>Studio overview</h1>
      <p className="ov__sub">What needs your attention, and how the month is going.</p>

      <div className="ov__stats">
        <Stat label="Lessons today" value={lessons.today} sub={today} />
        <Stat label="Parents & students" value={people.parents + people.students} sub={`${plural(people.parents, 'parent')} · ${plural(people.students, 'student')}`} />
        <Stat label="Lessons this week" value={lessons.week} sub={`${lessons.completedThisWeek} completed`} />
        <Stat label="Band requests waiting" value={bandRequests} sub="Need your approval" />
      </div>

      <section className="ov__card">
        <h2 className="ov__cardtitle">Needs attention</h2>
        {attention.length === 0 && <div className="ov__row ov__row--empty">Nothing needs your attention right now.</div>}
        {attention.map(a => (
          <div className="ov__row" key={a.id}>
            <div><b>{a.title}</b><small>{a.detail}</small></div>
            <div className="ov__acts">
              {a.actions.map(x => <Link key={x.label} to={x.to} className={`ov__btn ${x.primary ? 'ov__btn--p' : ''}`}>{x.label}</Link>)}
            </div>
          </div>
        ))}
      </section>

      <div className="ov__glancehead">
        <h2>This month at a glance</h2>
        <Link to="/admin/analytics" className="ov__link">View all analytics →</Link>
      </div>
      <div className="ov__glance">
        <section className="ov__card ov__card--pad">
          <h3>Bookings per coach</h3>
          {rows.map(([name, n]) => (
            <div className="ov__bar" key={name}>
              <span>{name}</span>
              <span className="ov__track"><span style={{ width: `${(n / max) * 100}%` }} /></span>
              <b>{n}</b>
            </div>
          ))}
          <Link to="/admin/band-bookings" className="ov__link">View bookings →</Link>
        </section>

        <section className="ov__card ov__card--pad">
          <h3>Payments this month</h3>
          <div className="ov__big">{peso(payments.total)}</div>
          <div className={`ov__delta ${payments.changeFromLastMonth > 0 ? 'up' : ''}`}>
            {payments.total === 0 ? 'No payments recorded yet'
              : payments.changeFromLastMonth > 0 ? `Up ${peso(payments.changeFromLastMonth)} from last month`
              : payments.changeFromLastMonth < 0 ? `Down ${peso(-payments.changeFromLastMonth)} from last month` : 'Same as last month'}
          </div>
          <div className="ov__split" aria-hidden="true">
            <span style={{ flex: split ? payments.solo : 1, background: split ? '#1c2456' : '#e7e9f3' }} />
            {split > 0 && <span style={{ flex: payments.band, background: '#f0b429' }} />}
          </div>
          <div className="ov__muted">Solo cash {peso(payments.solo)} · Band {peso(payments.band)}</div>
          <Link to="/admin/payments" className="ov__link">View payments →</Link>
        </section>

        <section className="ov__card ov__card--pad">
          <h3>Coach ratings</h3>
          <div className="ov__big">{ratings.average === null ? '—' : ratings.average.toFixed(1)}</div>
          <div className="ov__muted">{ratings.count === 0 ? 'No ratings yet' : `From ${ratings.count} ratings`}</div>
          <Link to="/admin/analytics" className="ov__link">View ratings →</Link>
        </section>
      </div>
    </div>
  );
}
