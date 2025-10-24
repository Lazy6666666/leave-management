import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/departments
export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: departments });
  } catch (error) {
    console.error('Error in GET /api/departments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}