import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../styles/admin.css";
import MAIN_URL from "../../../misc/api";

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      console.error("No authentication token found. Redirecting to login.");
      navigate("/admin/login");
      return;
    }

    try {
      const response = await fetch(MAIN_URL + "/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("jwt_token");

        console.log("Logout successful.");

        navigate("/admin/login");
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData.message);
      }
    } catch (error) {
      console.error("A network error occurred during logout:", error);
      localStorage.removeItem("jwt_token");
      navigate("/admin");
    }
  };

  return (
    <div className="home-page">
      <div className="container">
        <div className="left">
          <div className="left-menu">
            <ul>
              <li>
                <NavLink
                  to="dashboard"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="scheduler"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Scheduler
                </NavLink>
              </li>

              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="right">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
