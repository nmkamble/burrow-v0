"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { DeleteItemDialog } from "@/components/delete-item-dialog"
import { MapPin, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const conditionLabels: Record<string, string> = {
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
}

interface Category {
  id: string
  name: string
  slug: string
}

interface ListingCardProps {
  item: {
    id: string
    title: string
    description: string | null
    category_id: string | null
    price_per_day: number
    location: string
    condition: string
    image_url: string | null
    is_available: boolean
    categories?: { name: string; slug: string } | null
  }
  categories: Category[]
  pendingCount: number
}

export function ListingCard({ item, categories, pendingCount }: ListingCardProps) {
  return (
    <Card>
      {/* Image preview */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-4xl font-bold text-muted-foreground/20">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <span className="rounded-md bg-card px-3 py-1 text-sm font-medium text-card-foreground">
              Unavailable
            </span>
          </div>
        )}
      </div>

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
        {pendingCount > 0 && (
          <p className="mt-3 text-sm font-medium text-primary">
            {pendingCount} pending request
            {pendingCount !== 1 ? "s" : ""}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/items/${item.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Link>
          </Button>
          <EditItemDialog item={item} categories={categories} />
          <DeleteItemDialog itemId={item.id} itemTitle={item.title} />
        </div>
      </CardContent>
    </Card>
  )
}
