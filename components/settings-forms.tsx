"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"

interface SettingsFormsProps {
  user: {
    id: string
    name: string
    email: string
  }
  settings: {
    maintenanceMode: boolean
    registrationDisabled: boolean
    systemNotice: string
  }
  isAdmin: boolean
}

export function SettingsForms({ user, settings, isAdmin }: SettingsFormsProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      profile: {
        name: formData.get("name"),
        email: formData.get("email"),
      }
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSystemSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      systemSettings: {
        maintenanceMode: formData.get("maintenanceMode") === "on",
        registrationDisabled: formData.get("registrationDisabled") === "on",
        systemNotice: formData.get("systemNotice"),
        type: "system"
      }
    }

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to update system settings")

      toast({
        title: "Success",
        description: "System settings updated successfully",
      })

      // Refresh the page to show updated settings
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update system settings",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="Your email"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Manage system-wide settings and controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSystemSettingsSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Maintenance Mode</label>
                  <p className="text-sm text-muted-foreground">
                    Put the system in maintenance mode. Only admins can access the system.
                  </p>
                </div>
                <Switch
                  name="maintenanceMode"
                  defaultChecked={settings.maintenanceMode}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="font-medium">Disable Registration</label>
                  <p className="text-sm text-muted-foreground">
                    Prevent new users from registering
                  </p>
                </div>
                <Switch
                  name="registrationDisabled"
                  defaultChecked={settings.registrationDisabled}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <label className="font-medium">System Notice</label>
                <p className="text-sm text-muted-foreground">
                  Display a notice to all users
                </p>
                <Textarea
                  name="systemNotice"
                  defaultValue={settings.systemNotice}
                  placeholder="Enter a system-wide notice..."
                  className="h-20"
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save System Settings"}
              </Button>
            </form>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Danger Zone</h3>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  These actions are destructive and should be used with caution.
                </AlertDescription>
              </Alert>
              <div className="flex gap-4">
                <Button variant="destructive">Clear All Data</Button>
                <Button variant="destructive">Reset System</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
} 