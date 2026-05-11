#!/usr/bin/env node
/**
 * Script para convertir markdown **bold** a formato Portable Text de Sanity
 * Arregla todos los posts que tienen asteriscos dobles sin formato
 * 
 * Uso: node scripts/fix-markdown-bold.mjs
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
 * Procesa el texto de un bloque y convierte **texto** en spans con negrita
 * Maneja múltiples ocurrencias de **texto** en el mismo bloque
 */
function processBoldText(text) {
  const children = [];
  let lastIndex = 0;
  
  // Buscar todas las ocurrencias de **texto**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Texto antes del match
    if (match.index > lastIndex) {
      children.push({
        _key: generateKey(),
        _type: "span",
        marks: [],
        text: text.slice(lastIndex, match.index)
      });
    }
    
    // Texto en negrita (sin los asteriscos)
    children.push({
      _key: generateKey(),
      _type: "span",
      marks: ["strong"],
      text: match[1] // El contenido entre ** **
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Texto después del último match
  if (lastIndex < text.length) {
    children.push({
      _key: generateKey(),
      _type: "span",
      marks: [],
      text: text.slice(lastIndex)
    });
  }
  
  return children;
}

/**
 * Procesa un bloque completo y devuelve el bloque actualizado
 */
function processBlock(block) {
  // Solo procesar bloques de tipo 'block' con children
  if (block._type !== 'block' || !block.children || block.children.length === 0) {
    return block;
  }
  
  const newChildren = [];
  let hasChanges = false;
  
  for (const child of block.children) {
    if (child._type === 'span' && child.text && child.text.includes('**')) {
      // Este span tiene markdown bold, procesarlo
      const processedChildren = processBoldText(child.text);
      newChildren.push(...processedChildren);
      hasChanges = true;
    } else {
      // Mantener el span original
      newChildren.push(child);
    }
  }
  
  if (hasChanges) {
    return {
      ...block,
      _key: block._key || generateKey(),
      children: newChildren
    };
  }
  
  return block;
}

/**
 * Procesa el body completo de un post
 */
function processBody(body) {
  if (!Array.isArray(body)) return body;
  
  return body.map(block => processBlock(block));
}

async function fixAllPosts() {
  console.log("🔧 Arreglando formato markdown **bold** en todos los posts...\n");
  
  try {
    // Obtener todos los posts con su body completo
    const posts = await client.fetch(`*[_type == "post"]{_id, title, slug, body}`);
    
    console.log(`📊 Total de posts encontrados: ${posts.length}\n`);
    
    let fixedCount = 0;
    
    for (const post of posts) {
      // Saltar el post que ya está bien (el que acabamos de crear)
      if (post.slug?.current === 'how-to-prepare-your-home-for-professional-cleaning-orlando') {
        console.log(`⏭️  Saltando: ${post.title} (ya tiene formato correcto)`);
        continue;
      }
      
      // Verificar si tiene asteriscos dobles en el body
      const bodyText = JSON.stringify(post.body);
      if (!bodyText.includes('**')) {
        console.log(`✓ ${post.title}: Sin formato markdown (OK)`);
        continue;
      }
      
      console.log(`🔍 Procesando: ${post.title}`);
      
      // Procesar el body
      const fixedBody = processBody(post.body);
      
      // Actualizar el post
      await client
        .patch(post._id)
        .set({ body: fixedBody })
      .commit({
          returnDocuments: false,
          visibility: "async"
        });
      
      console.log(`   ✅ Formato corregido\n`);
      fixedCount++;
    }
    
    console.log(`\n🎉 Proceso completado!`);
    console.log(`   Posts arreglados: ${fixedCount}`);
    console.log(`   Posts sin cambios: ${posts.length - fixedCount}`);
    
    if (fixedCount > 0) {
      console.log(`\n⚠️  IMPORTANTE: Hacer deploy a producción para ver los cambios`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response?.body) {
      console.error("Detalles:", error.response.body);
    }
    process.exit(1);
  }
}

fixAllPosts();
