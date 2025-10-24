'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn, formatFileSize } from '@/lib/utils';
import type { DocumentCategory, DocumentUploadFormData } from '@/types/calendar-documents-reporting';

interface DocumentUploadProps {
  categories: DocumentCategory[];
  onUploadSuccess: () => void;
  onCancel: () => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DocumentUpload({ 
  categories,
  onUploadSuccess, 
  onCancel, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']
}: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState<Partial<DocumentUploadFormData>>({
    title: '',
    description: '',
    category_id: '',
    expires_at: '',
    is_private: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading',
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize,
    accept: allowedFileTypes.reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
  });

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Update progress
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 25 } : f)
      );

      // Upload to Supabase Storage
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await response.json();

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
      );

      // Upload file to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 75 } : f)
      );

      // Create document record
      const documentResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
        }),
      });

      if (!documentResponse.ok) {
        throw new Error('Failed to create document record');
      }

      const { data: document } = await documentResponse.json();

      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f)
      );

      return document.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f)
      );
      throw error;
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    if (!formData.title || !formData.category_id) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const fileInfo of uploadedFiles) {
        if (fileInfo.status === 'error') continue;
        
        // Get the actual file from the dropzone
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput?.files) {
          const file = Array.from(fileInput.files).find(f => f.name === fileInfo.name);
          if (file) {
            await uploadFile(file, fileInfo.id);
          }
        }
      }

      onUploadSuccess();
    } catch (error) {
      console.error('Error during upload process:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Drag and drop files or click to select files to upload
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Information Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter document description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expires_at || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={formData.is_private || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
              />
              <Label htmlFor="private">Private Document</Label>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-input'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum file size: {formatFileSize(maxFileSize)}
                <br />
                Supported formats: {allowedFileTypes.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected Files:</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div className="w-32">
                      <Progress value={file.progress} className="h-2" />
                    </div>
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || uploadedFiles.length === 0}>
            {isUploading ? 'Uploading...' : 'Upload Documents'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}