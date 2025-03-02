import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromToken } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowUpRight,
  Phone,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  PhoneCall,
  ArrowRight,
} from "lucide-react"

interface StatusCounts {
  new: number
  called: number
  "follow-up": number
  "not-interested": number
  converted: number
  [key: string]: number
}

export default async function DashboardPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()

  // Get total contacts count
  const totalContacts = await db.collection("contacts").countDocuments({
    userId: user.id,
  })

  // Get contacts by status
  const contactsByStatus = await db.collection("contacts").aggregate([
    { $match: { userId: user.id } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray()

  // Create a status count map
  const statusCounts: StatusCounts = {
    new: 0,
    called: 0,
    "follow-up": 0,
    "not-interested": 0,
    converted: 0,
  }
  contactsByStatus.forEach(status => {
    if (status._id) {
      statusCounts[status._id] = status.count
    }
  })

  // Get recent contacts with their latest call
  const recentContacts = await db.collection("contacts")
    .aggregate([
      { $match: { userId: user.id } },
      {
        $lookup: {
          from: "call_logs",
          localField: "_id",
          foreignField: "contactId",
          as: "calls"
        }
      },
      { $sort: { "calls.timestamp": -1 } },
      { $limit: 5 }
    ]).toArray()

  // Get recent call logs
  const recentCalls = await db.collection("call_logs")
    .find({})
    .sort({ timestamp: -1 })
    .limit(5)
    .toArray()

  // Calculate conversion rate
  const conversionRate = totalContacts > 0
    ? ((statusCounts.converted || 0) / totalContacts * 100).toFixed(1)
    : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline">New</Badge>
      case "called":
        return <Badge variant="secondary">Called</Badge>
      case "follow-up":
        return <Badge className="bg-blue-500">Follow-up</Badge>
      case "not-interested":
        return <Badge variant="destructive">Not Interested</Badge>
      case "converted":
        return <Badge className="bg-green-500">Converted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard/contacts/new">
              <UserPlus className="mr-2 h-4 w-4" />
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
            <p className="text-xs text-muted-foreground">
              {statusCounts.new || 0} new contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Called Contacts</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.called || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statusCounts["follow-up"] || 0} follow-ups needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.converted || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {conversionRate}% conversion rate
              <ArrowUpRight className="ml-1 h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Interested</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts["not-interested"] || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {totalContacts} total contacts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Your most recently contacted leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts.map(contact => (
                <div key={contact._id.toString()} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contact.company.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contact.status)}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/contacts/${contact._id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest calls and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalls.map(call => (
                <div key={call._id.toString()} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border">
                    <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Call with {call.contactName || "Contact"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                      {call.duration && ` • ${Math.floor(call.duration / 60)}m ${call.duration % 60}s`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}