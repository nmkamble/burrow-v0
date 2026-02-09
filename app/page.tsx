import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { BrowseItems } from "@/components/browse-items";
import { Recycle, DollarSign, Leaf, Users } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch items with category info and average ratings
  const { data: items } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug)
    `
    )
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  // Fetch review stats for items
  const itemIds = items?.map((i) => i.id) || [];
  const { data: reviewStats } = await supabase
    .from("reviews")
    .select("item_id, rating")
    .in("item_id", itemIds);

  // Calculate avg ratings per item
  const ratingMap: Record<string, { total: number; count: number }> = {};
  reviewStats?.forEach((r) => {
    if (!ratingMap[r.item_id]) ratingMap[r.item_id] = { total: 0, count: 0 };
    ratingMap[r.item_id].total += r.rating;
    ratingMap[r.item_id].count += 1;
  });

  const enrichedItems = (items || []).map((item) => ({
    ...item,
    avg_rating: ratingMap[item.id]
      ? ratingMap[item.id].total / ratingMap[item.id].count
      : null,
    review_count: ratingMap[item.id]?.count || null,
  }));

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />

      {/* Hero Section */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Rent college essentials from fellow students
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Save money and reduce waste by renting calculators, party
              decorations, costumes, and more. Everything you need for campus
              life, at a fraction of the cost.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                icon: DollarSign,
                label: "Save Money",
                desc: "Rent for a fraction of retail",
              },
              {
                icon: Leaf,
                label: "Sustainable",
                desc: "Reduce, reuse, rent",
              },
              {
                icon: Users,
                label: "Peer-to-Peer",
                desc: "Rent from students like you",
              },
              {
                icon: Recycle,
                label: "Full Circle",
                desc: "List items you no longer need",
              },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col gap-2 rounded-lg border bg-background p-4"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {feature.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {feature.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Section */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Browse Available Items
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrichedItems.length} item{enrichedItems.length !== 1 ? "s" : ""}{" "}
            available to rent
          </p>
        </div>
        <BrowseItems
          items={enrichedItems}
          categories={categories || []}
        />
      </main>
    </div>
  );
}
