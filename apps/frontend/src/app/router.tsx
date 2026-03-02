import { Navigate, Outlet, createBrowserRouter, useParams } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AccountPage } from "@/pages/AccountPage";
import { AdminPlaceholderPage } from "@/pages/AdminPlaceholderPage";
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
      { path: "admin", element: <AdminPlaceholderPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/es" replace />,
  },
]);
