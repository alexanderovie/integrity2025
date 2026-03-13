#!/usr/bin/env node
/**
 * Script para actualizar el post de prueba con contenido profesional
 * 
 * Uso: node scripts/update-post-content.mjs
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
 * Crea un bloque de texto simple
 */
function createBlock(text, style = "normal", marks = []) {
  return {
    _key: generateKey(),
    _type: "block",
    style,
    children: [
      {
        _key: generateKey(),
        _type: "span",
        marks,
        text
      }
    ],
    markDefs: []
  };
}

/**
 * Crea un bloque con múltiples spans (para texto mixto)
 */
function createMixedBlock(children) {
  return {
    _key: generateKey(),
    _type: "block",
    style: "normal",
    children: children.map(child => ({
      _key: generateKey(),
      _type: "span",
      marks: child.marks || [],
      text: child.text
    })),
    markDefs: []
  };
}

/**
 * Crea un item de lista
 */
function createListItem(text, listItem = "bullet", level = 1) {
  return {
    _key: generateKey(),
    _type: "block",
    style: "normal",
    listItem,
    level,
    children: [
      {
        _key: generateKey(),
        _type: "span",
        marks: [],
        text
      }
    ],
    markDefs: []
  };
}

/**
 * Crea un link
 */
function createLinkBlock(text, href) {
  const linkKey = generateKey();
  return {
    _key: generateKey(),
    _type: "block",
    style: "normal",
    children: [
      {
        _key: generateKey(),
        _type: "span",
        marks: [linkKey],
        text
      }
    ],
    markDefs: [
      {
        _key: linkKey,
        _type: "link",
        href
      }
    ]
  };
}

// Contenido profesional del artículo
const postBody = [
  // Título principal
  createBlock(
    "How to Prepare Your Home for Professional Cleaning Services in Orlando",
    "h1"
  ),
  
  // Subtítulo
  createBlock(
    "A Complete Guide to Maximize Results and Save Time",
    "h2"
  ),
  
  // Introducción
  createBlock(
    "Preparing your home before the arrival of professional cleaners ensures the best possible results and helps the cleaning team work more efficiently. Whether it's your first time hiring a cleaning service or you're a regular client, proper preparation makes a significant difference in the quality of service you receive."
  ),
  
  // Sección 1
  createBlock(
    "1. Clear the Clutter",
    "h2"
  ),
  
  createBlock(
    "Before the cleaning team arrives, take a few minutes to remove personal items and clutter from surfaces. This simple step allows cleaners to focus on actual cleaning rather than organizing, maximizing the time spent on what matters most."
  ),
  
  createBlock(
    "What to put away:",
    "h3"
  ),
  
  createListItem("Children's toys scattered on floors"),
  createListItem("Papers, magazines, and mail on tables"),
  createListItem("Clothes and shoes in bedrooms"),
  createListItem("Dishes in sinks and countertops"),
  createListItem("Personal electronics and chargers"),
  
  createMixedBlock([
    { text: "Pro tip: ", marks: ["strong"] },
    { text: "The less clutter there is, the more time cleaners can dedicate to actual cleaning rather than organizing. This means better results for you!" }
  ]),
  
  // Sección 2
  createBlock(
    "2. Secure Valuables and Fragile Items",
    "h2"
  ),
  
  createBlock(
    "While professional cleaning companies are fully insured and employ trustworthy staff, it's always wise to secure items of sentimental or high monetary value. This provides peace of mind for both you and the cleaning team."
  ),
  
  createBlock(
    "Items to secure:",
    "h3"
  ),
  
  createListItem("Jewelry, watches, and valuable accessories"),
  createListItem("Important documents and certificates"),
  createListItem("Family heirlooms and irreplaceable items"),
  createListItem("Fragile decorations and collectibles"),
  createListItem("Electronics that could be damaged by cleaning products"),
  
  createMixedBlock([
    { text: "Peace of mind: ", marks: ["strong"] },
    { text: "Store these items in a locked drawer or safe before the team arrives. This simple step ensures everyone can focus on the cleaning task at hand." }
  ]),
  
  // Sección 3
  createBlock(
    "3. Make a List of Priority Areas",
    "h2"
  ),
  
  createBlock(
    "Every home has areas that need extra attention. Communicating these priorities helps the cleaning team focus on what matters most to you, ensuring your specific concerns are addressed during the service."
  ),
  
  createBlock(
    "Common priority zones:",
    "h3"
  ),
  
  createListItem("Kitchen appliances (oven, refrigerator, microwave)"),
  createListItem("Bathroom grout and tiles"),
  createListItem("Baseboards and corners that collect dust"),
  createListItem("Ceiling fans and light fixtures"),
  createListItem("Windows and mirrors"),
  
  // Sección 4
  createBlock(
    "4. Provide Access Instructions",
    "h2"
  ),
  
  createBlock(
    "Ensure the cleaning team can enter your home without issues. Clear access instructions prevent delays and ensure the service starts on time."
  ),
  
  createBlock(
    "Access options:",
    "h3"
  ),
  
  createListItem("Be present: Greet the team and show them around your home"),
  createListItem("Leave a key: In a secure lockbox or with a trusted neighbor"),
  createListItem("Smart lock: Provide temporary access codes"),
  createListItem("Garage code: If applicable and safe to share"),
  
  createMixedBlock([
    { text: "Important: ", marks: ["strong"] },
    { text: "Include any special instructions like alarm codes, parking information, or areas that are off-limits to the cleaning team." }
  ]),
  
  // Sección 5
  createBlock(
    "5. Secure Pets",
    "h2"
  ),
  
  createBlock(
    "While most cleaning companies are pet-friendly, animals can be stressed by unfamiliar people and equipment. Taking a few precautions ensures a smooth cleaning experience for everyone, including your furry friends."
  ),
  
  createBlock(
    "Pet preparation tips:",
    "h3"
  ),
  
  createListItem("Place pets in a secure room or crate during cleaning"),
  createListItem("Inform cleaners about pet allergies or sensitivities"),
  createListItem("Ensure pets have water and comfort items"),
  createListItem("Consider taking pets to a friend's house or daycare for the day"),
  
  // Sección 6
  createBlock(
    "6. Special Instructions for Specific Areas",
    "h2"
  ),
  
  createBlock(
    "Some parts of your home may need particular care or specific cleaning products. Communicating these needs upfront ensures the best results and prevents damage to delicate surfaces."
  ),
  
  createBlock(
    "Areas to discuss:",
    "h3"
  ),
  
  createListItem("Delicate surfaces: Marble, hardwood, specialty countertops"),
  createListItem("Stains: Point out specific stains that need special treatment"),
  createListItem("Odor issues: Pet areas, musty basements, smoking zones"),
  createListItem("Height restrictions: Vaulted ceilings, tall shelves"),
  
  // Sección 7
  createBlock(
    "The Benefits of Proper Preparation",
    "h2"
  ),
  
  createBlock(
    "Taking 15-20 minutes to prepare your home pays off significantly. Here's what you gain:"
  ),
  
  createListItem("More thorough cleaning: Team focuses on actual cleaning, not organizing"),
  createListItem("Faster service: No delays from moving items or asking questions"),
  createListItem("Better results: Cleaners can access all areas easily"),
  createListItem("Lower risk: Valuables are secure, fragile items protected"),
  createListItem("Peace of mind: You know exactly what to expect"),
  
  // CTA
  createBlock(
    "Ready to Experience Professional Cleaning?",
    "h2"
  ),
  
  createBlock(
    "At Integrity Clean Solutions, we understand that each client has unique needs. We offer flexible plans that adapt to your budget and lifestyle, serving Orlando and surrounding areas with pride."
  ),
  
  createBlock(
    "Why choose us:",
    "h3"
  ),
  
  createListItem("Fully insured and bonded professional team"),
  createListItem("Eco-friendly cleaning products available"),
  createListItem("Flexible scheduling including weekends"),
  createListItem("100% satisfaction guaranteed"),
  createListItem("Deep local knowledge of Orlando communities"),
  
  createLinkBlock(
    "Contact us today",
    "/contact-us"
  ),
  
  createBlock(
    " and discover how we can transform your home with our professional cleaning services. Your satisfaction is our priority!"
  )
];

// Datos actualizados del post
const updatedPost = {
  title: "How to Prepare Your Home for Professional Cleaning Services in Orlando",
  description: "Learn how to prepare your Orlando home before professional cleaners arrive. Simple steps to maximize results and save time. Perfect guide for first-time clients.",
  body: postBody
};

async function updatePost() {
  console.log("📝 Actualizando post con contenido profesional...\n");
  
  try {
    // Buscar el post por slug
    const post = await client.fetch(
      `*[_type == "post" && slug.current == "titulo-mas-de-10-caracteres"][0]{_id}`,
      {}
    );
    
    if (!post) {
      console.error("❌ Post no encontrado");
      process.exit(1);
    }
    
    console.log(`📄 Post encontrado: ${post._id}`);
    console.log("🔄 Actualizando contenido...\n");
    
    // Actualizar el post
    const result = await client
      .patch(post._id)
      .set(updatedPost)
      .commit({
        returnDocuments: true,
        visibility: "async"
      });
    
    console.log("✅ Post actualizado exitosamente!");
    console.log(`📄 ID: ${result._id}`);
    console.log(`📝 Nuevo título: ${updatedPost.title}`);
    console.log(`📊 Bloques de contenido: ${postBody.length}`);
    
    console.log("\n🌐 Ver en producción:");
    console.log(`https://integritycleansolutions.com/blog/titulo-mas-de-10-caracteres`);
    console.log("\n🎨 Ver en Studio:");
    console.log(`https://integrity2025.vercel.app/studio`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response?.body) {
      console.error("Detalles:", error.response.body);
    }
    process.exit(1);
  }
}

updatePost();
