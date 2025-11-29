/**
 * Constantes y utilidades para el pipeline de deals
 * Define los stages del pipeline y funciones helper
 */

/**
 * Stages del pipeline de deals (ordenados por flujo)
 */
export const DEAL_STAGES = {
  LEAD_CAPTURED: "lead_captured",
  QUOTE_REQUESTED: "quote_requested",
  QUOTE_SENT: "quote_sent",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_COMPLETED: "payment_completed",
  SERVICE_SCHEDULED: "service_scheduled",
  SERVICE_COMPLETED: "service_completed",
  CLOSED_WON: "closedwon",
  CLOSED_LOST: "closedlost",
} as const;

export type DealStage = (typeof DEAL_STAGES)[keyof typeof DEAL_STAGES];

/**
 * Pipeline por defecto de HubSpot (puede variar según tu cuenta)
 */
export const DEFAULT_PIPELINE = "default";

/**
 * Mapeo de stages a nombres legibles
 */
export const STAGE_LABELS: Record<DealStage, string> = {
  [DEAL_STAGES.LEAD_CAPTURED]: "Lead Captured",
  [DEAL_STAGES.QUOTE_REQUESTED]: "Quote Requested",
  [DEAL_STAGES.QUOTE_SENT]: "Quote Sent",
  [DEAL_STAGES.PAYMENT_PENDING]: "Payment Pending",
  [DEAL_STAGES.PAYMENT_COMPLETED]: "Payment Completed",
  [DEAL_STAGES.SERVICE_SCHEDULED]: "Service Scheduled",
  [DEAL_STAGES.SERVICE_COMPLETED]: "Service Completed",
  [DEAL_STAGES.CLOSED_WON]: "Closed Won",
  [DEAL_STAGES.CLOSED_LOST]: "Closed Lost",
};

/**
 * Obtiene el siguiente stage del pipeline
 */
export function getNextStage(currentStage: DealStage): DealStage | null {
  const stages = Object.values(DEAL_STAGES);
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }

  return stages[currentIndex + 1];
}

/**
 * Obtiene el stage anterior del pipeline
 */
export function getPreviousStage(currentStage: DealStage): DealStage | null {
  const stages = Object.values(DEAL_STAGES);
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  return stages[currentIndex - 1];
}

/**
 * Verifica si un stage es un stage final (Won o Lost)
 */
export function isFinalStage(stage: DealStage): boolean {
  return stage === DEAL_STAGES.CLOSED_WON || stage === DEAL_STAGES.CLOSED_LOST;
}

/**
 * Verifica si un stage indica que el deal está activo
 */
export function isActiveStage(stage: DealStage): boolean {
  return !isFinalStage(stage);
}

/**
 * Obtiene el stage apropiado basado en el evento
 */
export function getStageFromEvent(event: string): DealStage {
  switch (event) {
    case "newsletter_subscription":
    case "form_submission":
      return DEAL_STAGES.LEAD_CAPTURED;
    case "quote_form_completed":
      return DEAL_STAGES.QUOTE_REQUESTED;
    case "stripe_checkout_started":
      return DEAL_STAGES.QUOTE_SENT;
    case "stripe_checkout_session_created":
      return DEAL_STAGES.PAYMENT_PENDING;
    case "stripe_payment_completed":
      return DEAL_STAGES.PAYMENT_COMPLETED;
    case "service_scheduled":
      return DEAL_STAGES.SERVICE_SCHEDULED;
    case "service_completed":
      return DEAL_STAGES.SERVICE_COMPLETED;
    case "deal_won":
      return DEAL_STAGES.CLOSED_WON;
    case "deal_lost":
      return DEAL_STAGES.CLOSED_LOST;
    default:
      return DEAL_STAGES.LEAD_CAPTURED;
  }
}
