import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromToken } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { redirect } from "next/navigation"
import { BarChart, DollarSign, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"

type StatusType = "new" | "called" | "follow-up" | "not-interested" | "converted"

interface StatusCount {
  _id: StatusType
  count: number
}

export default async function ReportsPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()

  // Get total contacts
  const totalContacts = await db.collection("contacts").countDocuments({
    userId: user.id,
  })

  // Get contacts by status
  const contactsByStatus = await db.collection("contacts").aggregate<StatusCount>([
    { $match: { userId: user.id } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray()

  // Create a status count map
  const statusCounts = {
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

  // Get recent call logs
  const recentCalls = await db.collection("call_logs")
    .find({ userId: user.id })
    .sort({ timestamp: -1 })
    .limit(30)
    .toArray()

  // Calculate conversion rate
  const conversionRate = totalContacts > 0
    ? ((statusCounts.converted || 0) / totalContacts * 100).toFixed(1)
    : 0

  // Calculate follow-up rate
  const followUpRate = totalContacts > 0
    ? ((statusCounts["follow-up"] || 0) / totalContacts * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analytics and statistics about your contacts
        </p>
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
              {statusCounts.new} new contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {statusCounts.converted} converted contacts
              <ArrowUpRight className="ml-1 h-3 w-3 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUpRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {statusCounts["follow-up"]} follow-ups needed
              {Number(followUpRate) > 20 ? (
                <ArrowUpRight className="ml-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="ml-1 h-3 w-3 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCalls.length}</div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Status Distribution</CardTitle>
            <CardDescription>Breakdown of contacts by their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New</span>
                    <span className="text-sm font-bold">{statusCounts.new}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(statusCounts.new / totalContacts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Called</span>
                    <span className="text-sm font-bold">{statusCounts.called}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${(statusCounts.called / totalContacts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up</span>
                    <span className="text-sm font-bold">{statusCounts["follow-up"]}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-yellow-500"
                      style={{
                        width: `${(statusCounts["follow-up"] / totalContacts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Not Interested</span>
                    <span className="text-sm font-bold">{statusCounts["not-interested"]}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{
                        width: `${(statusCounts["not-interested"] / totalContacts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Converted</span>
                    <span className="text-sm font-bold">{statusCounts.converted}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${(statusCounts.converted / totalContacts) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Activity</CardTitle>
            <CardDescription>Recent call logs and outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Total Calls</p>
                  <p className="text-sm text-muted-foreground">
                    {recentCalls.length} calls in the last 30 days
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-bold">
                        {recentCalls.filter(call => call.status === "completed").length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${(recentCalls.filter(call => call.status === "completed").length / recentCalls.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Missed</span>
                      <span className="text-sm font-bold">
                        {recentCalls.filter(call => call.status === "missed").length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-red-500"
                        style={{
                          width: `${(recentCalls.filter(call => call.status === "missed").length / recentCalls.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scheduled</span>
                      <span className="text-sm font-bold">
                        {recentCalls.filter(call => call.status === "scheduled").length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${(recentCalls.filter(call => call.status === "scheduled").length / recentCalls.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 