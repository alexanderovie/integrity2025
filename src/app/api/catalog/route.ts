import { NextResponse } from 'next/server';
import { getCatalogReadModel } from '@/lib/services/catalog-read-model';

export async function GET() {
  try {
    const catalog = await getCatalogReadModel();
    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Error interno al cargar catálogo' },
      { status: 500 }
    );
  }
}
