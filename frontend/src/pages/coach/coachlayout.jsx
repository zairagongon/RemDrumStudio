import React, { useState, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutGrid,
  CalendarPlus,
  BookOpen,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  Camera,
  RotateCcw,
  Upload,
  Menu,
  X
} from 'lucide-react';
import './coachlayout.css';

// =========================================================================
// 🥁 [REMARKS: DITO MO PAPALITAN ANG LOGO NG DRUMS SA CODE] 🥁
// =========================================================================
// Palitan lamang ang string path o URL sa ibaba para sa iyong logo.
// Halimbawa:
//   1. Kung may larawan ka sa public folder (e.g. /public/assets/my_drums.png):
//      export const DRUM_LOGO_IMAGE_PATH = '/assets/my_drums.png';
//
//   2. Kung galing sa web o online link:
//      export const DRUM_LOGO_IMAGE_PATH = 'https://example.com/logo.png';
// =========================================================================
export const DRUM_LOGO_IMAGE_PATH = '/assets/drum_logo.png';
// =========================================================================

export default function CoachLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoImage, setLogoImage] = useState(() => {
    return localStorage.getItem('remdrum_custom_logo') || DRUM_LOGO_IMAGE_PATH;
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'schedule', label: 'My Schedule', icon: CalendarPlus },
    { id: 'students', label: 'My Students', icon: BookOpen },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  // Handle direct file upload from user's device
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setLogoImage(result);
          localStorage.setItem('remdrum_custom_logo', result);
          setIsLogoModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL logo input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (imageUrlInput.trim()) {
      setLogoImage(imageUrlInput.trim());
      localStorage.setItem('remdrum_custom_logo', imageUrlInput.trim());
      setImageUrlInput('');
      setIsLogoModalOpen(false);
    }
  };

  // Reset to default drum logo
  const handleResetDefault = () => {
    setLogoImage(DRUM_LOGO_IMAGE_PATH);
    localStorage.removeItem('remdrum_custom_logo');
    setIsLogoModalOpen(false);
  };

  const renderSidebarContent = (onItemClick) => (
    <aside className="coach-sidebar-aside">
      <div>
        {/* Hidden File Input for instant logo replacement */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="coach-hidden-input"
          onChange={handleFileUpload}
        />

        {/* Brand Logo & Drum Picture matching Figure 8 / image_5b2f250b.png */}
        <div className="coach-brand-block">
          <div
            onClick={() => setIsLogoModalOpen(true)}
            className="coach-logo-trigger"
            title="Click to replace logo / Pindutin para palitan ang logo ng drums"
          >
           <img
              src={logoImage || DRUM_LOGO_IMAGE_PATH}
              alt="RemDrumStudio Drums Logo"
              className="coach-logo-img"
              onError={(e) => {
                e.currentTarget.src = DRUM_LOGO_IMAGE_PATH;
              }}
            />

            <div className="coach-logo-overlay">
              <Camera className="coach-logo-camera" />
              <span>Change</span>
            </div>
          </div>

          <div className="coach-brand-wrap">
            <h2 className="coach-brand-title">RemDrumStudio</h2>
            <div className="coach-divider" />
          </div>
        </div>

        {/* Section Header */}
        <div className="coach-section-header">
          <p className="coach-section-label">Tutor's Workspace</p>
        </div>

        {/* Navigation Menu */}
        <nav className="coach-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.id}
                onClick={() => {
                  if (onItemClick) onItemClick();
                }}
                className={({ isActive }) =>
                  `coach-nav-link ${isActive ? 'coach-nav-link-active' : ''}`
                }
              >
                <Icon className="coach-nav-icon" />
                <span className="coach-nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Tutor Profile at Bottom matching Figure 8 */}
      <div className="coach-profile-footer">
        <div className="coach-profile-card">
          <div className="coach-profile-info">
            <div className="coach-avatar-box">PP</div>
            <div className="coach-profile-text">
              <p className="coach-profile-name">Pedro Penduco</p>
              <p className="coach-profile-role">Tutor</p>
            </div>
          </div>
          <ChevronRight className="coach-profile-chevron" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="coach-layout-shell">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="coach-mobile-toggle"
        aria-label="Toggle Navigation Menu"
      >
        {mobileMenuOpen ? (
          <X className="coach-mobile-toggle-icon" />
        ) : (
          <Menu className="coach-mobile-toggle-icon" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <div className="coach-desktop-sidebar">
        {renderSidebarContent()}
      </div>

      {/* Mobile Slide-over Sidebar */}
      {mobileMenuOpen && (
        <div className="coach-mobile-drawer">
          <div
            className="coach-mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="coach-mobile-panel">
            {renderSidebarContent(() => setMobileMenuOpen(false))}
          </div>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <div className="coach-main-canvas">
        <main className="coach-main-scroll">
          <Outlet />
        </main>
      </div>

      {/* Change Logo Modal */}
      {isLogoModalOpen && (
        <div className="coach-modal-backdrop" onClick={() => setIsLogoModalOpen(false)}>
          <div className="coach-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="coach-modal-header">
              <h3 className="coach-modal-title">Palitan ang Drums Logo / Change Logo</h3>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="coach-modal-close-btn"
              >
                <X className="coach-modal-close-icon" />
              </button>
            </div>
            <div className="coach-modal-content">
              <div className="coach-modal-body">
                <p className="coach-modal-desc">
                  Maaari kang mag-upload ng sarili mong larawan ng drums (PNG/JPG) o maglagay ng image URL para sa logo ng RemDrumStudio.
                </p>

                <div className="coach-logo-preview-box">
                  <span className="coach-preview-label">
                    Kasalukuyang Logo Preview:
                  </span>
                  <img
                    src={logoImage}
                    alt="Preview"
                    className="coach-preview-img"
                  />
                  <p className="coach-preview-brand">RemDrumStudio</p>
                </div>

                <div className="coach-option-box">
                  <span className="coach-option-title">
                    1. Mag-upload ng larawan mula sa iyong computer o phone:
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="coach-upload-btn"
                  >
                    <Upload className="coach-upload-icon" />
                    Pumili ng Image File (PNG, JPG, SVG)
                  </button>
                </div>

                <form onSubmit={handleUrlSubmit} className="coach-option-box">
                  <span className="coach-option-title">
                    2. O mag-paste ng Image URL link:
                  </span>
                  <div className="coach-url-row">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/drum-logo.png"
                      className="coach-url-input"
                    />
                    <button type="submit" className="coach-btn-dark">
                      Gamitin
                    </button>
                  </div>
                </form>

                <div className="coach-modal-actions">
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="coach-reset-btn"
                  >
                    <RotateCcw className="coach-reset-icon" />
                    Ibalik sa Original Drums
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(false)}
                    className="coach-btn-dark"
                  >
                    Isara
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
