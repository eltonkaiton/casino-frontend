import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

import ActiveUsers from "./pages/ActiveUsers";
import PendingUsers from "./pages/PendingUsers";
import SuspendedUsers from "./pages/SuspendedUsers";
import RejectedUsers from "./pages/RejectedUsers";

import AddUser from "./pages/AddUser";

import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";

import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";

// INVENTORY PAGES
import InventoryItems from "./pages/InventoryItems";
import AddInventory from "./pages/AddInventory";
import EditInventory from "./pages/EditInventory";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route path="/active-users" element={<ProtectedRoute><ActiveUsers /></ProtectedRoute>} />
        <Route path="/pending-users" element={<ProtectedRoute><PendingUsers /></ProtectedRoute>} />
        <Route path="/suspended-users" element={<ProtectedRoute><SuspendedUsers /></ProtectedRoute>} />
        <Route path="/rejected-users" element={<ProtectedRoute><RejectedUsers /></ProtectedRoute>} />
        <Route path="/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />

        {/* EMPLOYEES */}
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/add-employee" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
        <Route path="/edit-employee/:id" element={<ProtectedRoute><EditEmployee /></ProtectedRoute>} />

        {/* BOOKINGS */}
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />

        {/* PAYMENTS */}
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />

        {/* INVENTORY ROUTES */}
        <Route path="/inventory/items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
        <Route path="/inventory/add" element={<ProtectedRoute><AddInventory /></ProtectedRoute>} />
        <Route path="/inventory/edit/:id" element={<ProtectedRoute><EditInventory /></ProtectedRoute>} />
        <Route path="/inventory/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/inventory/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;