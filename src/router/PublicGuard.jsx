import { Outlet, Navigate } from "react-router-dom";
import MAIN_URL from "../../misc/api";
import React, { useState, useEffect } from "react";

// The purpose of this guard is to redirect a logged-in user away from public pages like login.
const PublicGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // The browser will automatically send the HttpOnly cookie with this request.
        // We only care if the request succeeds (e.g., a 200 status code).
        const response = await fetch(MAIN_URL + "/admin/check-auth");

        if (response.ok) {
          // If the response is ok, it means the server found the valid token in the cookie.
          setIsAuthenticated(true);
        } else {
          // Any non-ok response (like 401) means the authentication check failed.
          setIsAuthenticated(false);
          console.log(
            `Authentication check failed with status: ${response.status}`
          );
        }
      } catch (error) {
        // Handle any network or other errors.
        console.error("Error during authentication check:", error);
        setIsAuthenticated(false);
      } finally {
        // Set loading to false once the check is complete, regardless of the outcome.
        setLoading(false);
      }
    };

    // This check runs only once when the component mounts.
    checkAuthStatus();
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
  }

  // The logic here is for a PublicGuard.
  // We navigate to the dashboard only if the user is authenticated.
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" />;
  }

  // Otherwise, if they aren't authenticated, allow them to view the public page (login).
  return <Outlet />;
};

export default PublicGuard;
