import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Payments() {
  const [bookingsPayments, setBookingsPayments] = useState([]);
  const [ordersPayments, setOrdersPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("all");
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    bookingPayments: 0,
    orderPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    paidPayments: 0
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch Bookings
      const bookingsRes = await axios.get(`${API_BASE_URL}/bookings`);
      const bookings = bookingsRes.data.success ? bookingsRes.data.bookings : [];
      
      const bookingPaymentsData = bookings
        .map(booking => ({
          id: booking._id,
          source: "booking",
          customerName: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          amount: booking.totalAmount || booking.price || 0,
          paidAmount: booking.paidAmount || booking.totalAmount || booking.price,
          method: booking.paymentMethod || "M-Pesa",
          status: booking.paymentStatus || "Pending",
          transactionCode: booking.transactionCode,
          mpesaReceiptNumber: booking.mpesaReceiptNumber,
          date: booking.createdAt,
          eventDate: booking.eventDate,
          gameTitle: booking.gameTitle,
          location: booking.county || booking.location,
          venue: booking.venue,
          guests: booking.guests,
          dealers: booking.dealersNeeded,
          duration: booking.eventDuration,
          bookingStatus: booking.status,
          workStatus: booking.workStatus
        }));
      
      // Fetch Orders
      let ordersPaymentsData = [];
      try {
        const ordersRes = await axios.get(`${API_BASE_URL}/inventory/orders`);
        const orders = ordersRes.data.success ? ordersRes.data.orders : [];
        
        ordersPaymentsData = orders.map(order => ({
          id: order._id,
          source: "order",
          customerName: order.customer || order.supplier || "N/A",
          email: order.customerEmail || order.supplierEmail || "N/A",
          phone: order.customerPhone || order.supplierPhone || "N/A",
          amount: order.totalAmount || 0,
          paidAmount: order.paidAmount || order.totalAmount || 0,
          method: order.paymentMethod || "Bank Transfer",
          status: order.paymentStatus || "Pending",
          transactionCode: order.orderNumber,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          orderType: order.orderType,
          items: order.items,
          supplier: order.supplier,
          customer: order.customer,
          orderStatus: order.status,
          trackingNumber: order.trackingNumber
        }));
      } catch (error) {
        console.log("Orders endpoint not available yet");
      }
      
      const allPaymentsData = [...bookingPaymentsData, ...ordersPaymentsData];
      allPaymentsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setBookingsPayments(bookingPaymentsData);
      setOrdersPayments(ordersPaymentsData);
      setAllPayments(allPaymentsData);
      setFilteredPayments(allPaymentsData);
      
      const totalAmount = allPaymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = allPaymentsData.filter(p => p.status === "Pending").length;
      const approvedPayments = allPaymentsData.filter(p => p.status === "Approved").length;
      const paidPayments = allPaymentsData.filter(p => p.status === "Paid").length;
      
      setStats({
        totalPayments: allPaymentsData.length,
        totalAmount: totalAmount,
        bookingPayments: bookingPaymentsData.length,
        orderPayments: ordersPaymentsData.length,
        pendingPayments: pendingPayments,
        approvedPayments: approvedPayments,
        paidPayments: paidPayments
      });
      
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const generateReportData = () => {
    let filteredData = [];
    
    if (reportType === "all") {
      filteredData = allPayments;
    } else if (reportType === "bookings") {
      filteredData = bookingsPayments;
    } else if (reportType === "orders") {
      filteredData = ordersPayments;
    } else if (reportType === "pending") {
      filteredData = allPayments.filter(p => p.status === "Pending");
    } else if (reportType === "paid") {
      filteredData = allPayments.filter(p => p.status === "Paid");
    }

    const totalAmount = filteredData.reduce((sum, p) => sum + (p.amount || 0), 0);
    const reportStats = {
      total: filteredData.length,
      bookings: filteredData.filter(p => p.source === "booking").length,
      orders: filteredData.filter(p => p.source === "order").length,
      pending: filteredData.filter(p => p.status === "Pending").length,
      approved: filteredData.filter(p => p.status === "Approved").length,
      paid: filteredData.filter(p => p.status === "Paid").length,
      totalAmount: totalAmount,
    };

    return { payments: filteredData, stats: reportStats };
  };

  const generateReportHTML = () => {
    const { payments: reportPayments, stats: reportStats } = generateReportData();
    const reportDate = new Date().toLocaleString();
    const reportTitle = reportType === "all" ? "All Payments Report" : 
                        reportType === "bookings" ? "Booking Payments Report" : 
                        reportType === "orders" ? "Order Payments Report" :
                        reportType === "pending" ? "Pending Payments Report" : "Paid Payments Report";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payments Report - ${reportTitle}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f9fa; padding: 40px; font-size: 12px; }
          .report-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .report-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .report-header h1 { font-size: 28px; margin-bottom: 10px; }
          .report-header p { opacity: 0.9; font-size: 14px; }
          .report-summary { background: #f8f9fa; padding: 20px; margin: 20px; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
          .summary-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .summary-card h3 { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .summary-card p { color: #6c757d; font-size: 12px; }
          .total-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .total-card p { color: rgba(255,255,255,0.9); }
          .report-table { width: calc(100% - 40px); border-collapse: collapse; margin: 20px; }
          .report-table th { background: #4a5568; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 11px; }
          .report-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          .status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
          .status-paid, .status-approved { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fed7aa; color: #92400e; }
          .report-footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 11px; color: #6c757d; margin-top: 20px; }
          @media print { body { padding: 0; background: white; } .report-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>💰 CASINO EVENTS - PAYMENTS REPORT</h1>
            <p>Generated on: ${reportDate}</p>
            <p>Report Type: ${reportTitle}</p>
          </div>
          <div class="report-summary">
            <div class="summary-card"><h3>${reportStats.total}</h3><p>Total Payments</p></div>
            <div class="summary-card"><h3>${reportStats.bookings}</h3><p>Booking Payments</p></div>
            <div class="summary-card"><h3>${reportStats.orders}</h3><p>Order Payments</p></div>
            <div class="summary-card"><h3>${reportStats.pending}</h3><p>Pending</p></div>
            <div class="summary-card"><h3>${reportStats.approved}</h3><p>Approved</p></div>
            <div class="summary-card"><h3>${reportStats.paid}</h3><p>Paid</p></div>
            <div class="summary-card total-card"><h3>KES ${reportStats.totalAmount.toLocaleString()}</h3><p>Total Amount</p></div>
          </div>
          <table class="report-table">
            <thead><tr><th>#</th><th>Source</th><th>Customer</th><th>Email</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              ${reportPayments.map((payment, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${payment.source === "booking" ? "🎰 Booking" : "📦 Order"}</strong></td>
                  <td>${payment.customerName}</td>
                  <td>${payment.email}</td>
                  <td><strong>KES ${payment.amount.toLocaleString()}</strong></td>
                  <td>${payment.method}</td>
                  <td><code>${payment.transactionCode || "N/A"}</code></td>
                  <td>${new Date(payment.date).toLocaleDateString()}</td>
                  <td><span class="status-badge status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="report-footer">
            <p>This is a computer-generated report. No signature required.</p>
            <p>Casino Events - Official Payment Report | For inquiries: support@casinoevents.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    try {
      setGeneratingReport(true);
      const htmlContent = generateReportHTML();
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlContent);
      iframe.contentWindow.document.close();
      
      setTimeout(async () => {
        try {
          const element = iframe.contentWindow.document.body;
          const canvas = await html2canvas(element, { scale: 2, logging: false });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const imgWidth = 297;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save(`payments_report_${reportType}_${Date.now()}.pdf`);
          document.body.removeChild(iframe);
          setGeneratingReport(false);
          alert('PDF Report downloaded successfully!');
        } catch (error) {
          document.body.removeChild(iframe);
          setGeneratingReport(false);
          alert('Failed to generate PDF');
        }
      }, 1000);
    } catch (error) {
      setGeneratingReport(false);
      alert('Failed to generate report');
    }
  };

  const viewReport = () => {
    const htmlContent = generateReportHTML();
    setReportData(htmlContent);
    setShowReportModal(true);
  };

  const printReport = () => {
    const htmlContent = generateReportHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  useEffect(() => {
    let filtered = [];
    
    if (activeTab === "all") {
      filtered = [...allPayments];
    } else if (activeTab === "bookings") {
      filtered = [...bookingsPayments];
    } else if (activeTab === "orders") {
      filtered = [...ordersPayments];
    }
    
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "All") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(filtered);
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter, allPayments, bookingsPayments, ordersPayments]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="col-md-3 col-sm-6 mb-3">
      <div className="card h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-2">{title}</h6>
              <h3 className="mb-0" style={{ color: color }}>{value}</h3>
            </div>
            <div className="fs-1">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        <p className="mt-3">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-0">💰 Payment Transactions</h2>
          <p className="text-muted">Track all payments from bookings and orders</p>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" style={{ width: "150px" }} value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="bookings">Bookings Only</option>
            <option value="orders">Orders Only</option>
            <option value="pending">Pending Only</option>
            <option value="paid">Paid Only</option>
          </select>
          <button className="btn btn-primary" onClick={viewReport}>📊 View Report</button>
          <button className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>{generatingReport ? "⏳..." : "📥 PDF"}</button>
          <button className="btn btn-outline-secondary" onClick={fetchPayments}>🔄 Refresh</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <StatCard title="Total Payments" value={stats.totalPayments} color="#4F46E5" icon="💰" />
        <StatCard title="Total Amount" value={formatCurrency(stats.totalAmount)} color="#10B981" icon="💵" />
        <StatCard title="Booking Payments" value={stats.bookingPayments} color="#F59E0B" icon="🎰" />
        <StatCard title="Order Payments" value={stats.orderPayments} color="#8B5CF6" icon="📦" />
        <StatCard title="Pending" value={stats.pendingPayments} color="#F59E0B" icon="⏳" />
        <StatCard title="Approved" value={stats.approvedPayments} color="#8B5CF6" icon="✅" />
        <StatCard title="Paid" value={stats.paidPayments} color="#10B981" icon="💰" />
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link ${activeTab === "all" ? "active fw-bold" : ""}`} onClick={() => setActiveTab("all")}>📊 All Payments ({stats.totalPayments})</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === "bookings" ? "active fw-bold" : ""}`} onClick={() => setActiveTab("bookings")}>🎰 Booking Payments ({stats.bookingPayments})</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === "orders" ? "active fw-bold" : ""}`} onClick={() => setActiveTab("orders")}>📦 Order Payments ({stats.orderPayments})</button></li>
      </ul>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input type="text" className="form-control" placeholder="🔍 Search by customer name, email, or transaction code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="text-muted mt-2">Showing {filteredPayments.length} payments</div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="alert alert-info text-center"><h5>No payments found</h5><p className="mb-0">Try adjusting your search or filter criteria.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr><th>#</th><th>Source</th><th>Customer</th><th>Contact</th><th>Amount</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Status</th><th>Details</th></tr>
              </thead>
              <tbody>
                {currentPayments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td className="fw-bold">{indexOfFirstItem + index + 1}</td>
                    <td><span className={`badge ${payment.source === "booking" ? "bg-success" : "bg-info"}`}>{payment.source === "booking" ? "🎰 Booking" : "📦 Order"}</span></td>
                    <td><strong>{payment.customerName}</strong><br /><small className="text-muted">{payment.email}</small></td>
                    <td>{payment.phone}</td>
                    <td className="fw-bold text-success">{formatCurrency(payment.amount)}</td>
                    <td>{payment.method}</td>
                    <td><code className="small">{payment.transactionCode || "N/A"}</code></td>
                    <td>{formatDate(payment.date)}</td>
                    <td><span className={`badge ${payment.status === "Paid" ? "bg-success" : payment.status === "Approved" ? "bg-info" : "bg-warning"}`}>{payment.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-info text-white" data-bs-toggle="modal" data-bs-target={`#paymentModal${payment.id.replace(/[^a-zA-Z0-9]/g, '')}`}>
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4"><ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button></li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button></li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button></li>
            </ul></nav>
          )}
        </>
      )}

      {/* Payment Detail Modals */}
      {currentPayments.map((payment) => {
        const modalId = `paymentModal${payment.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        return (
          <div key={payment.id} className="modal fade" id={modalId} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header" style={{ backgroundColor: payment.source === "booking" ? "#10B981" : "#8B5CF6", color: "white" }}>
                  <h5 className="modal-title">{payment.source === "booking" ? "🎰 Booking Payment Details" : "📦 Order Payment Details"}</h5>
                  <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <div className="row"><div className="col-md-6"><strong>Customer:</strong><p className="text-muted">{payment.customerName}</p></div><div className="col-md-6"><strong>Email:</strong><p className="text-muted">{payment.email}</p></div></div>
                  <div className="row"><div className="col-md-6"><strong>Phone:</strong><p className="text-muted">{payment.phone}</p></div><div className="col-md-6"><strong>Payment Method:</strong><p className="text-muted">{payment.method}</p></div></div>
                  <div className="row"><div className="col-md-6"><strong>Amount:</strong><p className="text-success fw-bold">{formatCurrency(payment.amount)}</p></div><div className="col-md-6"><strong>Status:</strong><p><span className={`badge ${payment.status === "Paid" ? "bg-success" : payment.status === "Approved" ? "bg-info" : "bg-warning"}`}>{payment.status}</span></p></div></div>
                  <div className="row"><div className="col-md-6"><strong>Transaction Code:</strong><p><code>{payment.transactionCode || "N/A"}</code></p></div><div className="col-md-6"><strong>Date:</strong><p>{formatDate(payment.date)}</p></div></div>
                  {payment.source === "booking" && (
                    <><hr /><div className="row"><div className="col-md-4"><strong>Game:</strong><p>{payment.gameTitle}</p></div><div className="col-md-4"><strong>Event Date:</strong><p>{formatDate(payment.eventDate)}</p></div><div className="col-md-4"><strong>Location:</strong><p>{payment.location}</p></div></div>
                    <div className="row"><div className="col-md-3"><strong>Guests:</strong><p>{payment.guests}</p></div><div className="col-md-3"><strong>Dealers:</strong><p>{payment.dealers}</p></div><div className="col-md-3"><strong>Duration:</strong><p>{payment.duration}</p></div><div className="col-md-3"><strong>Booking Status:</strong><p>{payment.bookingStatus}</p></div></div></>
                  )}
                  {payment.source === "order" && (
                    <><hr /><div className="row"><div className="col-md-6"><strong>Order Number:</strong><p>{payment.orderNumber}</p></div><div className="col-md-6"><strong>Order Type:</strong><p>{payment.orderType}</p></div></div>
                    {payment.items && payment.items.length > 0 && (<div className="mt-3"><strong>Items:</strong><ul className="list-group mt-2">{payment.items.map((item, idx) => (<li key={idx} className="list-group-item">{item.name} - {item.quantity} × {formatCurrency(item.price)}</li>))}</ul></div>)}
                    <div className="row mt-3"><div className="col-md-6"><strong>Order Status:</strong><p>{payment.orderStatus}</p></div>{payment.trackingNumber && <div className="col-md-6"><strong>Tracking:</strong><p>{payment.trackingNumber}</p></div>}</div></>
                  )}
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Report Modal */}
      <div className={`modal fade ${showReportModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showReportModal ? 'rgba(0,0,0,0.5)' : 'transparent' }} onClick={() => setShowReportModal(false)}>
        <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header bg-primary text-white"><h5 className="modal-title">📊 Payment Report - Preview</h5><button type="button" className="btn-close btn-close-white" onClick={() => setShowReportModal(false)}></button></div>
            <div className="modal-body p-0"><iframe srcDoc={reportData} title="Report Preview" style={{ width: '100%', height: '70vh', border: 'none' }} /></div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button type="button" className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>{generatingReport ? "Generating..." : "📥 Download PDF"}</button>
              <button type="button" className="btn btn-info" onClick={printReport}>🖨️ Print Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;