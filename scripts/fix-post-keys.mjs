#!/usr/bin/env node
/**
 * Script para arreglar las _keys faltantes en posts existentes de Sanity
 * 
 * Uso: node scripts/fix-post-keys.mjs
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

/**
 * Genera una key única para Sanity Portable Text
 */
function generateKey() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Agrega _key únicas a todos los bloques y children
 */
function addKeysToBlocks(blocks) {
  return blocks.map(block => {
    const blockWithKey = { ...block, _key: block._key || generateKey() };
    
    // Agregar keys a children si existen
    if (blockWithKey.children && Array.isArray(blockWithKey.children)) {
      blockWithKey.children = blockWithKey.children.map(child => ({
        ...child,
        _key: child._key || generateKey()
      }));
    }
    
    // Agregar keys a markDefs si existen
    if (blockWithKey.markDefs && Array.isArray(blockWithKey.markDefs)) {
      blockWithKey.markDefs = blockWithKey.markDefs.map(mark => ({
        ...mark,
        _key: mark._key || generateKey()
      }));
    }
    
    return blockWithKey;
  });
}

async function fixPostKeys() {
  console.log("🔧 Arreglando _keys faltantes en posts de Sanity...\n");
  
  try {
    // Obtener todos los posts
    const posts = await client.fetch(`*[_type == "post"]{_id, title, body}`);
    
    console.log(`📊 Encontrados ${posts.length} posts\n`);
    
    for (const post of posts) {
      console.log(`📝 Procesando: ${post.title}`);
      
      // Verificar si el body tiene blocks sin _key
      let needsUpdate = false;
      
      if (post.body && Array.isArray(post.body)) {
        for (const block of post.body) {
          if (!block._key) {
            needsUpdate = true;
            break;
          }
          
          // Verificar children
          if (block.children && Array.isArray(block.children)) {
            for (const child of block.children) {
              if (!child._key) {
                needsUpdate = true;
                break;
              }
            }
          }
          
          if (needsUpdate) break;
        }
      }
      
      if (needsUpdate) {
        console.log(`   ⚠️  Faltan _keys, actualizando...`);
        
        const fixedBody = addKeysToBlocks(post.body);
        
        await client
          .patch(post._id)
          .set({ body: fixedBody })
          .commit();
        
        console.log(`   ✅ Actualizado exitosamente!\n`);
      } else {
        console.log(`   ✓ Todas las _keys presentes\n`);
      }
    }
    
    console.log("🎉 Proceso completado!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixPostKeys();
