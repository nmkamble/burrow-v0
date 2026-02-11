import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import Link from "next/link"
import { ListingCard } from "@/components/listing-card"

export default async function MyListingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
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
    .order("created_at", { ascending: false })

  // Fetch categories for the edit dialog
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name")

  // Fetch pending requests for user's items
  const itemIds = items?.map((i) => i.id) || []
  let pendingRequests: { item_id: string }[] | null = null
  if (itemIds.length > 0) {
    const { data } = await supabase
      .from("rental_requests")
      .select("item_id")
      .in("item_id", itemIds)
      .eq("status", "pending")
    pendingRequests = data
  }

  const pendingCountMap: Record<string, number> = {}
  pendingRequests?.forEach((req) => {
    pendingCountMap[req.item_id] = (pendingCountMap[req.item_id] || 0) + 1
  })

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
              <ListingCard
                key={item.id}
                item={item}
                categories={categories || []}
                pendingCount={pendingCountMap[item.id] || 0}
              />
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
  )
}
