import { NextRequest, NextResponse } from 'next/server';
import {
  verifyMetaToken,
  getAdAccountInfo,
  generateTokenReport,
  getAvailableOperations,
} from '@/lib/meta-api/token-verifier';

/**
 * POST /api/meta/verify-token
 * Verifica un token de Meta Marketing API y muestra qué operaciones puede realizar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, apiVersion = 'v21.0' } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken es requerido' },
        { status: 400 }
      );
    }

    // Verificar token
    const tokenInfo = await verifyMetaToken(accessToken, apiVersion);

    if (!tokenInfo.isValid) {
      return NextResponse.json(
        {
          error: 'Token inválido o expirado',
          tokenInfo,
        },
        { status: 401 }
      );
    }

    // Obtener información de ad accounts si hay
    const adAccountsInfo = await Promise.all(
      tokenInfo.adAccounts.slice(0, 5).map((accId) =>
        getAdAccountInfo(accessToken, accId, apiVersion)
      )
    );

    // Obtener operaciones disponibles
    const operations = getAvailableOperations(tokenInfo);

    // Generar reporte
    const report = await generateTokenReport(accessToken, apiVersion);

    return NextResponse.json({
      success: true,
      tokenInfo: {
        ...tokenInfo,
        expiresAt: tokenInfo.expiresAt
          ? new Date(tokenInfo.expiresAt * 1000).toISOString()
          : null,
      },
      adAccountsInfo: adAccountsInfo.filter((acc) => acc !== null),
      operations,
      report,
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      {
        error: 'Error al verificar el token',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meta/verify-token
 * Muestra información sobre cómo usar el endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para verificar tokens de Meta Marketing API',
    usage: {
      method: 'POST',
      endpoint: '/api/meta/verify-token',
      body: {
        accessToken: 'string (requerido) - Tu token de acceso de Meta',
        apiVersion: 'string (opcional) - Versión de la API (default: v21.0)',
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/meta/verify-token \\
  -H "Content-Type: application/json" \\
  -d '{"accessToken": "TU_TOKEN_AQUI"}'`,
      },
    },
    response: {
      success: 'boolean',
      tokenInfo: {
        type: 'user | page | system | app | unknown',
        permissions: 'string[]',
        adAccounts: 'string[]',
        isValid: 'boolean',
        expiresAt: 'string | null',
      },
      adAccountsInfo: 'AdAccountInfo[]',
      operations: 'Operation[]',
      report: 'string (reporte completo en texto)',
    },
  });
}

