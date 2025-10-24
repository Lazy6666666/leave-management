'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Eye, Trash2, Share2, Calendar, User, Folder, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Document, DocumentCategory, DocumentWithRelations } from '@/types/calendar-documents-reporting';
import { formatFileSize } from '@/lib/utils';

interface DocumentListProps {
  documents: DocumentWithRelations[];
  categories: DocumentCategory[];
  isLoading?: boolean;
  onDocumentDeleted?: () => void;
  onDownload?: (document: DocumentWithRelations) => void;
  onShare?: (document: DocumentWithRelations) => void;
}

export function DocumentList({ 
  documents, 
  categories,
  isLoading = false, 
  onDocumentDeleted, 
  onDownload, 
  onShare 
}: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithRelations | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesCategory = categoryFilter === 'all' || doc.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  const getStatusBadge = (doc: DocumentWithRelations) => {
    const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();
    
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (doc.is_private) {
      return <Badge variant="secondary">Confidential</Badge>;
    }
    
    return <Badge variant="outline">Active</Badge>;
  };

  const handleDelete = (document: DocumentWithRelations) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Loading documents...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage and access your documents
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-2xl">
                          {getFileIcon(document.file_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{document.title}</h3>
                            {getStatusBadge(document)}
                          </div>
                          {document.description && (
                            <p className="text-gray-600 text-sm mb-2">{document.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Folder className="w-4 h-4" />
                              <span>{getCategoryName(document.category_id)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{document.employee?.first_name} {document.employee?.last_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(document.uploaded_at), 'MMM dd, yyyy')}</span>
                            </div>
                            <span>{formatFileSize(document.file_size)}</span>
                          </div>
                          {(document as any).tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(document as any).tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload?.(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShare?.(document)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(document)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete \"{selectedDocument?.title}\"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (!selectedDocument) return;
                try {
                  await fetch(`/api/documents/${selectedDocument.id}`, { method: 'DELETE' });
                } catch (_) {
                  // ignore
                }
                setDeleteDialogOpen(false);
                setSelectedDocument(null);
                onDocumentDeleted?.();
              }} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}