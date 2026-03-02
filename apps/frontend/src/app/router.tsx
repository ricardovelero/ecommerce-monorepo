import { Navigate, Outlet, createBrowserRouter, useParams } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AdminCategoriesPage } from "@/features/admin/AdminCategoriesPage";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { AdminProductsPage } from "@/features/admin/AdminProductsPage";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { AccountPage } from "@/pages/AccountPage";
import { CartPage } from "@/pages/CartPage";
import { HomePage } from "@/pages/HomePage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ProductsPage } from "@/pages/ProductsPage";

function LanguageGuard() {
  const { lang } = useParams();
  if (lang !== "es" && lang !== "en") {
    return <Navigate to="/es" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/es" replace />,
  },
  {
    path: "/:lang",
    element: <LanguageGuard />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "account", element: <AccountPage /> },
      {
        path: "admin",
        element: (
          <RequireRole role="ADMIN">
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: "admin/products",
        element: (
          <RequireRole role="ADMIN">
            <AdminProductsPage />
          </RequireRole>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <RequireRole role="ADMIN">
            <AdminCategoriesPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/es" replace />,
  },
]);
