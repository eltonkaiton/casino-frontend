import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let newErrors = {};

    // Name validation
    if (!formData.name.trim().includes(" ")) {
      newErrors.name =
        "Full name must contain at least first and last name";
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Phone validation
    if (!/^\d{10,}$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must contain at least 10 digits";
    }

    // Password validation
    if (formData.password.length < 4) {
      newErrors.password =
        "Password must be at least 4 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "https://c-server-fprl.onrender.com/api/users",
        formData
      );

      alert("User added successfully!");

      console.log(response.data);

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "Active",
      });

      setErrors({});
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to add user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">

        <h2 className="mb-4 text-center">
          Add New User
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
            />

            {errors.name && (
              <small className="text-danger">
                {errors.name}
              </small>
            )}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <small className="text-danger">
                {errors.email}
              </small>
            )}
          </div>

          {/* Phone */}
          <div className="mb-3">
            <label className="form-label">
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />

            {errors.phone && (
              <small className="text-danger">
                {errors.phone}
              </small>
            )}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />

            {errors.password && (
              <small className="text-danger">
                {errors.password}
              </small>
            )}
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="form-label">
              Status
            </label>

            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Adding User..." : "Add User"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddUser;