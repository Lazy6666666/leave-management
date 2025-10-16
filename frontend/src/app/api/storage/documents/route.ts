import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Create storage bucket for documents
export async function POST() {
  try {
    const supabase = createClient();
    
    // Create the documents bucket with proper configuration
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: true, // Documents can be accessed via public URLs
      fileSizeLimit: 50 * 1024 * 1024, // 50MB limit per file
      allowedMimeTypes: [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        
        // Other common types
        'application/zip',
        'application/x-zip-compressed',
      ],
    });

    if (error) {
      console.error('Error creating storage bucket:', error);
      return NextResponse.json(
        { error: 'Failed to create storage bucket' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Documents storage bucket created successfully',
      bucket: data 
    });
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get storage configuration
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage.getBucket('documents');

    if (error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Documents bucket not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error getting storage configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}