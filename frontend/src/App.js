import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDashboard from "./pages/ListingDashboard";
import RentingDashboard from "./pages/RentingDashboard";
import AddListing from "./pages/AddListing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (authToken) localStorage.setItem("token", authToken);
    else localStorage.removeItem("token");
  }, [authToken]);

  return (
    <Router>
      {!authToken && <Navbar />}
      {authToken && <Sidebar setAuthToken={setAuthToken} />}

      <div className={`main-content ${authToken ? "" : "no-sidebar"}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
          <Route path="/register" element={<Register />} />
          {/*<Route path="/listing/:id" element={<ListingDetails />} />*/}

          <Route
            path="/listing/dashboard"
            element={
              <ProtectedRoute>
                <ListingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/renting/dashboard"
            element={
              <ProtectedRoute>
                <RentingDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
