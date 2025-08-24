import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import EditListing from "./pages/EditListing";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDashboard from "./pages/ListingDashboard";
import RentingDashboard from "./pages/RentingDashboard";
import AddListing from "./pages/AddListing";
import ListingDetails from "./pages/ListingDetails";
import Bookings from "./pages/Bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import MessagesPage from "./pages/MessagesPage";

function AppWrapper() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (authToken) localStorage.setItem("token", authToken);
    else localStorage.removeItem("token");
  }, [authToken]);

  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/forgot-password"].includes(location.pathname);

  return (
    <>
      {!authToken && !isAuthPage && <Navbar />}
      {authToken && <Sidebar setAuthToken={setAuthToken} />}

      <div className={isAuthPage ? "auth-page" : `main-content ${authToken ? "" : "no-sidebar"}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setAuthToken={setAuthToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetails />} /> 
          <Route path="/edit-listing/:id" element={<EditListing />} />

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
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings currentUser={{ 
                  role: localStorage.getItem("role"), 
                  name: localStorage.getItem("name") 
                }} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
