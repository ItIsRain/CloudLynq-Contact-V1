// app/api/contacts/[id]/calls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { CallLog } from "@/lib/models";

// POST /api/contacts/[id]/calls - Log a new call
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const data = await request.json();

    // Validate the contact exists
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(params.id),
      userId: user.id,
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Create the call log
    const callLog: CallLog = {
      contactId: params.id,
      userId: user.id,
      timestamp: new Date(),
      duration: data.duration || undefined,
      notes: data.notes || undefined,
      status: data.status || "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("call_logs").insertOne(callLog);

    return NextResponse.json({
      message: "Call logged successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error logging call:", error);
    return NextResponse.json(
      { error: "Failed to log call" },
      { status: 500 }
    );
  }
}

// GET /api/contacts/[id]/calls - Get all calls for a contact
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    // Validate the contact exists and belongs to the user
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(params.id),
      userId: user.id,
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Get call logs
    const callLogs = await db
      .collection("call_logs")
      .find({ contactId: params.id })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(callLogs);
  } catch (error) {
    console.error("Error fetching call logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}