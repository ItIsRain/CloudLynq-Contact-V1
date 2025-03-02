import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["new", "called", "follow-up", "not-interested", "converted"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const db = await getDb()

    // Update contact status
    const result = await db.collection("contacts").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: user.id,
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Update status error:", error)
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 })
  }
}

