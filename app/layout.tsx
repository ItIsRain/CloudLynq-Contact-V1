import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { getDb } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CloudLynq",
  description: "Contact Management System",
  generator: 'v0.dev',
  icons: {
    icon: "/CloudLynqFavicon.svg",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const db = await getDb()
  const settings = await db.collection("settings").findOne({ type: "system" })
  const user = await getUserFromToken()
  const isAdmin = user?.email === "mohamed@lynq.ae"

  // Check maintenance mode
  if (settings?.maintenanceMode && !isAdmin) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
              <h1 className="text-3xl font-bold mb-4">System Maintenance</h1>
              <p className="text-muted-foreground">The system is currently under maintenance. Please try again later.</p>
            </div>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/CloudLynqFavicon.svg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {settings?.systemNotice && (
              <div className="sticky top-0 z-50 bg-yellow-100 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800">
                <div className="container mx-auto px-4 py-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center font-medium">
                    {settings.systemNotice}
                  </p>
                </div>
              </div>
            )}
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'