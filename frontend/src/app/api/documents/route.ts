import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { documentUploadFormSchema } from '@/lib/validations/calendar-documents-reporting';

// GET /api/documents
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const employeeId = searchParams.get('employee_id');
    const search = searchParams.get('search');
    const isConfidential = searchParams.get('is_confidential');

    let query = supabase
      .from('documents')
      .select(`
        *,
        employees!inner(first_name, last_name, email),
        document_categories!inner(name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }
    if (isConfidential !== null) {
      query = query.eq('is_confidential', isConfidential === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/documents
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Validate the request body
    const validatedData = documentUploadFormSchema.parse(body);

    const { data, error } = await supabase
      .from('documents')
      .insert(validatedData)
      .select(`
        *,
        employees!inner(first_name, last_name, email),
        document_categories!inner(name)
      `)
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
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
- POST: INSERT policy
  • Users can upload documents – uploaded_by or employee_id must match current user

Also related tables/policies may be involved via joins:
  • document_shares (view shares)
  • document_categories (category filtering)
*/