import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    salary: "",
    password: "",
    phone: "",
    position: "Administrator",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    let newErrors = {};

    // Full name validation
    if (!formData.name.trim().includes(" ")) {
      newErrors.name =
        "Please enter full name (first and last name)";
    }

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Phone validation
    if (!/^\d{10,}$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must be at least 10 digits";
    }

    // Password validation
    if (formData.password.length < 4) {
      newErrors.password =
        "Password must be at least 4 characters";
    }

    // Salary validation
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary =
        "Please enter valid salary amount";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        "https://c-server-fprl.onrender.com/api/employees",
        formData
      );

      alert(res.data.message);

      // RESET FORM
      setFormData({
        name: "",
        email: "",
        salary: "",
        password: "",
        phone: "",
        position: "Administrator",
      });

      setErrors({});

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to add employee"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="mb-4">Add Employee</h2>

        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}
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

          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />

            {errors.email && (
              <small className="text-danger">
                {errors.email}
              </small>
            )}
          </div>

          {/* PHONE */}
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

          {/* SALARY */}
          <div className="mb-3">
            <label className="form-label">
              Salary
            </label>

            <input
              type="number"
              name="salary"
              className="form-control"
              placeholder="Enter salary"
              value={formData.salary}
              onChange={handleChange}
            />

            {errors.salary && (
              <small className="text-danger">
                {errors.salary}
              </small>
            )}
          </div>

          {/* PASSWORD */}
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

          {/* POSITION */}
          <div className="mb-4">
            <label className="form-label">
              Position
            </label>

            <select
              name="position"
              className="form-select"
              value={formData.position}
              onChange={handleChange}
            >
              <option>Administrator</option>
              <option>Finance</option>
              <option>Supervisor</option>
              <option>Inventory</option>
              <option>Service Manager</option>
              <option>Supplier</option>
            </select>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
          >
            {loading
              ? "Saving Employee..."
              : "Save Employee"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddEmployee;