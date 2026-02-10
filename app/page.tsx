import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { ItemCard, type ItemCardData } from "@/components/item-card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  HandHeart,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch featured items (latest 4 available)
  const { data: items } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug)
    `
    )
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(4);

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

  const ratingMap: Record<string, { total: number; count: number }> = {};
  reviewStats?.forEach((r) => {
    if (!ratingMap[r.item_id]) ratingMap[r.item_id] = { total: 0, count: 0 };
    ratingMap[r.item_id].total += r.rating;
    ratingMap[r.item_id].count += 1;
  });

  const enrichedItems: ItemCardData[] = (items || []).map((item) => ({
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
      <section className="relative overflow-hidden border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/burrow-mascot.jpg"
              alt="Burrow the groundhog mascot"
              width={96}
              height={96}
              className="mb-6 rounded-full border-4 border-primary/20"
            />
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Borrow within your borough
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Why buy when you can borrow? Burrow connects neighbors to share
              tools, gear, and everyday essentials. Save money, reduce waste, and
              build community.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/browse">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Items
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/list-item">
                  Start Lending
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {enrichedItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Recently Listed
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fresh items from your neighbors
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/browse">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {enrichedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              How Burrow Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps to start borrowing or lending
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: Search,
                title: "Find what you need",
                desc: "Browse items listed by neighbors in your area. Filter by category, condition, or price to find the perfect match.",
              },
              {
                step: "2",
                icon: HandHeart,
                title: "Request to borrow",
                desc: "Send a request with your dates and a message. The lender reviews and approves your request.",
              },
              {
                step: "3",
                icon: CalendarCheck,
                title: "Pick up and enjoy",
                desc: "Coordinate pickup, use the item for your rental period, and return it when you are done. Easy.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Leaf,
              title: "Sustainable",
              desc: "Reduce waste by sharing items instead of buying new ones that sit unused.",
            },
            {
              icon: Users,
              title: "Community-driven",
              desc: "Build trust and connections with people in your neighborhood.",
            },
            {
              icon: ShieldCheck,
              title: "Safe and secure",
              desc: "Verified accounts, reviews, and secure request management protect everyone.",
            },
          ].map((value) => (
            <div
              key={value.title}
              className="flex flex-col gap-3 rounded-xl border bg-card p-6"
            >
              <value.icon className="h-6 w-6 text-primary" />
              <h3 className="font-display text-base font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/burrow-mascot.jpg"
              alt="Burrow mascot"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="font-display text-sm font-bold text-foreground">
              Burrow
            </span>
            <span className="text-sm text-muted-foreground">
              &mdash; Borrow within your borough
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for neighbors, by neighbors.
          </p>
        </div>
      </footer>
    </div>
  );
}
