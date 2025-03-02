import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getUserFromToken } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Phone, PhoneCall, PhoneOff, Clock } from "lucide-react"
import Link from "next/link"

export default async function CallLogsPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()

  // Get all call logs with contact details
  const callLogs = await db.collection("call_logs")
    .aggregate([
      { $match: { userId: user.id } },
      { $sort: { timestamp: -1 } },
      {
        $lookup: {
          from: "contacts",
          localField: "contactId",
          foreignField: "_id",
          as: "contact"
        }
      },
      { $unwind: "$contact" }
    ])
    .toArray()

  // Calculate statistics
  const totalCalls = callLogs.length
  const completedCalls = callLogs.filter(call => call.status === "completed").length
  const missedCalls = callLogs.filter(call => call.status === "missed").length
  const scheduledCalls = callLogs.filter(call => call.status === "scheduled").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "missed":
        return <Badge variant="destructive">Missed</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
        <p className="text-muted-foreground">
          View and manage your call history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCalls}</div>
            <p className="text-xs text-muted-foreground">
              {((completedCalls / totalCalls) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed</CardTitle>
            <PhoneOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missedCalls}</div>
            <p className="text-xs text-muted-foreground">
              {((missedCalls / totalCalls) * 100).toFixed(1)}% missed rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCalls}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming calls
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>
            A detailed log of all your calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callLogs.map((log) => (
                <TableRow key={log._id.toString()}>
                  <TableCell>
                    <div>
                      <Link 
                        href={`/dashboard/contacts/${log.contact._id}`}
                        className="font-medium hover:underline"
                      >
                        {log.contact.firstName} {log.contact.lastName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {log.contact.company?.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{formatDuration(log.duration)}</TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate">
                      {log.notes || "No notes"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}