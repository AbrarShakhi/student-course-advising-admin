import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import MAIN_URL from "../../misc/api";

const API_URL = MAIN_URL;

// This is the new, specific endpoint for checking authentication status
const PROTECTED_ADMIN_URL = `${API_URL}/admin/check-auth`;

const PrivateGard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(PROTECTED_ADMIN_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Any non-200 status (including 401 from an invalid token) will set isAuthenticated to false
          console.error(
            "Authentication check failed with status:",
            response.status
          );
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("An error occurred during authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>{" "}
      </div>
    );
  } // Corrected redirection path to the dashboard

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default PrivateGard;
