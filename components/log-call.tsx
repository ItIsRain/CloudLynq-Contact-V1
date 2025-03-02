// components/log-call.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface LogCallProps {
  contactId: string;
  contactName: string;
}

export function LogCall({ contactId, contactName }: LogCallProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"completed" | "missed" | "scheduled">("completed");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/contacts/${contactId}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
          duration: duration ? parseInt(duration) : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to log call");
      }

      toast({
        title: "Call logged",
        description: `Call with ${contactName} has been logged successfully.`,
      });
      
      setIsOpen(false);
      setNotes("");
      setDuration("");
      setStatus("completed");
      router.refresh(); // Refresh the page to show the new call log
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log call",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center"
        variant="outline"
      >
        <Phone className="mr-2 h-4 w-4" />
        Log Call
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Log a Call</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(false)} 
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <RadioGroup 
              defaultValue="completed"
              value={status}
              onValueChange={(value) => setStatus(value as "completed" | "missed" | "scheduled")}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed">Completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="missed" id="missed" />
                <Label htmlFor="missed">Missed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled">Scheduled</Label>
              </div>
            </RadioGroup>
          </div>

          {status === "completed" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 300 (5 minutes)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about the call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging..." : "Log Call"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}