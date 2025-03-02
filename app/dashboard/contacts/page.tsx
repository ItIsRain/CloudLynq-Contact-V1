import { ContactsTable } from "@/components/contacts-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { Plus, Users, Phone, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { Contact } from "@/lib/models"
import type { WithId, Document } from "mongodb"

export default async function ContactsPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()
  const contacts = await db
    .collection("contacts")
    .find({})
    .sort({ createdAt: -1 })
    .toArray()

  const rawContacts: Contact[] = contacts.map((doc: WithId<Document>) => ({
    _id: doc._id.toString(),
    userId: doc.userId?.toString() || user.id,
    firstName: doc.firstName || '',
    lastName: doc.lastName || '',
    email: doc.email || '',
    phone: doc.phone || '',
    company: {
      name: doc.company?.name || '',
      address: doc.company?.address || '',
      phone: doc.company?.phone || '',
      website: doc.company?.website || '',
    },
    status: doc.status || 'new',
    notes: doc.notes || [],
    createdAt: (doc.createdAt || new Date()).toISOString(),
    updatedAt: (doc.updatedAt || new Date()).toISOString(),
  }))

  // Calculate stats
  const totalContacts = rawContacts.length
  const calledContacts = rawContacts.filter(c => c.status === 'called').length
  const convertedContacts = rawContacts.filter(c => c.status === 'converted').length
  const notInterestedContacts = rawContacts.filter(c => c.status === 'not-interested').length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage and track your business contacts</p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/import">
              <Plus className="mr-2 h-4 w-4" />
              Import Contacts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/contacts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Called</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calledContacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedContacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Interested</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notInterestedContacts}</div>
          </CardContent>
        </Card>
      </div>

      <ContactsTable contacts={rawContacts} />
    </div>
  )
}

