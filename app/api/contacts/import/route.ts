import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Use modern route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Verify file is a CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Get file content as text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const csvText = buffer.toString('utf-8');
    
    // Simple manual CSV parsing (no external library)
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) { // Need header + at least one data row
      return NextResponse.json({ error: 'CSV file must contain a header row and at least one data row' }, { status: 400 });
    }
    
    // Extract headers (first line)
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Find column indexes
    const companyNameIndex = headers.findIndex(h => h === 'company_name');
    const companyAddressIndex = headers.findIndex(h => h === 'company_address');
    const companyPhoneIndex = headers.findIndex(h => h === 'company_phone');
    const companyWebsiteIndex = headers.findIndex(h => h === 'company_website');
    
    // Validate required headers
    if (companyNameIndex === -1) {
      return NextResponse.json({ error: 'CSV must contain a "company_name" column' }, { status: 400 });
    }
    
    // Parse data rows
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < headers.length) {
        continue; // Skip invalid rows
      }
      
      const companyName = values[companyNameIndex] || '';
      const companyAddress = companyAddressIndex >= 0 ? values[companyAddressIndex] || '' : '';
      const companyPhone = companyPhoneIndex >= 0 ? values[companyPhoneIndex] || '' : '';
      const companyWebsite = companyWebsiteIndex >= 0 ? values[companyWebsiteIndex] || '' : '';
      
      contacts.push({
        firstName: '', 
        lastName: '',  
        email: '',     
        phone: companyPhone,
        company: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          website: companyWebsite,
        },
        status: 'new',
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Get database connection
    const db = await getDb();
    
    // Insert contacts into database
    if (contacts.length > 0) {
      await db.collection('contacts').insertMany(contacts);
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Imported ${contacts.length} contacts` 
    });
  } catch (error: unknown) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line respecting quotes
function parseCSVLine(line: string): string[] {
  const result = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  result.push(currentValue.trim());
  
  return result;
}