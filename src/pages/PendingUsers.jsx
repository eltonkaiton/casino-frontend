import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://c-server-fprl.onrender.com/api/users"
      );

      const pendingUsers = res.data.filter(
        (user) => user.status === "Pending"
      );

      setUsers(pendingUsers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // UPDATE STATUS FUNCTION
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://c-server-fprl.onrender.com/api/users/${id}/status`,
        { status }
      );

      // refresh list after update
      fetchUsers();
    } catch (error) {
      console.log(error);
      alert("Failed to update user");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pending Users</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No pending users found</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-warning">
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
                  <span className="badge bg-warning text-dark">
                    {user.status}
                  </span>
                </td>

                {/* ACTION BUTTONS */}
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() =>
                      updateStatus(user._id, "Active")
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      updateStatus(user._id, "Rejected")
                    }
                  >
                    Reject
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

export default PendingUsers;