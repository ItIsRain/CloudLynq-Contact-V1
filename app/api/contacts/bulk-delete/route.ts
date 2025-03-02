import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { contactIds } = await req.json();
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { message: "Contact IDs are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const objectIds = contactIds.map(id => new ObjectId(id));

    const db = await getDb();

    // Delete the contacts
    const result = await db.collection("contacts").deleteMany({
      _id: { $in: objectIds },
      userId: user.id,
    });

    // Delete associated call logs
    await db.collection("call_logs").deleteMany({
      contactId: { $in: contactIds }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete contacts error:", error);
    return NextResponse.json(
      { message: "Failed to delete contacts" },
      { status: 500 }
    );
  }
} 