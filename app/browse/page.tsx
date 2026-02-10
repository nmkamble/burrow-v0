import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { BrowseItems } from "@/components/browse-items";

export const metadata = {
  title: "Browse Items - Burrow",
  description: "Search and filter all available items to borrow in your neighborhood.",
};

export default async function BrowsePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch items with category info
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
  let reviewStats: { item_id: string; rating: number }[] | null = null;
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("item_id, rating")
      .in("item_id", itemIds);
    reviewStats = data;
  }

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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Browse Items
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrichedItems.length} item{enrichedItems.length !== 1 ? "s" : ""}{" "}
            available to borrow
          </p>
        </div>
        <BrowseItems items={enrichedItems} categories={categories || []} />
      </main>
    </div>
  );
}
