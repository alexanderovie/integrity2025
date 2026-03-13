#!/usr/bin/env node
/**
 * Script para crear un post de blog en Sanity via CLI
 * 
 * Uso: node scripts/create-blog-post.mjs
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

/**
 * Revalida la página del blog en Next.js
 * Según Context7 2026-2028 best practices
 */
async function revalidateBlogPage() {
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://integritycleansolutions.com";
  
  if (!REVALIDATE_SECRET) {
    console.log("\n⚠️  REVALIDATE_SECRET no configurado.");
    console.log("   La página se actualizará automáticamente en el próximo redeploy.");
    console.log("   Para revalidación inmediata, configura REVALIDATE_SECRET en .env.local");
    return;
  }
  
  try {
    console.log("\n🔄 Revalidando cache de Next.js...");
    
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVALIDATE_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: "/blog" }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Cache revalidado exitosamente!");
      console.log(`   Path: ${result.path}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      const error = await response.json();
      console.log("⚠️  No se pudo revalidar el cache:");
      console.log(`   ${error.error || error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log("⚠️  Error al revalidar cache:");
    console.log(`   ${error.message}`);
    console.log("   La página se actualizará en el próximo redeploy.");
  }
}

// Contenido del post en formato Portable Text
const postContent = [
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Getting your home ready before professional cleaners arrive ensures the best results and helps the team work efficiently. Whether it's your first time hiring a cleaning service or you're a regular client, proper preparation makes a significant difference."
      }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Clear the Clutter" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Before the cleaning team arrives, take a few minutes to remove personal items and clutter from surfaces."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "What to put away:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Children's toys scattered on floors" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Papers, magazines, and mail on tables" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Clothes and shoes in bedrooms" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Dishes in sinks and countertops" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Personal electronics and chargers" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      { _type: "span", marks: ["strong"], text: "Pro tip:" },
      { _type: "span", text: " The less clutter there is, the more time cleaners can dedicate to actual cleaning rather than organizing." }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Secure Valuables and Fragile Items" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "While professional cleaning companies are insured and trustworthy, it's always wise to secure items of sentimental or high monetary value."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Items to secure:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Jewelry and watches" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Important documents" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Family heirlooms" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Fragile decorations" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Electronics that could be damaged by cleaning products" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      { _type: "span", marks: ["strong"], text: "Peace of mind:" },
      { _type: "span", text: " Store these items in a locked drawer or safe before the team arrives." }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Make a List of Priority Areas" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Every home has areas that need extra attention. Communicating these priorities helps the cleaning team focus on what matters most to you."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Common priority zones:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Kitchen appliances (oven, refrigerator, microwave)" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Bathroom grout and tiles" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Baseboards and corners" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Ceiling fans and light fixtures" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Windows and mirrors" }]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Provide Access Instructions" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Ensure the cleaning team can enter your home without issues."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Access options:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Be present:" },
      { _type: "span", text: " Greet the team and show them around" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Leave a key:" },
      { _type: "span", text: " In a lockbox or with a neighbor" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Smart lock:" },
      { _type: "span", text: " Provide temporary access codes" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Garage code:" },
      { _type: "span", text: " If applicable and safe" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      { _type: "span", marks: ["strong"], text: "Important:" },
      { _type: "span", text: " Include any special instructions like alarm codes, parking information, or areas that are off-limits." }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Secure Pets" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "While most cleaning companies are pet-friendly, animals can be stressed by unfamiliar people and equipment."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Pet preparation tips:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Place pets in a secure room or crate" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Inform cleaners about pet allergies or sensitivities" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Ensure pets have water and comfort items" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Consider taking pets to a friend's house or daycare" }]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Special Instructions for Specific Areas" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Some parts of your home may need particular care or products."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Areas to discuss:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Delicate surfaces:" },
      { _type: "span", text: " Marble, hardwood, specialty countertops" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Stains:" },
      { _type: "span", text: " Point out specific stains that need treatment" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Odor issues:" },
      { _type: "span", text: " Pet areas, musty basements, smoking zones" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Height restrictions:" },
      { _type: "span", text: " Vaulted ceilings, tall shelves" }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Prepare Cleaning Supplies (Optional)" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Most professional services bring their own supplies, but if you have preferences, let them know."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "What you might provide:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Eco-friendly products if you have allergies" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Specialized cleaners for specific surfaces" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Microfiber cloths if preferred" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Your vacuum if it's high-quality or specific to your needs" }]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "What NOT to Do" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Avoid these common preparation mistakes:"
      }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Don't clean before they arrive:" },
      { _type: "span", text: " You're paying for professional cleaning—let them do their job" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Don't hover:" },
      { _type: "span", text: " Give the team space to work efficiently" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Don't forget to communicate:" },
      { _type: "span", text: " Special requests should be discussed beforehand, not during the cleaning" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Don't leave cash or important items visible:" },
      { _type: "span", text: " Secure these as a precaution" }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "After the Cleaning" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Once the team finishes, take a moment to inspect the work."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Post-cleaning checklist:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Walk through each room with the team lead" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Note any areas that need additional attention" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Provide feedback for future visits" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Enjoy your clean home!" }]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Benefits of Proper Preparation" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Taking 15-20 minutes to prepare your home pays off significantly."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Advantages include:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "More thorough cleaning:" },
      { _type: "span", text: " Team focuses on actual cleaning, not organizing" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Faster service:" },
      { _type: "span", text: " No delays from moving items or asking questions" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Better results:" },
      { _type: "span", text: " Cleaners can access all areas easily" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Lower risk:" },
      { _type: "span", text: " Valuables are secure, fragile items protected" }
    ]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [
      { _type: "span", marks: ["strong"], text: "Peace of mind:" },
      { _type: "span", text: " You know exactly what to expect" }
    ]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Ready to Experience Professional Cleaning?" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "At Integrity Clean Solutions, we make the entire process seamless from booking to completion. Our trained professionals respect your home and deliver exceptional results every time."
      }
    ]
  },
  {
    _type: "block",
    style: "h3",
    children: [{ _type: "span", text: "Why choose us:" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Fully insured and bonded team" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Eco-friendly cleaning products available" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Flexible scheduling including weekends" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Satisfaction guaranteed" }]
  },
  {
    _type: "block",
    style: "normal",
    listItem: "bullet",
    children: [{ _type: "span", text: "Serving Orlando and surrounding areas" }]
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Start Today" }]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      {
        _type: "span",
        text: "Don't wait any longer to enjoy the benefits of a professionally cleaned home. Our team is ready to help you create a cleaner, healthier living environment."
      }
    ]
  },
  {
    _type: "block",
    style: "normal",
    children: [
      { _type: "span", text: "[Contact us today]" },
      { _type: "span", text: " and discover how we can improve your quality of life." }
    ],
    markDefs: [
      {
        _type: "link",
        _key: "contact-link",
        href: "/contact-us"
      }
    ]
  }
];

// Documento del post
const postDocument = {
  _type: "post",
  title: "How to Prepare Your Home for Professional Cleaning Services",
  slug: {
    _type: "slug",
    current: "how-to-prepare-your-home-for-professional-cleaning-services"
  },
  description: "Learn how to prepare your Orlando home before professional cleaners arrive. Simple steps to maximize results and save time. Perfect guide for first-time clients.",
  publishedAt: new Date().toISOString(),
  category: "Guides",
  tags: ["preparation", "first-time", "Orlando", "home cleaning", "tips"],
  featured: true,
  body: postContent
};

/**
 * Valida los campos requeridos según schema de Sanity
 * Basado en Context7 validation patterns 2026-2028
 */
function validateDocument(doc) {
  const errors = [];
  
  // Validar título (required, min 10, max 90)
  if (!doc.title || doc.title.length < 10 || doc.title.length > 90) {
    errors.push(`Title must be between 10 and 90 characters (current: ${doc.title?.length || 0})`);
  }
  
  // Validar excerpt/description (required, min 50, max 180)
  if (!doc.description || doc.description.length < 50 || doc.description.length > 180) {
    errors.push(`Excerpt must be between 50 and 180 characters (current: ${doc.description?.length || 0})`);
  }
  
  // Validar slug (required)
  if (!doc.slug?.current) {
    errors.push("Slug is required");
  }
  
  // Validar category (required)
  if (!doc.category) {
    errors.push("Category is required");
  }
  
  // Validar tags (array, min 1)
  if (!doc.tags || doc.tags.length < 1) {
    errors.push("At least 1 tag is required");
  }
  
  // Validar body (required, min 1)
  if (!doc.body || doc.body.length < 1) {
    errors.push("Content body is required");
  }
  
  return errors;
}

async function createPost() {
  console.log("📝 Creando post de blog en Sanity...\n");
  
  // Validación previa según Context7 2026-2028
  const validationErrors = validateDocument(postDocument);
  if (validationErrors.length > 0) {
    console.error("❌ Validation errors:");
    validationErrors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }
  
  console.log("✅ Validación de schema exitosa\n");
  
  try {
    // Verificar si ya existe un post con ese slug (Context7 pattern)
    const existingPost = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0]{_id, _rev}`,
      { slug: postDocument.slug.current }
    );
    
    if (existingPost) {
      console.log(`⚠️  Post existente encontrado (ID: ${existingPost._id})`);
      console.log("📝 Actualizando documento...\n");
      
      // Usar patch con set() para actualización parcial (Context7 pattern)
      const updatedPost = await client
        .patch(existingPost._id)
        .set(postDocument)
        .commit({
          // Opciones de commit según Context7
          returnDocuments: true,
          visibility: "async"
        });
      
      console.log("✅ Post actualizado exitosamente!");
      console.log(`📄 ID: ${updatedPost._id}`);
      console.log(`🔖 Rev: ${updatedPost._rev}`);
      console.log(`🔗 Slug: ${postDocument.slug.current}`);
      console.log(`📝 Operación: UPDATE`);
    } else {
      console.log("🆕 Creando nuevo documento...\n");
      
      // Crear nuevo documento (Context7 pattern)
      const result = await client.create(postDocument, {
        // Opciones de creación según Context7
        returnDocuments: true
      });
      
      console.log("✅ Post creado exitosamente!");
      console.log(`📄 ID: ${result._id}`);
      console.log(`🔖 Rev: ${result._rev}`);
      console.log(`🔗 Slug: ${postDocument.slug.current}`);
      console.log(`📅 Publicado: ${new Date().toLocaleString()}`);
      console.log(`📝 Operación: CREATE`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🌐 URLs de acceso:");
    console.log("=".repeat(60));
    console.log(`Blog: https://integritycleansolutions.com/blog/${postDocument.slug.current}`);
    console.log(`API:  https://l4t851dy.api.sanity.io/v2026-03-13/data/query/production?query=*[_type=="post"]`);
    console.log(`Studio: https://integrity2025.vercel.app/studio`);
    console.log("=".repeat(60));
    
    // Revalidar cache según Context7 2026-2028
    await revalidateBlogPage();
    
  } catch (error) {
    console.error("\n❌ Error al crear/actualizar el post:");
    console.error(`   Message: ${error.message}`);
    
    // Mejor manejo de errores según Context7
    if (error.response?.body) {
      console.error(`   Details:`, error.response.body);
    }
    
    process.exit(1);
  }
}

createPost();
