#!/usr/bin/env node
/**
 * Script de migración MDX → Sanity
 * 
 * Uso: pnpm migrate:content
 * 
 * Este script:
 * 1. Lee todos los archivos MDX de content/blog/posts/
 * 2. Extrae frontmatter y contenido
 * 3. Convierte a formato Sanity
 * 4. Sube a Sanity via API
 * 5. Genera reporte de migración
 */

import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Sanity
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "l4t851dy";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("❌ Error: SANITY_API_WRITE_TOKEN no está configurado");
  console.log("\nConfigura el token:");
  console.log("export SANITY_API_WRITE_TOKEN=tu_token_aqui");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-13",
  token,
  useCdn: false,
});

const postsDirectory = path.join(process.cwd(), "content/blog/posts");

/**
 * Convierte Markdown a Portable Text (formato básico)
 * Esta es una conversión simple - para contenido complejo se necesitaría
 * un parser más sofisticado como @portabletext/to-html
 */
function markdownToPortableText(content) {
  const blocks = [];
  const lines = content.split("\n");
  let currentList = null;
  let currentListType = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      continue;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      closeCurrentList();
      blocks.push({
        _type: "block",
        style: "h1",
        children: [{ _type: "span", text: trimmed.slice(2) }],
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      closeCurrentList();
      blocks.push({
        _type: "block",
        style: "h2",
        children: [{ _type: "span", text: trimmed.slice(3) }],
      });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      closeCurrentList();
      blocks.push({
        _type: "block",
        style: "h3",
        children: [{ _type: "span", text: trimmed.slice(4) }],
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      closeCurrentList();
      blocks.push({
        _type: "block",
        style: "blockquote",
        children: [{ _type: "span", text: trimmed.slice(2) }],
      });
      continue;
    }

    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType !== "bullet") {
        closeCurrentList();
        currentList = {
          _type: "block",
          listItem: "bullet",
          level: 0,
          children: [],
        };
        currentListType = "bullet";
      }
      currentList.children.push({
        _type: "span",
        text: trimmed.slice(2),
      });
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (currentListType !== "number") {
        closeCurrentList();
        currentList = {
          _type: "block",
          listItem: "number",
          level: 0,
          children: [],
        };
        currentListType = "number";
      }
      currentList.children.push({
        _type: "span",
        text: trimmed.replace(/^\d+\.\s/, ""),
      });
      continue;
    }

    // Normal paragraph
    closeCurrentList();
    blocks.push({
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: trimmed }],
    });
  }

  closeCurrentList();
  return blocks;

  function closeCurrentList() {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
      currentListType = null;
    }
  }
}

/**
 * Crea un documento de post en Sanity
 */
function createSanityDocument(frontmatter, content, slug) {
  const publishedAt = new Date(frontmatter.publishedAt).toISOString();

  return {
    _type: "post",
    _id: `migration-${slug}`,
    title: frontmatter.title,
    slug: {
      _type: "slug",
      current: slug,
    },
    description: frontmatter.description,
    publishedAt,
    category: frontmatter.category || "General",
    tags: frontmatter.tags || [],
    featured: frontmatter.featured || false,
    body: markdownToPortableText(content),
    // Metadata para tracking
    _migration: {
      source: "mdx",
      migratedAt: new Date().toISOString(),
      originalFile: `${slug}.mdx`,
    },
  };
}

/**
 * Migra un solo post
 */
async function migratePost(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);
    const slug = path.basename(filePath, ".mdx");

    console.log(`📝 Migrando: ${frontmatter.title || slug}`);

    // Crear documento
    const doc = createSanityDocument(frontmatter, content, slug);

    // Verificar si ya existe en Sanity
    const existing = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]`,
      { slug }
    );

    if (existing) {
      console.log(`   ⚠️  Ya existe, actualizando...`);
      // Actualizar en lugar de crear
      await client
        .patch(existing._id)
        .set(doc)
        .commit();
      return { slug, status: "updated", title: frontmatter.title };
    } else {
      console.log(`   ✨ Creando nuevo post...`);
      await client.create(doc);
      return { slug, status: "created", title: frontmatter.title };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { slug: path.basename(filePath, ".mdx"), status: "error", error: error.message };
  }
}

/**
 * Función principal
 */
async function main() {
  console.log("🚀 Iniciando migración de contenido MDX a Sanity...\n");
  console.log(`📍 Proyecto: ${projectId}`);
  console.log(`📁 Dataset: ${dataset}\n`);

  if (!fs.existsSync(postsDirectory)) {
    console.error("❌ No se encontró el directorio de posts");
    process.exit(1);
  }

  const files = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"));

  console.log(`📄 Encontrados ${files.length} archivos MDX\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(postsDirectory, file);
    const result = await migratePost(filePath);
    results.push(result);
    console.log("");
  }

  // Reporte
  const created = results.filter((r) => r.status === "created").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log("\n" + "=".repeat(50));
  console.log("📊 REPORTE DE MIGRACIÓN");
  console.log("=".repeat(50));
  console.log(`   ✅ Creados: ${created}`);
  console.log(`   🔄 Actualizados: ${updated}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Total: ${files.length}`);
  console.log("=".repeat(50));

  if (errors === 0) {
    console.log("\n🎉 Migración completada exitosamente!");
    console.log("\nPróximos pasos:");
    console.log("1. Verifica los posts en: https://www.sanity.io/manage");
    console.log("2. Abre el Studio: https://integrity2025.vercel.app/studio");
    console.log("3. Revisa que las imágenes se vean bien");
    console.log("4. Cuando estés listo, activa el modo 'sanity-only'");
  } else {
    console.log("\n⚠️  Algunos posts tuvieron errores. Revisa los logs arriba.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
