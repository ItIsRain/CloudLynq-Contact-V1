"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Edit, MoreHorizontal, Phone, Search, Trash } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { Contact } from "@/lib/models"

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof Contact>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  const filteredAndSortedContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        const matchesSearch = (
          contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        const matchesStatus = statusFilter === "all" || contact.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortField === "createdAt") {
          return sortDirection === "asc" 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        
        const aValue = a[sortField]?.toString().toLowerCase() || ""
        const bValue = b[sortField]?.toString().toLowerCase() || ""
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      })
  }, [contacts, searchQuery, statusFilter, sortField, sortDirection])

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredAndSortedContacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(filteredAndSortedContacts.map(c => c._id)))
    }
  }

  const handleSelectContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete contact')
      }

      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact. Please try again.",
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      const response = await fetch('/api/contacts/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: Array.from(selectedContacts),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete contacts')
      }

      const data = await response.json()
      
      toast({
        title: "Contacts deleted",
        description: `Successfully deleted ${data.deletedCount} contacts.`,
      })
      
      setSelectedContacts(new Set())
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contacts. Please try again.",
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

  const handleSort = (field: keyof Contact) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="called">Called</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="not-interested">Not Interested</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedContacts.size > 0 && (
          <Button
            variant="destructive"
            onClick={() => setBulkDeleteDialogOpen(true)}
            className="whitespace-nowrap"
          >
            Delete Selected ({selectedContacts.size})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedContacts.size === filteredAndSortedContacts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("firstName")}
              >
                Name {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("company")}
              >
                Company {sortField === "company" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Added {sortField === "createdAt" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedContacts.length > 0 ? (
              filteredAndSortedContacts.map((contact) => (
                <TableRow key={contact._id.toString()} className="group hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.has(contact._id)}
                      onCheckedChange={() => handleSelectContact(contact._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contact.company.name}</div>
                      {contact.company.phone && (
                        <div className="text-sm text-muted-foreground">{contact.company.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contact.status)}</TableCell>
                  <TableCell>{formatDate(new Date(contact.createdAt))}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contacts/${contact._id}`} className="cursor-pointer">
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contacts/${contact._id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Phone className="mr-2 h-4 w-4" />
                          Mark as called
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => {
                            setContactToDelete(contact._id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (contactToDelete) {
                  handleDeleteContact(contactToDelete)
                }
                setDeleteDialogOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedContacts.size} contacts and all their associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                handleBulkDelete()
                setBulkDeleteDialogOpen(false)
              }}
            >
              Delete {selectedContacts.size} Contacts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

