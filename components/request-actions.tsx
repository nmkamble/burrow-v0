"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

export function RequestActions({
  requestId,
  borrowerName,
}: {
  requestId: string;
  borrowerName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const router = useRouter();

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true);
    const supabase = createClient();

    const updateData: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (responseMessage.trim()) {
      updateData.owner_response = responseMessage.trim();
    }

    const { error } = await supabase
      .from("rental_requests")
      .update(updateData)
      .eq("id", requestId);

    setIsLoading(false);

    if (error) {
      toast.error("Failed to update request. Please try again.");
    } else {
      toast.success(
        status === "approved" ? "Request approved!" : "Request declined."
      );
      router.refresh();
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setShowResponse(!showResponse)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Add a response message
        {showResponse ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {showResponse && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`response-${requestId}`} className="text-xs">
            Message to {borrowerName || "borrower"}
          </Label>
          <Textarea
            id={`response-${requestId}`}
            placeholder="e.g. Sure! You can pick it up at..."
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={2}
            className="text-sm"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          disabled={isLoading}
          onClick={() => handleAction("approved")}
          className="flex-1"
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => handleAction("rejected")}
          className="flex-1"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Decline
        </Button>
      </div>
    </div>
  );
}
