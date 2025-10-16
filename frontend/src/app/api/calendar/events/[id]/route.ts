import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calendarEventUpdateSchema } from '@/lib/validations/calendar-documents-reporting';

// GET /api/calendar/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('calendar_events')
      .select(`
        *,
        employees!inner(first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar event' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/events/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = calendarEventUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('calendar_events')
      .update(validatedData)
      .eq('id', id)
      .select(`
        *,
        employees!inner(first_name, last_name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to update calendar event' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/calendar/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to delete calendar event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
/*
RLS Reference (see docs/backend-functions-and-policies.md)
Table: public.calendar_events
- GET: SELECT policy – view own events or as manager/admin/hr
- PUT: UPDATE policy – update own events (employee_id or created_by matches)
- DELETE: DELETE policy – delete own events (employee_id or created_by matches)
*/