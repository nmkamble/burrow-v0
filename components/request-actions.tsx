"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function RequestActions({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("rental_requests")
      .update({ status, updated_at: new Date().toISOString() })
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
    <div className="mt-3 flex gap-2">
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
  );
}
