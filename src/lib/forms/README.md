# Form Utilities - Enterprise-Grade Form Handling

Este módulo proporciona patrones escalables de manejo de formularios, siguiendo las mejores prácticas de empresas premium como **Stripe**, **Linear** y **Vercel**.

## 🎯 Principios de Diseño

### 1. **Escalabilidad**
- Usa `Record<string, string>` para errores (no objetos fijos)
- Permite agregar campos sin cambiar tipos
- Compatible con 2026-2027+ requirements

### 2. **Type Safety**
- TypeScript estricto en todo momento
- Tipos compartidos y reutilizables
- Inferencia automática de tipos

### 3. **Consistencia**
- Mismo patrón en todos los formularios
- Validadores reutilizables
- Utilities compartidas

## 📦 Uso Básico

### Patrón Escalable de Errores

```tsx
import { useState } from 'react';
import type { FormErrors } from '@/lib/forms';
import { createEmptyErrors } from '@/lib/forms';

// ✅ CORRECTO: Escalable y flexible
const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());

// ❌ INCORRECTO: Objeto fijo (no escalable)
const [errors, setErrors] = useState({
  name: "",
  email: "",
  // Problema: agregar un campo requiere cambiar el tipo
});
```

### Validación con Validators Reutilizables

```tsx
import { validateEmail, validatePhone, validateRequired } from '@/lib/forms';

const validate = (): boolean => {
  const newErrors: FormErrors = {};

  // Usar validators reutilizables
  const emailError = validateEmail(formData.email);
  if (emailError) newErrors.email = emailError;

  const phoneError = validatePhone(formData.number, true);
  if (phoneError) newErrors.number = phoneError;

  const messageError = validateRequired(formData.message, "Message");
  if (messageError) newErrors.message = messageError;

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Limpiar Errores al Cambiar Campo

```tsx
import { clearFieldError } from '@/lib/forms';

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  // Limpiar error cuando el usuario empieza a escribir
  if (errors[name]) {
    setErrors(prev => clearFieldError(prev, name));
  }
};
```

## 🔧 Validators Disponibles

### `validateEmail(email: string): string | undefined`
Valida formato de email (RFC 5322 compliant).

### `validatePhone(phone: string, required?: boolean): string | undefined`
Valida números de teléfono (10-15 dígitos, E.164 compatible).

### `validateRequired(value: string, fieldName?: string): string | undefined`
Valida que un campo no esté vacío.

### `validateZipCode(zip: string, required?: boolean): string | undefined`
Valida código postal US (5 dígitos).

### `validateName(name: string, required?: boolean): string | undefined`
Valida nombres (letras, espacios, guiones, apostrofes).

### `validateLength(value: string, min: number, max: number, fieldName?: string): string | undefined`
Valida longitud de string.

### `composeValidators(...validators): FieldValidator`
Combina múltiples validators para un campo.

## 🛠️ Utilities Disponibles

- `createEmptyErrors()`: Crea objeto de errores vacío
- `clearFieldError(errors, fieldName)`: Limpia error de un campo
- `setFieldError(errors, fieldName, error)`: Establece error de un campo
- `mergeErrors(...errorObjects)`: Combina múltiples objetos de errores
- `hasErrors(errors)`: Verifica si hay errores
- `getFirstErrorField(errors)`: Obtiene el primer campo con error
- `createValidationResult(isValid, errors)`: Crea resultado de validación

## 📋 Comparación: Antes vs Después

### ❌ Antes (Parche - No Escalable)
```tsx
const [errors, setErrors] = useState({
  name: "",
  email: "",
  message: "",
  submit: "" // Problema: estructura fija
});

// Agregar un campo nuevo requiere:
// 1. Cambiar el tipo del estado
// 2. Actualizar todas las referencias
// 3. Modificar la función reset()
```

### ✅ Después (Escalable - Enterprise-Grade)
```tsx
const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());

// Agregar un campo nuevo:
// 1. Solo agregar el campo al formData
// 2. Agregar validación si es necesario
// 3. ¡Listo! El sistema de errores se adapta automáticamente
```

## 🚀 Migración de Formularios Existentes

Para migrar un formulario existente:

1. **Cambiar tipo de errores:**
   ```tsx
   // Antes
   const [errors, setErrors] = useState({ name: "", email: "" });

   // Después
   const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());
   ```

2. **Usar validators reutilizables:**
   ```tsx
   // Antes
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) newErrors.email = "Invalid email";

   // Después
   const emailError = validateEmail(email);
   if (emailError) newErrors.email = emailError;
   ```

3. **Actualizar manejo de errores:**
   ```tsx
   // Antes
   setErrors({ name: newErrors.name || "", email: newErrors.email || "" });

   // Después
   setErrors(newErrors); // Más simple y escalable
   ```

## 📚 Referencias

- **Stripe**: Usa `Record<string, string>` para errores de formulario
- **Linear**: Validators reutilizables y composición
- **Vercel**: Type-safe form handling con TypeScript estricto

## ✅ Checklist para Nuevos Formularios

- [ ] Usar `FormErrors` type (no objetos fijos)
- [ ] Usar `createEmptyErrors()` para inicializar
- [ ] Usar validators reutilizables de `@/lib/forms`
- [ ] Limpiar errores con `clearFieldError()` al cambiar campos
- [ ] Mantener consistencia con otros formularios del proyecto

---

**Última actualización:** 2025-12-29
**Compatibilidad:** Next.js 16+, TypeScript 5+, React 19+
