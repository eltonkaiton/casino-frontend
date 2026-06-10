import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function EditInventory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    category: "Equipment",
    quantity: "",
    unit: "pcs",
    price: "",
    description: ""
  });

  const API_BASE_URL = "https://c-server-fprl.onrender.com/api";

  const fetchItem = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${API_BASE_URL}/inventory/items/${id}`);
      
      if (res.data.success) {
        const item = res.data.item;
        setFormData({
          name: item.name || "",
          category: item.category || "Equipment",
          quantity: item.quantity || "",
          unit: item.unit || "pcs",
          price: item.price || "",
          description: item.description || ""
        });
      } else {
        alert("Item not found");
        navigate("/inventory/items");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      alert("Failed to fetch item details");
      navigate("/inventory/items");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

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
      const res = await axios.put(`${API_BASE_URL}/inventory/items/${id}`, formData);
      
      if (res.data.success) {
        alert("Item updated successfully!");
        navigate("/inventory/items");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Equipment", "Consumables", "Furniture", "Electronics", "Other"];

  if (fetching) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading item details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Edit Inventory Item</h2>
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
                {loading ? "Saving..." : "Save Changes"}
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

export default EditInventory;