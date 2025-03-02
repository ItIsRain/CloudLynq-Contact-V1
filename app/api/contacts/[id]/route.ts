import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate ObjectId format
    let contactId: ObjectId;
    try {
      contactId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json({ message: "Invalid contact ID" }, { status: 400 });
    }

    const data = await req.json();
    const { firstName, lastName, email, phone } = data;

    const db = await getDb();
    
    // First check if the contact exists and belongs to the user
    const existingContact = await db.collection("contacts").findOne({
      _id: contactId,
      userId: new ObjectId(user.id),
    });

    if (!existingContact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    // Update the contact
    const result = await db.collection("contacts").updateOne(
      {
        _id: contactId,
        userId: new ObjectId(user.id),
      },
      {
        $set: {
          firstName,
          lastName,
          email,
          phone,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { message: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate ObjectId format
    let contactId: ObjectId;
    try {
      contactId = new ObjectId(params.id);
    } catch (error) {
      return NextResponse.json({ message: "Invalid contact ID" }, { status: 400 });
    }

    const db = await getDb();
    const contact = await db.collection("contacts").findOne({
      _id: contactId,
      userId: new ObjectId(user.id),
    });

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Get contact error:", error);
    return NextResponse.json(
      { message: "Failed to fetch contact" },
      { status: 500 }
    );
  }
} 