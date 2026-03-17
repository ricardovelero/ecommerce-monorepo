import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AdminCategoriesPage } from "@/features/admin/AdminCategoriesPage";
import { AdminDashboard } from "@/features/admin/AdminDashboard";
import { AdminOrderDetailPage } from "@/features/admin/AdminOrderDetailPage";
import { AdminOrdersPage } from "@/features/admin/AdminOrdersPage";
import { AdminProductsPage } from "@/features/admin/AdminProductsPage";
import { RequireRole } from "@/features/auth/components/RequireRole";
import { AccountOrderDetailPage } from "@/pages/AccountOrderDetailPage";
import { AccountOrdersPage } from "@/pages/AccountOrdersPage";
import { AccountPage } from "@/pages/AccountPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutCancelPage } from "@/pages/CheckoutCancelPage";
import { CheckoutSuccessPage } from "@/pages/CheckoutSuccessPage";
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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/es" replace />} />
      <Route path="/:lang" element={<LanguageGuard />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/orders" element={<AccountOrdersPage />} />
        <Route path="account/orders/:id" element={<AccountOrderDetailPage />} />
        <Route path="checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
        <Route
          path="admin"
          element={
            <RequireRole role="ADMIN">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="admin/products"
          element={
            <RequireRole role="ADMIN">
              <AdminProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/categories"
          element={
            <RequireRole role="ADMIN">
              <AdminCategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/orders"
          element={
            <RequireRole role="ADMIN">
              <AdminOrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="admin/orders/:id"
          element={
            <RequireRole role="ADMIN">
              <AdminOrderDetailPage />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/es" replace />} />
    </Routes>
  );
}

export function StorefrontRoutes() {
  return (
    <Routes>
      <Route path="/:lang" element={<LanguageGuard />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
      </Route>
    </Routes>
  );
}
