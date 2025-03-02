// app/dashboard/contacts/[id]/page.tsx
import { ContactDetail } from "@/components/contact-detail"
import { NotesSection } from "@/components/notes-section"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { notFound, redirect } from "next/navigation"

interface ContactPageProps {
  params: {
    id: string
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()

  try {
    // Fetch the contact
    const contact = await db.collection("contacts").findOne({
      _id: new ObjectId(params.id),
      userId: user.id, // Using string comparison since userId is stored as string
    })

    if (!contact) {
      notFound()
    }

    // Fetch call history for this contact
    const callHistory = await db.collection("call_logs")
      .find({ contactId: params.id })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()
    
    // Get user IDs from call logs to fetch user details
    const userIds = [...new Set(callHistory.map(log => log.userId))]
    
    // Fetch user information for all users who called
    const users = userIds.length > 0 
      ? await db.collection("users").find({
          _id: { 
            $in: userIds.map(id => new ObjectId(id.toString().replace(/^ObjectId\(['"](.+)['"]\)$/, '$1'))) 
          }
        }).toArray()
      : []
      
    // Create a map of user IDs to user names for easy lookup
    const userMap: Record<string, string> = {}
    users.forEach(user => {
      userMap[user._id.toString()] = user.name || user.email || "Unknown user"
    })

    // Add userName to each call log
    const enhancedCallHistory = callHistory.map(log => ({
      _id: log._id.toString(),
      contactId: log.contactId,
      userId: log.userId,
      userName: log.userName || userMap[log.userId] || "Unknown user",
      timestamp: log.timestamp,
      duration: log.duration,
      notes: log.notes,
      status: log.status as 'completed' | 'missed' | 'scheduled'
    }))

    return (
      <div className="space-y-6">
        <ContactDetail contact={contact} callHistory={enhancedCallHistory} />
        <NotesSection contactId={params.id} notes={contact.notes} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching contact details:", error)
    notFound()
  }
}