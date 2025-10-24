import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/documents/upload
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const documentData = JSON.parse(formData.get('documentData') as string);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${documentData.employee_id}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create document record in database
    const documentRecord = {
      ...documentData,
      file_name: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type,
    };

    const { data, error: dbError } = await supabase
      .from('documents')
      .insert(documentRecord)
      .select(`
        *,
        employees!inner(first_name, last_name, email),
        document_categories!inner(name)
      `)
      .single();

    if (dbError) {
      // If database insert fails, delete the uploaded file
      await supabase.storage.from('documents').remove([filePath]);
      console.error('Error creating document record:', dbError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.documents
- POST: INSERT policy
  • Users can upload documents – uploaded_by or employee_id must match current user
*/