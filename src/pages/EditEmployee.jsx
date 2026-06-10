import { useEffect, useState } from "react";

import axios from "axios";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

function EditEmployee() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    salary: "",
    position: "",
  });

  // =========================
  // FETCH EMPLOYEE
  // =========================
  const fetchEmployee = async () => {
    try {
      const res = await axios.get(
        `https://c-server-fprl.onrender.com/api/employees/${id}`
      );

      setFormData(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // UPDATE EMPLOYEE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `https://c-server-fprl.onrender.com/api/employees/${id}`,
        formData
      );

      alert("Employee updated successfully");

      navigate("/employees");

    } catch (error) {
      console.log(error);

      alert("Failed to update employee");
    }
  };

  return (
    <div className="container mt-4">

      <div className="card shadow p-4">

        <h2 className="mb-4">
          Edit Employee
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Salary
            </label>

            <input
              type="number"
              name="salary"
              className="form-control"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>

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
              <option>Superviser</option>
              <option>Inventory</option>
              <option>Service Manager</option>
              <option>Supplier</option>
            </select>
          </div>

          <button className="btn btn-primary w-100">
            Update Employee
          </button>

        </form>

      </div>

    </div>
  );
}

export default EditEmployee;