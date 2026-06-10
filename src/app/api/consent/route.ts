import { NextRequest, NextResponse } from 'next/server';

const CONSENT_COOKIE = 'ics_consent_marketing';
const MAX_AGE = 60 * 60 * 24 * 180;

export async function GET(request: NextRequest) {
  const marketing = request.cookies.get(CONSENT_COOKIE)?.value === '1' ? '1' : '0';
  const consent = { marketing };
  return NextResponse.json(consent);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const marketing = body.marketing === '1' ? '1' : '0';

    const response = NextResponse.json({ success: true, marketing });

    response.cookies.set(CONSENT_COOKIE, marketing, {
      maxAge: MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
