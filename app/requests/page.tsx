import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Package, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { RequestActions } from "@/components/request-actions";

export const metadata = {
  title: "Requests - Burrow",
  description: "View and manage your borrowing and lending requests.",
};

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function RequestsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch requests where user is borrower
  const { data: borrowRequests } = await supabase
    .from("rental_requests")
    .select(
      `
      *,
      items(id, title, price_per_day, location, image_url)
    `
    )
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch requests where user is owner (incoming)
  const { data: lendRequests } = await supabase
    .from("rental_requests")
    .select(
      `
      *,
      items(id, title, price_per_day, location, image_url),
      profiles:borrower_id(display_name)
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your borrowing and lending requests in one place.
        </p>

        <Tabs defaultValue="borrowing" className="mt-6">
          <TabsList>
            <TabsTrigger value="borrowing" className="gap-1.5">
              <ArrowUpRight className="h-4 w-4" />
              Borrowing
              {borrowRequests && borrowRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {borrowRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="lending" className="gap-1.5">
              <ArrowDownLeft className="h-4 w-4" />
              Lending
              {lendRequests && lendRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {lendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="borrowing" className="mt-4">
            {borrowRequests && borrowRequests.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {borrowRequests.map((req) => (
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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium text-foreground">
                  No borrow requests yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Browse items and send your first borrow request.
                </p>
                <Link
                  href="/browse"
                  className="mt-4 text-sm font-medium text-primary underline underline-offset-4"
                >
                  Browse items
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lending" className="mt-4">
            {lendRequests && lendRequests.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lendRequests.map((req) => (
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
                      <CardDescription>
                        From{" "}
                        {(req.profiles as { display_name: string | null })
                          ?.display_name || "Someone"}
                      </CardDescription>
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
                      {req.status === "pending" && (
                        <RequestActions requestId={req.id} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium text-foreground">
                  No lending requests
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  When someone requests to borrow your items, they will appear here.
                </p>
                <Link
                  href="/list-item"
                  className="mt-4 text-sm font-medium text-primary underline underline-offset-4"
                >
                  List an item
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
