import type { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface CallLog {
  _id?: ObjectId;
  contactId: string;
  userId: string;
  timestamp: Date;
  duration?: number;
  notes?: string;
  status: 'completed' | 'missed' | 'scheduled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: {
    name: string
    address: string
    phone: string
    website: string
  }
  status: "new" | "called" | "follow-up" | "not-interested" | "converted"
  notes: Note[]
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  _id: ObjectId
  content: string
  createdAt: Date
  createdBy: {
    id: string
    name: string
  }
}

