#!/usr/bin/env node
/**
 * Script profesional para migrar posts MDX a Sanity
 * Genera NDJSON para importación masiva eficiente
 * Uso: pnpm sanity:migrate
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

// Leer .env.local manualmente (enfoque profesional sin dependencias extra)
function loadEnvFile() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ No se encontró .env.local");
    process.exit(1);
  }

  const envContent = readFileSync(envPath, "utf8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remover comillas si existen
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });

  return env;
}

const env = loadEnvFile();
const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fybafzhk";
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = env.SANITY_API_WRITE_TOKEN;

if (!TOKEN) {
  console.error("❌ Error: SANITY_API_WRITE_TOKEN no está configurado en .env.local");
  process.exit(1);
}

const postsDirectory = join(process.cwd(), "content/blog/posts");

// Función para convertir Markdown a Portable Text (formato Sanity)
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

    if (trimmed.startsWith("#### ")) {
      closeCurrentList();
      blocks.push({
        _type: "block",
        style: "h4",
        children: [{ _type: "span", text: trimmed.slice(5) }],
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

    // Procesar enlaces [texto](url)
    const children = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let lastIndex = 0;

    while ((match = linkRegex.exec(trimmed)) !== null) {
      if (match.index > lastIndex) {
        children.push({
          _type: "span",
          text: trimmed.slice(lastIndex, match.index),
        });
      }
      children.push({
        _type: "span",
        text: match[1],
        marks: [
          {
            _type: "link",
            href: match[2],
          },
        ],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < trimmed.length) {
      children.push({
        _type: "span",
        text: trimmed.slice(lastIndex),
      });
    }

    if (children.length === 0) {
      children.push({ _type: "span", text: trimmed });
    }

    blocks.push({
      _type: "block",
      style: "normal",
      children,
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

// Generar documento Sanity
function createSanityDocument(frontmatter, content, slug) {
  const publishedAt = new Date(frontmatter.publishedAt).toISOString();

  return {
    _id: `post-${slug}`,
    _type: "post",
    title: frontmatter.title,
    slug: {
      _type: "slug",
      current: slug,
    },
    description: frontmatter.description,
    publishedAt,
    category: frontmatter.category,
    tags: frontmatter.tags || [],
    featured: frontmatter.featured || false,
    body: markdownToPortableText(content),
    seoTitle: frontmatter.seoTitle || "",
    seoDescription: frontmatter.seoDescription || "",
  };
}

// Función principal
async function main() {
  console.log("🚀 Iniciando migración profesional de posts MDX a Sanity...\n");

  if (!existsSync(postsDirectory)) {
    console.error("❌ No se encontró el directorio de posts");
    process.exit(1);
  }

  const files = readdirSync(postsDirectory).filter((file) =>
    file.endsWith(".mdx")
  );

  console.log(`📄 Encontrados ${files.length} archivos MDX\n`);

  const documents = [];

  for (const fileName of files) {
    try {
      const fullPath = join(postsDirectory, fileName);
      const fileContents = readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const slug = fileName.replace(/\.mdx$/, "");

      console.log(`📝 Procesando: ${data.title || slug}`);

      const doc = createSanityDocument(data, content, slug);
      documents.push(doc);

      console.log(`   ✅ Documento preparado\n`);
    } catch (error) {
      console.error(`   ❌ Error procesando ${fileName}:`, error.message);
    }
  }

  if (documents.length === 0) {
    console.log("⚠️  No se encontraron documentos para migrar");
    process.exit(0);
  }

  // Importar usando Sanity CLI
  console.log("📦 Importando documentos a Sanity...");
  console.log(`   Proyecto: ${PROJECT_ID}`);
  console.log(`   Dataset: ${DATASET}`);
  console.log(`   Documentos: ${documents.length}\n`);

  // Usar fetch directo a la API de Sanity (más profesional que CLI)
  try {
    const response = await fetch(
      `https://${PROJECT_ID}.api.sanity.io/v2024-07-17/data/mutate/${DATASET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          mutations: documents.map((doc) => ({
            createOrReplace: doc,
          })),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    await response.json();

    console.log("✅ Migración completada exitosamente!");
    console.log(`\n📊 Resumen:`);
    console.log(`   📁 Posts migrados: ${documents.length}`);
    console.log(`   🆔 IDs: ${documents.map((d) => d._id).join(", ")}`);

    console.log("\n🔗 Próximos pasos:");
    console.log("   1. Visita: https://www.sanity.io/manage");
    console.log("   2. Selecciona tu proyecto");
    console.log("   3. Ve a 'Content' para ver los posts");
    console.log("   4. Abre /studio en tu sitio para editar");
    console.log("   5. Configura CORS: http://localhost:3000 y tu dominio\n");
  } catch (error) {
    console.error("❌ Error en la migración:", error.message);
    console.log("\n💡 Solución alternativa:");
    console.log("   1. Guarda los posts manualmente desde el Studio");
    console.log("   2. O usa: pnpm sanity dataset import production");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
