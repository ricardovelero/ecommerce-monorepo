import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckoutCancelPage() {
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout cancelled</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your payment was cancelled. Your cart is still available.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`${prefix}/cart`}>Return to cart</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`${prefix}/products`}>Continue shopping</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
