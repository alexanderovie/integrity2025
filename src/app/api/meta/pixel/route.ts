import { NextRequest, NextResponse } from 'next/server';
import {
  sendMetaEvent,
  MetaPixelEvent,
  hashUserData,
  type MetaUserData,
  type MetaCustomData,
} from '@/lib/meta/pixel';

/**
 * POST /api/meta/pixel
 * Server-side endpoint for sending events to Meta Conversions API
 *
 * This is the standard way to send events from your server
 * to avoid ad blockers and ensure reliable tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name,
      user_data,
      custom_data,
      event_id,
      event_source_url,
      test_mode,
    } = body;

    // Validate required fields
    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent from request
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Prepare user data - handle PII hashing
    const metaUserData: MetaUserData = {
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    // Hash PII if provided and add to metaUserData
    if (user_data) {
      if (user_data.email && typeof user_data.email === 'string') {
        metaUserData.em = await hashUserData(user_data.email);
      }
      if (user_data.phone && typeof user_data.phone === 'string') {
        metaUserData.ph = await hashUserData(user_data.phone);
      }
      if (user_data.first_name && typeof user_data.first_name === 'string') {
        metaUserData.fn = await hashUserData(user_data.first_name);
      }
      if (user_data.last_name && typeof user_data.last_name === 'string') {
        metaUserData.ln = await hashUserData(user_data.last_name);
      }
      // Copy other valid MetaUserData fields
      if (user_data.external_id) metaUserData.external_id = user_data.external_id;
      if (user_data.fbp) metaUserData.fbp = user_data.fbp;
      if (user_data.fbc) metaUserData.fbc = user_data.fbc;
    }

    // Send event to Meta
    const result = await sendMetaEvent(
      event_name as MetaPixelEvent | string,
      metaUserData,
      custom_data as MetaCustomData | undefined,
      {
        eventId: event_id,
        eventSourceUrl: event_source_url || request.headers.get('referer') || undefined,
        testMode: test_mode,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, fbtrace_id: result.fbtrace_id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fbtrace_id: result.fbtrace_id,
    });
  } catch (error) {
    console.error('Meta Pixel API route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
