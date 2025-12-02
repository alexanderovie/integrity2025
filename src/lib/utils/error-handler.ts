/**
 * Sistema de Manejo de Errores Escalable y Robusto
 * Actualizado: Diciembre 2025
 *
 * Implementa mejores prácticas modernas para manejo de errores:
 * - Clasificación de errores por tipo
 * - Logging estructurado
 * - Respuestas consistentes
 * - Trazabilidad de errores
 */

export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMIT = "RATE_LIMIT",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  DATABASE = "DATABASE",
  NETWORK = "NETWORK",
  INTERNAL = "INTERNAL",
  PAYMENT = "PAYMENT",
}

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  userId?: string;
  stack?: string;
}

export interface StructuredError {
  message: string;
  metadata: ErrorMetadata;
  publicMessage: string;
  statusCode: number;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Crea un error estructurado con metadata completa
 */
export function createStructuredError(
  error: unknown,
  category: ErrorCategory = ErrorCategory.INTERNAL,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  statusCode: number = 500,
  context?: Record<string, unknown>
): StructuredError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Determinar severidad basado en la categoría
  const finalSeverity = severity === ErrorSeverity.MEDIUM
    ? getSeverityByCategory(category)
    : severity;

  const metadata: ErrorMetadata = {
    category,
    severity: finalSeverity,
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    },
    ...(stack && !isProduction && { stack }),
  };

  // Mensaje público seguro
  const publicMessage = getPublicErrorMessage(category, errorMessage);

  return {
    message: errorMessage,
    metadata,
    publicMessage,
    statusCode,
  };
}

/**
 * Determina la severidad basada en la categoría
 */
function getSeverityByCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.RATE_LIMIT:
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.LOW;

    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.MEDIUM;

    case ErrorCategory.EXTERNAL_SERVICE:
    case ErrorCategory.DATABASE:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.HIGH;

    case ErrorCategory.PAYMENT:
    case ErrorCategory.INTERNAL:
      return ErrorSeverity.CRITICAL;

    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Genera un mensaje público seguro según la categoría
 */
function getPublicErrorMessage(category: ErrorCategory, originalMessage: string): string {
  if (!isProduction) {
    return originalMessage;
  }

  switch (category) {
    case ErrorCategory.VALIDATION:
      return "Los datos proporcionados no son válidos. Por favor, revisa e intenta de nuevo.";

    case ErrorCategory.AUTHENTICATION:
      return "No se pudo verificar tu identidad. Por favor, intenta iniciar sesión nuevamente.";

    case ErrorCategory.AUTHORIZATION:
      return "No tienes permisos para realizar esta acción.";

    case ErrorCategory.NOT_FOUND:
      return "El recurso solicitado no fue encontrado.";

    case ErrorCategory.RATE_LIMIT:
      return "Has realizado demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.";

    case ErrorCategory.EXTERNAL_SERVICE:
      return "El servicio temporalmente no está disponible. Por favor, intenta más tarde.";

    case ErrorCategory.DATABASE:
      return "Hubo un problema al procesar tu solicitud. Nuestro equipo ha sido notificado.";

    case ErrorCategory.NETWORK:
      return "Hubo un problema de conexión. Por favor, verifica tu internet e intenta de nuevo.";

    case ErrorCategory.PAYMENT:
      return "Hubo un problema al procesar el pago. Por favor, verifica tus datos e intenta de nuevo.";

    case ErrorCategory.INTERNAL:
    default:
      return "Ocurrió un error inesperado. Nuestro equipo ha sido notificado.";
  }
}

/**
 * Log estructurado de errores para monitoreo
 */
export function logError(structuredError: StructuredError, additionalContext?: Record<string, unknown>) {
  const logData = {
    ...structuredError.metadata,
    message: structuredError.message,
    publicMessage: structuredError.publicMessage,
    statusCode: structuredError.statusCode,
    ...additionalContext,
  };

  // En producción, enviar a servicio de logging (Sentry, LogRocket, etc.)
  if (isProduction) {
    // TODO: Integrar con servicio de logging
    console.error("[ERROR]", JSON.stringify(logData, null, 2));

    // Para errores críticos, considerar alertas
    if (structuredError.metadata.severity === ErrorSeverity.CRITICAL) {
      // TODO: Enviar alerta a equipo
      console.error("[CRITICAL ERROR] Alert team:", structuredError.metadata.category);
    }
  } else {
    // En desarrollo, log detallado
    console.error("\n=== ERROR DETAILS ===");
    console.error("Message:", structuredError.message);
    console.error("Category:", structuredError.metadata.category);
    console.error("Severity:", structuredError.metadata.severity);
    console.error("Context:", structuredError.metadata.context);
    if (structuredError.metadata.stack) {
      console.error("\nStack:", structuredError.metadata.stack);
    }
    console.error("====================\n");
  }
}

/**
 * Helper para crear respuestas HTTP de error consistentes
 * Retorna una respuesta estructurada y type-safe
 */
export function createErrorResponse(structuredError: StructuredError): {
  statusCode: number;
  body: {
    error: {
      message: string;
      code?: string;
      category?: string;
      requestId?: string;
    };
  };
} {
  const response: {
    statusCode: number;
    body: {
      error: {
        message: string;
        code?: string;
        category?: string;
        requestId?: string;
      };
    };
  } = {
    statusCode: structuredError.statusCode,
    body: {
      error: {
        message: structuredError.publicMessage,
      },
    },
  };

  // En desarrollo, agregar más detalles
  if (!isProduction) {
    response.body.error.code = structuredError.metadata.code;
    response.body.error.category = structuredError.metadata.category;
  }

  // Agregar requestId si está disponible
  if (structuredError.metadata.requestId) {
    response.body.error.requestId = structuredError.metadata.requestId;
  }

  return response;
}

/**
 * Helper para errores de validación (Zod)
 */
export function handleValidationError(
  error: unknown,
  context?: Record<string, unknown>
): StructuredError {
  if (isZodError(error)) {
    const zodError = error as { issues: Array<{ message: string; path: (string | number)[] }> };
    const firstIssue = zodError.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation error";

    return createStructuredError(
      new Error(message),
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      400,
      { validationIssues: zodError.issues, ...context }
    );
  }

  return createStructuredError(
    error,
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    400,
    context
  );
}

/**
 * Helper para errores de servicios externos
 */
export function handleExternalServiceError(
  service: string,
  error: unknown,
  context?: Record<string, unknown>
): StructuredError {
  return createStructuredError(
    error,
    ErrorCategory.EXTERNAL_SERVICE,
    ErrorSeverity.HIGH,
    502,
    { service, ...context }
  );
}

/**
 * Helper para errores de rate limiting
 */
export function handleRateLimitError(
  limit: number,
  window: string,
  context?: Record<string, unknown>
): StructuredError {
  return createStructuredError(
    new Error(`Rate limit exceeded: ${limit} requests per ${window}`),
    ErrorCategory.RATE_LIMIT,
    ErrorSeverity.LOW,
    429,
    { limit, window, ...context }
  );
}

/**
 * Verifica si es un error de Zod
 */
function isZodError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  );
}

/**
 * Extrae información útil de errores de servicios externos
 */
export function extractExternalErrorInfo(error: unknown): {
  message: string;
  statusCode?: number;
  code?: string;
} {
  if (error instanceof Error) {
    // Intentar extraer información de errores HTTP
    const httpMatch = error.message.match(/HTTP (\d+)/);
    const statusCode = httpMatch ? parseInt(httpMatch[1]) : undefined;

    return {
      message: error.message,
      statusCode,
    };
  }

  return {
    message: String(error),
  };
}
