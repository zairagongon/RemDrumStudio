import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CalendarClock,
  Banknote,
  Clock,
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { api } from '../../../services/api.js';
import './coachPayments.css';

const DEFAULT_SUMMARY = {
  collected: 1000,
  stillUnpaid: 500,
  lessonFee: 500,
};

const DEFAULT_RECORDS = [
  {
    id: 'pay-1',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    date: 'October 24, 2026',
    amount: 500,
    status: 'Unpaid',
  },
  {
    id: 'pay-2',
    student: 'Justin Marcial',
    lesson: 'Drum Lesson',
    date: 'October 24, 2026',
    amount: 500,
    status: 'Paid',
  },
  {
    id: 'pay-3',
    student: 'Darryl Villanueva',
    lesson: 'Drum Lesson',
    date: 'October 24, 2026',
    amount: 500,
    status: 'Paid',
  },
];

const DEFAULT_BAND_SHARE_SUMMARY = {
  totalEarned: 1500,
  released: 900,
  pending: 600,
};

const DEFAULT_BAND_SHARES = [
  {
    id: 'bs-1',
    bandName: 'Midnight Echo',
    bookingRef: 'BB-1042',
    sessionType: 'Band Rehearsal Coaching',
    date: 'October 24, 2026',
    time: '4:00 - 6:00 PM',
    totalBookingFee: 1500,
    sharePercent: 40,
    coachShare: 600,
    studioShare: 900,
    status: 'Pending',
    payoutDate: 'Pending studio release',
  },
  {
    id: 'bs-2',
    bandName: 'Velvet Sticks',
    bookingRef: 'BB-1038',
    sessionType: 'Studio Band Session',
    date: 'October 20, 2026',
    time: '6:00 - 8:00 PM',
    totalBookingFee: 1200,
    sharePercent: 40,
    coachShare: 480,
    studioShare: 720,
    status: 'Released',
    payoutDate: 'October 21, 2026',
  },
  {
    id: 'bs-3',
    bandName: 'Rhythm Pulse',
    bookingRef: 'BB-1029',
    sessionType: 'Band Recording Prep',
    date: 'October 15, 2026',
    time: '3:00 - 4:30 PM',
    totalBookingFee: 1050,
    sharePercent: 40,
    coachShare: 420,
    studioShare: 630,
    status: 'Released',
    payoutDate: 'October 16, 2026',
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Reschedule Request Alert',
    message: 'Patricia Arquileta requested to move Drum Lesson from Oct 24 to Nov 2, 10:00 - 11:00 PM.',
    type: 'reschedule',
    time: '12m ago',
    unread: true,
    actionTab: 'bookings',
    actionLabel: 'Review Request'
  },
  {
    id: 'notif-2',
    title: 'Cash Payment Pending',
    message: 'Lesson fee for Patricia Arquileta (Oct 24 Drum Lesson, ₱500) is marked as Unpaid.',
    type: 'payment',
    time: '45m ago',
    unread: true,
    actionTab: 'payments',
    actionLabel: 'View Payment'
  },
  {
    id: 'notif-3',
    title: "Today's Lesson Reminder",
    message: 'Drum Lesson with Zaira Gongon is scheduled today at 2:00 PM.',
    type: 'schedule',
    time: '2h ago',
    unread: true,
    actionTab: 'dashboard',
    actionLabel: 'View Schedule'
  },
  {
    id: 'notif-4',
    title: 'Student Enrollment Update',
    message: 'Justin Marcial is actively enrolled. Next session on November 01, 2:00 PM.',
    type: 'student',
    time: '1d ago',
    unread: false,
    actionTab: 'students',
    actionLabel: 'View Student'
  }
];

export default function CoachPayments() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('lessons');
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [bandShareSummary, setBandShareSummary] = useState(DEFAULT_BAND_SHARE_SUMMARY);
  const [bandShares, setBandShares] = useState(DEFAULT_BAND_SHARES);
  const [selectedShare, setSelectedShare] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  // Notification Bell state
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const bellRef = useRef(null);

  const loadPaymentsData = async () => {
    try {
      const [payRes, notifRes] = await Promise.allSettled([
        api.get('/payments'),
        api.get('/notifications')
      ]);
      if (payRes.status === 'fulfilled' && payRes.value) {
        const data = payRes.value;
        if (data.summary) setSummary(data.summary);
        if (data.records) setRecords(data.records);
        if (data.bandShareSummary) setBandShareSummary(data.bandShareSummary);
        if (Array.isArray(data.bandShares)) setBandShares(data.bandShares);
      }
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) && notifRes.value.length > 0) {
        setNotifications(notifRes.value);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadPaymentsData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsPaid = async (id) => {
    try {
      await api.post(`/payments/${id}/mark-paid`);
    } catch (e) {}

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Paid' } : r))
    );
    setSummary((prev) => ({
      ...prev,
      collected: prev.collected + 500,
      stillUnpaid: Math.max(0, prev.stillUnpaid - 500),
    }));
    setConfirmingId(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (e) {}
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    handleMarkAsRead(item.id);
    setIsBellOpen(false);
    if (item.actionTab) navigate(`../${item.actionTab}`);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'reschedule':
        return <CalendarClock className="cp-notif-type-icon cp-notif-type-reschedule" />;
      case 'payment':
        return <Banknote className="cp-notif-type-icon cp-notif-type-payment" />;
      case 'schedule':
        return <Clock className="cp-notif-type-icon cp-notif-type-schedule" />;
      case 'student':
        return <UserCheck className="cp-notif-type-icon cp-notif-type-student" />;
      default:
        return <Bell className="cp-notif-type-icon cp-notif-type-default" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = notifications.filter(n => (notifFilter === 'unread' ? n.unread : true));

  return (
    <div className="cp-container">
      {/* Top Header bar */}
      <div className="cp-header">
        <div>
          <h1 className="cp-page-title">Payments</h1>
          <p className="cp-page-subtitle">
            View lesson payments records, status, and your shares from band bookings.
          </p>
        </div>

        {/* Self-contained Interactive Notification Bell */}
        <div className="cp-notif-wrapper" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="cp-notif-bell-btn"
            title="View Notifications"
            aria-label="View Studio Notifications"
          >
            <Bell className="cp-notif-bell-icon" />
            {unreadCount > 0 && (
              <span className="cp-notif-badge-count">{unreadCount}</span>
            )}
          </button>

          {isBellOpen && (
            <div className="cp-notif-dropdown">
              <div className="cp-notif-dropdown-header">
                <div className="cp-notif-header-left">
                  <Bell className="cp-notif-header-bell" />
                  <h4 className="cp-notif-header-title">Studio Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="cp-notif-header-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="cp-notif-header-actions">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="cp-notif-mark-all-btn"
                    >
                      <CheckCheck className="cp-notif-check-icon" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsBellOpen(false)}
                    className="cp-notif-close-btn"
                  >
                    <X className="cp-notif-close-icon" />
                  </button>
                </div>
              </div>

              <div className="cp-notif-filter-bar">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`cp-notif-filter-btn ${notifFilter === 'all' ? 'cp-notif-filter-btn-active' : ''}`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`cp-notif-filter-btn ${notifFilter === 'unread' ? 'cp-notif-filter-btn-active' : ''}`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="cp-notif-list-scroll">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`cp-notif-item-row ${
                        item.unread ? 'cp-notif-item-unread' : 'cp-notif-item-read'
                      }`}
                    >
                      <div className="cp-notif-item-icon-box">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="cp-notif-item-body">
                        <div className="cp-notif-item-top">
                          <p className="cp-notif-item-title">{item.title}</p>
                          <span className="cp-notif-item-time">{item.time}</span>
                        </div>
                        <p className="cp-notif-item-message">{item.message}</p>
                        <div className="cp-notif-item-footer">
                          <span className="cp-notif-action-link">
                            {item.actionLabel || 'View Details'}
                            <ChevronRight className="cp-notif-chevron-icon" />
                          </span>
                          {item.unread && <span className="cp-notif-unread-dot" />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cp-notif-empty">No notifications to display.</div>
                )}
              </div>

              <div className="cp-notif-dropdown-footer">
                <p className="cp-notif-footer-text">
                  RemDrumStudio Notification Service • Real-time alerts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3 Metric Cards matching Figure 12 */}
      {activeTab === 'lessons' ? (
        <div className="cp-stats-grid">
          <div className="cp-stat-card">
            <p className="cp-stat-label">Collected</p>
            <p className="cp-stat-value">₱ {summary.collected}</p>
          </div>

          <div className="cp-stat-card">
            <p className="cp-stat-label">Still Unpaid</p>
            <p className="cp-stat-value">₱ {summary.stillUnpaid}</p>
          </div>

          <div className="cp-stat-card">
            <p className="cp-stat-label">Lesson Fee</p>
            <p className="cp-stat-value">₱ {summary.lessonFee}</p>
          </div>
        </div>
      ) : (
        <div className="cp-stats-grid">
          <div className="cp-stat-card">
            <p className="cp-stat-label">Total Band Shares</p>
            <p className="cp-stat-value">₱ {bandShareSummary.totalEarned}</p>
          </div>

          <div className="cp-stat-card">
            <p className="cp-stat-label">Released</p>
            <p className="cp-stat-value">₱ {bandShareSummary.released}</p>
          </div>

          <div className="cp-stat-card">
            <p className="cp-stat-label">Pending</p>
            <p className="cp-stat-value">₱ {bandShareSummary.pending}</p>
          </div>
        </div>
      )}

      {/* Pill Tabs matching Bookings page style */}
      <div className="cp-tabs-row">
        <button
          type="button"
          onClick={() => setActiveTab('lessons')}
          className={`cp-tab ${activeTab === 'lessons' ? 'cp-tab-active' : 'cp-tab-inactive'}`}
        >
          Lesson Payments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('band-shares')}
          className={`cp-tab ${activeTab === 'band-shares' ? 'cp-tab-active' : 'cp-tab-inactive'}`}
        >
          Band Booking Shares
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'lessons' ? (
        <div className="cp-table-card">
          <div className="cp-table-header">
            <div className="cp-col-4">STUDENT</div>
            <div className="cp-col-4">LESSON</div>
            <div className="cp-col-2">AMOUNT</div>
            <div className="cp-col-2 cp-col-right">STATUS</div>
          </div>

          <div className="cp-table-body">
            {records.map((rec) => (
              <React.Fragment key={rec.id}>
                <div className="cp-table-row">
                  <div className="cp-col-4 cp-student-name">{rec.student}</div>
                  <div className="cp-col-4">
                    <p className="cp-lesson-name">{rec.lesson}</p>
                    <p className="cp-lesson-date">{rec.date}</p>
                  </div>
                  <div className="cp-col-2 cp-amount">₱ {rec.amount}</div>
                  <div className="cp-col-2 cp-status-cell">
                    <span className={rec.status === 'Paid' ? 'cp-pill-green' : 'cp-pill-unpaid'}>
                      {rec.status}
                    </span>
                    {rec.status === 'Unpaid' && !confirmingId && (
                      <button
                        onClick={() => setConfirmingId(rec.id)}
                        className="cp-btn-action cp-mark-btn"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>

                {confirmingId === rec.id && (
                  <div className="cp-confirm-bar">
                    <div className="cp-confirm-text">
                      <span className="cp-confirm-strong">Received ₱500 cash from {rec.student}?</span>
                      <span className="cp-confirm-sub">The student will be notified.</span>
                    </div>
                    <div className="cp-confirm-actions">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="cp-btn-action"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleMarkAsPaid(rec.id)}
                        className="cp-btn-action cp-confirm-btn"
                      >
                        Yes, Mark as Paid
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="cp-table-card">
          <div className="cp-table-header">
            <div className="cp-col-4">BAND BOOKING</div>
            <div className="cp-col-3">BOOKING TOTAL</div>
            <div className="cp-col-2">YOUR SHARE</div>
            <div className="cp-col-3 cp-col-right">STATUS</div>
          </div>

          <div className="cp-table-body">
            {bandShares.length > 0 ? (
              bandShares.map((item) => (
                <div key={item.id} className="cp-table-row">
                  <div className="cp-col-4">
                    <p className="cp-lesson-name">{item.bandName}</p>
                    <p className="cp-lesson-date">
                      {item.date} • {item.time}
                    </p>
                  </div>

                  <div className="cp-col-3">
                    <p className="cp-lesson-name">₱ {item.totalBookingFee}</p>
                    <p className="cp-lesson-date">Coach Share ({item.sharePercent}%)</p>
                  </div>

                  <div className="cp-col-2 cp-share-amount">₱ {item.coachShare}</div>

                  <div className="cp-col-3 cp-status-cell">
                    <span className={item.status === 'Released' ? 'cp-pill-green' : 'cp-pill-unpaid'}>
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedShare(item)}
                      className="cp-btn-action cp-mark-btn"
                    >
                      View Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="cp-empty-note">No band booking shares recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Band Booking Share Details Modal */}
      {selectedShare && (
        <div className="cp-modal-backdrop" onClick={() => setSelectedShare(null)}>
          <div className="cp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header">
              <h3 className="cp-modal-title">Band Booking Share Breakdown</h3>
              <button
                type="button"
                onClick={() => setSelectedShare(null)}
                className="cp-modal-close-btn"
              >
                <X className="cp-modal-close-icon" />
              </button>
            </div>
            <div className="cp-modal-content">
              <div className="cp-modal-body">
                <div className="cp-modal-banner">
                  <div>
                    <h4 className="cp-modal-band-title">{selectedShare.bandName}</h4>
                    <p className="cp-modal-band-sub">
                      {selectedShare.sessionType} • Ref #{selectedShare.bookingRef}
                    </p>
                  </div>
                  <span className={selectedShare.status === 'Released' ? 'cp-pill-green' : 'cp-pill-unpaid'}>
                    {selectedShare.status}
                  </span>
                </div>

                <div className="cp-modal-grid">
                  <div className="cp-modal-tile">
                    <span className="cp-modal-tile-label">Session Schedule</span>
                    <span className="cp-modal-tile-value">
                      {selectedShare.date} ({selectedShare.time})
                    </span>
                  </div>
                  <div className="cp-modal-tile">
                    <span className="cp-modal-tile-label">Payout Status</span>
                    <span className="cp-modal-tile-value">{selectedShare.payoutDate}</span>
                  </div>
                  <div className="cp-modal-tile">
                    <span className="cp-modal-tile-label">Total Band Fee</span>
                    <span className="cp-modal-tile-value">₱ {selectedShare.totalBookingFee}</span>
                  </div>
                  <div className="cp-modal-tile">
                    <span className="cp-modal-tile-label">Studio Share ({100 - selectedShare.sharePercent}%)</span>
                    <span className="cp-modal-tile-value">₱ {selectedShare.studioShare}</span>
                  </div>
                </div>

                <div className="cp-modal-highlight">
                  <span className="cp-modal-highlight-label">
                    Your Coach Share ({selectedShare.sharePercent}%)
                  </span>
                  <span className="cp-modal-highlight-value">₱ {selectedShare.coachShare}</span>
                </div>

                <div className="cp-modal-footer">
                  <button
                    type="button"
                    onClick={() => setSelectedShare(null)}
                    className="cp-btn-dark"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
