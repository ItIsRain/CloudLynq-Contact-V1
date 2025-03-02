"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Edit, ExternalLink, Mail, Phone, PhoneCall } from "lucide-react"
import { CallLogDialog } from "./CallLogDialog"

interface ContactDetailProps {
  contact: any
  callHistory?: Array<{
    _id: string;
    contactId: string;
    userId: string;
    userName: string;
    timestamp: Date;
    duration?: number;
    notes?: string;
    status: 'completed' | 'missed' | 'scheduled';
  }>;
}

export function ContactDetail({ contact, callHistory = [] }: ContactDetailProps) {
  const [status, setStatus] = useState(contact.status)
  const [isCallLogOpen, setIsCallLogOpen] = useState(false)
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/contacts/${contact._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setStatus(newStatus)
      toast({
        title: "Status updated",
        description: `Contact marked as ${newStatus}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update contact status",
      })
    }
  }

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

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(date).getTime();
    
    // Convert to seconds, minutes, hours, days
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `just now`;
    }
  };

  const getCallStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/contacts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {contact.firstName} {contact.lastName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            {getStatusBadge(status)}
            <span>Added on {formatDate(new Date(contact.createdAt))}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => setIsCallLogOpen(true)}>
            <PhoneCall className="mr-2 h-4 w-4" />
            Log Call
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/contacts/${contact._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email</div>
                  <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Phone</div>
                  <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:underline">
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.company.name && (
              <div>
                <div className="font-medium">Company Name</div>
                <div className="text-muted-foreground">{contact.company.name}</div>
              </div>
            )}

            {contact.company.address && (
              <div>
                <div className="font-medium">Address</div>
                <div className="text-muted-foreground">{contact.company.address}</div>
              </div>
            )}

            {contact.company.phone && (
              <div>
                <div className="font-medium">Company Phone</div>
                <a href={`tel:${contact.company.phone}`} className="text-muted-foreground hover:underline">
                  {contact.company.phone}
                </a>
              </div>
            )}

            {contact.company.website && (
              <div>
                <div className="font-medium">Website</div>
                <a
                  href={contact.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-muted-foreground hover:underline"
                >
                  {contact.company.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Call History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Recent calls with this contact</CardDescription>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No call history available</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCallLogOpen(true)}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Log First Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {callHistory.map((call) => (
                <div key={call._id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getCallStatusColor(call.status)}`}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                      <h3 className="font-medium mt-2">{call.userName || 'Unknown user'}</h3>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(new Date(call.timestamp))}
                    </span>
                  </div>
                  {call.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.floor(call.duration / 60)}m {call.duration % 60}s
                    </p>
                  )}
                  {call.notes && (
                    <div className="mt-2 bg-muted p-3 rounded-md">
                      <p className="text-sm">{call.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Status</CardTitle>
          <CardDescription>Update the status of this contact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant={status === "new" ? "default" : "outline"} onClick={() => handleStatusChange("new")}>
              New
            </Button>
            <Button variant={status === "called" ? "default" : "outline"} onClick={() => handleStatusChange("called")}>
              Called
            </Button>
            <Button
              variant={status === "follow-up" ? "default" : "outline"}
              onClick={() => handleStatusChange("follow-up")}
            >
              Follow-up
            </Button>
            <Button
              variant={status === "not-interested" ? "default" : "outline"}
              onClick={() => handleStatusChange("not-interested")}
            >
              Not Interested
            </Button>
            <Button
              variant={status === "converted" ? "default" : "outline"}
              onClick={() => handleStatusChange("converted")}
            >
              Converted
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call Log Dialog */}
      <CallLogDialog 
        isOpen={isCallLogOpen} 
        onClose={() => setIsCallLogOpen(false)} 
        contactId={contact._id.toString()} 
        contactName={`${contact.firstName} ${contact.lastName}`.trim()}
      />
    </div>
  )
}