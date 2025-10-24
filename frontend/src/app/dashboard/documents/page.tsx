'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, Shield, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DocumentWithRelations, DocumentCategory } from '@/types/calendar-documents-reporting';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const { data } = await response.json();
      return data as DocumentWithRelations[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      const response = await fetch('/api/documents/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const { data } = await response.json();
      return data as DocumentCategory[];
    },
  });

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    refetchDocuments();
    toast.success('Upload successful', {
      description: 'Your document has been uploaded successfully.',
    });
  };

  const handleDocumentDeleted = () => {
    refetchDocuments();
  };

  const getFilteredDocuments = (filter: string) => {
    switch (filter) {
      case 'my-documents':
        return documents.filter(doc => doc.employee_id === 'current-user-id'); // Replace with actual user ID
      case 'shared':
        return documents.filter(doc => (doc.shares ?? []).some(s => s.is_active));
      case 'confidential':
        return documents.filter(doc => doc.is_private);
      default:
        return documents;
    }
  };

  const stats = {
    total: documents.length,
    myDocuments: documents.filter(doc => doc.employee_id === 'current-user-id').length,
    shared: documents.filter(doc => (doc.shares ?? []).some(s => s.is_active)).length,
    confidential: documents.filter(doc => doc.is_private).length,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-600">Upload, organize, and share documents securely</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Documents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shared}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidential</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confidential}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {showUploadForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a new document to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                categories={categories}
                onUploadSuccess={handleUploadSuccess}
                onCancel={() => setShowUploadForm(false)}
              />
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="my-documents">My Documents</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="confidential">Confidential</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowUploadForm(!showUploadForm)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <TabsContent value="all" className="space-y-4">
            <DocumentList
              documents={getFilteredDocuments('all')}
              categories={categories}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>

          <TabsContent value="my-documents" className="space-y-4">
            <DocumentList
              documents={getFilteredDocuments('my-documents')}
              categories={categories}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            <DocumentList
              documents={getFilteredDocuments('shared')}
              categories={categories}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>

          <TabsContent value="confidential" className="space-y-4">
            <DocumentList
              documents={getFilteredDocuments('confidential')}
              categories={categories}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}