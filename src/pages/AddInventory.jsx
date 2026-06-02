import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Equipment",
    quantity: "",
    unit: "pcs",
    price: "",
    description: ""
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/inventory/items`, formData);
      
      if (res.data.success) {
        alert("Item added successfully!");
        navigate("/inventory/items");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Equipment", "Consumables", "Furniture", "Electronics", "Other"];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Add New Inventory Item</h2>
        <Link to="/inventory/items" className="btn btn-secondary">
          ← Back to Inventory
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="form-control"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="pcs, kg, liters"
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Item"}
              </button>
              <Link to="/inventory/items" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddInventory;