import Navbar from "../components/Navbar";
import { Users, CalendarCheck, CreditCard, MessageSquare, TrendingUp, ArrowUp, ArrowDown, Activity, DollarSign, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserPlus,
  FaBars,
  FaBox,
  FaShoppingCart,
} from "react-icons/fa";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalFeedback: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
    feedbackGrowth: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const API_BASE_URL = "http://localhost:5000/api";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const bookingsRes = await axios.get(`${API_BASE_URL}/bookings`);
      const bookings = bookingsRes.data.success ? bookingsRes.data.bookings : [];
      
      let users = [];
      try {
        const usersRes = await axios.get(`${API_BASE_URL}/users`);
        users = usersRes.data.success ? usersRes.data.users : [];
      } catch (error) {
        console.log("Users endpoint not available yet");
      }
      
      let feedback = [];
      try {
        const feedbackRes = await axios.get(`${API_BASE_URL}/feedback`);
        feedback = feedbackRes.data.success ? feedbackRes.data.feedback : [];
      } catch (error) {
        console.log("Feedback endpoint not available yet");
      }
      
      const totalUsers = users.length;
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.price || 0), 0);
      const totalFeedback = feedback.length;
      const pendingBookings = bookings.filter(b => b.status === "Pending").length;
      const approvedBookings = bookings.filter(b => b.status === "Approved").length;
      const rejectedBookings = bookings.filter(b => b.status === "Rejected").length;
      
      const currentDate = new Date();
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const lastMonthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= lastMonthDate && bookingDate < currentDate;
      }).length;
      
      const lastMonthRevenue = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= lastMonthDate && bookingDate < currentDate;
      }).reduce((sum, booking) => sum + (booking.price || 0), 0);
      
      const bookingGrowth = lastMonthBookings === 0 ? 0 : ((totalBookings - lastMonthBookings) / lastMonthBookings) * 100;
      const revenueGrowth = lastMonthRevenue === 0 ? 0 : ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      
      const recentActivitiesData = bookings.slice(0, 6).map(booking => ({
        id: booking._id,
        user: booking.customerName,
        action: `made a booking for ${booking.gameTitle}`,
        time: getTimeAgo(booking.createdAt),
        type: "booking",
        amount: booking.price,
        status: booking.status
      }));
      
      const gameCount = {};
      bookings.forEach(booking => {
        if (booking.gameTitle) {
          const gameName = booking.gameTitle.replace(/[^\w\s]/g, '').trim();
          gameCount[gameName] = (gameCount[gameName] || 0) + 1;
        }
      });
      const topGamesData = Object.entries(gameCount)
        .map(([name, value]) => ({ name: name || "Unknown", value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      setStats({
        totalUsers,
        totalBookings,
        totalRevenue,
        totalFeedback,
        userGrowth: 0,
        bookingGrowth: Math.round(bookingGrowth),
        revenueGrowth: Math.round(revenueGrowth),
        feedbackGrowth: 0,
        pendingBookings,
        approvedBookings,
        rejectedBookings
      });
      
      setRecentActivities(recentActivitiesData);
      setBookingStatusData([
        { name: "Approved", value: approvedBookings, color: "#10B981" },
        { name: "Pending", value: pendingBookings, color: "#F59E0B" },
        { name: "Rejected", value: rejectedBookings, color: "#EF4444" }
      ]);
      setTopGames(topGamesData);
      
      generateChartData(bookings, selectedPeriod);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateChartData = (bookings, period) => {
    const now = new Date();
    let days = 7;
    let labels = [];
    
    if (period === "week") {
      days = 7;
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    } else if (period === "month") {
      days = 30;
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    } else if (period === "quarter") {
      days = 90;
      labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"];
    }
    
    const dailyRevenue = Array(days).fill(0);
    const dailyBookings = Array(days).fill(0);
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const diffDays = Math.floor((now - bookingDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays < days) {
        dailyRevenue[dailyRevenue.length - 1 - diffDays] += booking.price || 0;
        dailyBookings[dailyBookings.length - 1 - diffDays] += 1;
      }
    });
    
    const maxRevenue = Math.max(...dailyRevenue, 1);
    const chartDataArray = labels.slice(0, days).map((label, idx) => ({
      name: label,
      revenue: dailyRevenue[idx] || 0,
      bookings: dailyBookings[idx] || 0,
      height: (dailyRevenue[idx] / maxRevenue) * 100
    }));
    
    setChartData(chartDataArray);
  };
  
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };
  
  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    const bookingsRes = await axios.get(`${API_BASE_URL}/bookings`);
    const bookings = bookingsRes.data.success ? bookingsRes.data.bookings : [];
    generateChartData(bookings, period);
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.href = "/";
  };
  
  const StatCard = ({ title, value, icon: Icon, color, bgColor, growth, prefix = "" }) => {
    const isPositive = growth >= 0;
    return (
      <div className="stat-card" style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        border: "1px solid #E5E7EB",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 20px 25px -12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)";
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ 
            backgroundColor: bgColor, 
            borderRadius: "14px", 
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon size={24} color={color} />
          </div>
          {growth !== 0 && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "4px",
              backgroundColor: isPositive ? "#D1FAE5" : "#FEE2E2",
              padding: "4px 8px",
              borderRadius: "20px"
            }}>
              {isPositive ? <ArrowUp size={14} color="#10B981" /> : <ArrowDown size={14} color="#EF4444" />}
              <span style={{ fontSize: "12px", fontWeight: "600", color: isPositive ? "#10B981" : "#EF4444" }}>
                {Math.abs(growth)}%
              </span>
            </div>
          )}
        </div>
        <h3 style={{ fontSize: "13px", fontWeight: "500", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "32px", fontWeight: "700", color: "#111827", margin: 0 }}>
          {prefix}{value.toLocaleString()}
        </p>
      </div>
    );
  };
  
  // Custom Bar Chart Component
  const CustomBarChart = ({ data, title, subtitle }) => {
    const maxHeight = Math.max(...data.map(d => d.height), 1);
    
    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{title}</h3>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>{subtitle}</p>
          </div>
          <select 
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "13px",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              fontWeight: "500"
            }}
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 3 months</option>
          </select>
        </div>
        
        {data.length > 0 ? (
          <div style={{ height: "320px", display: "flex", alignItems: "flex-end", gap: "8px", marginTop: "20px" }}>
            {data.slice(0, 12).map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{
                  height: `${Math.max(item.height, 5)}%`,
                  width: "100%",
                  backgroundColor: "#4F46E5",
                  borderRadius: "8px 8px 4px 4px",
                  transition: "height 0.3s ease",
                  position: "relative",
                  cursor: "pointer"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    fontWeight: "500",
                    color: "#4F46E5",
                    whiteSpace: "nowrap"
                  }}>
                    KES {item.revenue.toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: "10px", color: "#6B7280", textAlign: "center" }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#9CA3AF" }}>No data available</p>
          </div>
        )}
      </div>
    );
  };
  
  // Custom Pie Chart Component
  const CustomPieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>Booking Status Distribution</h3>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Overview of booking approvals</p>
        </div>
        
        {data.some(d => d.value > 0) ? (
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <div style={{ position: "relative", width: "200px", height: "200px" }}>
                <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
                  {data.map((item, idx) => {
                    const angle = (item.value / total) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle += angle;
                    
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = 100 + 80 * Math.cos(startRad);
                    const y1 = 100 + 80 * Math.sin(startRad);
                    const x2 = 100 + 80 * Math.cos(endRad);
                    const y2 = 100 + 80 * Math.sin(endRad);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    return <path key={idx} d={pathData} fill={item.color} stroke="#FFFFFF" strokeWidth="2" />;
                  })}
                  <circle cx="100" cy="100" r="50" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
              {data.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: item.color }} />
                  <span style={{ fontSize: "13px", color: "#374151" }}>{item.name}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{item.value}</span>
                  <span style={{ fontSize: "11px", color: "#6B7280" }}>({((item.value / total) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#9CA3AF" }}>No booking data available</p>
          </div>
        )}
      </div>
    );
  };

  const menuItemStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#E5E7EB",
    transition: "all 0.2s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  });

  const iconStyle = {
    fontSize: "18px",
    minWidth: "20px",
    color: "#9CA3AF",
    transition: "color 0.2s ease",
  };
  
  if (loading) {
    return (
      <div style={{ display: "flex", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
        <div className="sidebar" style={{
          backgroundColor: "#0f172a",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          width: sidebarOpen ? "260px" : "80px",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          overflowY: "auto",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "30px", textAlign: "center", color: "#fff" }}>Loading...</div>
        </div>
        <div style={{ flex: 1, marginLeft: sidebarOpen ? "260px" : "80px", transition: "margin-left 0.3s ease" }}>
          <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <div style={{ padding: "30px", textAlign: "center" }}>
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: "#6B7280" }}>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container" style={{ display: "flex", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="sidebar" style={{
        backgroundColor: "#0f172a",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: sidebarOpen ? "260px" : "80px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
        overflowY: "auto",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Gradient Overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #FFD700, #FFA500, #FF8C00)",
        }} />

        {/* Logo Section */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          position: "relative",
        }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "20px" }}>🎰</span>
              </div>
              <div>
                <h5 style={{
                  margin: 0,
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Casino Admin
                </h5>
                <small style={{ color: "#64748B", fontSize: "10px" }}>Management Portal</small>
              </div>
            </div>
          )}
          <div
            onClick={toggleSidebar}
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
          >
            <FaBars style={{ color: "#FFD700", fontSize: "18px" }} />
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, padding: "0 12px" }}>
          {/* Dashboard */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/")}>
              <FaTachometerAlt style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Dashboard</span>}
            </div>
          </Link>

          {/* Users Dropdown */}
          <div>
            <div
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              style={{ ...menuItemStyle("/users"), justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaUsers style={iconStyle} />
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Users</span>}
              </div>
              {sidebarOpen && (
                showUsersDropdown ? <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} /> : <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
              )}
            </div>

            {showUsersDropdown && sidebarOpen && (
              <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
                <Link to="/active-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    👥 Active Users
                  </div>
                </Link>
                <Link to="/pending-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    ⏳ Pending Users
                  </div>
                </Link>
                <Link to="/suspended-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    ⚠️ Suspended Users
                  </div>
                </Link>
                <Link to="/rejected-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    ❌ Rejected Users
                  </div>
                </Link>
                <Link to="/add-user" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    <FaUserPlus style={{ fontSize: "12px", marginRight: "8px" }} />
                    Add User
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Employees */}
          <Link to="/employees" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/employees")}>
              <FaUserTie style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Employees</span>}
            </div>
          </Link>

          {/* Bookings */}
          <Link to="/bookings" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/bookings")}>
              <FaCalendarCheck style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Bookings</span>}
            </div>
          </Link>

          {/* Inventory Dropdown */}
          <div>
            <div
              onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
              style={{ ...menuItemStyle("/inventory"), justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaBox style={iconStyle} />
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Inventory</span>}
              </div>
              {sidebarOpen && (
                showInventoryDropdown ? <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} /> : <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
              )}
            </div>

            {showInventoryDropdown && sidebarOpen && (
              <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
                <Link to="/inventory/items" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    📦 All Items
                  </div>
                </Link>
                <Link to="/inventory/add" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "4px", color: "#CBD5E1", fontSize: "13px" }}>
                    ➕ Add Item
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <Link to="/inventory/orders" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/inventory/orders")}>
              <FaShoppingCart style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Orders</span>}
            </div>
          </Link>

          {/* Payments */}
          <Link to="/payments" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/payments")}>
              <FaMoneyBillWave style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Payments</span>}
            </div>
          </Link>

          {/* Reports */}
          <Link to="/reports" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle("/reports")}>
              <FaClipboardList style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Reports</span>}
            </div>
          </Link>
        </div>

        {/* Bottom Section - Logout Only */}
        <div style={{ padding: "20px 12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
          >
            <FaSignOutAlt style={{ color: "#EF4444", fontSize: "18px" }} />
            {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500", color: "#EF4444" }}>Logout</span>}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, marginLeft: sidebarOpen ? "260px" : "80px", transition: "margin-left 0.3s ease" }}>
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <div style={{ padding: "30px" }}>
          {/* Welcome Section */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#111827", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Welcome back! 👋
            </h1>
            <p style={{ color: "#6B7280", fontSize: "15px" }}>
              Here's what's happening with your platform today.
            </p>
          </div>
          
          {/* Stats Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}>
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#4F46E5" bgColor="#EEF2FF" growth={stats.userGrowth} />
            <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="#10B981" bgColor="#D1FAE5" growth={stats.bookingGrowth} />
            <StatCard title="Total Revenue" value={stats.totalRevenue} icon={CreditCard} color="#F59E0B" bgColor="#FEF3C7" growth={stats.revenueGrowth} prefix="KES " />
            <StatCard title="Feedback" value={stats.totalFeedback} icon={MessageSquare} color="#EF4444" bgColor="#FEE2E2" growth={stats.feedbackGrowth} />
          </div>
          
          {/* Additional Stats Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px"
          }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <Activity size={18} color="#F59E0B" />
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#6B7280" }}>Pending Bookings</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#F59E0B", margin: 0 }}>{stats.pendingBookings}</p>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <DollarSign size={18} color="#10B981" />
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#6B7280" }}>Approved Bookings</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#10B981", margin: 0 }}>{stats.approvedBookings}</p>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #E5E7EB", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                <ShoppingBag size={18} color="#EF4444" />
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#6B7280" }}>Rejected Bookings</span>
              </div>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#EF4444", margin: 0 }}>{stats.rejectedBookings}</p>
            </div>
          </div>
          
          {/* Charts Section */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}>
            <CustomBarChart data={chartData} title="Revenue Overview" subtitle="Track your revenue trends over time" />
            <CustomPieChart data={bookingStatusData} />
          </div>
          
          {/* Bottom Section */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px"
          }}>
            {/* Recent Activity */}
            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>Recent Activity</h3>
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>Latest actions on your platform</p>
                </div>
                <button 
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13px",
                    color: "#4F46E5",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}
                  onClick={() => window.location.href = "/bookings"}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6" }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF" }}
                >
                  View All →
                </button>
              </div>
              
              {recentActivities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentActivities.map((activity) => (
                    <div key={activity.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px",
                      borderRadius: "14px",
                      backgroundColor: "#F9FAFB",
                      transition: "all 0.2s",
                      border: "1px solid transparent"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB" }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; e.currentTarget.style.borderColor = "transparent" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "#D1FAE5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <CalendarCheck size={22} color="#10B981" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
                          {activity.user}
                        </p>
                        <p style={{ fontSize: "13px", color: "#6B7280" }}>{activity.action}</p>
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{activity.time}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "15px", fontWeight: "700", color: "#10B981" }}>
                          KES {activity.amount?.toLocaleString()}
                        </span>
                        <div>
                          <span className={`badge ${activity.status === "Approved" ? "bg-success" : activity.status === "Rejected" ? "bg-danger" : "bg-warning"} ${activity.status === "Pending" ? "text-dark" : "text-white"}`} style={{ fontSize: "10px", padding: "4px 8px", display: "inline-block" }}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <Activity size={48} color="#D1D5DB" />
                  <p style={{ color: "#9CA3AF", marginTop: "12px" }}>No recent activities</p>
                </div>
              )}
            </div>
            
            {/* Top Games */}
            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>Top Games</h3>
                <p style={{ fontSize: "13px", color: "#6B7280" }}>Most popular games by bookings</p>
              </div>
              
              {topGames.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {topGames.map((game, idx) => {
                    const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                    return (
                      <div key={idx} style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "#F9FAFB",
                        transition: "all 0.2s"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: colors[idx % colors.length] + "20",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <Star size={18} color={colors[idx % colors.length]} />
                          </div>
                          <div>
                            <p style={{ fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{game.name}</p>
                            <p style={{ fontSize: "12px", color: "#6B7280" }}>{game.value} bookings</p>
                          </div>
                        </div>
                        <div style={{ flex: 1, maxWidth: "150px" }}>
                          <div style={{
                            height: "6px",
                            backgroundColor: "#E5E7EB",
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${(game.value / topGames[0].value) * 100}%`,
                              height: "100%",
                              backgroundColor: colors[idx % colors.length],
                              borderRadius: "3px",
                              transition: "width 0.5s ease"
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <ShoppingBag size={48} color="#D1D5DB" />
                  <p style={{ color: "#9CA3AF", marginTop: "12px" }}>No game data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;