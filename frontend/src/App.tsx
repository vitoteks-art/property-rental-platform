import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell";
import MarketingLayout from "./layouts/MarketingLayout";
import AccessDenied from "./pages/AccessDenied";
import AccountLayout from "./layouts/AccountLayout";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardLandlord from "./pages/DashboardLandlord";
import DashboardTenant from "./pages/DashboardTenant";
import AccountBillingPage from "./pages/AccountBillingPage";
import AccountNotificationsPage from "./pages/AccountNotificationsPage";
import AccountProfilePage from "./pages/AccountProfilePage";
import AccountSecurityPage from "./pages/AccountSecurityPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { ProtectedRoute, RoleRoute } from "./routes/guards";
import { useAuth } from "./store/auth";

const router = createBrowserRouter([
  // Public pages (no global app header — so homepage can be truly full-screen)
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // App shell (authenticated app)
  {
    element: <AppShell />,
    children: [
      { path: "/access-denied", element: <AccessDenied /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Account settings (all logged-in roles)
          {
            path: "/account",
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountProfilePage /> },
              { path: "security", element: <AccountSecurityPage /> },
              { path: "notifications", element: <AccountNotificationsPage /> },
              { path: "billing", element: <AccountBillingPage /> },
            ],
          },

          {
            element: <RoleRoute allow={["LANDLORD"]} />,
            children: [{ path: "/landlord", element: <DashboardLandlord /> }],
          },
          {
            element: <RoleRoute allow={["TENANT"]} />,
            children: [{ path: "/tenant", element: <DashboardTenant /> }],
          },
          {
            element: <RoleRoute allow={["ADMIN"]} />,
            children: [{ path: "/admin", element: <DashboardAdmin /> }],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return <RouterProvider router={router} />;
}
