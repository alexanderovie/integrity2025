# 🚀 Guía Rápida: Crear Posts con ChatGPT

## Paso 1: Abrir ChatGPT
Ve a https://chat.openai.com

## Paso 2: Copiar el Prompt
Copia el texto completo del archivo `docs/content/chatgpt-blog-template.md`

## Paso 3: Elegir un Tema
Al final del prompt, escribe el tema que quieres. Ejemplos:
- "5 Signs Your Home Needs a Deep Cleaning in Orlando"
- "Move-Out Cleaning Checklist: Get Your Full Deposit Back"
- "How to Remove Pet Odors from Your Home"

## Paso 4: Generar Contenido
ChatGPT te dará el artículo completo con formato.

## Paso 5: Copiar a Sanity

### 5.1 Abrir Sanity Studio
- Ve a: `https://integritycleansolutions.com/studio`
- Haz login con tu cuenta

### 5.2 Crear Nuevo Post
1. Click en **"+ New Document"** (arriba derecha)
2. Selecciona **"Blog Post"**

### 5.3 Llenar Campos
Copia cada parte del artículo de ChatGPT:

| Campo | Qué copiar |
|-------|-----------|
| **Title** | El `title` del frontmatter (línea 1 después de `title:`) |
| **Slug** | Click en **"Generate"** (se crea automático del título) |
| **Excerpt** | El `description` del frontmatter |
| **Published at** | Selecciona la fecha de hoy |
| **Category** | Elige: Services, Tips, Guides, Airbnb, o Eco-Friendly |
| **Tags** | Copia los tags del frontmatter (ej: `["deep cleaning", "orlando"]`) |
| **Featured** | `true` si quieres destacarlo en la home, `false` si no |
| **Featured image** | Sube una imagen (o déjala para después) |
| **Content** | Copia TODO el contenido del artículo (desde el H1 hasta el final) |
| **SEO title** | Opcional: versión corta del título |
| **SEO description** | Opcional: copia el excerpt |

### 5.4 Publicar
1. Revisa que todo se vea bien
2. Click en **"Publish"** (botón verde abajo a la derecha)
3. ¡Listo! El post aparecerá en el sitio web

---

## ⚡ Ejemplo Completo

### Lo que ChatGPT te da:
```yaml
---
title: "5 Signs Your Home Needs a Deep Cleaning in Orlando"
description: "Discover the top 5 signs that indicate your Orlando home needs professional deep cleaning services."
publishedAt: "2026-03-13"
category: "Tips"
tags: ["deep cleaning", "orlando", "home maintenance", "signs"]
featured: false
image: "/images/blog/deep-cleaning-signs-orlando.jpeg"
---

# 5 Signs Your Home Needs a Deep Cleaning in Orlando

Living in Orlando means dealing with humidity, dust, and allergens...

## The Real Problem

**🏠 For Homeowners:**
- Dust buildup in vents
- Allergies getting worse
- Strange odors
...
```

### Lo que copias a Sanity:
- **Title:** `5 Signs Your Home Needs a Deep Cleaning in Orlando`
- **Slug:** Click "Generate" → `5-signs-your-home-needs-a-deep-cleaning-in-orlando`
- **Excerpt:** `Discover the top 5 signs that indicate your Orlando home needs professional deep cleaning services.`
- **Category:** `Tips`
- **Tags:** `deep cleaning`, `orlando`, `home maintenance`, `signs`
- **Content:** (todo desde `# 5 Signs...` hasta el final)

---

## ✅ Checklist Rápido

Antes de publicar, verifica:
- [ ] Título es claro y tiene "Orlando"
- [ ] Slug se generó automáticamente
- [ ] Excerpt tiene 150-160 caracteres
- [ ] Fecha es correcta
- [ ] Categoría tiene sentido
- [ ] Tags son relevantes
- [ ] Contenido tiene H2s, bullets y emojis
- [ ] Incluye CTA con 15% OFF y código INTEGRITY15
- [ ] Tiene testimonio de cliente

---

## 🎯 Ideas de Temas

**Si no sabes qué escribir, usa estos:**

**Servicios:**
- "Deep Cleaning vs Regular Cleaning: Which One Do You Need?"
- "Move-Out Cleaning: The Complete Checklist for Orlando Renters"
- "Airbnb Cleaning Secrets: How to Get 5-Star Reviews"
- "Post-Construction Cleaning: What to Expect"
- "Commercial Cleaning Benefits for Orlando Businesses"

**Problemas:**
- "How to Get Rid of Pet Odors Permanently"
- "Spring Cleaning Checklist for Florida Homes"
- "The Health Benefits of Professional Cleaning"
- "How Often Should You Clean Your Home?"
- "Moving to Orlando? Essential Cleaning Guide"

**Audiencias:**
- "Cleaning Tips for Busy Professionals"
- "Allergy Relief Through Professional Cleaning"
- "Safe Cleaning for Families with Kids"
- "Property Manager's Guide to Turnover Cleaning"
- "Senior Living: Safe Home Cleaning Practices"

---

## 🆘 Solución de Problemas

**El post no aparece en el sitio web:**
- Espera 1-5 minutos y recarga la página
- Verifica que hiciste click en "Publish" (no solo "Save")

**Las imágenes no se ven:**
- Asegúrate de subir una imagen en "Featured image"
- El nombre del archivo debe ser descriptivo

**El formato se ve raro:**
- En el campo "Content", asegúrate de que los headers tengan `#` o `##`
- Las listas deben tener `-` al inicio de cada línea

**No sé qué categoría elegir:**
- **Services** = Habla de un servicio específico que ofrecemos
- **Tips** = Consejos y guías prácticas
- **Guides** = Tutoriales paso a paso
- **Airbnb** = Específico para hosts de Airbnb
- **Eco-Friendly** = Sobre limpieza verde/ecológica

---

## 📞 Contacto

¿Necesitas ayuda?
- Revisa la guía completa: `docs/content/chatgpt-blog-template.md`
- Contacta al equipo técnico

---

**¡Feliz escritura!** 🎉
