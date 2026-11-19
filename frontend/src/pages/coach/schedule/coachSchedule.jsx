import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Bell,
  CheckCheck,
  CalendarClock,
  Banknote,
  UserCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { api } from '../../../services/api.js';
import { getSession } from '../../../services/auth.js';
import './coachSchedule.css';

const DEFAULT_COLUMNS = {
  MON: [
    { id: 'mon-1', time: '2:00 PM', status: 'BOOKED' },
    { id: 'mon-2', time: '3:00 PM', status: 'BOOKED' },
  ],
  TUE: [
    { id: 'tue-1', time: '9:00 AM', status: 'AVAILABLE' },
  ],
  WED: [
    { id: 'wed-1', time: '7:00 AM', status: 'BOOKED' },
    { id: 'wed-2', time: '11:00 AM', status: 'AVAILABLE' },
  ],
  THU: [
    { id: 'thu-1', time: '7:00 AM', status: 'BOOKED' },
  ],
  FRI: [
    { id: 'fri-1', time: '2:00 PM', status: 'BOOKED' },
  ],
  SAT: [],
  SUN: [
    { id: 'sun-1', time: '11:00 AM', status: 'AVAILABLE' },
  ],
};

const DEFAULT_SLOTS = [
  {
    id: 'wls-1',
    date: 'October 24, 2026',
    time: '2:00 - 3:00 PM',
    tutor: 'Rem Diaz',
    lesson: 'Drum Lesson',
    status: 'Booked',
  },
  {
    id: 'wls-2',
    date: 'October 26, 2026',
    time: '2:00 - 3:00 PM',
    tutor: 'Rem Diaz',
    lesson: 'Drum Lesson',
    status: 'Booked',
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

export default function CoachSchedule() {
  const navigate = useNavigate();

  const [dateInput, setDateInput] = useState('2026-10-28');
  const [startInput, setStartInput] = useState('9:00 AM');
  const [endInput, setEndInput] = useState('10:00 AM');
  const [editingSlot, setEditingSlot] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  const [weeklyColumns, setWeeklyColumns] = useState(DEFAULT_COLUMNS);
  const [weeklyLessonSlots, setWeeklyLessonSlots] = useState(DEFAULT_SLOTS);

  // Notification Bell state
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const bellRef = useRef(null);

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const session = getSession();
  const tutorDisplayName =
    session?.user?.name ||
    [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(' ') ||
    'Rem Diaz';

  const loadScheduleData = async () => {
    try {
      const [schedRes, notifRes] = await Promise.allSettled([
        api.get('/schedules'),
        api.get('/notifications')
      ]);
      if (schedRes.status === 'fulfilled' && schedRes.value) {
        const data = schedRes.value;
        if (data.weeklyColumns) setWeeklyColumns(data.weeklyColumns);
        if (data.weeklyLessonSlots) setWeeklyLessonSlots(data.weeklyLessonSlots);
      }
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) && notifRes.value.length > 0) {
        setNotifications(notifRes.value);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadScheduleData();
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

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!dateInput || !startInput || !endInput) {
      setAlertMsg('Please specify date, start time, and end time.');
      return;
    }

    try {
      const resData = await api.post('/schedules/create-slot', {
        date: dateInput,
        start: startInput,
        end: endInput,
      });
      let dayName = 'TUE';
      try {
        const d = new Date(dateInput);
        const daysMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        dayName = daysMap[d.getDay()] || 'TUE';
      } catch (err) {}

      setWeeklyColumns(prev => ({
        ...prev,
        [dayName]: [
          ...(prev[dayName] || []),
          resData.slot || { id: `slot-${Date.now()}`, time: startInput, status: 'AVAILABLE' }
        ]
      }));

      setWeeklyLessonSlots(prev => [
        resData.weeklySlot || {
          id: `wls-${Date.now()}`,
          date: dateInput,
          time: `${startInput} - ${endInput}`,
          tutor: tutorDisplayName,
          lesson: 'Drum Lesson',
          status: 'Available',
        },
        ...prev,
      ]);

      setAlertMsg('New available slot added to your teaching schedule!');
      setTimeout(() => setAlertMsg(''), 4000);
    } catch (err) {
      setWeeklyColumns(prev => ({
        ...prev,
        TUE: [...(prev.TUE || []), { id: `slot-${Date.now()}`, time: startInput, status: 'AVAILABLE' }]
      }));
      setAlertMsg('Slot created locally!');
      setTimeout(() => setAlertMsg(''), 3000);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.post(`/schedules/${id}/delete`);
    } catch (e) {}
    setWeeklyLessonSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveEdit = async () => {
    if (!editingSlot) return;
    try {
      await api.patch(`/schedules/${editingSlot.id}`, editingSlot);
    } catch (e) {}
    setWeeklyLessonSlots(prev =>
      prev.map(s => (s.id === editingSlot.id ? editingSlot : s))
    );
    setEditingSlot(null);
    setAlertMsg('Schedule slot updated!');
    setTimeout(() => setAlertMsg(''), 3000);
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
        return <CalendarClock className="cs-notif-type-icon cs-notif-type-reschedule" />;
      case 'payment':
        return <Banknote className="cs-notif-type-icon cs-notif-type-payment" />;
      case 'schedule':
        return <Clock className="cs-notif-type-icon cs-notif-type-schedule" />;
      case 'student':
        return <UserCheck className="cs-notif-type-icon cs-notif-type-student" />;
      default:
        return <Bell className="cs-notif-type-icon cs-notif-type-default" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = notifications.filter(n => (notifFilter === 'unread' ? n.unread : true));

  return (
    <div className="cs-container">
      {/* Top Header bar */}
      <div className="cs-header">
        <div>
          <h1 className="cs-page-title">My Schedule</h1>
          <p className="cs-page-subtitle">
            Manage your booked lessons and available teaching time.
          </p>
        </div>

        {/* Self-contained Interactive Notification Bell */}
        <div className="cs-notif-wrapper" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="cs-notif-bell-btn"
            title="View Notifications"
            aria-label="View Studio Notifications"
          >
            <Bell className="cs-notif-bell-icon" />
            {unreadCount > 0 && (
              <span className="cs-notif-badge-count">{unreadCount}</span>
            )}
          </button>

          {isBellOpen && (
            <div className="cs-notif-dropdown">
              <div className="cs-notif-dropdown-header">
                <div className="cs-notif-header-left">
                  <Bell className="cs-notif-header-bell" />
                  <h4 className="cs-notif-header-title">Studio Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="cs-notif-header-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="cs-notif-header-actions">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="cs-notif-mark-all-btn"
                    >
                      <CheckCheck className="cs-notif-check-icon" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsBellOpen(false)}
                    className="cs-notif-close-btn"
                  >
                    <X className="cs-notif-close-icon" />
                  </button>
                </div>
              </div>

              <div className="cs-notif-filter-bar">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`cs-notif-filter-btn ${notifFilter === 'all' ? 'cs-notif-filter-btn-active' : ''}`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`cs-notif-filter-btn ${notifFilter === 'unread' ? 'cs-notif-filter-btn-active' : ''}`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="cs-notif-list-scroll">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`cs-notif-item-row ${
                        item.unread ? 'cs-notif-item-unread' : 'cs-notif-item-read'
                      }`}
                    >
                      <div className="cs-notif-item-icon-box">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="cs-notif-item-body">
                        <div className="cs-notif-item-top">
                          <p className="cs-notif-item-title">{item.title}</p>
                          <span className="cs-notif-item-time">{item.time}</span>
                        </div>
                        <p className="cs-notif-item-message">{item.message}</p>
                        <div className="cs-notif-item-footer">
                          <span className="cs-notif-action-link">
                            {item.actionLabel || 'View Details'}
                            <ChevronRight className="cs-notif-chevron-icon" />
                          </span>
                          {item.unread && <span className="cs-notif-unread-dot" />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cs-notif-empty">No notifications to display.</div>
                )}
              </div>

              <div className="cs-notif-dropdown-footer">
                <p className="cs-notif-footer-text">
                  RemDrumStudio Notification Service • Real-time alerts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {alertMsg && (
        <div className="cs-alert">{alertMsg}</div>
      )}

      {/* Top Creation Form matching Figure 9 */}
      <div className="cs-form-card">
        <form onSubmit={handleCreateSlot} className="cs-form-grid">
          <div>
            <label className="cs-field-label">Date</label>
            <div className="cs-input-wrap">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="YYYY-MM-DD or October 28, 2026"
                className="cs-input"
              />
              <Calendar className="cs-input-icon" />
            </div>
          </div>

          <div>
            <label className="cs-field-label">Start</label>
            <div className="cs-input-wrap">
              <input
                type="text"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                placeholder="2:00 PM"
                className="cs-input"
              />
              <Clock className="cs-input-icon" />
            </div>
          </div>

          <div>
            <label className="cs-field-label">End</label>
            <div className="cs-input-wrap">
              <input
                type="text"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                placeholder="3:00 PM"
                className="cs-input"
              />
              <Clock className="cs-input-icon" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="cs-btn-dark cs-submit-btn"
            >
              Create Available Slot
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Schedule View Box matching Figure 9 */}
      <div className="cs-week-wrapper">
        <div className="cs-week-grid">
          {daysOfWeek.map((day) => (
            <div key={day} className="cs-day-col">
              <div className="cs-day-header">
                <span className="cs-day-label">{day}</span>
              </div>

              <div className="cs-day-body">
                {weeklyColumns[day] && weeklyColumns[day].length > 0 ? (
                  weeklyColumns[day].map((slot) => {
                    const isBooked = slot.status === 'BOOKED';
                    return (
                      <div
                        key={slot.id}
                        className={isBooked ? 'cs-slot-booked' : 'cs-slot-available'}
                      >
                        <p className="cs-slot-time">{slot.time}</p>
                        <p className="cs-slot-status">{slot.status}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="cs-unavailable-wrap">
                    <span className="cs-unavailable-text">Unavailable</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Lesson Slot Section matching Figure 9 */}
      <div className="cs-slots-card">
        <div>
          <h3 className="cs-slots-title">Weekly Lesson Slot</h3>
        </div>

        <div className="cs-slots-list">
          {weeklyLessonSlots.map((item) => (
            <div key={item.id} className="cs-slot-row">
              <div className="cs-slot-date-col">
                <p className="cs-slot-date">{item.date}</p>
                <p className="cs-slot-hours">{item.time}</p>
              </div>

              <div className="cs-slot-tutor-col">
                <p className="cs-slot-tutor">{item.tutor}</p>
                <p className="cs-slot-lesson">{item.lesson}</p>
              </div>

              <div className="cs-slot-actions">
                <span className="cs-pill-blue">{item.status}</span>
                <button
                  onClick={() => setEditingSlot({ ...item })}
                  className="cs-btn-action cs-edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSlot(item.id)}
                  className="cs-btn-action cs-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-contained Edit Slot Modal */}
      {editingSlot && (
        <div className="cs-modal-backdrop" onClick={() => setEditingSlot(null)}>
          <div className="cs-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cs-modal-header">
              <h3 className="cs-modal-title">Edit Weekly Lesson Slot</h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="cs-modal-close-btn"
              >
                <X className="cs-modal-close-icon" />
              </button>
            </div>
            <div className="cs-modal-content">
              <div className="cs-modal-body">
                <div>
                  <label className="cs-modal-label">Date</label>
                  <input
                    type="text"
                    value={editingSlot.date}
                    onChange={(e) => setEditingSlot({ ...editingSlot, date: e.target.value })}
                    className="cs-modal-input"
                  />
                </div>

                <div>
                  <label className="cs-modal-label">Time Range</label>
                  <input
                    type="text"
                    value={editingSlot.time}
                    onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                    className="cs-modal-input"
                  />
                </div>

                <div>
                  <label className="cs-modal-label">Status</label>
                  <select
                    value={editingSlot.status}
                    onChange={(e) => setEditingSlot({ ...editingSlot, status: e.target.value })}
                    className="cs-modal-input"
                  >
                    <option value="Booked">Booked</option>
                    <option value="Available">Available</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>

                <div className="cs-modal-footer">
                  <button
                    onClick={() => setEditingSlot(null)}
                    className="cs-btn-action"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="cs-btn-dark"
                  >
                    Save Changes
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
