"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { Contact } from "@/lib/models";
import type { ObjectId } from "mongodb";

interface EditContactProps {
  contact: Contact;
  id: string;
}

export function EditContact({ contact, id }: EditContactProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    email: contact.email || "",
    phone: contact.phone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update contact.");
      }

      toast({
        title: "Success",
        description: "Contact updated successfully.",
      });
      router.push(`/dashboard/contacts/${id}`);
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unknown error occurred.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="firstName">First Name</label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="lastName">Last Name</label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="phone">Phone</label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit">Update Contact</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push(`/dashboard/contacts/${id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}