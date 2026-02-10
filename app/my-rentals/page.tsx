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
import { CalendarDays, Package } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function MyRentalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: requests } = await supabase
    .from("rental_requests")
    .select(
      `
      *,
      items(id, title, price_per_day, location)
    `
    )
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          My Rental Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of items you have requested to rent.
        </p>

        {requests && requests.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/items/${req.items?.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {req.items?.title || "Unknown Item"}
                      </Link>
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={statusColors[req.status] || ""}
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <CardDescription>{req.items?.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {new Date(req.start_date).toLocaleDateString()} -{" "}
                      {new Date(req.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {req.message && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {req.message}
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
              No rental requests yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse items and send your first rental request.
            </p>
            <Link
              href="/browse"
              className="mt-4 text-sm text-primary underline underline-offset-4"
            >
              Browse items
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
