import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { documentUpdateSchema } from '@/lib/validations/calendar-documents-reporting';

// GET /api/documents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        employees!inner(first_name, last_name, email),
        document_categories!inner(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = documentUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('documents')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        employees!inner(first_name, last_name, email),
        document_categories!inner(name)
      `)
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // First, get the document to delete the file from storage
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (document?.file_path) {
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.documents
- GET: SELECT policies
  • Users can view own uploaded documents
  • Users can view shared documents
  • Managers and HR can view team documents
- PUT: UPDATE policy
  • Users can update own documents – uploaded_by or employee_id must match current user
- DELETE: DELETE policy
  • Users can delete own documents – uploaded_by or employee_id must match current user

Related tables/policies:
  • document_shares (for shared access)
  • document_audit_logs (view audit trails)
*/