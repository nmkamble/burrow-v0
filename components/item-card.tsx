import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

export interface ItemCardData {
  id: string;
  title: string;
  description: string | null;
  price_per_day: number;
  location: string;
  condition: string;
  image_url: string | null;
  is_available: boolean;
  categories?: { name: string; slug: string } | null;
  avg_rating?: number | null;
  review_count?: number | null;
}

const conditionLabels: Record<string, string> = {
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
};

const conditionColors: Record<string, string> = {
  "like-new": "bg-primary/10 text-primary",
  good: "bg-primary/10 text-primary",
  fair: "bg-accent/20 text-accent-foreground",
  worn: "bg-muted text-muted-foreground",
};

export function ItemCard({ item }: { item: ItemCardData }) {
  return (
    <Link href={`/items/${item.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-muted">
          {item.image_url ? (
            <img
              src={item.image_url || "/placeholder.svg"}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-muted-foreground/30">
                  {item.title.charAt(0)}
                </div>
              </div>
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
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-medium leading-snug text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
              {item.title}
            </h3>
            <span className="shrink-0 font-display text-lg font-bold text-primary">
              ${Number(item.price_per_day).toFixed(2)}
              <span className="text-xs font-normal text-muted-foreground">
                /day
              </span>
            </span>
          </div>
          {item.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {item.categories?.name && (
              <Badge variant="secondary" className="text-xs">
                {item.categories.name}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-xs ${conditionColors[item.condition] || ""}`}
            >
              {conditionLabels[item.condition] || item.condition}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </span>
            {item.avg_rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {Number(item.avg_rating).toFixed(1)}
                {item.review_count ? ` (${item.review_count})` : ""}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
