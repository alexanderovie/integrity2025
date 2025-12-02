/**
 * Utilidades para manejo seguro de errores
 * Actualizado: Diciembre 2025
 *
 * Este archivo mantiene compatibilidad con el código existente.
 * Para nuevas implementaciones, usar src/lib/utils/error-handler.ts
 * que proporciona un sistema más robusto y escalable.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Genera un mensaje de error seguro para el cliente
 * En producción, oculta detalles técnicos
 */
export function getSafeErrorMessage(error: unknown): string {
  if (isProduction) {
    // En producción, devolver mensaje genérico
    return "An error occurred. Please try again later.";
  }

  // En desarrollo, mostrar detalles completos
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred";
}

/**
 * Genera respuesta de error estándar
 */
export function createErrorResponse(
  error: unknown,
  statusCode: number = 500,
  customMessage?: string
) {
  const message = customMessage || getSafeErrorMessage(error);

  // En desarrollo, incluir stack trace
  const response: {
    error: string;
    message: string;
    stack?: string;
  } = {
    error: statusCode === 500 ? "Internal Server Error" : "Request Error",
    message,
  };

  if (!isProduction && error instanceof Error && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Verifica si un error es un error de validación (Zod)
 */
export function isValidationError(error: unknown): boolean {
  // Zod errors tienen esta estructura
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  );
}

/**
 * Formatea errores de validación de Zod
 */
export function formatValidationError(error: unknown): string {
  if (isValidationError(error)) {
    const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> };
    const firstIssue = zodError.issues[0];
    if (firstIssue) {
      const path = firstIssue.path.join(".");
      return path ? `${path}: ${firstIssue.message}` : firstIssue.message;
    }
  }
  return getSafeErrorMessage(error);
}
