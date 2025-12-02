/**
 * Script para eliminar contactos de prueba de HubSpot
 * Ejecutar: npx tsx scripts/delete-test-contacts.ts
 */

import { deleteContactByEmail } from "../src/lib/hubspot/contacts";

const TEST_EMAILS = [
  "test-contact-123@test.com",
  "test-newsletter-123@test.com",
  "test-contact-1764638441@test.com",
  "test-newsletter-1764638439@test.com",
  "test-newsletter-1764638436@test.com",
  "test-contact-1764638363@test.com",
  "test-newsletter-1764638360@test.com",
  "aoviedo@prueba.com",
];

async function deleteTestContacts() {
  console.log("🗑️  Eliminando contactos de prueba de HubSpot...\n");

  const results = [];

  for (const email of TEST_EMAILS) {
    console.log(`Eliminando: ${email}...`);
    const result = await deleteContactByEmail(email);
    results.push({ email, ...result });

    if (result.success) {
      console.log(`  ✅ ${result.message}`);
    } else {
      console.log(`  ⚠️  ${result.message}`);
    }
    console.log("");
  }

  // Resumen
  console.log("==========================================");
  console.log("📊 RESUMEN DE ELIMINACIÓN");
  console.log("==========================================");
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Eliminados exitosamente: ${successful}`);
  console.log(`⚠️  No encontrados o errores: ${failed}`);
  console.log(`📋 Total procesados: ${results.length}`);

  if (failed > 0) {
    console.log("\n⚠️  Contactos no eliminados:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.email}: ${r.message}`);
      });
  }

  console.log("\n✅ Proceso completado");
}

// Ejecutar
deleteTestContacts().catch((error) => {
  console.error("❌ Error ejecutando script:", error);
  process.exit(1);
});
