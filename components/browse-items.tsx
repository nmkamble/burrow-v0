"use client";

import { useState, useMemo } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { SearchFilters } from "@/components/search-filters";
import { ItemCard, type ItemCardData } from "@/components/item-card";
import { Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface BrowseItemsProps {
  items: ItemCardData[];
  categories: Category[];
}

export function BrowseItems({ items, categories }: BrowseItemsProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [condition, setCondition] = useState("all");

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (item) => item.categories?.slug === selectedCategory
      );
    }

    // Condition filter
    if (condition !== "all") {
      result = result.filter((item) => item.condition === condition);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
        break;
      case "price-high":
        result.sort((a, b) => Number(b.price_per_day) - Number(a.price_per_day));
        break;
      case "rating":
        result.sort(
          (a, b) => (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0)
        );
        break;
      default:
        // newest is already sorted from query
        break;
    }

    return result;
  }, [items, search, selectedCategory, sortBy, condition]);

  return (
    <div className="flex flex-col gap-6">
      <SearchFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        condition={condition}
        onConditionChange={setCondition}
      />
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-medium text-foreground">No items found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you need.
          </p>
        </div>
      )}
    </div>
  );
}
