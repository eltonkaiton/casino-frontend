import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_BASE_URL = "https://c-server-fprl.onrender.com/api";

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
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Delivered":
        return "bg-success";
      case "Processing":
        return "bg-info text-white";
      case "Pending":
        return "bg-warning text-dark";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">📦 Order Management</h2>
          <p className="text-muted">Track and manage all inventory orders</p>
        </div>
        <button className="btn btn-primary" onClick={fetchOrders}>
          🔄 Refresh
        </button>
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
              <h6 className="card-title">Delivered</h6>
              <h2 className="mb-0">{orders.filter(o => o.status === "Delivered").length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
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
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-3">
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
                    <td>
                      <code>{order.orderNumber}</code>
                    </td>
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
                      <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
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
    </div>
  );
}

export default Orders;