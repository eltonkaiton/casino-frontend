import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
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

// Inventory
import InventoryItems from "./pages/InventoryItems";
import AddInventory from "./pages/AddInventory";
import EditInventory from "./pages/EditInventory";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

// Chat
import EmployeeChat from "./pages/EmployeeChat";

import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1 }}>
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

            {/* CHAT */}
            <Route
              path="/employee-chat"
              element={
                <ProtectedRoute>
                  <EmployeeChat />
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

            {/* INVENTORY */}
            <Route path="/inventory/items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
            <Route path="/inventory/add" element={<ProtectedRoute><AddInventory /></ProtectedRoute>} />
            <Route path="/inventory/edit/:id" element={<ProtectedRoute><EditInventory /></ProtectedRoute>} />
            <Route path="/inventory/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/inventory/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

          </Routes>
        </div>

        {/* GLOBAL FOOTER (VISIBLE ON ALL PAGES) */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;