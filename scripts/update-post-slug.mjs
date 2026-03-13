#!/usr/bin/env node
/**
 * Script para actualizar el slug del post
 * 
 * Uso: node scripts/update-post-slug.mjs
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Configuración de Sanity
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l4t851dy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("❌ Error: SANITY_API_WRITE_TOKEN no está configurado");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-13",
  token,
  useCdn: false,
});

// Nuevo slug coherente con el título
const newSlug = {
  _type: "slug",
  current: "how-to-prepare-your-home-for-professional-cleaning-orlando"
};

async function updateSlug() {
  console.log("🔗 Actualizando slug del post...\n");
  
  try {
    // Buscar el post por ID
    const postId = "cd6d2666-6ebe-4ecf-8988-5e4464215365";
    
    console.log(`📄 Actualizando slug para post: ${postId}`);
    console.log(`🔗 Nuevo slug: ${newSlug.current}\n`);
    
    // Actualizar solo el slug
    const result = await client
      .patch(postId)
      .set({ slug: newSlug })
      .commit({
        returnDocuments: true,
        visibility: "async"
      });
    
    console.log("✅ Slug actualizado exitosamente!");
    console.log(`📄 ID: ${result._id}`);
    console.log(`🔗 Slug anterior: titulo-mas-de-10-caracteres`);
    console.log(`🔗 Nuevo slug: ${newSlug.current}`);
    
    console.log("\n🌐 Nueva URL:");
    console.log(`https://integritycleansolutions.com/blog/${newSlug.current}`);
    console.log("\n⚠️  URL antigua (redirigirá a 404):");
    console.log(`https://integritycleansolutions.com/blog/titulo-mas-de-10-caracteres`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response?.body) {
      console.error("Detalles:", error.response.body);
    }
    process.exit(1);
  }
}

updateSlug();
