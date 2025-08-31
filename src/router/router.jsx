import { createBrowserRouter } from "react-router-dom";

import PublicGuard from "./PublicGuard";
import PrivateGard from "./PrivateGuard";
import Login from "../pages/auth/Login";
import Admin from "../pages/admin/Admin";

import Dashboard from "../pages/menu/Dashboard";
import Scheduler from "../pages/menu/Scheduler";

const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    children: [
      {
        path: "/admin/login",
        element: <Login />,
      },
    ],
  },

  {
    element: <PrivateGard />,
    children: [
      {
        path: "/admin",
        element: <Admin />,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "scheduler",
            element: <Scheduler />,
          },
          {
            path: "logout",
            element: <Login />,
          },
        ],
      },
    ],
  },
]);

export default router;
