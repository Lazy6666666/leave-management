import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/documents/categories
export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching document categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/documents/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.document_categories
- GET: SELECT policy – All authenticated users can view active document categories
*/