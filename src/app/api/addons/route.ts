import { NextRequest, NextResponse } from 'next/server';
import { getServiceAddons } from '@/lib/services/addons';

export async function GET(request: NextRequest) {
  try {
    const serviceSlug = request.nextUrl.searchParams.get('service')?.toLowerCase().trim() || null;
    const extras = await getServiceAddons(serviceSlug);

    return NextResponse.json(extras);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json(
      { error: 'Error interno al cargar extras' },
      { status: 500 }
    );
  }
}
