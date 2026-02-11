import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { RentRequestForm } from "@/components/rent-request-form";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, ShieldCheck, User } from "lucide-react";

const conditionLabels: Record<string, string> = {
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch item with category and owner profile
  const { data: item } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name, slug),
      profiles:owner_id(display_name, university)
    `
    )
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  // Fetch reviews for this item
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles:reviewer_id(display_name)
    `
    )
    .eq("item_id", id)
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader user={user} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Back link */}
        <Link
          href="/browse"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to browse
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-3">
          {/* Left column: Item details */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
              {item.image_url ? (
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-6xl font-bold text-muted-foreground/20">
                    {item.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Item info */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                {item.categories?.name && (
                  <Badge variant="secondary">{item.categories.name}</Badge>
                )}
                <Badge variant="outline">
                  {conditionLabels[item.condition] || item.condition}
                </Badge>
                {!item.is_available && (
                  <Badge variant="destructive">Unavailable</Badge>
                )}
              </div>

              <h1 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                {item.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </span>
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {avgRating.toFixed(1)} ({reviews?.length} review
                    {reviews?.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-primary">
                  ${Number(item.price_per_day).toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/ day</span>
              </div>

              {item.description && (
                <div className="mt-6">
                  <h2 className="text-sm font-medium text-foreground">
                    Description
                  </h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Owner info */}
              {item.profiles && (
                <div className="mt-6 flex items-center gap-3 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Listed by{" "}
                      {(item.profiles as { display_name: string | null })
                        ?.display_name || "Anonymous"}
                    </p>
                    {(item.profiles as { university: string | null })
                      ?.university && (
                      <p className="text-xs text-muted-foreground">
                        {
                          (item.profiles as { university: string | null })
                            .university
                        }
                      </p>
                    )}
                  </div>
                  <ShieldCheck className="ml-auto h-5 w-5 text-primary" />
                </div>
              )}

              {/* Reviews */}
              {reviews && reviews.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-medium text-foreground">
                    Reviews ({reviews.length})
                  </h2>
                  <div className="mt-3 flex flex-col gap-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {(
                              review.profiles as {
                                display_name: string | null;
                              }
                            )?.display_name || "Anonymous"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "fill-accent text-accent"
                                    : "text-border"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Rent request form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <RentRequestForm
              itemId={item.id}
              ownerId={item.owner_id}
              pricePerDay={Number(item.price_per_day)}
              userId={user?.id || null}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
