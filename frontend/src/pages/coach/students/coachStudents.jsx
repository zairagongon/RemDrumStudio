import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Mail,
  Phone,
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
import './coachStudents.css';

const DEFAULT_STUDENTS = [
  {
    id: 'st-1',
    initials: 'JM',
    name: 'Justin Marcial',
    email: 'justinmarcial@gmail.com',
    nextLessonDate: 'November 01, 2026',
    nextLessonTime: '2:00 - 3:00 PM',
    status: 'Active',
    paymentStatus: 'Unpaid',
    phone: '+63 912 345 6789',
    guardian: 'Maria Marcial',
    instrument: 'Drum Kit (Rock & Jazz Fundamentals)',
    progress: 'Grade 2 - Groove & Rudiments',
    attendedSessions: 14,
  },
  {
    id: 'st-2',
    initials: 'PA',
    name: 'Patricia Arquileta',
    email: 'patriciaarquileta@gmail.com',
    nextLessonDate: 'October 24, 2026',
    nextLessonTime: '2:00 - 3:00 PM',
    status: 'Completed',
    paymentStatus: 'Paid',
    phone: '+63 923 456 7890',
    guardian: 'Ronald Arquileta',
    instrument: 'Drum Kit (Advanced Snare & Fills)',
    progress: 'Grade 4 - Fast Syncopation',
    attendedSessions: 22,
  },
  {
    id: 'st-3',
    initials: 'DV',
    name: 'Darryl Villanueva',
    email: 'darrylvillanueva@gmail.com',
    nextLessonDate: 'October 01, 2026',
    nextLessonTime: '2:00 - 3:00 PM',
    status: 'Completed',
    paymentStatus: 'Paid',
    phone: '+63 934 567 8901',
    guardian: 'Elena Villanueva',
    instrument: 'Drum Kit (Double Bass & Timing)',
    progress: 'Grade 3 - Double Kick Technique',
    attendedSessions: 19,
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

export default function CoachStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All Students');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Notification Bell state
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const bellRef = useRef(null);

  const loadStudentsData = async () => {
    try {
      const [studRes, notifRes] = await Promise.allSettled([
        api.get('/students'),
        api.get('/notifications')
      ]);
      if (studRes.status === 'fulfilled' && studRes.value) {
        const data = studRes.value;
        const incoming = Array.isArray(data) ? data : data?.students;
        if (incoming) setStudents(incoming);
      }
      if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) && notifRes.value.length > 0) {
        setNotifications(notifRes.value);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadStudentsData();
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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter =
        filterRole === 'All Students' ||
        student.status.toLowerCase() === filterRole.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [searchTerm, filterRole, students]);

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
        return <CalendarClock className="cst-notif-type-icon cst-notif-type-reschedule" />;
      case 'payment':
        return <Banknote className="cst-notif-type-icon cst-notif-type-payment" />;
      case 'schedule':
        return <Clock className="cst-notif-type-icon cst-notif-type-schedule" />;
      case 'student':
        return <UserCheck className="cst-notif-type-icon cst-notif-type-student" />;
      default:
        return <Bell className="cst-notif-type-icon cst-notif-type-default" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const filteredNotifications = notifications.filter(n => (notifFilter === 'unread' ? n.unread : true));

  return (
    <div className="cst-container">
      {/* Top Header bar */}
      <div className="cst-header">
        <div>
          <h1 className="cst-page-title">My Students</h1>
          <p className="cst-page-subtitle">
            Only students assigned to your lessons are shown.
          </p>
        </div>

        {/* Self-contained Interactive Notification Bell */}
        <div className="cst-notif-wrapper" ref={bellRef}>
          <button
            type="button"
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="cst-notif-bell-btn"
            title="View Notifications"
            aria-label="View Studio Notifications"
          >
            <Bell className="cst-notif-bell-icon" />
            {unreadCount > 0 && (
              <span className="cst-notif-badge-count">{unreadCount}</span>
            )}
          </button>

          {isBellOpen && (
            <div className="cst-notif-dropdown">
              <div className="cst-notif-dropdown-header">
                <div className="cst-notif-header-left">
                  <Bell className="cst-notif-header-bell" />
                  <h4 className="cst-notif-header-title">Studio Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="cst-notif-header-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="cst-notif-header-actions">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                      className="cst-notif-mark-all-btn"
                    >
                      <CheckCheck className="cst-notif-check-icon" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsBellOpen(false)}
                    className="cst-notif-close-btn"
                  >
                    <X className="cst-notif-close-icon" />
                  </button>
                </div>
              </div>

              <div className="cst-notif-filter-bar">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`cst-notif-filter-btn ${notifFilter === 'all' ? 'cst-notif-filter-btn-active' : ''}`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`cst-notif-filter-btn ${notifFilter === 'unread' ? 'cst-notif-filter-btn-active' : ''}`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              <div className="cst-notif-list-scroll">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`cst-notif-item-row ${
                        item.unread ? 'cst-notif-item-unread' : 'cst-notif-item-read'
                      }`}
                    >
                      <div className="cst-notif-item-icon-box">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="cst-notif-item-body">
                        <div className="cst-notif-item-top">
                          <p className="cst-notif-item-title">{item.title}</p>
                          <span className="cst-notif-item-time">{item.time}</span>
                        </div>
                        <p className="cst-notif-item-message">{item.message}</p>
                        <div className="cst-notif-item-footer">
                          <span className="cst-notif-action-link">
                            {item.actionLabel || 'View Details'}
                            <ChevronRight className="cst-notif-chevron-icon" />
                          </span>
                          {item.unread && <span className="cst-notif-unread-dot" />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cst-notif-empty">No notifications to display.</div>
                )}
              </div>

              <div className="cst-notif-dropdown-footer">
                <p className="cst-notif-footer-text">
                  RemDrumStudio Notification Service • Real-time alerts
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar matching Figure 10 */}
      <div className="cst-toolbar">
        <div className="cst-search-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="cst-search-input"
          />
          <Search className="cst-search-icon" />
        </div>

        <div className="cst-filter-wrap">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            aria-label="Filter students by status"
            className="cst-filter-select"
          >
            <option value="All Students">All Students</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
          <ChevronDown className="cst-filter-chevron" />
        </div>
      </div>

      {/* Student List Table Box matching Figure 10 */}
      <div className="cst-table-card">
        <div className="cst-table-header">
          <div className="cst-col-5">STUDENT</div>
          <div className="cst-col-4">NEXT LESSON</div>
          <div className="cst-col-3">STATUS</div>
        </div>

        <div className="cst-table-body">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((st) => (
              <div key={st.id} className="cst-table-row">
                <div className="cst-col-5 cst-info-cell">
                  <div className="cst-avatar">{st.initials}</div>
                  <div className="cst-text-truncate">
                    <p className="cst-name">{st.name}</p>
                    <p className="cst-email">{st.email}</p>
                  </div>
                </div>

                <div className="cst-col-4">
                  <p className="cst-next-date">{st.nextLessonDate}</p>
                  <p className="cst-next-time">{st.nextLessonTime}</p>
                </div>

                <div className="cst-col-3 cst-status-cell">
                  <div className="cst-pills-wrap">
                    <span className="cst-pill-blue">{st.status}</span>
                    <span className={st.paymentStatus === 'Unpaid' ? 'cst-pill-unpaid' : 'cst-pill-blue'}>
                      {st.paymentStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(st)}
                    className="cst-btn-action"
                  >
                    View Students
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="cst-empty">
              No students found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Self-contained Student Profile Detail Modal */}
      {selectedStudent && (
        <div className="cst-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="cst-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cst-modal-header">
              <h3 className="cst-modal-title">Student Details & Lesson Record</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="cst-modal-close-btn"
              >
                <X className="cst-modal-close-icon" />
              </button>
            </div>
            <div className="cst-modal-content">
              <div className="cst-modal-body">
                <div className="cst-modal-banner">
                  <div className="cst-avatar cst-modal-avatar">
                    {selectedStudent.initials}
                  </div>
                  <div className="cst-modal-info">
                    <h4 className="cst-modal-name">{selectedStudent.name}</h4>
                    <div className="cst-modal-contacts">
                      <span className="cst-modal-contact-item">
                        <Mail className="cst-modal-contact-icon" />
                        {selectedStudent.email}
                      </span>
                      <span className="cst-modal-contact-item">
                        <Phone className="cst-modal-contact-icon" />
                        {selectedStudent.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cst-modal-grid">
                  <div className="cst-modal-tile">
                    <span className="cst-modal-tile-label">Guardian Contact</span>
                    <span className="cst-modal-tile-value">{selectedStudent.guardian || 'Parent/Guardian'}</span>
                  </div>
                  <div className="cst-modal-tile">
                    <span className="cst-modal-tile-label">Total Attended</span>
                    <span className="cst-modal-tile-value">{selectedStudent.attendedSessions} Sessions</span>
                  </div>
                  <div className="cst-modal-tile cst-modal-tile-wide">
                    <span className="cst-modal-tile-label">Current Program</span>
                    <span className="cst-modal-tile-value">{selectedStudent.instrument}</span>
                    <p className="cst-modal-progress">{selectedStudent.progress}</p>
                  </div>
                </div>

                <div className="cst-modal-schedule">
                  <div>
                    <span className="cst-modal-schedule-label">Upcoming Scheduled Session</span>
                    <span className="cst-modal-schedule-value">{selectedStudent.nextLessonDate} at {selectedStudent.nextLessonTime}</span>
                  </div>
                  <div className="cst-pills-wrap">
                    <span className="cst-pill-blue">{selectedStudent.status}</span>
                    <span className={selectedStudent.paymentStatus === 'Unpaid' ? 'cst-pill-unpaid' : 'cst-pill-blue'}>
                      {selectedStudent.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="cst-modal-footer">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="cst-btn-dark"
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
