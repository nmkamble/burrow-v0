"use client";

import React from "react"

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ListItemFormProps {
  categories: Category[];
  userId: string;
}

export function ListItemForm({ categories, userId }: ListItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.from("items").insert({
      owner_id: userId,
      category_id: categoryId,
      title,
      description: description || null,
      price_per_day: parseFloat(pricePerDay),
      location,
      condition,
      image_url: imageUrl || null,
      is_available: true,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to list item. Please try again.");
    } else {
      toast.success("Item listed successfully!");
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground">
            Item Listed!
          </h3>
          <p className="text-center text-muted-foreground">
            Your item is now visible to your neighbors. You will be notified when
            someone requests to borrow it.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/browse")}>
              Browse Items
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setTitle("");
                setDescription("");
                setCategoryId("");
                setPricePerDay("");
                setLocation("");
                setCondition("");
                setImageUrl("");
              }}
            >
              List Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          List an Item to Lend
        </CardTitle>
        <CardDescription>
          Share items with your neighbors and earn some extra cash through
          Burrow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              placeholder="e.g., Power drill, Party tent, Projector"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your item, its features, and any important details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Price per Day ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.50"
                placeholder="2.50"
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Pickup Location</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown, West Side"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste a link to an image of your item. Listings with photos get
              more rentals.
            </p>
          </div>

          <Button
            type="submit"
            className="mt-2"
            disabled={isLoading || !categoryId || !condition}
          >
            {isLoading ? "Listing item..." : "List Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
