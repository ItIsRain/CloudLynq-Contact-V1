"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { PhoneCall } from "lucide-react"

interface CallLogDialogProps {
  isOpen?: boolean
  onClose?: () => void
  contactId: string
  contactName: string
}

export function CallLogDialog({ isOpen, onClose, contactId, contactName }: CallLogDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [status, setStatus] = useState<"completed" | "missed" | "scheduled">("completed")
  const [notes, setNotes] = useState("")
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const handleClose = () => {
    setNotes("")
    setDuration("")
    setStatus("completed")
    if (onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/contacts/${contactId}/calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes,
          duration: duration || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to log call")
      }

      toast({
        title: "Call logged",
        description: "The call has been logged successfully.",
      })
      
      handleClose()
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log call. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const open = isOpen !== undefined ? isOpen : internalOpen
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      handleClose()
    }
    if (onClose && !value) {
      onClose()
    } else {
      setInternalOpen(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PhoneCall className="mr-2 h-4 w-4" />
            Log Call
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Call with {contactName}</DialogTitle>
          <DialogDescription>
            Record details about your call with {contactName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "completed" | "missed" | "scheduled")}
              className="w-full rounded-md border p-2"
            >
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label>Duration (minutes)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter call duration"
            />
          </div>
          <div className="space-y-2">
            <label>Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the call"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging..." : "Log Call"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}