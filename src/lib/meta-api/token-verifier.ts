/**
 * Meta Marketing API Token Verifier
 * Verifica el tipo de token y sus permisos disponibles
 */

interface TokenInfo {
  type: 'user' | 'page' | 'system' | 'app' | 'unknown';
  permissions: string[];
  adAccounts: string[];
  isValid: boolean;
  expiresAt?: number;
  scopes: string[];
}

interface AdAccountInfo {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: string;
  spend_cap?: number;
}

/**
 * Verifica el tipo y permisos de un token de Meta
 */
export async function verifyMetaToken(
  accessToken: string,
  apiVersion: string = 'v21.0'
): Promise<TokenInfo> {
  const baseUrl = `https://graph.facebook.com/${apiVersion}`;

  try {
    // 1. Verificar token básico
    const meResponse = await fetch(
      `${baseUrl}/me?access_token=${accessToken}`
    );
    
    if (!meResponse.ok) {
      throw new Error('Token inválido o expirado');
    }

    const meData = await meResponse.json();
    const userId = meData.id;

    // 2. Obtener permisos del token
    const permissionsResponse = await fetch(
      `${baseUrl}/me/permissions?access_token=${accessToken}`
    );
    const permissionsData = await permissionsResponse.json();
    const permissions = permissionsData.data
      .filter((p: { status: string }) => p.status === 'granted')
      .map((p: { permission: string }) => p.permission);

    // 3. Intentar obtener ad accounts para determinar tipo de token
    let adAccounts: string[] = [];
    let tokenType: TokenInfo['type'] = 'unknown';

    try {
      const adAccountsResponse = await fetch(
        `${baseUrl}/me/adaccounts?access_token=${accessToken}&fields=id,name,account_status`
      );
      
      if (adAccountsResponse.ok) {
        const adAccountsData = await adAccountsResponse.json();
        adAccounts = adAccountsData.data?.map((acc: { id: string }) => acc.id) || [];
        
        // Si tiene ad accounts, probablemente es user token con ads_management
        if (adAccounts.length > 0) {
          tokenType = permissions.includes('ads_management') ? 'user' : 'page';
        }
      }
    } catch (e) {
      // No tiene acceso a ad accounts
    }

    // 4. Verificar si es system user token
    if (permissions.includes('ads_management') && !adAccounts.length) {
      // Intentar verificar business manager
      try {
        const businessResponse = await fetch(
          `${baseUrl}/me/businesses?access_token=${accessToken}`
        );
        if (businessResponse.ok) {
          tokenType = 'system';
        }
      } catch (e) {
        // No es system user
      }
    }

    // 5. Obtener información de expiración si está disponible
    const debugResponse = await fetch(
      `${baseUrl}/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    let expiresAt: number | undefined;
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      expiresAt = debugData.data?.expires_at;
    }

    return {
      type: tokenType,
      permissions,
      adAccounts,
      isValid: true,
      expiresAt,
      scopes: permissions,
    };
  } catch (error) {
    return {
      type: 'unknown',
      permissions: [],
      adAccounts: [],
      isValid: false,
      scopes: [],
    };
  }
}

/**
 * Obtiene información detallada de una cuenta de anuncios
 */
export async function getAdAccountInfo(
  accessToken: string,
  adAccountId: string,
  apiVersion: string = 'v21.0'
): Promise<AdAccountInfo | null> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${adAccountId}?` +
      `fields=id,name,currency,timezone_name,account_status,spend_cap&` +
      `access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('No se pudo obtener información de la cuenta');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name || 'Sin nombre',
      currency: data.currency || 'USD',
      timezone: data.timezone_name || 'UTC',
      status: data.account_status || 'unknown',
      spend_cap: data.spend_cap,
    };
  } catch (error) {
    console.error('Error obteniendo info de ad account:', error);
    return null;
  }
}

/**
 * Lista todas las operaciones disponibles según los permisos del token
 */
export function getAvailableOperations(tokenInfo: TokenInfo): {
  category: string;
  operations: string[];
}[] {
  const operations: { category: string; operations: string[] }[] = [];

  // Operaciones básicas siempre disponibles
  operations.push({
    category: 'Información Básica',
    operations: [
      'Ver perfil de usuario',
      'Ver permisos del token',
      'Verificar validez del token',
    ],
  });

  // Operaciones de Ad Accounts
  if (tokenInfo.permissions.includes('ads_read') || tokenInfo.permissions.includes('ads_management')) {
    operations.push({
      category: 'Gestión de Anuncios (Ads Management)',
      operations: [
        'Listar cuentas de anuncios',
        'Ver información de campañas',
        'Ver información de ad sets',
        'Ver información de ads',
        'Ver insights y métricas',
        'Ver creativos de anuncios',
      ],
    });
  }

  if (tokenInfo.permissions.includes('ads_management')) {
    operations.push({
      category: 'Creación y Modificación (Requiere ads_management)',
      operations: [
        'Crear campañas',
        'Modificar campañas',
        'Pausar/activar campañas',
        'Crear ad sets',
        'Modificar ad sets',
        'Crear anuncios',
        'Modificar anuncios',
        'Eliminar campañas/ads',
        'Modificar presupuestos',
        'Modificar targeting',
      ],
    });
  }

  // Operaciones de Audiencias
  if (tokenInfo.permissions.includes('ads_read')) {
    operations.push({
      category: 'Audiencias (Custom Audiences)',
      operations: [
        'Listar custom audiences',
        'Ver información de audiences',
        'Ver lookalike audiences',
      ],
    });
  }

  if (tokenInfo.permissions.includes('ads_management')) {
    operations.push({
      category: 'Gestión de Audiencias (Requiere ads_management)',
      operations: [
        'Crear custom audiences',
        'Agregar usuarios a audiences',
        'Eliminar audiences',
        'Crear lookalike audiences',
      ],
    });
  }

  // Operaciones de Insights
  if (tokenInfo.permissions.includes('ads_read')) {
    operations.push({
      category: 'Insights y Reportes',
      operations: [
        'Obtener insights de campañas',
        'Obtener insights de ad sets',
        'Obtener insights de ads',
        'Obtener insights de ad accounts',
        'Generar reportes asíncronos',
        'Ver métricas de rendimiento',
      ],
    });
  }

  // Operaciones de Pages
  if (tokenInfo.permissions.includes('pages_read_engagement') || tokenInfo.permissions.includes('pages_manage_ads')) {
    operations.push({
      category: 'Páginas de Facebook',
      operations: [
        'Ver información de páginas',
        'Ver posts de páginas',
        'Ver insights de páginas',
      ],
    });
  }

  if (tokenInfo.permissions.includes('pages_manage_ads')) {
    operations.push({
      category: 'Gestión de Páginas (Requiere pages_manage_ads)',
      operations: [
        'Crear anuncios desde páginas',
        'Gestionar anuncios de páginas',
      ],
    });
  }

  // Operaciones de Leads
  if (tokenInfo.permissions.includes('leads_retrieval')) {
    operations.push({
      category: 'Lead Ads (Requiere leads_retrieval + App Review)',
      operations: [
        'Obtener leads de Lead Ads',
        'Ver información de leads',
        'Descargar datos de leads',
      ],
    });
  }

  // Operaciones de Business Manager
  if (tokenInfo.type === 'system') {
    operations.push({
      category: 'Business Manager (System User Token)',
      operations: [
        'Gestionar múltiples ad accounts',
        'Gestionar assets del business',
        'Operaciones a escala empresarial',
        'Rotación de tokens',
      ],
    });
  }

  return operations;
}

/**
 * Genera un reporte completo del token
 */
export async function generateTokenReport(
  accessToken: string,
  apiVersion: string = 'v21.0'
): Promise<string> {
  const tokenInfo = await verifyMetaToken(accessToken, apiVersion);
  const operations = getAvailableOperations(tokenInfo);

  let report = '📊 REPORTE DE TOKEN META MARKETING API\n';
  report += '='.repeat(50) + '\n\n';

  report += `✅ Estado: ${tokenInfo.isValid ? 'VÁLIDO' : 'INVÁLIDO'}\n`;
  report += `🔑 Tipo: ${tokenInfo.type.toUpperCase()}\n`;
  report += `📋 Permisos: ${tokenInfo.permissions.length}\n\n`;

  report += '📝 PERMISOS GRANTED:\n';
  tokenInfo.permissions.forEach((perm) => {
    report += `  ✓ ${perm}\n`;
  });

  report += `\n💼 AD ACCOUNTS ACCESIBLES: ${tokenInfo.adAccounts.length}\n`;
  if (tokenInfo.adAccounts.length > 0) {
    tokenInfo.adAccounts.forEach((acc) => {
      report += `  • ${acc}\n`;
    });
  }

  if (tokenInfo.expiresAt) {
    const expiryDate = new Date(tokenInfo.expiresAt * 1000);
    report += `\n⏰ Expira: ${expiryDate.toLocaleString()}\n`;
  }

  report += '\n\n🎯 OPERACIONES DISPONIBLES:\n';
  report += '='.repeat(50) + '\n';
  operations.forEach((category) => {
    report += `\n📂 ${category.category}:\n`;
    category.operations.forEach((op) => {
      report += `  • ${op}\n`;
    });
  });

  report += '\n\n⚠️  RECOMENDACIONES:\n';
  report += '='.repeat(50) + '\n';

  if (tokenInfo.type === 'user' && tokenInfo.permissions.includes('ads_management')) {
    report += '⚠️  Usas un User Token para automatización. Considera usar System User Token.\n';
  }

  if (!tokenInfo.permissions.includes('ads_management') && tokenInfo.permissions.includes('ads_read')) {
    report += 'ℹ️  Solo tienes permisos de lectura. Para crear/modificar necesitas ads_management.\n';
  }

  if (tokenInfo.adAccounts.length === 0 && tokenInfo.permissions.includes('ads_management')) {
    report += '⚠️  No tienes acceso a ad accounts. Verifica permisos en Business Manager.\n';
  }

  if (tokenInfo.expiresAt) {
    const daysUntilExpiry = Math.floor(
      (tokenInfo.expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 30) {
      report += `⚠️  El token expira en ${daysUntilExpiry} días. Considera renovarlo.\n`;
    }
  }

  return report;
}

