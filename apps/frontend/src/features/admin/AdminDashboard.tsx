import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/features/admin/AdminNav";

export function AdminDashboard() {
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}/admin`;

  return (
    <section>
      <AdminNav />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">Create, edit and remove catalog products.</p>
            <Link className="text-sm font-medium underline" to={`${prefix}/products`}>
              Open products admin
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">Manage available categories for catalog organization.</p>
            <Link className="text-sm font-medium underline" to={`${prefix}/categories`}>
              Open categories admin
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
