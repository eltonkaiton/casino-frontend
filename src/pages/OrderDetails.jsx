import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "https://c-server-fprl.onrender.com/api";

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Note: You may need to create a single order endpoint
      const ordersRes = await axios.get(`${API_BASE_URL}/inventory/orders`);
      
      if (ordersRes.data.success) {
        const foundOrder = ordersRes.data.orders.find(o => o._id === id);
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
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

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Order not found</h5>
          <Link to="/inventory/orders" className="btn btn-primary mt-3">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <Link to="/inventory/orders" className="btn btn-secondary">
          ← Back to Orders
        </Link>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Order #{order.orderNumber}</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Order Type:</strong> {order.orderType}</p>
              <p><strong>Status:</strong> <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></p>
              <p><strong>Created At:</strong> {formatDate(order.createdAt)}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Total Amount:</strong> <span className="fw-bold text-success">{formatCurrency(order.totalAmount)}</span></p>
              <p><strong>Payment Status:</strong> <span className={`badge ${order.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>{order.paymentStatus || "Pending"}</span></p>
              {order.transactionCode && <p><strong>Transaction Code:</strong> <code>{order.transactionCode}</code></p>}
            </div>
          </div>
          
          <hr />
          
          <h6>Supplier/Customer Information</h6>
          <div className="row">
            <div className="col-md-6">
              <p><strong>{order.orderType === "Purchase" ? "Supplier" : "Customer"}:</strong> {order.supplier || order.customer}</p>
              <p><strong>Email:</strong> {order.supplierEmail || order.customerEmail || "N/A"}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Phone:</strong> {order.supplierPhone || order.customerPhone || "N/A"}</p>
              {order.shippingAddress && <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>}
            </div>
          </div>
          
          {order.notes && (
            <>
              <hr />
              <h6>Notes</h6>
              <p className="text-muted">{order.notes}</p>
            </>
          )}
          
          <hr />
          
          <h6>Order Items</h6>
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name || item.itemId?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-active">
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="fw-bold text-success">{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;