import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function AdminNav() {
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}/admin`;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link to={prefix}>Dashboard</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/products`}>Products</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/categories`}>Categories</Link>
      </Button>
    </div>
  );
}
