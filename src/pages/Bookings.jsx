import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [workStatusFilter, setWorkStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const API_BASE_URL = "https://c-server-fprl.onrender.com/api";

  // Work Status options - "Customer Confirmed" now shows as "Completed"
  const workStatusOptions = [
    "All",
    "Unassigned",
    "Assigned",
    "Preparing",
    "On Route",
    "Setup Complete",
    "Event Ongoing",
    "Awaiting Customer Confirmation",
    "Completed",
    "Disputed",
    "Closed"
  ];

  // Helper function to display work status (Customer Confirmed => Completed)
  const displayWorkStatus = (workStatus) => {
    if (workStatus === "Customer Confirmed") return "Completed";
    return workStatus || "Unassigned";
  };

  // Helper to check if work status is considered completed
  const isCompletedStatus = (workStatus) => {
    return workStatus === "Completed" || workStatus === "Customer Confirmed";
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/bookings`);
      
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to fetch bookings. Please check the console for details.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      setUpdating(true);
      const res = await axios.put(`${API_BASE_URL}/bookings/${id}/status`, { status });
      
      if (res.data.success) {
        alert(`Booking ${status} successfully!`);
        fetchBookings();
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update booking status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      setUpdating(true);
      const res = await axios.put(`${API_BASE_URL}/bookings/${id}/payment-status`, { paymentStatus });
      
      if (res.data.success) {
        alert(`Payment ${paymentStatus} successfully!`);
        fetchBookings();
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const updateWorkStatus = async (id, workStatus) => {
    try {
      setUpdating(true);
      const res = await axios.put(`${API_BASE_URL}/bookings/${id}/work-status`, { workStatus });
      
      if (res.data.success) {
        alert(`Work status updated successfully!`);
        fetchBookings();
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to update work status");
      }
    } catch (error) {
      console.error("Error updating work status:", error);
      alert("Failed to update work status");
    } finally {
      setUpdating(false);
    }
  };

  const confirmEvent = async (id) => {
    try {
      setUpdating(true);
      const res = await axios.post(`${API_BASE_URL}/bookings/${id}/confirm`, {});
      
      if (res.data.success) {
        alert("Event confirmed successfully!");
        fetchBookings();
        setShowModal(false);
      } else {
        alert(res.data.message || "Failed to confirm event");
      }
    } catch (error) {
      console.error("Error confirming event:", error);
      alert("Failed to confirm event");
    } finally {
      setUpdating(false);
    }
  };

  // Generate Report Data
  const generateReportData = () => {
    let filteredData = [];
    
    if (reportType === "all") {
      filteredData = bookings;
    } else if (reportType === "pending") {
      filteredData = bookings.filter(b => b.status === "Pending");
    } else if (reportType === "approved") {
      filteredData = bookings.filter(b => b.status === "Approved");
    } else if (reportType === "rejected") {
      filteredData = bookings.filter(b => b.status === "Rejected");
    } else if (reportType === "paid") {
      filteredData = bookings.filter(b => b.paymentStatus === "Paid");
    } else if (reportType === "completed") {
      filteredData = bookings.filter(b => isCompletedStatus(b.workStatus));
    } else if (reportType === "confirmed") {
      filteredData = bookings.filter(b => b.customerConfirmed === true);
    }

    if (dateRange.start && dateRange.end) {
      filteredData = filteredData.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= new Date(dateRange.start) && bookingDate <= new Date(dateRange.end);
      });
    }

    const totalAmount = filteredData.reduce((sum, b) => sum + (b.totalAmount || b.price || 0), 0);
    const stats = {
      total: filteredData.length,
      pending: filteredData.filter(b => b.status === "Pending").length,
      approved: filteredData.filter(b => b.status === "Approved").length,
      rejected: filteredData.filter(b => b.status === "Rejected").length,
      paid: filteredData.filter(b => b.paymentStatus === "Paid").length,
      completed: filteredData.filter(b => isCompletedStatus(b.workStatus)).length,
      confirmed: filteredData.filter(b => b.customerConfirmed === true).length,
      totalAmount: totalAmount,
    };

    return { bookings: filteredData, stats };
  };

  // Generate HTML for Report
  const generateReportHTML = () => {
    const { bookings: reportBookings, stats } = generateReportData();
    const reportDate = new Date().toLocaleString();
    const reportTitle = reportType === "all" ? "All Bookings Report" : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Bookings Report`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bookings Report - ${reportTitle}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8f9fa; padding: 40px; font-size: 12px; }
          .report-container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .report-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .report-header h1 { font-size: 28px; margin-bottom: 10px; }
          .report-header p { opacity: 0.9; font-size: 14px; }
          .report-summary { background: #f8f9fa; padding: 20px; margin: 20px; border-radius: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }
          .summary-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .summary-card h3 { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
          .summary-card p { color: #6c757d; font-size: 11px; }
          .total-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          .total-card p { color: rgba(255,255,255,0.9); }
          .report-table { width: calc(100% - 40px); border-collapse: collapse; margin: 20px; }
          .report-table th { background: #4a5568; color: white; padding: 10px; text-align: left; font-weight: 600; font-size: 10px; }
          .report-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
          .status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; }
          .status-approved { background: #d1fae5; color: #065f46; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          .status-pending { background: #fed7aa; color: #92400e; }
          .work-completed { background: #d1fae5; color: #065f46; }
          .work-ongoing { background: #fef3c7; color: #92400e; }
          .payment-paid { background: #d1fae5; color: #065f46; }
          .payment-pending { background: #fed7aa; color: #92400e; }
          .report-footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 10px; color: #6c757d; margin-top: 20px; }
          @media print { body { padding: 0; background: white; } .report-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>🎰 CASINO EVENTS - BOOKINGS REPORT</h1>
            <p>Generated on: ${reportDate}</p>
            <p>Report Type: ${reportTitle}</p>
          </div>
          <div class="report-summary">
            <div class="summary-card"><h3>${stats.total}</h3><p>Total Bookings</p></div>
            <div class="summary-card"><h3>${stats.approved}</h3><p>Approved</p></div>
            <div class="summary-card"><h3>${stats.pending}</h3><p>Pending</p></div>
            <div class="summary-card"><h3>${stats.rejected}</h3><p>Rejected</p></div>
            <div class="summary-card"><h3>${stats.paid}</h3><p>Paid</p></div>
            <div class="summary-card"><h3>${stats.completed}</h3><p>Completed</p></div>
            <div class="summary-card total-card"><h3>KES ${stats.totalAmount.toLocaleString()}</h3><p>Total Revenue</p></div>
          </div>
          <table class="report-table">
            <thead><tr><th>#</th><th>Customer</th><th>Game</th><th>County</th><th>Event Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Work Status</th><th>Confirmed</th></tr></thead>
            <tbody>
              ${reportBookings.map((booking, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${booking.customerName}</strong></td>
                  <td>${booking.gameTitle}</td>
                  <td>${booking.county || '-'}</td>
                  <td>${new Date(booking.eventDate).toLocaleDateString()}</td>
                  <td><strong>KES ${(booking.totalAmount || booking.price || 0).toLocaleString()}</strong></td>
                  <td><span class="status-badge ${booking.paymentStatus === 'Paid' ? 'payment-paid' : 'payment-pending'}">${booking.paymentStatus || 'Pending'}</span></td>
                  <td><span class="status-badge status-${booking.status?.toLowerCase()}">${booking.status}</span></td>
                  <td><span class="status-badge ${isCompletedStatus(booking.workStatus) ? 'work-completed' : booking.workStatus === 'Event Ongoing' ? 'work-ongoing' : 'status-pending'}">${displayWorkStatus(booking.workStatus)}</span></td>
                  <td>${booking.customerConfirmed ? '✅ Yes' : '⏳ No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="report-footer">
            <p>This is a computer-generated report. No signature required.</p>
            <p>Casino Events - Official Report | For inquiries: support@casinoevents.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    try {
      setGeneratingReport(true);
      const reportDiv = document.createElement('div');
      reportDiv.style.position = 'absolute';
      reportDiv.style.top = '-9999px';
      reportDiv.style.left = '-9999px';
      reportDiv.style.width = '1200px';
      reportDiv.innerHTML = generateReportHTML();
      document.body.appendChild(reportDiv);
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(reportDiv, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`bookings_report_${reportType}_${Date.now()}.pdf`);
      document.body.removeChild(reportDiv);
      setGeneratingReport(false);
      alert('PDF Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      setGeneratingReport(false);
      alert('Failed to generate PDF. Please try again.');
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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.gameTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    const matchesPayment = paymentFilter === "All" || booking.paymentStatus === paymentFilter;
    // When filtering by "Completed", also include "Customer Confirmed"
    const matchesWorkStatus = workStatusFilter === "All" || 
      (workStatusFilter === "Completed" ? isCompletedStatus(booking.workStatus) : booking.workStatus === workStatusFilter);
    
    return matchesSearch && matchesStatus && matchesPayment && matchesWorkStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case "Approved": return "bg-success";
      case "Rejected": return "bg-danger";
      case "Pending": return "bg-warning text-dark";
      default: return "bg-secondary";
    }
  };

  const getWorkStatusBadgeClass = (workStatus) => {
    // "Customer Confirmed" treated as "Completed" for badge color
    if (isCompletedStatus(workStatus)) return "bg-success";
    switch(workStatus) {
      case "Event Ongoing": return "bg-primary";
      case "Setup Complete": return "bg-primary";
      case "On Route": return "bg-warning text-dark";
      case "Preparing": return "bg-warning text-dark";
      case "Assigned": return "bg-secondary";
      case "Awaiting Customer Confirmation": return "bg-warning text-dark";
      case "Disputed": return "bg-danger";
      case "Closed": return "bg-secondary";
      default: return "bg-secondary";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
  };

  const BookingModal = () => (
    <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">📋 Booking Details</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            {selectedBooking && (
              <div>
                <div className="row mb-3">
                  <div className="col-md-6"><strong>Customer Name:</strong><p className="text-muted">{selectedBooking.customerName}</p></div>
                  <div className="col-md-6"><strong>Email:</strong><p className="text-muted">{selectedBooking.email}</p></div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6"><strong>Phone:</strong><p className="text-muted">{selectedBooking.phone}</p></div>
                  <div className="col-md-6"><strong>Game Package:</strong><p className="text-muted">{selectedBooking.gameTitle}</p></div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4"><strong>County:</strong><p className="text-muted">{selectedBooking.county || "N/A"}</p></div>
                  <div className="col-md-4"><strong>Venue:</strong><p className="text-muted">{selectedBooking.venue || "N/A"}</p></div>
                  <div className="col-md-4"><strong>Event Date:</strong><p className="text-muted">{formatDate(selectedBooking.eventDate)}</p></div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4"><strong>Duration:</strong><p className="text-muted">{selectedBooking.eventDuration || "4 Hours"}</p></div>
                  <div className="col-md-4"><strong>Dealers:</strong><p className="text-muted">{selectedBooking.dealersNeeded || 1}</p></div>
                  <div className="col-md-4"><strong>Guests:</strong><p className="text-muted">{selectedBooking.guests || 1}</p></div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4"><strong>Base Price:</strong><p className="text-muted">{formatCurrency(selectedBooking.price)}</p></div>
                  <div className="col-md-4"><strong>Total Amount:</strong><p className="text-muted fw-bold text-success">{formatCurrency(selectedBooking.totalAmount || selectedBooking.price)}</p></div>
                  <div className="col-md-4"><strong>Payment Method:</strong><p className="text-muted">{selectedBooking.paymentMethod || "M-Pesa"}</p></div>
                </div>
                {selectedBooking.transportFee > 0 && (
                  <div className="row mb-3">
                    <div className="col-md-4"><strong>Transport Fee:</strong><p className="text-muted">{formatCurrency(selectedBooking.transportFee)}</p></div>
                    <div className="col-md-4"><strong>Accommodation Fee:</strong><p className="text-muted">{formatCurrency(selectedBooking.accommodationFee || 0)}</p></div>
                    <div className="col-md-4"><strong>Dealer Cost:</strong><p className="text-muted">{formatCurrency(selectedBooking.dealerCost || 0)}</p></div>
                  </div>
                )}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <strong>Payment Status:</strong>
                    <p><span className={`badge ${selectedBooking.paymentStatus === "Paid" ? "bg-success" : selectedBooking.paymentStatus === "Approved" ? "bg-info" : "bg-warning"}`}>{selectedBooking.paymentStatus || "Pending"}</span></p>
                  </div>
                  <div className="col-md-4">
                    <strong>Booking Status:</strong>
                    <p><span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`}>{selectedBooking.status}</span></p>
                  </div>
                  <div className="col-md-4">
                    <strong>Work Status:</strong>
                    <p><span className={`badge ${getWorkStatusBadgeClass(selectedBooking.workStatus)}`}>{displayWorkStatus(selectedBooking.workStatus)}</span></p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Customer Confirmed:</strong>
                    <p>{selectedBooking.customerConfirmed ? '✅ Yes' : '⏳ No'}</p>
                  </div>
                  {selectedBooking.customerConfirmedAt && (
                    <div className="col-md-6">
                      <strong>Confirmed At:</strong>
                      <p>{new Date(selectedBooking.customerConfirmedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedBooking.transactionCode && (
                  <div className="row mb-3"><div className="col-12"><strong>Transaction Code:</strong><p className="text-muted">{selectedBooking.transactionCode}</p></div></div>
                )}
                <div className="row mb-3"><div className="col-12"><strong>Created At:</strong><p className="text-muted">{new Date(selectedBooking.createdAt).toLocaleString()}</p></div></div>
                
                <hr />
                <div className="mt-3">
                  <h6>Update Status</h6>
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    <button className="btn btn-success btn-sm" onClick={() => updateBookingStatus(selectedBooking._id, "Approved")} disabled={updating}>✓ Approve Booking</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateBookingStatus(selectedBooking._id, "Rejected")} disabled={updating}>✗ Reject Booking</button>
                    {selectedBooking.paymentStatus !== "Paid" && (
                      <button className="btn btn-info btn-sm" onClick={() => updatePaymentStatus(selectedBooking._id, "Paid")} disabled={updating}>💰 Mark as Paid</button>
                    )}
                    {!selectedBooking.customerConfirmed && selectedBooking.workStatus === "Awaiting Customer Confirmation" && (
                      <button className="btn btn-primary btn-sm" onClick={() => confirmEvent(selectedBooking._id)} disabled={updating}>✅ Confirm Event</button>
                    )}
                    <button className="btn btn-warning btn-sm" onClick={() => updateWorkStatus(selectedBooking._id, "Event Ongoing")} disabled={updating}>⚡ Event Ongoing</button>
                    <button className="btn btn-success btn-sm" onClick={() => updateWorkStatus(selectedBooking._id, "Completed")} disabled={updating}>✅ Complete Work</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportModal = () => (
    <div className={`modal fade ${showReportModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowReportModal(false)}>
      <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">📊 Booking Report - Preview</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowReportModal(false)}></button>
          </div>
          <div className="modal-body p-0">
            <iframe srcDoc={reportData} title="Report Preview" style={{ width: '100%', height: '70vh', border: 'none' }} sandbox="allow-same-origin allow-scripts" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
            <button type="button" className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>
              {generatingReport ? "⏳ Generating..." : "📥 Download PDF"}
            </button>
            <button type="button" className="btn btn-info" onClick={printReport}>🖨️ Print Report</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        <p className="mt-3">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-0">📋 Customer Bookings</h2>
          <p className="text-muted">Manage and track all customer bookings across Kenya</p>
        </div>
        <div className="text-end">
          <span className="badge bg-primary fs-6 px-3 py-2">{bookings.length} Total Bookings</span>
        </div>
      </div>

      {/* Filters and Report Buttons */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label fw-bold">🔍 Search</label>
              <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">📊 Booking Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">💰 Payment Status</label>
              <select className="form-select" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="All">All Payments</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">🔄 Work Status</label>
              <select className="form-select" value={workStatusFilter} onChange={(e) => setWorkStatusFilter(e.target.value)}>
                {workStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-outline-secondary flex-grow-1" onClick={fetchBookings}>🔄 Refresh</button>
              <button className="btn btn-primary flex-grow-1" onClick={viewReport}>📊 Report</button>
              <button className="btn btn-success flex-grow-1" onClick={generatePDF} disabled={generatingReport}>{generatingReport ? "⏳..." : "📥 PDF"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-2"><div className="card bg-primary text-white"><div className="card-body"><h6>Total</h6><h3 className="mb-0">{bookings.length}</h3></div></div></div>
        <div className="col-md-2"><div className="card bg-warning text-dark"><div className="card-body"><h6>Pending</h6><h3 className="mb-0">{bookings.filter(b => b.status === "Pending").length}</h3></div></div></div>
        <div className="col-md-2"><div className="card bg-success text-white"><div className="card-body"><h6>Approved</h6><h3 className="mb-0">{bookings.filter(b => b.status === "Approved").length}</h3></div></div></div>
        <div className="col-md-2"><div className="card bg-danger text-white"><div className="card-body"><h6>Rejected</h6><h3 className="mb-0">{bookings.filter(b => b.status === "Rejected").length}</h3></div></div></div>
        <div className="col-md-2"><div className="card bg-info text-white"><div className="card-body"><h6>Completed</h6><h3 className="mb-0">{bookings.filter(b => isCompletedStatus(b.workStatus)).length}</h3></div></div></div>
        <div className="col-md-2"><div className="card bg-success text-white"><div className="card-body"><h6>Confirmed</h6><h3 className="mb-0">{bookings.filter(b => b.customerConfirmed === true).length}</h3></div></div></div>
      </div>

      {/* Bookings Table */}
      {currentBookings.length === 0 ? (
        <div className="alert alert-info text-center"><h5>No bookings found</h5><p className="mb-0">Try adjusting your search or filter criteria.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr><th>#</th><th>Customer</th><th>Game</th><th>Location</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th>Work Status</th><th>Confirmed</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td className="fw-bold">{indexOfFirstItem + index + 1}</td>
                    <td><strong>{booking.customerName}</strong><br /><small className="text-muted">{booking.email}</small></td>
                    <td>{booking.gameTitle}</td>
                    <td><small>{booking.county || 'Nairobi'}<br/>{booking.venue && <span className="text-muted">{booking.venue}</span>}</small></td>
                    <td>{formatDate(booking.eventDate)}</td>
                    <td className="fw-bold text-success">{formatCurrency(booking.totalAmount || booking.price)}</td>
                    <td><span className={`badge ${booking.paymentStatus === "Paid" ? "bg-success" : booking.paymentStatus === "Approved" ? "bg-info" : "bg-warning text-dark"}`}>{booking.paymentStatus || "Pending"}</span></td>
                    <td><span className={`badge ${getStatusBadgeClass(booking.status)}`}>{booking.status}</span></td>
                    <td><span className={`badge ${getWorkStatusBadgeClass(booking.workStatus)}`}>{displayWorkStatus(booking.workStatus)}</span></td>
                    <td>{booking.customerConfirmed ? '✅' : '⏳'}</td>
                    <td>
                      <button className="btn btn-sm btn-info text-white" onClick={() => { setSelectedBooking(booking); setShowModal(true); }}>👁️</button>
                      {!booking.customerConfirmed && booking.workStatus === "Awaiting Customer Confirmation" && (
                        <button className="btn btn-sm btn-success mt-1" onClick={() => confirmEvent(booking._id)}>✅</button>
                      )}
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

      <BookingModal />
      <ReportModal />
    </div>
  );
}

export default Bookings;