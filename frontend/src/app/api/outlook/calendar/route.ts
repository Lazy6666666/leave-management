import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const MICROSOFT_GRAPH_API_BASE_URL = 'https://graph.microsoft.com/v1.0/me/calendars';

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Retrieve Outlook access token for the user
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('access_token, expires_at')
      .eq('user_id', user.id)
      .eq('integration_type', 'outlook_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('Error fetching Outlook integration:', integrationError?.message);
      return NextResponse.json({ error: 'Outlook integration not found or expired' }, { status: 400 });
    }

    // TODO: Implement token refresh logic if expires_at is in the past

    const outlookAccessToken = integration.access_token;

    // Fetch calendar events from Microsoft Graph API
    const response = await fetch(`${MICROSOFT_GRAPH_API_BASE_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${outlookAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching Outlook calendar events:', errorData);
      throw new Error(`Failed to fetch Outlook calendar events: ${errorData.error?.message || response.statusText}`);
    }

    const events = await response.json();
    return NextResponse.json(events);

  } catch (error) {
    console.error('Outlook calendar API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Outlook calendar events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const eventData = await req.json();

    // Retrieve Outlook access token for the user
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('access_token, expires_at')
      .eq('user_id', user.id)
      .eq('integration_type', 'outlook_calendar')
      .single();

    if (integrationError || !integration) {
      console.error('Error fetching Outlook integration:', integrationError?.message);
      return NextResponse.json({ error: 'Outlook integration not found or expired' }, { status: 400 });
    }

    // TODO: Implement token refresh logic if expires_at is in the past

    const outlookAccessToken = integration.access_token;

    // Create calendar event in Microsoft Graph API
    const response = await fetch(`${MICROSOFT_GRAPH_API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${outlookAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating Outlook calendar event:', errorData);
      throw new Error(`Failed to create Outlook calendar event: ${errorData.error?.message || response.statusText}`);
    }

    const newEvent = await response.json();
    return NextResponse.json(newEvent, { status: 201 });

  } catch (error) {
    console.error('Outlook calendar API error:', error);
    return NextResponse.json({ error: 'Failed to create Outlook calendar event' }, { status: 500 });
  }
}