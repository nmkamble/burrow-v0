import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Plus } from "lucide-react";
import Link from "next/link";

const conditionLabels: Record<string, string> = {
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
};

export default async function MyListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: items } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug)
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch pending requests for user's items
  const itemIds = items?.map((i) => i.id) || [];
  const { data: pendingRequests } = await supabase
    .from("rental_requests")
    .select("item_id")
    .in("item_id", itemIds)
    .eq("status", "pending");

  const pendingCountMap: Record<string, number> = {};
  pendingRequests?.forEach((req) => {
    pendingCountMap[req.item_id] = (pendingCountMap[req.item_id] || 0) + 1;
  });

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              My Listings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage items you have listed for lending.
            </p>
          </div>
          <Button asChild>
            <Link href="/list-item">
              <Plus className="mr-1.5 h-4 w-4" />
              List an Item
            </Link>
          </Button>
        </div>

        {items && items.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/items/${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </CardTitle>
                    <span className="shrink-0 font-display font-bold text-primary">
                      ${Number(item.price_per_day).toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /day
                      </span>
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.categories?.name && (
                      <Badge variant="secondary" className="text-xs">
                        {item.categories.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {conditionLabels[item.condition] || item.condition}
                    </Badge>
                    <Badge
                      variant={item.is_available ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  {pendingCountMap[item.id] > 0 && (
                    <p className="mt-3 text-sm font-medium text-primary">
                      {pendingCountMap[item.id]} pending request
                      {pendingCountMap[item.id] !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground">
              No listings yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              List your first item and start earning.
            </p>
            <Button asChild className="mt-4">
              <Link href="/list-item">List an Item</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
