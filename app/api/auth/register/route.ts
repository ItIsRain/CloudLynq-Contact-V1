import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const now = new Date()
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    })

    // Generate token
    const token = generateToken(result.insertedId.toString())

    // Set cookie
    setAuthCookie(token)

    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

