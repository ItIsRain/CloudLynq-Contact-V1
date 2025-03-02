import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getUserFromToken } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader user={user} />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

