import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Bell,
  CheckCheck,
  CalendarClock,
  Banknote,
  Clock,
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';
import './coachBookings.css';

// Change to 'http://localhost:3000' if your backend runs on a different port
const API_BASE_URL = '';

const DEFAULT_BOOKINGS = [
  {
    id: 'bk-1',
    date: 'October 24, 2026',
    time: '7:00 - 8:00 AM',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    paymentStatus: 'Paid',
    category: 'in-progress',
    status: 'In Progress',
  },
  {
    id: 'bk-2',
    date: 'November 25, 2026',
    time: '7:00 - 8:00 AM',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    paymentStatus: 'Unpaid',
    category: 'in-progress',
    status: 'In Progress',
  },
  {
    id: 'bk-3',
    date: 'October 24, 2026',
    time: '7:00 - 8:00 AM',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    paymentStatus: 'Paid',
    category: 'completed',
    status: 'Completed',
  },
  {
    id: 'bk-4',
    date: 'November 25, 2026',
    time: '7:00 - 8:00 AM',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    paymentStatus: 'Paid',
    category: 'completed',
    status: 'Completed',
  },
  {
    id: 'bk-5',
    date: 'October 24, 2026',
    time: '7:00 - 8:00 AM',
    student: 'Patricia Arquileta',
    lesson: 'Drum Lesson',
    wants: 'Nov 2, 10:00 - 11:00 PM',
    paymentStatus: 'Paid',
    category: 'rescheduled',
    status: 'Pending Reschedule',
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

export default function CoachBookings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [suggestTimeInput, setSuggestTimeInput] = useState('Nov 3, 2:00 - 3:00 PM');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [bookings, setBookings] = useState(DEFAULT_BOOKINGS);

  // Notification Bell state
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const bellRef = useRef(null);

  const loadBookingsData = async () => {
    try {
      const [bookRes, notifRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/bookings`),
        fetch(`${API_BASE_URL}/api/notifications`)
      ]);
      if (bookRes.status === 'fulfilled' && bookRes.value.ok) {
        const data = await bookRes.value.json();
        const incoming = Array.isArray(data) ? data : data?.bookings;
        if (incoming) setBookings(incoming);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
        const notifData = await notifRes.value.json();
        if (Array.isArray(notifData) && notifData.length > 0) {
          setNotifications(notifData);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadBookingsData();
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

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'rescheduled', label: 'Rescheduled' },
  ];

  const inProgressList = bookings.filter((b) => b.category === 'in-progress');
  const completedList = bookings.filter((b) => b.category === 'completed');
  const rescheduledList = bookings.filter((b) => b.category === 'rescheduled');

  const handleMarkCompleted = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}/complete`, { method: 'POST' });
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, category: 'completed', status: 'Completed' } : b))
    );
    setNotificationMsg('Session marked as completed!');
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  const handleAcceptReschedule = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}/reschedule-accept`, { method: 'POST' });
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            date: 'November 02, 2026',
            time: '10:00 - 11:00 PM',
            category: 'in-progress',
            status: 'Reschedule Confirmed',
            wants: null,
          };
        }
        return b;
      })
    );
    setNotificationMsg('Reschedule request accepted! Session updated to Nov 2, 10:00 - 11:00 PM.');
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleSuggestSubmit = async () => {
    if (!rescheduleModal) return;
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${rescheduleModal.id}/reschedule-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestedTime: suggestTimeInput }),
      });
    } catch (e) {}

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === rescheduleModal.id) {
          return {
            ...b,
            wants: `${suggestTimeInput} (Offer sent to student)`,
          };
        }
        return b;
      })
    );
    setRescheduleModal(null);
    setNotificationMsg(`Proposed counter-schedule (${suggestTimeInput}) sent to student!`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, { method: 'POST' });
    } catch (e) {}
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, { method: 'POST' });
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
        return <CalendarClock className="cb-notif-type-icon cb-notif-type-reschedule" />;
      case 'payment':
        return <Banknote className="cb-notif-type-icon cb-notif-type-payment" />;
      case 'schedule':
        return <Clock className="cb-notif-type-icon cb-notif-type-schedule" />;
      case 'student':
        return <UserCheck className="cb-notif-type-icon cb-notif-type-student" />;
      default:
        return <Bell className="cb-notif-type-icon cb-notif-type-default" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = notifications.filter(n => (notifFilter === 'unread' ? n.unread : true));

  return (
    <div className="cb-container">
      {/* Top Header bar */}
      <div className="cb-header">
        <div>
          <h1 className="cb-page-title">Bookings</h1>
          <p className="cb-page-subtitle">
            Every lessons that students book with you, grouped by what you need to do.
          </p>
        </div>

        {/* Self-contained Interactive Notification Bell */}
        <div className="cb-notif-wrapper" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="cb-notif-bell-btn"
            title="View Notifications"
            aria-label="View Studio Notifications"
          >
            <Bell className="cb-notif-bell-icon" />
            {unreadCount > 0 && (
              <span className="cb-notif-badge-count">{unreadCount}</span>
            )}
          </button>

          {isBellOpen && (
            <div className="cb-notif-dropdown">
              <div className="cb-notif-dropdown-header">
                <div className="cb-notif-header-left">
                  <Bell className="cb-notif-header-bell" />
                  <h4 className="cb-notif-header-title">Studio Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="cb-notif-header-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="cb-notif-header-actions">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="cb-notif-mark-all-btn"
                    >
                      <CheckCheck className="cb-notif-check-icon" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsBellOpen(false)}
                    className="cb-notif-close-btn"
                  >
                    <X className="cb-notif-close-icon" />
                  </button>
                </div>
              </div>

              <div className="cb-notif-filter-bar">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`cb-notif-filter-btn ${notifFilter === 'all' ? 'cb-notif-filter-btn-active' : ''}`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`cb-notif-filter-btn ${notifFilter === 'unread' ? 'cb-notif-filter-btn-active' : ''}`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="cb-notif-list-scroll">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`cb-notif-item-row ${
                        item.unread ? 'cb-notif-item-unread' : 'cb-notif-item-read'
                      }`}
                    >
                      <div className="cb-notif-item-icon-box">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="cb-notif-item-body">
                        <div className="cb-notif-item-top">
                          <p className="cb-notif-item-title">{item.title}</p>
                          <span className="cb-notif-item-time">{item.time}</span>
                        </div>
                        <p className="cb-notif-item-message">{item.message}</p>
                        <div className="cb-notif-item-footer">
                          <span className="cb-notif-action-link">
                            {item.actionLabel || 'View Details'}
                            <ChevronRight className="cb-notif-chevron-icon" />
                          </span>
                          {item.unread && <span className="cb-notif-unread-dot" />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cb-notif-empty">No notifications to display.</div>
                )}
              </div>

              <div className="cb-notif-dropdown-footer">
                <p className="cb-notif-footer-text">
                  RemDrumStudio Notification Service • Real-time alerts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {notificationMsg && (
        <div className="cb-toast">
          <CheckCircle2 className="cb-toast-icon" />
          {notificationMsg}
        </div>
      )}

      {/* Filter Tabs matching Figure 11 */}
      <div className="cb-tabs-row">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cb-tab ${isActive ? 'cb-tab-active' : 'cb-tab-inactive'}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bookings Card Container matching Figure 11 */}
      <div className="cb-card">
        {(activeTab === 'all' || activeTab === 'in-progress') && (
          <div className="cb-section">
            <h3 className="cb-section-heading">In Progress</h3>

            <div className="cb-list">
              {inProgressList.length > 0 ? (
                inProgressList.map((item) => (
                  <div key={item.id} className="cb-row-item">
                    <div className="cb-row-time">
                      <p className="cb-row-date">{item.date}</p>
                      <p className="cb-row-hours">{item.time}</p>
                    </div>

                    <div className="cb-row-student-col">
                      <p className="cb-row-student">{item.student}</p>
                      <p className="cb-row-lesson">{item.lesson}</p>
                    </div>

                    <div className="cb-row-actions">
                      <span className={item.paymentStatus === 'Unpaid' ? 'cb-pill-unpaid' : 'cb-pill-blue'}>
                        {item.paymentStatus}
                      </span>
                      {item.id === 'bk-1' ? (
                        <button
                          onClick={() => handleMarkCompleted(item.id)}
                          className="cb-btn-action"
                        >
                          Mark as Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedBooking(item)}
                          className="cb-btn-action"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="cb-empty-note">No in-progress lessons.</p>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'completed') && (
          <div className="cb-section cb-section-bordered">
            <h3 className="cb-section-heading">Completed</h3>

            <div className="cb-list">
              {completedList.length > 0 ? (
                completedList.map((item) => (
                  <div key={item.id} className="cb-row-item">
                    <div className="cb-row-time">
                      <p className="cb-row-date">{item.date}</p>
                      <p className="cb-row-hours">{item.time}</p>
                    </div>

                    <div className="cb-row-student-col">
                      <p className="cb-row-student">{item.student}</p>
                      <p className="cb-row-lesson">{item.lesson}</p>
                    </div>

                    <div className="cb-row-actions">
                      <span className="cb-pill-blue">{item.paymentStatus}</span>
                      <button
                        onClick={() => setSelectedBooking(item)}
                        className="cb-btn-action"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cb-empty-note">No completed lessons yet.</p>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'rescheduled') && (
          <div className="cb-section cb-section-bordered">
            <h3 className="cb-section-heading">Rescheduled Requests</h3>

            <div className="cb-list">
              {rescheduledList.length > 0 ? (
                rescheduledList.map((item) => (
                  <div key={item.id} className="cb-row-item cb-row-item-reschedule">
                    <div className="cb-row-time">
                      <p className="cb-row-date">{item.date}</p>
                      <p className="cb-row-hours">{item.time}</p>
                    </div>

                    <div className="cb-row-student-col">
                      <p className="cb-row-student">{item.student}</p>
                      <p className="cb-row-lesson">{item.lesson}</p>
                      {item.wants && (
                        <div className="cb-wants-wrap">
                          <span className="cb-wants-label">Wants:</span>
                          <span className="cb-wants-time">{item.wants}</span>
                        </div>
                      )}
                    </div>

                    <div className="cb-row-actions cb-row-actions-compact">
                      <span className="cb-pill-blue">{item.paymentStatus}</span>
                      <button
                        onClick={() => setRescheduleModal(item)}
                        className="cb-btn-action"
                      >
                        Suggest another time
                      </button>
                      <button
                        onClick={() => handleAcceptReschedule(item.id)}
                        className="cb-btn-action cb-accept-btn"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cb-empty-note">No active reschedule requests.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Self-contained Booking View Details Modal */}
      {selectedBooking && (
        <div className="cb-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="cb-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cb-modal-header">
              <h3 className="cb-modal-title">Booking Overview</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="cb-modal-close-btn"
              >
                <X className="cb-modal-close-icon" />
              </button>
            </div>
            <div className="cb-modal-content">
              <div className="cb-modal-body">
                <div className="cb-modal-banner">
                  <h4 className="cb-modal-lesson-title">{selectedBooking.lesson}</h4>
                  <p className="cb-modal-student">{selectedBooking.student}</p>
                  <div className="cb-modal-pills">
                    <span className="cb-pill-blue">{selectedBooking.status}</span>
                    <span className="cb-pill-blue">{selectedBooking.paymentStatus}</span>
                  </div>
                </div>

                <div className="cb-modal-grid">
                  <div className="cb-modal-tile">
                    <span className="cb-modal-tile-label">Session Date</span>
                    <span className="cb-modal-tile-value">{selectedBooking.date}</span>
                  </div>
                  <div className="cb-modal-tile">
                    <span className="cb-modal-tile-label">Time</span>
                    <span className="cb-modal-tile-value">{selectedBooking.time}</span>
                  </div>
                  <div className="cb-modal-tile">
                    <span className="cb-modal-tile-label">Payment Status</span>
                    <span className="cb-modal-tile-value">{selectedBooking.paymentStatus}</span>
                  </div>
                  <div className="cb-modal-tile">
                    <span className="cb-modal-tile-label">Studio Fee</span>
                    <span className="cb-modal-tile-value">₱ 500</span>
                  </div>
                </div>

                <div className="cb-modal-footer">
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="cb-btn-dark"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self-contained Suggest Another Time Modal */}
      {rescheduleModal && (
        <div className="cb-modal-backdrop" onClick={() => setRescheduleModal(null)}>
          <div className="cb-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cb-modal-header">
              <h3 className="cb-modal-title">Suggest Another Lesson Slot</h3>
              <button
                onClick={() => setRescheduleModal(null)}
                className="cb-modal-close-btn"
              >
                <X className="cb-modal-close-icon" />
              </button>
            </div>
            <div className="cb-modal-content">
              <div className="cb-modal-body">
                <p className="cb-suggest-desc">
                  Student <strong className="cb-suggest-student">{rescheduleModal.student}</strong> requested to move their session to
                  <span className="cb-suggest-wants">{rescheduleModal.wants}</span>.
                </p>

                <div>
                  <label className="cb-suggest-label">
                    Your Proposed Replacement Time
                  </label>
                  <input
                    type="text"
                    value={suggestTimeInput}
                    onChange={(e) => setSuggestTimeInput(e.target.value)}
                    placeholder="e.g. Nov 3, 2:00 - 3:00 PM"
                    className="cb-suggest-input"
                  />
                  <p className="cb-suggest-hint">
                    The student will be prompted to confirm this slot in their Student Dashboard.
                  </p>
                </div>

                <div className="cb-modal-footer">
                  <button
                    onClick={() => setRescheduleModal(null)}
                    className="cb-btn-action"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSuggestSubmit}
                    className="cb-btn-dark"
                  >
                    Send Proposal to Student
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
