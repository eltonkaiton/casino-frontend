import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function ActiveUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://c-server-fprl.onrender.com/api/users"
      );

      const activeUsers = res.data.filter(
        (user) => user.status === "Active"
      );

      setUsers(activeUsers);
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
  // UPDATE STATUS (SUSPEND)
  // ======================
  const suspendUser = async (id) => {
    try {
      await axios.put(
        `https://c-server-fprl.onrender.com/api/users/${id}/status`,
        { status: "Suspended" }
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to suspend user");
    }
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id) => {
    try {
      await axios.delete(
        `https://c-server-fprl.onrender.com/api/users/${id}`
      );

      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Active Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No active users found</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-success">
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
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className="badge bg-success">
                    {user.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => suspendUser(user._id)}
                  >
                    Suspend
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

export default ActiveUsers;