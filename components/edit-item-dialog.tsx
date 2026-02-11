"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface EditItemDialogProps {
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
  }
  categories: Category[]
}

export function EditItemDialog({ item, categories }: EditItemDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || "")
  const [categoryId, setCategoryId] = useState(item.category_id || "")
  const [pricePerDay, setPricePerDay] = useState(String(item.price_per_day))
  const [location, setLocation] = useState(item.location)
  const [condition, setCondition] = useState(item.condition)
  const [imageUrl, setImageUrl] = useState(item.image_url || "")
  const [isAvailable, setIsAvailable] = useState(item.is_available)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from("items")
      .update({
        title,
        description: description || null,
        category_id: categoryId || null,
        price_per_day: parseFloat(pricePerDay),
        location,
        condition,
        image_url: imageUrl || null,
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    setIsLoading(false)

    if (error) {
      toast.error("Failed to update item. Please try again.")
    } else {
      toast.success("Item updated successfully!")
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Item</DialogTitle>
          <DialogDescription>
            Update the details of your listing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
              <Label>Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price per Day ($)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.50"
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-image">Image URL</Label>
            <Input
              id="edit-image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="edit-available" className="text-sm font-medium">
                Available for borrowing
              </Label>
              <p className="text-xs text-muted-foreground">
                Toggle off to temporarily hide from browse
              </p>
            </div>
            <Switch
              id="edit-available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
