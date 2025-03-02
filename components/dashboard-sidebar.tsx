"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { BarChart, Home, Phone, Settings, Upload, Users } from "lucide-react"

interface Route {
  href: string
  icon: React.ElementType
  title: string
}

export function DashboardSidebar() {
  const pathname = usePathname()
  
  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/dashboard/contacts",
      icon: Users,
      title: "Contacts",
    },
    {
      href: "/dashboard/import",
      icon: Upload,
      title: "Import Contacts",
    },
    {
      href: "/dashboard/reports",
      icon: BarChart,
      title: "Reports",
    },
    {
      href: "/dashboard/call-logs",
      icon: Phone,
      title: "Call Logs",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-gradient-to-b from-background to-muted/20 shadow-sm h-screen">
      <ScrollArea className="flex-1 py-3">
        <div className="px-3">
          <div className="text-xs font-semibold text-muted-foreground mx-2 mb-2 mt-2">MAIN NAVIGATION</div>
          
          <nav className="grid gap-1">
            {routes.slice(0, 2).map((route) => (
              <NavItem key={route.href} route={route} pathname={pathname} />
            ))}
          </nav>
          
          <div className="text-xs font-semibold text-muted-foreground mx-2 mb-2 mt-5">TOOLS</div>
          
          <nav className="grid gap-1">
            {routes.slice(2, 5).map((route) => (
              <NavItem key={route.href} route={route} pathname={pathname} />
            ))}
          </nav>
          
          <div className="text-xs font-semibold text-muted-foreground mx-2 mb-2 mt-5">PREFERENCES</div>
          
          <nav className="grid gap-1">
            {routes.slice(5).map((route) => (
              <NavItem key={route.href} route={route} pathname={pathname} />
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  )
}

function NavItem({ route, pathname }: { route: Route; pathname: string }) {
  const isActive = pathname === route.href
  
  return (
    <Button
      variant="ghost"
      className={cn(
        "justify-start h-10 gap-2 rounded-lg px-3",
        isActive
          ? "bg-primary/10 text-primary font-medium hover:bg-primary/10"
          : "hover:bg-muted"
      )}
      asChild
    >
      <Link href={route.href}>
        <route.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
        <span>{route.title}</span>
        {route.title === "Call Logs" && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full">3</span>
        )}
      </Link>
    </Button>
  )
}