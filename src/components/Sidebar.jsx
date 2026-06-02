import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaClipboardList,
  FaCommentDots,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserPlus,
  FaBars,
  FaChartLine,
  FaCog,
  FaHeadset,
  FaGift,
  FaStore,
  FaBox,
  FaTruck,
  FaShoppingCart,
} from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.href = "/";
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItemStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: isActive(path) ? "rgba(255, 215, 0, 0.15)" : "transparent",
    color: isActive(path) ? "#FFD700" : "#E5E7EB",
    transition: "all 0.2s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  });

  const iconStyle = (path) => ({
    fontSize: "18px",
    minWidth: "20px",
    color: isActive(path) ? "#FFD700" : "#9CA3AF",
    transition: "color 0.2s ease",
  });

  return (
    <div
      className="sidebar"
      style={{
        backgroundColor: "#0f172a",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: isOpen ? "260px" : "80px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
        overflowY: "auto",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)",
        }}
      />

      {/* Logo Section */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          position: "relative",
        }}
      >
        {isOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite",
              }}
            >
              <span style={{ fontSize: "20px" }}>🎰</span>
            </div>
            <div>
              <h5
                style={{
                  margin: 0,
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Casino Admin
              </h5>
              <small style={{ color: "#64748B", fontSize: "10px" }}>
                Management Portal
              </small>
            </div>
          </div>
        )}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 215, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          }}
        >
          <FaBars style={{ color: "#FFD700", fontSize: "18px" }} />
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: "0 12px" }}>
        {/* Dashboard */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/")}
            onMouseEnter={() => setHoveredItem("dashboard")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaTachometerAlt style={iconStyle("/")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Dashboard</span>}
            {hoveredItem === "dashboard" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                Dashboard
              </div>
            )}
          </div>
        </Link>

        {/* Users Dropdown */}
        <div>
          <div
            onClick={() => setShowUsersDropdown(!showUsersDropdown)}
            style={{
              ...menuItemStyle("/users"),
              justifyContent: "space-between",
            }}
            onMouseEnter={() => setHoveredItem("users")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUsers style={iconStyle("/users")} />
              {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Users</span>}
            </div>
            {isOpen && (
              showUsersDropdown ? <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} /> : <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
            )}
          </div>

          {showUsersDropdown && isOpen && (
            <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
              <Link to="/active-users" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/active-users") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/active-users") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive("/active-users")) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive("/active-users")) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  👥 Active Users
                </div>
              </Link>
              <Link to="/pending-users" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/pending-users") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/pending-users") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  ⏳ Pending Users
                </div>
              </Link>
              <Link to="/suspended-users" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/suspended-users") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/suspended-users") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  ⚠️ Suspended Users
                </div>
              </Link>
              <Link to="/rejected-users" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/rejected-users") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/rejected-users") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  ❌ Rejected Users
                </div>
              </Link>
              <Link to="/add-user" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/add-user") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/add-user") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  <FaUserPlus style={{ fontSize: "12px", marginRight: "8px" }} />
                  Add User
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Employees */}
        <Link to="/employees" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/employees")}
            onMouseEnter={() => setHoveredItem("employees")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaUserTie style={iconStyle("/employees")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Employees</span>}
            {hoveredItem === "employees" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                Employees
              </div>
            )}
          </div>
        </Link>

        {/* Bookings */}
        <Link to="/bookings" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/bookings")}
            onMouseEnter={() => setHoveredItem("bookings")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaCalendarCheck style={iconStyle("/bookings")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Bookings</span>}
            {hoveredItem === "bookings" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                }}
              >
                Bookings
              </div>
            )}
          </div>
        </Link>

        {/* Inventory Dropdown */}
        <div>
          <div
            onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
            style={{
              ...menuItemStyle("/inventory"),
              justifyContent: "space-between",
            }}
            onMouseEnter={() => setHoveredItem("inventory")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaBox style={iconStyle("/inventory")} />
              {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Inventory</span>}
            </div>
            {isOpen && (
              showInventoryDropdown ? <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} /> : <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
            )}
          </div>

          {showInventoryDropdown && isOpen && (
            <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
              <Link to="/inventory/items" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/inventory/items") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/inventory/items") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  📦 All Items
                </div>
              </Link>
              <Link to="/inventory/add" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    color: isActive("/inventory/add") ? "#FFD700" : "#CBD5E1",
                    backgroundColor: isActive("/inventory/add") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                    fontSize: "13px",
                  }}
                >
                  ➕ Add Item
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Orders */}
        <Link to="/inventory/orders" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/inventory/orders")}
            onMouseEnter={() => setHoveredItem("orders")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaShoppingCart style={iconStyle("/inventory/orders")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Orders</span>}
            {hoveredItem === "orders" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                Orders
              </div>
            )}
          </div>
        </Link>

        {/* Payments */}
        <Link to="/payments" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/payments")}
            onMouseEnter={() => setHoveredItem("payments")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaMoneyBillWave style={iconStyle("/payments")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Payments</span>}
            {hoveredItem === "payments" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                }}
              >
                Payments
              </div>
            )}
          </div>
        </Link>

        {/* Reports */}
        <Link to="/reports" style={{ textDecoration: "none" }}>
          <div
            style={menuItemStyle("/reports")}
            onMouseEnter={() => setHoveredItem("reports")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <FaClipboardList style={iconStyle("/reports")} />
            {isOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Reports</span>}
            {hoveredItem === "reports" && !isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "70px",
                  backgroundColor: "#1e293b",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  zIndex: 1001,
                }}
              >
                Reports
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Bottom Section */}
      <div style={{ padding: "20px 12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            marginTop: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
          }}
        >
          <FaSignOutAlt style={{ color: "#EF4444", fontSize: "18px" }} />
          {isOpen && <span style={{ fontSize: "14px", fontWeight: "500", color: "#EF4444" }}>Logout</span>}
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .sidebar::-webkit-scrollbar-thumb {
          background: #FFD700;
          border-radius: 4px;
        }
        
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #FFA500;
        }
      `}</style>
    </div>
  );
}

export default Sidebar;