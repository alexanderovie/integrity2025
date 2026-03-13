# 📋 Resumen de Smoke Tests - Workflows de Negocio

## 🎯 Propósito

Estos tests verifican que **todos los flujos de conversión** de tu sitio web funcionan correctamente 24/7. Si algo se rompe, los tests lo detectan inmediatamente.

---

## ✅ Workflows Protegidos (35+ tests)

### **P0 - CRÍTICOS (Si fallan, pierdes dinero)**

#### 1. 🌐 Cliente Orgánico (SEO)
**Qué prueba:**
- Usuario llega desde Google → Landing page → Formulario → Lead creado
- UTM parameters se preservan correctamente
- Formulario envía datos a HubSpot

**Comando para correr:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "Cliente Orgánico SEO"
```

#### 2. 💰 Tráfico Pagado (Google Ads)
**Qué prueba:**
- Click de anuncio → Stripe checkout funciona
- Precios válidos aceptados, precios inválidos rechazados
- Sesión de Stripe creada correctamente

**Comando:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "Tráfico Pagado"
```

#### 3. 📱 Facebook/Instagram Ads
**Qué prueba:**
- Meta Pixel dispara eventos (PageView, Lead)
- Conversions API responde correctamente
- Tracking no se rompe

**Comando:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "Facebook/Instagram"
```

#### 4. ✉️ Contacto General
**Qué prueba:**
- Formulario de contacto envía emails
- Teléfono y email son visibles
- Múltiples métodos de contacto funcionan

**Comando:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "Contacto General"
```

#### 5. 🛡️ Seguridad (Anti-Spam)
**Qué prueba:**
- Rate limiting bloquea spam (429 después de 10 requests)
- Bots bloqueados (403)
- XSS/SQL injection rechazados (400)

**Comando:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "SEGURIDAD"
```

---

### **P1 - IMPORTANTES (Impactan conversiones)**

#### 6. 🏠 Airbnb Host
- Landing específico para hosts
- Formulario funciona
- Contenido relevante visible

#### 7. 📦 Move-in/Move-out
- Landing de mudanzas carga
- CTA visible y funcional

#### 8. 📰 Newsletter/Blog
- Posts cargan correctamente
- Suscripción newsletter funciona
- Estructura de posts correcta

#### 9. 💼 Aplicación de Trabajo
- Página de careers carga
- Formulario de aplicación funciona

#### 10. 🆘 Soporte/Feedback
- Formulario de ayuda envía tickets

---

### **P2 - PERFORMANCE Y UX**

#### 11. ⚡ Performance
- Páginas críticas cargan en < 3 segundos
- No hay errores JavaScript críticos
- Mobile responsive funciona

---

## 🚀 Cómo Usar

### **Correr todos los tests:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --project=chromium
```

### **Correr solo tests críticos (P0):**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "P0"
```

### **Correr un workflow específico:**
```bash
BASE_URL=https://integritycleansolutions.com pnpm exec playwright test tests/smoke/workflows-critical.spec.ts --grep "Stripe"
```

---

## 📊 Interpretación de Resultados

### **Si PASA (✅):**
- Todo el funnel de conversión funciona
- Lead generation está operativo
- Pagos procesan correctamente
- Seguridad protege contra spam

### **Si FALLA (❌):**

| Fallo | Impacto | Acción Inmediata |
|-------|---------|------------------|
| Stripe checkout | No hay ventas | Revisar API keys |
| Formulario quote | No hay leads | Verificar HubSpot |
| Meta Pixel | Ads no optimizan | Revisar pixel ID |
| Rate limiting | Spam masivo | Verificar Redis |
| Contact form | Clientes no pueden contactar | Revisar Resend |

---

## 🔧 Mantenimiento

### **Frecuencia recomendada:**
- **Antes de deploys grandes:** Siempre
- **Semanalmente:** En CI/CD automático
- **Diariamente:** Para sitios de alto tráfico

### **Alertas automáticas:**
Configura en tu CI/CD para que:
1. Corra tests automáticamente
2. Si fallan, bloquee el deploy
3. Notifique al equipo vía Slack/email

---

## 💡 Tips para el Dueño

### **Qué hacer si un test falla:**

1. **No entres en pánico** - El test detectó el problema antes que un cliente
2. **Revisa el error específico** - El test te dice exactamente qué pasó
3. **Verifica servicios externos** - Stripe, HubSpot, Redis pueden estar caídos
4. **Contacta al developer** - Mándale el log del error

### **Tests que más importan para tu negocio:**

1. **Stripe checkout** - Si esto falla, no vendes
2. **Formulario quote** - Si esto falla, no generas leads
3. **Meta Pixel** - Si esto falla, tus ads no optimizan
4. **Rate limiting** - Si esto falla, te llenan de spam

---

## 📞 Contacto

Si necesitas ayuda interpretando los tests o configurando alertas, contacta al equipo de desarrollo.

**Estado actual:** Todos los tests críticos deben pasar para considerar el sitio "saludable".

---

**Documento creado:** 2026-03-13  
**Total de tests:** 35+  
**Cobertura:** 100% de workflows de negocio críticos
