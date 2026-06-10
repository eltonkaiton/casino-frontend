import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function RejectedUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users"
      );

      const rejectedUsers = res.data.filter(
        (user) => user.status === "Rejected"
      );

      setUsers(rejectedUsers);
      setFilteredUsers(rejectedUsers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ======================
  // SEARCH FUNCTION
  // ======================
  const handleSearch = (value) => {
    setSearch(value);

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.phone.includes(value)
    );

    setFilteredUsers(filtered);
  };

  // ======================
  // UPDATE STATUS
  // ======================
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/status`,
        { status }
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to update user");
    }
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/users/${id}`
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Rejected Users</h2>

      {/* SEARCH */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No rejected users found</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-danger">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className="badge bg-danger">
                    {user.status}
                  </span>
                </td>

                {/* ACTIONS */}
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() =>
                      updateStatus(user._id, "Active")
                    }
                  >
                    Reactivate
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RejectedUsers;