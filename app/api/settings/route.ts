import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

const ADMIN_EMAIL = "mohamed@lynq.ae"

export async function GET() {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const settings = await db.collection("settings").findOne({ type: "system" }) || {
      maintenanceMode: false,
      registrationDisabled: false,
      systemNotice: "",
    }

    return NextResponse.json({
      settings,
      isAdmin: user.email === ADMIN_EMAIL,
    })
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const db = await getDb()

    // Only admin can update system settings
    if (data.systemSettings && user.email === ADMIN_EMAIL) {
      await db.collection("settings").updateOne(
        { type: "system" },
        {
          $set: {
            ...data.systemSettings,
            type: "system",
            updatedAt: new Date(),
            updatedBy: user.id,
          }
        },
        { upsert: true }
      )

      // Return the updated settings
      const updatedSettings = await db.collection("settings").findOne({ type: "system" })
      return NextResponse.json({ success: true, settings: updatedSettings })
    }

    // Update user profile
    if (data.profile) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            name: data.profile.name,
            email: data.profile.email,
            updatedAt: new Date(),
          }
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 })
  }
} 