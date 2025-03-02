import { EditContact } from "@/components/edit-form";
import { getDb } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import type { Contact } from "@/lib/models";

interface EditContactPageProps {
  params: {
    id: string;
  };
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  console.log('Attempting to edit contact with ID:', params.id);
  
  const user = await getUserFromToken();
  if (!user) {
    console.log('No user found, redirecting to login');
    redirect("/login");
  }
  console.log('User authenticated:', user.id);

  const db = await getDb();

  try {
    // Validate ObjectId format
    let contactId: ObjectId;
    try {
      contactId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format:', params.id);
      notFound();
    }

    // To this
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(params.id),
      userId: user.id, // Don't convert to ObjectId since it's stored as string
    });

    if (!contact) {
      console.log('Contact not found');
      notFound();
    }
    console.log('Contact found:', contact._id.toString());

    // Cast the contact to include all required fields
    const typedContact: Contact = {
      ...contact,
      _id: contact._id.toString(),
      userId: contact.userId.toString(),
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: {
        name: contact.company?.name || '',
        address: contact.company?.address || '',
        phone: contact.company?.phone || '',
        website: contact.company?.website || '',
      },
      status: contact.status || 'new',
      notes: contact.notes || [],
      createdAt: contact.createdAt || new Date(),
      updatedAt: contact.updatedAt || new Date(),
    };

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit Contact</h1>
        <EditContact contact={typedContact} id={params.id} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching contact:', error);
    notFound();
  }
}