"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

interface Note {
  _id: string
  content: string
  createdAt: string
  createdBy: {
    id: string
    name: string
  }
}

interface NotesSectionProps {
  contactId: string
  notes: Note[]
}

export function NotesSection({ contactId, notes: initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes || [])
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Note cannot be empty",
        description: "Please enter a note",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/contacts/${contactId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      const newNote = await response.json()
      setNotes([newNote, ...notes])
      setContent("")

      toast({
        title: "Note added",
        description: "Your note has been added successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add note",
        description: "Please try again",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Add notes about your interactions with this contact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a note about this contact..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </form>

        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note._id.toString()} className="rounded-lg border p-4">
                <div className="mb-2 text-sm text-muted-foreground">
                  {note.createdBy.name} on {formatDate(new Date(note.createdAt))}
                </div>
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No notes yet. Add your first note above.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

