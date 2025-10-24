import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/leave-types
export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: leaveTypes, error } = await supabase
      .from('leave_types')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching leave types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leave types' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: leaveTypes });
  } catch (error) {
    console.error('Error in GET /api/leave-types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}