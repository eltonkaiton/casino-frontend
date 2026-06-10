import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaUserCircle,
  FaSearch,
  FaCheckCircle,
  FaComments,
  FaEnvelope,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaBox,
  FaShoppingCart,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaUserTie,
  FaUserPlus,
  FaTachometerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:5000/api";

const EmployeeChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedPosition, setSelectedPosition] = useState("all");
  const messagesEndRef = useRef(null);
  const positions = ["Administrator", "Service Manager", "Finance", "Supervisor"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    fetchAllConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAllConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const allMessages = [];

      for (const position of positions) {
        try {
          const response = await axios.get(`${API_BASE_URL}/chat/employee-messages`, {
            params: {
              employeeId: "admin",
              employeeName: "Admin",
              employeePosition: position,
            },
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          });

          if (response.data.success) {
            response.data.messages.forEach((msg) => {
              allMessages.push({
                ...msg,
                position: position,
              });
            });
          }
        } catch (error) {
          console.log(`Error fetching ${position} messages:`, error.message);
        }
      }

      const conversationMap = new Map();

      allMessages.forEach((msg) => {
        const key = `${msg.fromUserId}_${msg.toUserName}`;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            customerId: msg.fromUserId,
            customerName: msg.fromUserName,
            position: msg.toUserName,
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            unreadCount: msg.read ? 0 : 1,
            messages: [msg],
          });
        } else {
          const existing = conversationMap.get(key);
          if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
            existing.lastMessage = msg.message;
            existing.lastMessageTime = msg.createdAt;
          }
          if (!msg.read) {
            existing.unreadCount += 1;
          }
          existing.messages.push(msg);
        }
      });

      const conversationsList = Array.from(conversationMap.values());
      conversationsList.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      setConversations(conversationsList);

      const counts = {};
      positions.forEach((pos) => {
        counts[pos] = conversationsList
          .filter((c) => c.position === pos)
          .reduce((sum, c) => sum + c.unreadCount, 0);
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversation) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/chat/messages/by-position`, {
        params: {
          customerId: conversation.customerId,
          employeePosition: conversation.position,
        },
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (response.data.success) {
        const formattedMessages = response.data.messages.map((msg) => ({
          ...msg,
          sender: msg.senderType === "customer" ? "customer" : "employee",
        }));
        setMessages(formattedMessages);
        await markMessagesAsRead(conversation.customerId, conversation.position);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (customerId, position) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/chat/mark-read-by-position`,
        { customerId, employeePosition: position },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.customerId === customerId && conv.position === position
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/chat/send`,
        {
          fromUserId: "admin",
          fromUserName: user?.name || "Admin",
          toUserId: selectedConversation.customerId,
          toUserName: selectedConversation.customerName,
          message: messageText,
          senderType: "employee",
        },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      if (response.data.success) {
        const newMsg = {
          _id: Date.now().toString(),
          message: messageText,
          senderType: "employee",
          sender: "employee",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");

        setConversations((prev) =>
          prev.map((conv) =>
            conv.customerId === selectedConversation.customerId
              ? {
                  ...conv,
                  lastMessage: messageText,
                  lastMessageTime: new Date().toISOString(),
                }
              : conv
          )
        );

        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchConversationMessages(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    fetchAllConversations();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPositionColor = (position) => {
    switch (position) {
      case "Administrator":
        return "#EF4444";
      case "Service Manager":
        return "#F59E0B";
      case "Finance":
        return "#10B981";
      case "Supervisor":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === "all" || conv.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully");
    window.location.href = "/";
  };

  const menuItemStyle = () => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#E5E7EB",
    transition: "all 0.2s ease",
    cursor: "pointer",
  });

  const iconStyle = {
    fontSize: "18px",
    minWidth: "20px",
    color: "#9CA3AF",
  };

  const ConversationList = () => (
    <div style={styles.conversationList}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Customer Messages</h2>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.filterContainer}>
        <button
          onClick={() => setSelectedPosition("all")}
          style={{
            ...styles.filterButton,
            backgroundColor: selectedPosition === "all" ? "#4F46E5" : "#F3F4F6",
            color: selectedPosition === "all" ? "#FFF" : "#374151",
          }}
        >
          All
          {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
            <span style={styles.filterBadge}>
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(pos)}
            style={{
              ...styles.filterButton,
              backgroundColor: selectedPosition === pos ? getPositionColor(pos) : "#F3F4F6",
              color: selectedPosition === pos ? "#FFF" : "#374151",
            }}
          >
            {pos}
            {unreadCounts[pos] > 0 && (
              <span style={styles.filterBadge}>{unreadCounts[pos]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading conversations...</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div style={styles.emptyState}>
          <FaComments size={48} color="#D1D5DB" />
          <p>No conversations found</p>
          <small>Messages from customers will appear here</small>
        </div>
      ) : (
        <div style={styles.conversationsContainer}>
          {filteredConversations.map((conv) => (
            <div
              key={`${conv.customerId}_${conv.position}`}
              onClick={() => handleSelectConversation(conv)}
              style={{
                ...styles.conversationItem,
                backgroundColor: selectedConversation?.customerId === conv.customerId ? "#F3F4F6" : "#FFF",
                borderLeft: conv.unreadCount > 0 ? `3px solid ${getPositionColor(conv.position)}` : "3px solid transparent",
              }}
            >
              <div style={styles.avatarContainer}>
                <div style={styles.avatar}>{conv.customerName?.charAt(0).toUpperCase()}</div>
                {conv.unreadCount > 0 && <div style={styles.unreadDot} />}
              </div>
              <div style={styles.conversationInfo}>
                <div style={styles.conversationHeader}>
                  <span style={styles.customerName}>{conv.customerName}</span>
                  <span style={styles.messageTime}>{formatTime(conv.lastMessageTime)}</span>
                </div>
                <p style={styles.lastMessage}>{conv.lastMessage}</p>
                <span
                  style={{
                    ...styles.positionBadge,
                    backgroundColor: getPositionColor(conv.position) + "20",
                    color: getPositionColor(conv.position),
                  }}
                >
                  📍 {conv.position}
                </span>
              </div>
              {conv.unreadCount > 0 && <div style={styles.unreadCountBadge}>{conv.unreadCount}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ChatArea = () => (
    <div style={styles.chatArea}>
      <div style={styles.chatHeader}>
        <div style={styles.chatHeaderLeft}>
          <button onClick={handleBack} style={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div style={styles.chatAvatar}>{selectedConversation?.customerName?.charAt(0).toUpperCase()}</div>
          <div>
            <h3 style={styles.chatCustomerName}>{selectedConversation?.customerName}</h3>
            <span
              style={{
                ...styles.chatPositionBadge,
                backgroundColor: getPositionColor(selectedConversation?.position) + "20",
                color: getPositionColor(selectedConversation?.position),
              }}
            >
              Sent to: {selectedConversation?.position}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyChatState}>
            <FaEnvelope size={48} color="#D1D5DB" />
            <p>No messages yet</p>
            <small>Start a conversation with this customer</small>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === "customer" ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  backgroundColor: msg.sender === "customer" ? "#F3F4F6" : "#4F46E5",
                  color: msg.sender === "customer" ? "#111827" : "#FFF",
                }}
              >
                <p style={styles.messageText}>{msg.message}</p>
                <span style={styles.messageTime}>
                  {formatTime(msg.createdAt)}
                  {msg.sender === "employee" && <FaCheckCircle size={12} style={{ marginLeft: 4 }} />}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Type your reply..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          style={styles.messageInput}
        />
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          style={{
            ...styles.sendButton,
            opacity: !newMessage.trim() || sending ? 0.5 : 1,
            cursor: !newMessage.trim() || sending ? "not-allowed" : "pointer",
          }}
        >
          {sending ? <div style={styles.smallSpinner} /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
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
        }}
      >
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

        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
          }}
        >
          {sidebarOpen && (
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
            }}
          >
            <FaBars style={{ color: "#FFD700", fontSize: "18px" }} />
          </div>
        </div>

        <div style={{ flex: 1, padding: "0 12px" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle()}>
              <FaTachometerAlt style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Dashboard</span>}
            </div>
          </Link>

          <div style={{ cursor: "pointer" }}>
            <div style={{ ...menuItemStyle(), justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaComments size={18} color="#FFD700" />
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Messages</span>}
              </div>
            </div>
          </div>

          <div>
            <div
              onClick={() => setShowUsersDropdown(!showUsersDropdown)}
              style={{ ...menuItemStyle(), justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaUsers style={iconStyle} />
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Users</span>}
              </div>
              {sidebarOpen &&
                (showUsersDropdown ? (
                  <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} />
                ) : (
                  <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
                ))}
            </div>
            {showUsersDropdown && sidebarOpen && (
              <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
                <Link to="/active-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>👥 Active Users</div>
                </Link>
                <Link to="/pending-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>⏳ Pending Users</div>
                </Link>
                <Link to="/suspended-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>⚠️ Suspended Users</div>
                </Link>
                <Link to="/rejected-users" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>❌ Rejected Users</div>
                </Link>
                <Link to="/add-user" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>
                    <FaUserPlus style={{ fontSize: "12px", marginRight: "8px" }} />
                    Add User
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link to="/employees" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle()}>
              <FaUserTie style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Employees</span>}
            </div>
          </Link>

          <Link to="/bookings" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle()}>
              <FaCalendarCheck style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Bookings</span>}
            </div>
          </Link>

          <div>
            <div
              onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
              style={{ ...menuItemStyle(), justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaBox style={iconStyle} />
                {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Inventory</span>}
              </div>
              {sidebarOpen &&
                (showInventoryDropdown ? (
                  <FaChevronUp style={{ fontSize: "12px", color: "#9CA3AF" }} />
                ) : (
                  <FaChevronDown style={{ fontSize: "12px", color: "#9CA3AF" }} />
                ))}
            </div>
            {showInventoryDropdown && sidebarOpen && (
              <div style={{ marginLeft: "32px", marginTop: "8px", marginBottom: "12px" }}>
                <Link to="/inventory/items" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>📦 All Items</div>
                </Link>
                <Link to="/inventory/add" style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px 12px", color: "#CBD5E1", fontSize: "13px" }}>➕ Add Item</div>
                </Link>
              </div>
            )}
          </div>

          <Link to="/inventory/orders" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle()}>
              <FaShoppingCart style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Orders</span>}
            </div>
          </Link>

          <Link to="/payments" style={{ textDecoration: "none" }}>
            <div style={menuItemStyle()}>
              <FaMoneyBillWave style={iconStyle} />
              {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500" }}>Payments</span>}
            </div>
          </Link>
        </div>

        <div style={{ padding: "20px 12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            }}
          >
            <FaSignOutAlt style={{ color: "#EF4444", fontSize: "18px" }} />
            {sidebarOpen && <span style={{ fontSize: "14px", fontWeight: "500", color: "#EF4444" }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "260px" : "80px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div style={styles.container}>{!selectedConversation ? <ConversationList /> : <ChatArea />}</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 70px)",
    backgroundColor: "#F9FAFB",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  conversationList: {
    width: "380px",
    backgroundColor: "#FFF",
    borderRight: "1px solid #E5E7EB",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: { padding: "20px", borderBottom: "1px solid #E5E7EB" },
  headerTitle: { fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "16px" },
  searchBox: { position: "relative" },
  searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: "14px" },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
  },
  filterContainer: { padding: "12px 20px", display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: "1px solid #E5E7EB" },
  filterButton: { padding: "6px 12px", borderRadius: "20px", border: "none", fontSize: "12px", fontWeight: "500", cursor: "pointer", position: "relative" },
  filterBadge: { position: "absolute", top: "-4px", right: "-4px", backgroundColor: "#EF4444", color: "#FFF", borderRadius: "10px", padding: "2px 6px", fontSize: "10px", fontWeight: "bold" },
  conversationsContainer: { flex: 1, overflowY: "auto" },
  conversationItem: { display: "flex", padding: "16px 20px", cursor: "pointer", borderBottom: "1px solid #F3F4F6", position: "relative" },
  avatarContainer: { position: "relative", marginRight: "12px" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#4F46E5", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold" },
  unreadDot: { position: "absolute", bottom: "0", right: "0", width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10B981", border: "2px solid #FFF" },
  conversationInfo: { flex: 1 },
  conversationHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  customerName: { fontSize: "15px", fontWeight: "600", color: "#111827" },
  messageTime: { fontSize: "11px", color: "#9CA3AF" },
  lastMessage: { fontSize: "13px", color: "#6B7280", marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" },
  positionBadge: { fontSize: "10px", padding: "2px 8px", borderRadius: "12px", display: "inline-block", fontWeight: "500" },
  unreadCountBadge: { position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", backgroundColor: "#EF4444", color: "#FFF", borderRadius: "12px", padding: "2px 8px", fontSize: "12px", fontWeight: "bold", minWidth: "24px", textAlign: "center" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#FFF" },
  chatHeader: { padding: "16px 20px", borderBottom: "1px solid #E5E7EB", backgroundColor: "#FFF", display: "flex", justifyContent: "space-between", alignItems: "center" },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  backButton: { background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
  chatAvatar: { width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#4F46E5", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold" },
  chatCustomerName: { fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "2px" },
  chatPositionBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "12px", fontWeight: "500" },
  messagesContainer: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#F9FAFB" },
  messageRow: { display: "flex", width: "100%" },
  messageBubble: { maxWidth: "60%", padding: "10px 14px", borderRadius: "18px", position: "relative" },
  messageText: { fontSize: "14px", lineHeight: "1.4", margin: 0 },
  messageTime: { fontSize: "10px", color: "#9CA3AF", display: "block", marginTop: "4px" },
  emptyChatState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#9CA3AF" },
  inputContainer: { padding: "16px 20px", borderTop: "1px solid #E5E7EB", backgroundColor: "#FFF", display: "flex", gap: "12px", alignItems: "center" },
  messageInput: { flex: 1, padding: "12px 16px", border: "1px solid #E5E7EB", borderRadius: "24px", fontSize: "14px", outline: "none" },
  sendButton: { width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#4F46E5", border: "none", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" },
  loadingContainer: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#6B7280" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#9CA3AF", padding: "40px" },
  spinner: { width: "32px", height: "32px", border: "3px solid #E5E7EB", borderTopColor: "#4F46E5", borderRadius: "50%", animation: "spin 1s linear infinite" },
  smallSpinner: { width: "18px", height: "18px", border: "2px solid #FFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default EmployeeChat;