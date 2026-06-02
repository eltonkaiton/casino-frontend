import { useState, useEffect, useRef } from "react";
import { Bell, User, Settings, LogOut, ChevronDown, Menu, X, Moon, Sun } from "lucide-react";

function Navbar({ toggleSidebar, sidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New booking received", time: "2 min ago", read: false },
    { id: 2, message: "Payment processed successfully", time: "15 min ago", read: false },
    { id: 3, message: "New user registered", time: "1 hour ago", read: true },
    { id: 4, message: "System update completed", time: "3 hours ago", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="brand">
            <div className="brand-icon">🎰</div>
            <div className="brand-info">
              <h3 className="brand-title">Casino Admin</h3>
              <span className="brand-subtitle">Management Dashboard</span>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Dark Mode Toggle */}
          <button className="icon-btn" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className="icon-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="notification-content">
                          <p className="notification-message">{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                        {!notif.read && <div className="notification-dot"></div>}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                <div className="notification-footer">
                  <button className="view-all-btn">View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="profile-wrapper" ref={dropdownRef}>
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="profile-avatar">
                <User size={18} />
              </div>
              <div className="profile-info">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Super Administrator</span>
              </div>
              <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'rotate' : ''}`} />
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <User size={24} />
                  </div>
                  <div className="dropdown-user-info">
                    <h4>Admin User</h4>
                    <p>admin@casino.com</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <User size={18} />
                  <span>My Profile</span>
                </button>
                <button className="dropdown-item">
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .menu-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .menu-toggle:hover {
          background: rgba(255, 215, 0, 0.1);
          color: #FFD700;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          font-size: 28px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          color: #FFD700;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .brand-subtitle {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 2px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }

        .icon-btn:hover {
          background: rgba(255, 215, 0, 0.1);
          color: #FFD700;
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 20px;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 340px;
          background: #1e293b;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
        }

        .notification-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h4 {
          color: #FFD700;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .mark-all-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .mark-all-btn:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .notification-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .notification-item.unread {
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-content {
          flex: 1;
        }

        .notification-message {
          color: #fff;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .notification-time {
          color: #94a3b8;
          font-size: 11px;
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          margin-left: 12px;
        }

        .no-notifications {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }

        .notification-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .view-all-btn {
          background: none;
          border: none;
          color: #FFD700;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .view-all-btn:hover {
          opacity: 0.8;
        }

        .profile-wrapper {
          position: relative;
        }

        .profile-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          padding: 6px 12px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-btn:hover {
          background: rgba(255, 215, 0, 0.1);
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-avatar svg {
          color: #1e293b;
        }

        .profile-info {
          text-align: left;
        }

        .profile-name {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          display: block;
        }

        .profile-role {
          color: #94a3b8;
          font-size: 10px;
        }

        .dropdown-icon {
          color: #94a3b8;
          transition: transform 0.2s;
        }

        .dropdown-icon.rotate {
          transform: rotate(180deg);
        }

        .profile-dropdown {
          position: absolute;
          top: 55px;
          right: 0;
          width: 280px;
          background: #1e293b;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 215, 0, 0.1);
          overflow: hidden;
          z-index: 1000;
        }

        .dropdown-header {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
        }

        .dropdown-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-avatar svg {
          color: #1e293b;
        }

        .dropdown-user-info h4 {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }

        .dropdown-user-info p {
          color: #94a3b8;
          font-size: 11px;
          margin: 0;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 8px 0;
        }

        .dropdown-item {
          width: 100%;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        /* Dark Mode Styles */
        body.dark-mode .navbar {
          background: linear-gradient(135deg, #0f0f1a 0%, #0a0a0f 100%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar {
            padding: 0 16px;
          }
          
          .brand-info {
            display: none;
          }
          
          .profile-info {
            display: none;
          }
          
          .profile-btn {
            padding: 6px;
          }
          
          .notification-dropdown {
            width: 300px;
            right: -60px;
          }
          
          .profile-dropdown {
            right: -20px;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;