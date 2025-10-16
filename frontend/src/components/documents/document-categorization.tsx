'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DocumentExportDialog } from '@/components/documents/document-export-dialog';
import { Search, Filter, Tag, Calendar, FileText, Download, Eye, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description: string;
  file_path: string;
  category_id: string;
  category_name: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  tags: string[];
  expiry_date: string | null;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface DocumentSearchFilters {
  query: string;
  categoryId: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  status: 'active' | 'expired' | 'all';
}

export function DocumentCategorization() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentSearchFilters>({
    query: '',
    categoryId: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [sortBy, setSortBy] = useState<'created_at' | 'title' | 'category' | 'expiry_date'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { toast } = useToast();

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [filters, pagination.page, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/document-categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data || []);
      } else {
        toast.error('Failed to fetch document categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch document categories');
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(filters.query && { query: filters.query }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });

      const response = await fetch(`/api/documents/search?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setDocuments(data.data || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1
        });
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = <K extends keyof DocumentSearchFilters>(
    key: K,
    value: DocumentSearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/view`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      } else {
        toast.error('Failed to view document');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.title;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Document downloaded successfully');
      } else {
        toast.error('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Document deleted successfully');
        fetchDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || 'bg-gray-500';
  };

  const isDocumentExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Search & Categorization</CardTitle>
          <CardDescription>
            Search, filter, and manage documents with advanced categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value: string) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value: 'active' | 'expired' | 'all') => handleFilterChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All documents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All documents</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'created_at' | 'title' | 'category' | 'expiry_date')}
              >
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="expiry_date">Expiry Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Found {pagination.total} documents
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDocuments}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <DocumentExportDialog
                filters={{
                  category: filters.categoryId || undefined,
                  dateFrom: filters.dateFrom || undefined,
                  dateTo: filters.dateTo || undefined,
                  status: filters.status,
                }}
              />
            </div>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="text-center py-8">
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map(document => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{document.title}</h3>
                          <Badge 
                            className={getCategoryColor(document.category_name)}
                          >
                            {document.category_name}
                          </Badge>
                          {isDocumentExpiringSoon(document.expiry_date) && (
                            <Badge variant="destructive" className="animate-pulse">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        
                        {document.description && (
                          <p className="text-gray-600 mb-2">{document.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {document.employee_name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(document.created_at), 'MMM dd, yyyy')}
                          </span>
                          {document.expiry_date && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Expires: {format(new Date(document.expiry_date), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                        
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mb-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {document.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}