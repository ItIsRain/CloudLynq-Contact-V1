import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { ObjectId, Document } from "mongodb"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 })
    }

    const db = await getDb()

    // Create note
    const noteId = new ObjectId()
    const now = new Date()
    const note = {
      _id: noteId,
      content,
      createdAt: now,
      createdBy: {
        id: user.id,
        name: user.name,
      },
    }

    // Add note to contact
    const result = await db.collection<Document>("contacts").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: user.id,
      },
      {
        $push: { "notes": note } as any,
        $set: { updatedAt: now },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Add note error:", error)
    return NextResponse.json({ message: "Failed to add note" }, { status: 500 })
  }
}

