// components/call-history.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { Phone, PhoneOff, PhoneOutgoing } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CallHistoryProps {
  callHistory: Array<{
    _id: string;
    contactId: string;
    userId: string;
    timestamp: Date;
    duration?: number;
    notes?: string;
    status: 'completed' | 'missed' | 'scheduled';
  }>;
  userMap: Record<string, string>;
}

export function CallHistory({ callHistory, userMap }: CallHistoryProps) {
  if (!callHistory || callHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Recent calls with this contact</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No call history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call History</CardTitle>
        <CardDescription>Recent calls with this contact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {callHistory.map((call) => (
            <div key={call._id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
              <div className={`mr-4 mt-1 rounded-full p-2 ${getStatusColor(call.status)}`}>
                {call.status === 'completed' && <PhoneOutgoing className="h-4 w-4 text-white" />}
                {call.status === 'missed' && <PhoneOff className="h-4 w-4 text-white" />}
                {call.status === 'scheduled' && <Phone className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{userMap[call.userId] || 'Unknown user'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(call.timestamp)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {call.status.charAt(0).toUpperCase() + call.status.slice(1)} call
                  {call.duration ? ` (${formatDuration(call.duration)})` : ''}
                </p>
                {call.notes && <p className="mt-1 text-sm">{call.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'missed':
      return 'bg-red-500';
    case 'scheduled':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

function formatTimeAgo(date: Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}