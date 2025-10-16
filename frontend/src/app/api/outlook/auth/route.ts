import { NextRequest, NextResponse } from 'next/server';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

import { cookies } from 'next/headers';



const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;

const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;

const OUTLOOK_REDIRECT_URI = process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI;



const AUTHORIZATION_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';

const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';



export async function GET(req: NextRequest) {

  const supabase = createRouteHandlerClient({ cookies });

  const { searchParams } = new URL(req.url);

  const code = searchParams.get('code');

  const state = searchParams.get('state'); // For CSRF protection



  // Handle OAuth callback

  if (code) {

    try {

      const tokenParams = new URLSearchParams({

        client_id: OUTLOOK_CLIENT_ID!,

        scope: 'openid profile email offline_access calendars.readwrite',

        code: code,

        redirect_uri: OUTLOOK_REDIRECT_URI!,

        grant_type: 'authorization_code',

        client_secret: OUTLOOK_CLIENT_SECRET!,

      });



      const tokenResponse = await fetch(TOKEN_URL, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/x-www-form-urlencoded',

        },

        body: tokenParams.toString(),

      });



      if (!tokenResponse.ok) {

        const errorData = await tokenResponse.json();

        throw new Error(`Failed to get tokens: ${errorData.error_description || tokenResponse.statusText}`);

      }



      const tokens = await tokenResponse.json();



      // Store tokens securely in Supabase for the current user

      const { data: { user } } = await supabase.auth.getUser();



      if (user) {

        const { error } = await supabase

          .from('user_integrations') // Assuming a table to store user-specific integration tokens

          .upsert(

            {

              user_id: user.id,

              integration_type: 'outlook_calendar',

              access_token: tokens.access_token,

              refresh_token: tokens.refresh_token,

              expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),

              // Store any other relevant token data

            },

            { onConflict: 'user_id,integration_type' }

          );



        if (error) {

          console.error('Error storing Outlook tokens:', error);

          return NextResponse.redirect(new URL('/dashboard/settings?error=outlook_integration_failed', req.url));

        }



        return NextResponse.redirect(new URL('/dashboard/settings?success=outlook_integrated', req.url));

      } else {

        return NextResponse.redirect(new URL('/auth/login?error=unauthenticated', req.url));
      }

    } catch (error) {

      console.error('Outlook OAuth callback error:', error);

      return NextResponse.redirect(new URL('/dashboard/settings?error=outlook_integration_failed', req.url));

    }

  } else {

    // Initiate OAuth flow

    const authParams = new URLSearchParams({

      client_id: OUTLOOK_CLIENT_ID!,

      response_type: 'code',

      redirect_uri: OUTLOOK_REDIRECT_URI!,

      response_mode: 'query',

      scope: 'openid profile email offline_access calendars.readwrite',

      state: 'random_state_string', // TODO: Generate and verify state for CSRF protection

    });

    return NextResponse.redirect(`${AUTHORIZATION_URL}?${authParams.toString()}`);

  }

}