"use client";

import { Button } from "@/components/ui/button";
import {
  Calculator,
  PartyPopper,
  Shirt,
  BookOpen,
  Laptop,
  Dumbbell,
  CookingPot,
  Armchair,
} from "lucide-react";
import type { ReactNode } from "react";

const categoryIcons: Record<string, ReactNode> = {
  calculator: <Calculator className="h-4 w-4" />,
  "party-popper": <PartyPopper className="h-4 w-4" />,
  shirt: <Shirt className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  laptop: <Laptop className="h-4 w-4" />,
  dumbbell: <Dumbbell className="h-4 w-4" />,
  "cooking-pot": <CookingPot className="h-4 w-4" />,
  armchair: <Armchair className="h-4 w-4" />,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.slug ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(cat.slug === selected ? null : cat.slug)}
          className="gap-1.5"
        >
          {cat.icon && categoryIcons[cat.icon]}
          {cat.name}
        </Button>
      ))}
    </div>
  );
}
