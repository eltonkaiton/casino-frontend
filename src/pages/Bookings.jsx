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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("all");

  const API_BASE_URL = "https://c-server-fprl.onrender.com/api";

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/bookings`);
      console.log("Fetched bookings:", res.data);
      
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
    }

    const totalAmount = filteredData.reduce((sum, b) => sum + (b.price || 0), 0);
    const stats = {
      total: filteredData.length,
      pending: filteredData.filter(b => b.status === "Pending").length,
      approved: filteredData.filter(b => b.status === "Approved").length,
      rejected: filteredData.filter(b => b.status === "Rejected").length,
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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8f9fa;
            padding: 40px;
            font-size: 12px;
          }
          
          .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .report-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .report-header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .report-header p {
            opacity: 0.9;
            font-size: 14px;
          }
          
          .report-summary {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px;
            border-radius: 8px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .summary-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .summary-card h3 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .summary-card p {
            color: #6c757d;
            font-size: 12px;
          }
          
          .total-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .total-card p {
            color: rgba(255,255,255,0.9);
          }
          
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px;
            width: calc(100% - 40px);
          }
          
          .report-table th {
            background: #4a5568;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
          }
          
          .report-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          
          .report-table tr:hover {
            background: #f7fafc;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
          }
          
          .status-approved {
            background: #d1fae5;
            color: #065f46;
          }
          
          .status-rejected {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .status-pending {
            background: #fed7aa;
            color: #92400e;
          }
          
          .payment-paid {
            background: #d1fae5;
            color: #065f46;
          }
          
          .payment-pending {
            background: #fed7aa;
            color: #92400e;
          }
          
          .report-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #6c757d;
            margin-top: 20px;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .report-container {
              box-shadow: none;
            }
            .no-print {
              display: none;
            }
          }
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
            <div class="summary-card">
              <h3>${stats.total}</h3>
              <p>Total Bookings</p>
            </div>
            <div class="summary-card">
              <h3>${stats.approved}</h3>
              <p>Approved</p>
            </div>
            <div class="summary-card">
              <h3>${stats.pending}</h3>
              <p>Pending</p>
            </div>
            <div class="summary-card">
              <h3>${stats.rejected}</h3>
              <p>Rejected</p>
            </div>
            <div class="summary-card total-card">
              <h3>KES ${stats.totalAmount.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Game</th>
                <th>Event Date</th>
                <th>Location</th>
                <th>Guests</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportBookings.map((booking, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${booking.customerName}</strong></td>
                  <td>${booking.email}</td>
                  <td>${booking.phone}</td>
                  <td>${booking.gameTitle}</td>
                  <td>${new Date(booking.eventDate).toLocaleDateString()}</td>
                  <td>${booking.location}</td>
                  <td>${booking.guests}</td>
                  <td><strong>KES ${(booking.price || 0).toLocaleString()}</strong></td>
                  <td><span class="status-badge ${booking.paymentStatus === 'Paid' ? 'payment-paid' : 'payment-pending'}">${booking.paymentStatus || 'Pending'}</span></td>
                  <td><span class="status-badge status-${booking.status?.toLowerCase()}">${booking.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="report-footer">
            <p>This is a computer-generated report. No signature required.</p>
            <p>Casino Events - Official Report</p>
            <p>For inquiries: support@casinoevents.com | +254 700 000 000</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate PDF Report
  const generatePDF = async () => {
    try {
      setGeneratingReport(true);
      const htmlContent = generateReportHTML();
      
      // Create a temporary iframe to render HTML and convert to PDF
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlContent);
      iframe.contentWindow.document.close();
      
      // Wait for content to load
      setTimeout(async () => {
        try {
          const element = iframe.contentWindow.document.body;
          const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
          });
          
          const imgWidth = 297; // A4 landscape width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save(`bookings_report_${reportType}_${Date.now()}.pdf`);
          
          document.body.removeChild(iframe);
          setGeneratingReport(false);
          alert('PDF Report downloaded successfully!');
        } catch (error) {
          console.error('Error generating PDF:', error);
          document.body.removeChild(iframe);
          setGeneratingReport(false);
          alert('Failed to generate PDF. Please try again.');
        }
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setGeneratingReport(false);
      alert('Failed to generate report');
    }
  };

  // View Report in Modal
  const viewReport = () => {
    const htmlContent = generateReportHTML();
    setReportData(htmlContent);
    setShowReportModal(true);
  };

  // Print Report
  const printReport = () => {
    const htmlContent = generateReportHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.gameTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const BookingModal = () => (
    <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Booking Details</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            {selectedBooking && (
              <div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Customer Name:</strong>
                    <p className="text-muted">{selectedBooking.customerName}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong>
                    <p className="text-muted">{selectedBooking.email}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Phone:</strong>
                    <p className="text-muted">{selectedBooking.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Game:</strong>
                    <p className="text-muted">{selectedBooking.gameTitle}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Event Date:</strong>
                    <p className="text-muted">{formatDate(selectedBooking.eventDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Location:</strong>
                    <p className="text-muted">{selectedBooking.location}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Guests:</strong>
                    <p className="text-muted">{selectedBooking.guests}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Price:</strong>
                    <p className="text-muted">{formatCurrency(selectedBooking.price)}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Payment Status:</strong>
                    <p className="text-muted">{selectedBooking.paymentStatus || "Pending"}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Work Status:</strong>
                    <p className="text-muted">{selectedBooking.workStatus || "Unassigned"}</p>
                  </div>
                </div>
                {selectedBooking.transactionCode && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <strong>Transaction Code:</strong>
                      <p className="text-muted">{selectedBooking.transactionCode}</p>
                    </div>
                  </div>
                )}
                <div className="row mb-3">
                  <div className="col-12">
                    <strong>Created At:</strong>
                    <p className="text-muted">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedBooking.status === "Pending" && (
                  <div className="mt-3">
                    <hr />
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success flex-grow-1" 
                        onClick={() => updateBookingStatus(selectedBooking._id, "Approved")}
                        disabled={updating}
                      >
                        {updating ? "Processing..." : "✓ Approve Booking"}
                      </button>
                      <button 
                        className="btn btn-danger flex-grow-1" 
                        onClick={() => updateBookingStatus(selectedBooking._id, "Rejected")}
                        disabled={updating}
                      >
                        {updating ? "Processing..." : "✗ Reject Booking"}
                      </button>
                    </div>
                  </div>
                )}
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
            <iframe
              srcDoc={reportData}
              title="Report Preview"
              style={{ width: '100%', height: '70vh', border: 'none' }}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
            <button type="button" className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>
              {generatingReport ? "Generating..." : "📥 Download PDF"}
            </button>
            <button type="button" className="btn btn-info" onClick={printReport}>
              🖨️ Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">📋 Customer Bookings</h2>
          <p className="text-muted">Manage and track all customer bookings</p>
        </div>
        <div className="text-end">
          <span className="badge bg-primary fs-6">{bookings.length} Total Bookings</span>
        </div>
      </div>

      {/* Filters and Report Buttons */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">🔍 Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by customer, email, game, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">📊 Filter by Status</label>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">📄 Report Type</label>
              <select 
                className="form-select" 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-outline-secondary flex-grow-1" onClick={fetchBookings}>
                🔄 Refresh
              </button>
              <button className="btn btn-primary flex-grow-1" onClick={viewReport}>
                📊 View Report
              </button>
              <button className="btn btn-success flex-grow-1" onClick={generatePDF} disabled={generatingReport}>
                {generatingReport ? "⏳..." : "📥 PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {currentBookings.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No bookings found</h5>
          <p className="mb-0">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Game</th>
                  <th>Event Date</th>
                  <th>Location</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td className="fw-bold">{indexOfFirstItem + index + 1}</td>
                    <td>
                      <strong>{booking.customerName}</strong>
                      <br />
                      <small className="text-muted">{booking.email}</small>
                    </td>
                    <td>{booking.phone}</td>
                    <td>{booking.gameTitle}</td>
                    <td>{formatDate(booking.eventDate)}</td>
                    <td>{booking.location}</td>
                    <td className="text-center">{booking.guests}</td>
                    <td className="fw-bold text-success">{formatCurrency(booking.price)}</td>
                    <td>
                      <span className={`badge ${booking.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                        {booking.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info text-white" 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                      >
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
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Stats Summary */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <h2 className="mb-0">{bookings.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h2 className="mb-0">{bookings.filter(b => b.status === "Pending").length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Approved</h5>
              <h2 className="mb-0">{bookings.filter(b => b.status === "Approved").length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Rejected</h5>
              <h2 className="mb-0">{bookings.filter(b => b.status === "Rejected").length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingModal />
      <ReportModal />
    </div>
  );
}

export default Bookings;