"use client";

import React from "react"

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

interface RentRequestFormProps {
  itemId: string;
  ownerId: string;
  pricePerDay: number;
  userId: string | null;
}

export function RentRequestForm({
  itemId,
  ownerId,
  pricePerDay,
  userId,
}: RentRequestFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dayCount =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const totalPrice = dayCount * pricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please sign in to request a borrow.");
      return;
    }
    if (userId === ownerId) {
      toast.error("You cannot borrow your own item.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("rental_requests").insert({
      item_id: itemId,
      borrower_id: userId,
      owner_id: ownerId,
      start_date: startDate,
      end_date: endDate,
      message: message || null,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to submit rental request. Please try again.");
    } else {
      toast.success("Borrow request sent! The lender will review it.");
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">Request Sent</h3>
          <p className="text-center text-sm text-muted-foreground">
            Your borrow request has been submitted. The lender will review and
            respond to your request.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request to Borrow</CardTitle>
        <CardDescription>
          Select your dates and send a request to the lender.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                required
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                required
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message to lender</Label>
            <Textarea
              id="message"
              placeholder="Hi! I'd love to borrow this for a project. I can pick it up anytime..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          {dayCount > 0 && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ${pricePerDay.toFixed(2)} x {dayCount} day
                  {dayCount !== 1 ? "s" : ""}
                </span>
                <span className="font-display text-lg font-bold text-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {!userId ? (
            <Button asChild>
              <a href="/auth/login">Sign in to borrow</a>
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading || !startDate || !endDate}>
              {isLoading ? "Sending request..." : "Send Borrow Request"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
