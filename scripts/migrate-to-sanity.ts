#!/usr/bin/env tsx
/**
 * Script para migrar posts MDX a Sanity
 * Uso: pnpm sanity:migrate
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fybafzhk";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("❌ Error: SANITY_API_WRITE_TOKEN no está configurado");
  console.log("\nPara migrar posts necesitas un token con permisos de escritura.");
  console.log("1. Ve a https://www.sanity.io/manage");
  console.log("2. Selecciona tu proyecto");
  console.log("3. Ve a API > Tokens");
  console.log("4. Crea un nuevo token con permisos 'Editor'");
  console.log("5. Agrega SANITY_API_WRITE_TOKEN=your_token a .env.local\n");
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

type PortableTextSpan = {
  _type: "span";
  text: string;
  marks?: Array<{ _type: "link"; href: string }>;
};

type PortableTextBlock = {
  _type: "block";
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children: PortableTextSpan[];
};

// Función simple para convertir Markdown básico a Portable Text
function markdownToPortableText(content: string): PortableTextBlock[] {
  const blocks: PortableTextBlock[] = [];
  const lines = content.split("\n");
  let currentList: PortableTextBlock | null = null;
  let currentListType: "bullet" | "number" | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      // Cerrar lista si hay espacio en blanco
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      continue;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      blocks.push({
        _type: "block",
        style: "h1",
        children: [{ _type: "span", text: trimmed.slice(2) }],
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      blocks.push({
        _type: "block",
        style: "h2",
        children: [{ _type: "span", text: trimmed.slice(3) }],
      });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      blocks.push({
        _type: "block",
        style: "h3",
        children: [{ _type: "span", text: trimmed.slice(4) }],
      });
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      blocks.push({
        _type: "block",
        style: "h4",
        children: [{ _type: "span", text: trimmed.slice(5) }],
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
        currentListType = null;
      }
      blocks.push({
        _type: "block",
        style: "blockquote",
        children: [{ _type: "span", text: trimmed.slice(2) }],
      });
      continue;
    }

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType !== "bullet") {
        if (currentList) blocks.push(currentList);
        currentList = {
          _type: "block",
          listItem: "bullet",
          level: 0,
          children: [],
        };
        currentListType = "bullet";
      }
      if (!currentList) continue;
      currentList.children.push({
        _type: "span",
        text: trimmed.slice(2),
      });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      if (currentListType !== "number") {
        if (currentList) blocks.push(currentList);
        currentList = {
          _type: "block",
          listItem: "number",
          level: 0,
          children: [],
        };
        currentListType = "number";
      }
      if (!currentList) continue;
      currentList.children.push({
        _type: "span",
        text: trimmed.replace(/^\d+\.\s/, ""),
      });
      continue;
    }

    // Texto normal
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
      currentListType = null;
    }

    // Procesar negritas y enlaces básicos
    const text = trimmed;
    const children: PortableTextSpan[] = [];

    // Enlaces [texto](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    let lastIndex = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        children.push({
          _type: "span",
          text: text.slice(lastIndex, match.index),
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

    if (lastIndex < text.length) {
      children.push({
        _type: "span",
        text: text.slice(lastIndex),
      });
    }

    if (children.length === 0) {
      children.push({ _type: "span", text });
    }

    blocks.push({
      _type: "block",
      style: "normal",
      children,
    });
  }

  // Cerrar lista final si existe
  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}

async function migratePosts() {
  console.log("🚀 Iniciando migración de posts MDX a Sanity...\n");

  if (!fs.existsSync(postsDirectory)) {
    console.error("❌ No se encontró el directorio de posts");
    return;
  }

  const files = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".mdx"));

  console.log(`📄 Encontrados ${files.length} archivos MDX\n`);

  let migrated = 0;
  let errors = 0;

  for (const fileName of files) {
    try {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // Extraer slug del nombre de archivo
      const slug = fileName.replace(/\.mdx$/, "");

      console.log(`📝 Procesando: ${data.title || slug}`);

      // Convertir fecha a ISO 8601
      const publishedAt = new Date(data.publishedAt).toISOString();

      // Crear documento en Sanity
      const doc = {
        _type: "post",
        title: data.title,
        slug: {
          _type: "slug",
          current: slug,
        },
        description: data.description,
        publishedAt,
        category: data.category,
        tags: data.tags || [],
        featured: data.featured || false,
        body: markdownToPortableText(content),
      };

      // Verificar si ya existe
      const existing = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug }
      );

      if (existing) {
        console.log(`   ⚠️  Ya existe, actualizando...`);
        await client
          .patch(existing._id)
          .set(doc)
          .commit();
      } else {
        console.log(`   ✨ Creando nuevo post...`);
        await client.create(doc);
      }

      console.log(`   ✅ Migrado exitosamente\n`);
      migrated++;
    } catch (error) {
      console.error(`   ❌ Error migrando ${fileName}:`, error);
      errors++;
    }
  }

  console.log("\n📊 Resumen de migración:");
  console.log(`   ✅ Posts migrados: ${migrated}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Total: ${files.length}`);

  if (errors === 0) {
    console.log("\n🎉 Migración completada exitosamente!");
    console.log("\nPróximos pasos:");
    console.log("1. Visita https://www.sanity.io/manage para ver tus posts");
    console.log("2. Abre /studio en tu sitio para editar contenido");
    console.log("3. Configura CORS en Sanity para tu dominio de producción");
  }
}

migratePosts().catch((error) => {
  console.error("❌ Error fatal:", error);
  process.exit(1);
});
