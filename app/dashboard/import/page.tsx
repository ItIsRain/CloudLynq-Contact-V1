import { ImportForm } from "@/components/import-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserFromToken } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ImportPage() {
  const user = await getUserFromToken()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Contacts</h1>
        <p className="text-muted-foreground">Upload a CSV file to import contacts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>Upload a CSV file with contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <ImportForm userId={user.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
          <CardDescription>Your CSV file should have the following columns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4 overflow-auto">
              <p className="font-mono text-sm">company_name,company_address,company_phone,company_website</p>
              <p className="font-mono text-sm">Acme Inc,123 Main St City State,555-123-4567,https://example.com</p>
              <p className="font-mono text-sm">XYZ Corporation,456 Business Ave City State,555-987-6543,https://xyz.com</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Required CSV Columns:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>company_name</strong>: The name of the company</li>
                <li><strong>company_address</strong>: The full address of the company</li>
                <li><strong>company_phone</strong>: The company's phone number</li>
                <li><strong>company_website</strong>: The company's website URL</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="font-semibold text-amber-800 mb-2">Note:</h3>
              <p className="text-amber-800">
                The system will automatically create contact records with the company information.
                You can update individual contact details (like first name, last name, email) later.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Sample Data:</h3>
              <p className="text-blue-800">
                Your uploaded CSV file appears to contain company information for businesses in the UAE.
                Each row will be imported as a separate contact with the company information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}