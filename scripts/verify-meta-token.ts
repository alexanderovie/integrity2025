#!/usr/bin/env tsx
/**
 * Script CLI para verificar tokens de Meta Marketing API
 * 
 * Uso:
 *   pnpm tsx scripts/verify-meta-token.ts <TU_TOKEN>
 *   o
 *   META_TOKEN=tu_token pnpm tsx scripts/verify-meta-token.ts
 */

import {
  verifyMetaToken,
  getAdAccountInfo,
  generateTokenReport,
  getAvailableOperations,
} from '../src/lib/meta-api/token-verifier';

async function main() {
  const token = process.argv[2] || process.env.META_TOKEN;

  if (!token) {
    console.error('❌ Error: Token requerido');
    console.log('\nUso:');
    console.log('  pnpm tsx scripts/verify-meta-token.ts <TU_TOKEN>');
    console.log('  o');
    console.log('  META_TOKEN=tu_token pnpm tsx scripts/verify-meta-token.ts');
    process.exit(1);
  }

  console.log('🔍 Verificando token de Meta Marketing API...\n');

  try {
    // Verificar token
    const tokenInfo = await verifyMetaToken(token);

    if (!tokenInfo.isValid) {
      console.error('❌ Token inválido o expirado');
      process.exit(1);
    }

    // Generar reporte
    const report = await generateTokenReport(token);
    console.log(report);

    // Obtener info detallada de ad accounts
    if (tokenInfo.adAccounts.length > 0) {
      console.log('\n\n💼 INFORMACIÓN DETALLADA DE AD ACCOUNTS:');
      console.log('='.repeat(50));

      for (const accId of tokenInfo.adAccounts.slice(0, 5)) {
        const accInfo = await getAdAccountInfo(token, accId);
        if (accInfo) {
          console.log(`\n📊 ${accInfo.name} (${accInfo.id})`);
          console.log(`   Moneda: ${accInfo.currency}`);
          console.log(`   Zona horaria: ${accInfo.timezone}`);
          console.log(`   Estado: ${accInfo.status}`);
          if (accInfo.spend_cap) {
            console.log(`   Límite de gasto: ${accInfo.spend_cap}`);
          }
        }
      }

      if (tokenInfo.adAccounts.length > 5) {
        console.log(`\n... y ${tokenInfo.adAccounts.length - 5} más`);
      }
    }

    // Mostrar operaciones disponibles
    const operations = getAvailableOperations(tokenInfo);
    console.log('\n\n🎯 RESUMEN DE OPERACIONES DISPONIBLES:');
    console.log('='.repeat(50));
    operations.forEach((category) => {
      console.log(`\n📂 ${category.category}:`);
      category.operations.forEach((op) => {
        console.log(`   ✓ ${op}`);
      });
    });

    console.log('\n\n✅ Verificación completada exitosamente!\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

