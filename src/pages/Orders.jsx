import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("all");
  const itemsPerPage = 10;

  const API_BASE_URL = "http://localhost:5000/api";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/inventory/orders`);
      
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        console.error("Failed to fetch orders:", res.data.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Completed": return "bg-success";
      case "Delivered": return "bg-success";
      case "Received": return "bg-info";
      case "Out for Delivery": return "bg-primary";
      case "Shipped": return "bg-info";
      case "Processing": return "bg-warning text-dark";
      case "Pending": return "bg-warning text-dark";
      case "Cancelled": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  // Generate Report Data
  const generateReportData = () => {
    let filteredData = [];
    
    if (reportType === "all") {
      filteredData = orders;
    } else if (reportType === "pending") {
      filteredData = orders.filter(o => o.status === "Pending");
    } else if (reportType === "processing") {
      filteredData = orders.filter(o => o.status === "Processing");
    } else if (reportType === "shipped") {
      filteredData = orders.filter(o => o.status === "Shipped");
    } else if (reportType === "delivered") {
      filteredData = orders.filter(o => o.status === "Delivered");
    } else if (reportType === "completed") {
      filteredData = orders.filter(o => o.status === "Completed");
    } else if (reportType === "cancelled") {
      filteredData = orders.filter(o => o.status === "Cancelled");
    }

    const totalAmount = filteredData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const stats = {
      total: filteredData.length,
      pending: filteredData.filter(o => o.status === "Pending").length,
      processing: filteredData.filter(o => o.status === "Processing").length,
      shipped: filteredData.filter(o => o.status === "Shipped").length,
      delivered: filteredData.filter(o => o.status === "Delivered").length,
      completed: filteredData.filter(o => o.status === "Completed").length,
      cancelled: filteredData.filter(o => o.status === "Cancelled").length,
      totalAmount: totalAmount,
    };

    return { orders: filteredData, stats };
  };

  // Generate HTML for Report
  const generateReportHTML = () => {
    const { orders: reportOrders, stats } = generateReportData();
    const reportDate = new Date().toLocaleString();
    const reportTitle = reportType === "all" ? "All Orders Report" : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Orders Report`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orders Report - ${reportTitle}</title>
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
          .status-completed, .status-delivered { background: #d1fae5; color: #065f46; }
          .status-pending, .status-processing { background: #fed7aa; color: #92400e; }
          .status-shipped { background: #dbeafe; color: #1e40af; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .report-footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 10px; color: #6c757d; margin-top: 20px; }
          @media print { body { padding: 0; background: white; } .report-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>📦 CASINO EVENTS - ORDERS REPORT</h1>
            <p>Generated on: ${reportDate}</p>
            <p>Report Type: ${reportTitle}</p>
          </div>
          <div class="report-summary">
            <div class="summary-card"><h3>${stats.total}</h3><p>Total Orders</p></div>
            <div class="summary-card"><h3>${stats.pending}</h3><p>Pending</p></div>
            <div class="summary-card"><h3>${stats.processing}</h3><p>Processing</p></div>
            <div class="summary-card"><h3>${stats.shipped}</h3><p>Shipped</p></div>
            <div class="summary-card"><h3>${stats.delivered}</h3><p>Delivered</p></div>
            <div class="summary-card"><h3>${stats.completed}</h3><p>Completed</p></div>
            <div class="summary-card total-card"><h3>${formatCurrency(stats.totalAmount)}</h3><p>Total Value</p></div>
          </div>
          <table class="report-table">
            <thead>
              <tr><th>#</th><th>Order #</th><th>Type</th><th>Supplier</th><th>Items</th><th>Amount</th><th>Date</th><th>Status</th><th>Payment</th></tr>
            </thead>
            <tbody>
              ${reportOrders.map((order, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><code>${order.orderNumber}</code></td>
                  <td>${order.orderType}</td>
                  <td>${order.supplier || order.customer || 'N/A'}</td>
                  <td>${order.items?.length || 0} items</td>
                  <td>${formatCurrency(order.totalAmount)}</td>
                  <td>${formatDate(order.createdAt)}</td>
                  <td><span class="status-badge status-${order.status?.toLowerCase()}">${order.status}</span></td>
                  <td><span class="status-badge ${order.paymentStatus === 'Paid' ? 'status-completed' : 'status-pending'}">${order.paymentStatus || 'Pending'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="report-footer">
            <p>This is a computer-generated report. No signature required.</p>
            <p>Casino Events - Official Orders Report | For inquiries: support@casinoevents.com</p>
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
      
      const reportDiv = document.createElement('div');
      reportDiv.style.position = 'absolute';
      reportDiv.style.top = '-9999px';
      reportDiv.style.left = '-9999px';
      reportDiv.style.width = '1200px';
      reportDiv.innerHTML = generateReportHTML();
      document.body.appendChild(reportDiv);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = reportDiv;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`orders_report_${reportType}_${Date.now()}.pdf`);
      
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesType = typeFilter === "All" || order.orderType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="mb-0">📦 Order Management</h2>
          <p className="text-muted">Track and manage all inventory orders</p>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" style={{ width: "150px" }} value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending Only</option>
            <option value="processing">Processing Only</option>
            <option value="shipped">Shipped Only</option>
            <option value="delivered">Delivered Only</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
          <button className="btn btn-primary" onClick={viewReport}>📊 Report</button>
          <button className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>
            {generatingReport ? "⏳..." : "📥 PDF"}
          </button>
          <button className="btn btn-outline-secondary" onClick={fetchOrders}>🔄 Refresh</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Orders</h6>
              <h2 className="mb-0">{orders.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Value</h6>
              <h4 className="mb-0">{formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Pending Orders</h6>
              <h2 className="mb-0">{orders.filter(o => o.status === "Pending").length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Completed</h6>
              <h2 className="mb-0">{orders.filter(o => o.status === "Completed").length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by order number, supplier, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Received">Received</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Purchase">Purchase</option>
            <option value="Sale">Sale</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="text-muted mt-2">
            Showing {filteredOrders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No orders found</h5>
          <p className="mb-0">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Order Number</th>
                  <th>Type</th>
                  <th>Supplier/Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td className="fw-bold">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td><code>{order.orderNumber}</code></td>
                    <td>
                      <span className={`badge ${order.orderType === "Purchase" ? "bg-info" : "bg-success"}`}>
                        {order.orderType}
                      </span>
                    </td>
                    <td>
                      <strong>{order.supplier || order.customer || "N/A"}</strong>
                      <br />
                      <small className="text-muted">{order.supplierEmail || order.customerEmail}</small>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="fw-bold text-success">{formatCurrency(order.totalAmount)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : order.paymentStatus === "Approved" ? "bg-info" : "bg-warning text-dark"}`}>
                        {order.paymentStatus || "Pending"}
                      </span>
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
                {[...Array(Math.min(totalPages, 10))].map((_, i) => (
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

      {/* Report Modal */}
      <div className={`modal fade ${showReportModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showReportModal ? 'rgba(0,0,0,0.5)' : 'transparent' }} onClick={() => setShowReportModal(false)}>
        <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">📊 Orders Report - Preview</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowReportModal(false)}></button>
            </div>
            <div className="modal-body p-0">
              <iframe
                srcDoc={reportData}
                title="Report Preview"
                style={{ width: '100%', height: '70vh', border: 'none' }}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Close</button>
              <button type="button" className="btn btn-success" onClick={generatePDF} disabled={generatingReport}>
                {generatingReport ? "Generating..." : "📥 Download PDF"}
              </button>
              <button type="button" className="btn btn-info" onClick={printReport}>🖨️ Print Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;