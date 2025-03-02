import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { getDb } from "./db"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key"
const COOKIE_NAME = "auth-token"

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
  const cookieStore = cookies()
  const isDev = process.env.NODE_ENV !== "production"
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export function removeAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getUserFromToken() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string }
    const db = await getDb()
    
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId)
    })

    if (!user) {
      removeAuthCookie()
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    removeAuthCookie()
    return null
  }
}