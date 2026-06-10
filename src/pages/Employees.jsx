import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    administrators: 0,
    supervisors: 0,
    suppliers: 0
  });

  // ============================
  // FETCH EMPLOYEES
  // ============================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://c-server-fprl.onrender.com/api/employees");
      
      console.log("API Response:", res.data);
      
      // Handle the response format from your controller
      if (res.data.success && Array.isArray(res.data.employees)) {
        setEmployees(res.data.employees);
        
        // Calculate stats
        const administrators = res.data.employees.filter(e => e.position === "Administrator").length;
        const supervisors = res.data.employees.filter(e => e.position === "Supervisor").length;
        const suppliers = res.data.employees.filter(e => e.position === "Supplier").length;
        
        setStats({
          total: res.data.employees.length,
          administrators,
          supervisors,
          suppliers
        });
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        console.error("Unexpected response format:", res.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETE EMPLOYEE
  // ============================
  const deleteEmployee = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://c-server-fprl.onrender.com/api/employees/${id}`);
      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ============================
  // SEARCH FILTER
  // ============================
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.position?.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(search.toLowerCase())
  );

  // ============================
  // GET POSITION BADGE COLOR
  // ============================
  const getPositionBadge = (position) => {
    switch(position) {
      case "Administrator":
        return { class: "bg-danger", icon: "👑" };
      case "Supervisor":
        return { class: "bg-warning text-dark", icon: "👷" };
      case "Supplier":
        return { class: "bg-info text-dark", icon: "🏪" };
      default:
        return { class: "bg-secondary", icon: "👤" };
    }
  };

  return (
    <div className="container-fluid px-4 mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">👥 Employee Management</h2>
          <p className="text-muted">Manage all employees, supervisors, and suppliers</p>
        </div>
        <Link to="/add-employee" className="btn btn-primary">
          + Add New Employee
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="🔍 Search by name, email, position, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* STATS CARDS */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-2">Total Employees</h6>
                  <h2 className="mb-0">{stats.total}</h2>
                </div>
                <div className="fs-1">👥</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-2">Administrators</h6>
                  <h2 className="mb-0">{stats.administrators}</h2>
                </div>
                <div className="fs-1">👑</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-2">Supervisors</h6>
                  <h2 className="mb-0">{stats.supervisors}</h2>
                </div>
                <div className="fs-1">👷</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-dark shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-2">Suppliers</h6>
                  <h2 className="mb-0">{stats.suppliers}</h2>
                </div>
                <div className="fs-1">🏪</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Employee Directory</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No employees found</p>
              {search && (
                <button className="btn btn-link" onClick={() => setSearch("")}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Contact</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => {
                    const badge = getPositionBadge(employee.position);
                    return (
                      <tr key={employee._id}>
                        <td className="fw-bold text-muted">{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                <span style={{ fontSize: "20px" }}>{badge.icon}</span>
                              </div>
                            </div>
                            <div>
                              <h6 className="mb-0">{employee.name}</h6>
                              <small className="text-muted">ID: {employee._id?.slice(-8)}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${badge.class} px-3 py-2`}>
                            {badge.icon} {employee.position || "Staff"}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div><small className="text-muted">📧</small> {employee.email}</div>
                            <div><small className="text-muted">📞</small> {employee.phone || "N/A"}</div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            KES {employee.salary?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/edit-employee/${employee._id}`}
                            className="btn btn-sm btn-outline-warning me-2"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteEmployee(employee._id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {filteredEmployees.length} of {employees.length} employees
            </small>
            <small className="text-muted">
              Last updated: {new Date().toLocaleString()}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Employees;