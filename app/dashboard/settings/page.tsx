import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFromToken } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { redirect } from "next/navigation"
import { SettingsForms } from "@/components/settings-forms"
import { WithId, Document } from "mongodb"

const ADMIN_EMAIL = "mohamed@lynq.ae"

interface SystemSettings {
  maintenanceMode: boolean
  registrationDisabled: boolean
  systemNotice: string
  type: string
}

export default async function SettingsPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  const db = await getDb()
  const rawSettings = await db.collection("settings").findOne({ type: "system" })
  
  const settings: SystemSettings = {
    maintenanceMode: rawSettings?.maintenanceMode ?? false,
    registrationDisabled: rawSettings?.registrationDisabled ?? false,
    systemNotice: rawSettings?.systemNotice ?? "",
    type: "system"
  }

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and system settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <SettingsForms user={user} settings={settings} isAdmin={isAdmin} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="system" className="space-y-4">
            <SettingsForms user={user} settings={settings} isAdmin={isAdmin} />
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  View system health and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold">
                      {await db.collection("users").countDocuments()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Contacts</p>
                    <p className="text-2xl font-bold">
                      {await db.collection("contacts").countDocuments()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Calls</p>
                    <p className="text-2xl font-bold">
                      {await db.collection("call_logs").countDocuments()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">System Version</p>
                    <p className="text-2xl font-bold">1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
} 