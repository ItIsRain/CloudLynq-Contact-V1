'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImportFormProps {
  userId: string;
}

export function ImportForm({ userId }: ImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file to upload');
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      setError('File must be a CSV');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to import contacts');
      }
      
      setSuccess(data.message || 'Contacts imported successfully');
      setFile(null);
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Refresh the contacts list after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while importing contacts');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="cursor-pointer"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Select a CSV file with the format shown below
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" disabled={!file || isUploading}>
        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isUploading ? 'Importing...' : 'Import Contacts'}
      </Button>
    </form>
  );
}