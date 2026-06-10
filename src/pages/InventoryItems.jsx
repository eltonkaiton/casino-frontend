import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function InventoryItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/inventory/items`);
      
      if (res.data.success) {
        setItems(res.data.items);
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
  };

  const getStockBadge = (status) => {
    switch(status) {
      case "Low Stock":
        return "bg-warning text-dark";
      case "Out of Stock":
        return "bg-danger";
      default:
        return "bg-success";
    }
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading inventory items...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">📦 Inventory Management</h2>
          <p className="text-muted">Manage your stock and inventory items</p>
        </div>
        <Link to="/inventory/add" className="btn btn-primary">
          + Add New Item
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Items</h6>
              <h2 className="mb-0">{stats.totalItems}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Value</h6>
              <h5 className="mb-0">{formatCurrency(stats.totalValue)}</h5>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Low Stock</h6>
              <h2 className="mb-0">{stats.lowStock}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Out of Stock</h6>
              <h2 className="mb-0">{stats.outOfStock}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by name, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Items Table */}
      {filteredItems.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No items found</h5>
          <p className="mb-0">Click "Add New Item" to create your first inventory item.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td><code>{item.sku}</code></td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.unit}</td>
                  <td className="text-success fw-bold">{formatCurrency(item.price)}</td>
                  <td className="text-primary fw-bold">{formatCurrency(item.totalValue)}</td>
                  <td>
                    <span className={`badge ${getStockBadge(item.stockStatus)}`}>
                      {item.stockStatus}
                    </span>
                  </td>
                  <td>
                    <Link to={`/inventory/edit/${item._id}`} className="btn btn-sm btn-warning me-2">
                      ✏️ Edit
                    </Link>
                    <button className="btn btn-sm btn-danger">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryItems;