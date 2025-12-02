import { NextRequest, NextResponse } from 'next/server';
import {
  sendMetaEvent,
  MetaPixelEvent,
  transformUserDataToMetaFormat,
  type MetaCustomData,
  type MetaUserDataInput,
} from '@/lib/meta/pixel';
import { metaPixelSchema, validatePayloadSize } from '@/lib/validations/schemas';
import { createErrorResponse, formatValidationError } from '@/lib/utils/errors';

/**
 * POST /api/meta/pixel
 * Server-side endpoint for sending events to Meta Conversions API
 *
 * This is the standard way to send events from your server
 * to avoid ad blockers and ensure reliable tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Validar tamaño del payload
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText)) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Parsear JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Validar con Zod
    const validationResult = metaPixelSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: formatValidationError(validationResult.error),
        },
        { status: 400 }
      );
    }

    const {
      event_name,
      user_data,
      custom_data,
      event_id,
      event_source_url,
      test_mode,
    } = validationResult.data;

    // Extract server-side data from request
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Transform user data: handles hashing and validation
    // This function is type-safe and scalable
    const metaUserData = await transformUserDataToMetaFormat(
      user_data as MetaUserDataInput | undefined,
      {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      }
    );

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
    const errorResponse = createErrorResponse(error, 500);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
