import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { getDb } from "./db"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

export function generateToken(userId: string) {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function setAuthCookie(token: string) {
  cookies().set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

export function removeAuthCookie() {
  cookies().delete("auth-token")
}

export async function getUserFromToken() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    const db = await getDb()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    return null
  }
}

