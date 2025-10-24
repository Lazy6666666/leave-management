import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RBACService } from '@/lib/services/rbac-service';
import { calendarEventFormSchema } from '@/lib/validations/calendar-documents-reporting';

// GET /api/calendar/events
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const supabase = createClient();
    const rbac = RBACService.getInstance();
    const permissionMiddleware = await rbac.requirePermission(RBACService.PERMISSIONS.REPORT_READ);
    const guard = await permissionMiddleware(request);
    if (guard) return guard;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const employeeId = searchParams.get('employee_id');
    const eventType = searchParams.get('event_type');

    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        employees!inner(first_name, last_name, email)
      `)
      .order('start_date', { ascending: true });

    // Apply filters
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('end_date', endDate);
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching calendar events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch calendar events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/events
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const supabase = createClient();
    const rbac = RBACService.getInstance();
    const anyMiddleware = await rbac.requireAnyPermission([
      RBACService.PERMISSIONS.LEAVE_REQUEST_CREATE,
      RBACService.PERMISSIONS.DOCUMENT_CREATE,
    ]);
    const guard = await anyMiddleware(request);
    if (guard) return guard;
    const body = await request.json();

    // Validate the request body
    const validatedData = calendarEventFormSchema.parse(body);

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(validatedData)
      .select(`
        *,
        employees!inner(first_name, last_name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/events:', error);
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
- POST: INSERT policy – create own events (employee_id or created_by matches)
*/