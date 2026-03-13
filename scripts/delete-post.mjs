#!/usr/bin/env node
/**
 * Script para eliminar un post específico de Sanity
 * 
 * Uso: node scripts/delete-post.mjs <slug>
 * Ejemplo: node scripts/delete-post.mjs how-to-prepare-your-home-for-professional-cleaning-services
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

const slug = process.argv[2];

if (!slug) {
  console.error("❌ Error: Debes proporcionar un slug");
  console.log("Uso: node scripts/delete-post.mjs <slug>");
  process.exit(1);
}

async function deletePost() {
  console.log(`🗑️  Eliminando post con slug: "${slug}"...\n`);
  
  try {
    // Buscar el post por slug
    const post = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{_id, title}`,
      { slug }
    );
    
    if (!post) {
      console.log(`⚠️  No se encontró ningún post con el slug: "${slug}"`);
      process.exit(0);
    }
    
    console.log(`📄 Post encontrado:`);
    console.log(`   Título: ${post.title}`);
    console.log(`   ID: ${post._id}\n`);
    
    // Eliminar el post
    await client.delete(post._id);
    
    console.log(`✅ Post eliminado exitosamente!`);
    console.log(`\n🌐 La URL ya no estará disponible:`);
    console.log(`   https://integritycleansolutions.com/blog/${slug}`);
    
  } catch (error) {
    console.error("❌ Error al eliminar el post:", error.message);
    process.exit(1);
  }
}

deletePost();
