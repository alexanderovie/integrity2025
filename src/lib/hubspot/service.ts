import { Client } from "@hubspot/api-client";
import { Redis } from "@upstash/redis";

/**
 * HUBSPOT SERVICE - ENTERPRISE GRADE
 * 
 * Basado en documentación oficial HubSpot API v3:
 * https://developers.hubspot.com/docs/api/crm/contacts
 * 
 * Features:
 * - UPSERT (create/update in one call) usando batch/upsert
 * - Batching: 100 contacts por request (límite HubSpot)
 * - Rate limiting: 100 requests/10 seconds (free tier)
 * - Retry queue con Redis
 * - Circuit breaker
 * - Graceful degradation
 * 
 * Rate Limits Free Tier:
 * - 100 requests per 10 seconds = 10 req/sec
 * - Batch: 100 records per request
 * 
 * Escalable a: Enterprise (sin cambios de código)
 */

const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const BATCH_SIZE = 100; // HubSpot limit
const RETRY_MAX_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 1000;

interface ContactData {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  [key: string]: any;
}

interface UpsertResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  queued: number;
}

interface HubSpotServiceConfig {
  accessToken: string;
  redis: Redis;
}

// HubSpot API Types basado en documentación oficial
// https://developers.hubspot.com/docs/api/crm/contacts

interface HubSpotUpsertInput {
  id: string;
  idProperty?: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    [key: string]: string | undefined;
  };
}

interface HubSpotBatchUpsertRequest {
  inputs: HubSpotUpsertInput[];
}

interface HubSpotUpsertResult {
  id: string;
  properties: {
    email: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface HubSpotUpsertError {
  id: string;
  message: string;
  properties?: {
    email?: string;
  };
}

interface HubSpotBatchUpsertResponse {
  status: string;
  results?: HubSpotUpsertResult[];
  errors?: HubSpotUpsertError[];
}

export class HubSpotService {
  private client: Client;
  private redis: Redis;
  private requestCount = 0;
  private windowStart = Date.now();
  private circuitState: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly CIRCUIT_THRESHOLD = 5;
  private readonly CIRCUIT_TIMEOUT = 60000;

  constructor(config: HubSpotServiceConfig) {
    this.client = new Client({ accessToken: config.accessToken });
    this.redis = config.redis;
  }

  /**
   * UPSERT Contact (Create or Update)
   * 
   * Usa batch/upsert endpoint que:
   * - Crea el contacto si no existe
   * - Actualiza si ya existe (por email)
   * - Una sola llamada API eficiente
   * 
   * Documentación: 
   * https://developers.hubspot.com/docs/api/crm/contacts#upsert-contacts
   */
  async upsertContact(contact: ContactData): Promise<{
    success: boolean;
    contactId?: string;
    status: "created" | "updated" | "failed" | "queued";
    error?: string;
  }> {
    // Check circuit breaker
    if (this.isCircuitOpen()) {
      await this.queueForRetry(contact);
      return {
        success: false,
        status: "queued",
        error: "HubSpot circuit breaker open, queued for retry",
      };
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      await this.queueForRetry(contact);
      return {
        success: false,
        status: "queued",
        error: "Rate limit reached, queued for retry",
      };
    }

    try {
      // Use UPSERT endpoint (create or update in one call)
      // idProperty: "email" means we match by email address
      // Type assertion based on official HubSpot API documentation
      const requestBody: HubSpotBatchUpsertRequest = {
        inputs: [
          {
            id: contact.email,
            idProperty: "email",
            properties: {
              email: contact.email,
              firstname: contact.firstname || "",
              lastname: contact.lastname || "",
              phone: contact.phone || "",
              company: contact.company || "",
            },
          },
        ],
      };

      const rawResponse = await this.client.crm.contacts.batchApi.upsert(
        requestBody as any
      );
      // Cast through unknown to handle SDK type mismatches
      const response = rawResponse as unknown as HubSpotBatchUpsertResponse;

      this.onSuccess();

      // Determine if created or updated
      const result = response.results?.[0];
      const isNew = result?.createdAt === result?.updatedAt;

      return {
        success: true,
        contactId: result?.id,
        status: isNew ? "created" : "updated",
      };
    } catch (error: any) {
      this.onFailure();

      if (this.shouldRetry(error)) {
        await this.queueForRetry(contact);
        return {
          success: false,
          status: "queued",
          error: `HubSpot error: ${error.message}, queued for retry`,
        };
      }

      return {
        success: false,
        status: "failed",
        error: error.message,
      };
    }
  }

  /**
   * BATCH UPSERT - Máxima eficiencia para free tier
   * 
   * Procesa hasta 100 contactos en una sola llamada API
   * Esto permite 100 contacts por request = 10,000 contacts/10sec en free tier
   */
  async batchUpsertContacts(contacts: ContactData[]): Promise<UpsertResult> {
    if (contacts.length === 0) {
      return { success: true, created: 0, updated: 0, failed: 0, errors: [], queued: 0 };
    }

    // Circuit breaker check
    if (this.isCircuitOpen()) {
      await Promise.all(contacts.map((c) => this.queueForRetry(c)));
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: [],
        queued: contacts.length,
      };
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      await Promise.all(contacts.map((c) => this.queueForRetry(c)));
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: [],
        queued: contacts.length,
      };
    }

    try {
      // Prepare inputs for batch upsert
      const inputs = contacts.map((contact) => ({
        id: contact.email,
        idProperty: "email",
        properties: {
          email: contact.email,
          firstname: contact.firstname || "",
          lastname: contact.lastname || "",
          phone: contact.phone || "",
          company: contact.company || "",
        },
      }));

      // Call HubSpot batch upsert API
      const rawResponse = await this.client.crm.contacts.batchApi.upsert({
        inputs: inputs as any,
      } as any);

      // Cast through unknown to handle SDK type mismatches
      const response = rawResponse as unknown as HubSpotBatchUpsertResponse;

      this.onSuccess();

      // Process results
      const errors: Array<{ email: string; error: string }> = [];
      let created = 0;
      let updated = 0;

      if (response.results) {
        response.results.forEach((result) => {
          const isNew = result.createdAt === result.updatedAt;
          if (isNew) created++;
          else updated++;
        });
      }

      // Handle errors if any
      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((err) => {
          errors.push({
            email: err.id || "unknown",
            error: err.message || "Unknown error",
          });
        });
      }

      return {
        success: errors.length === 0,
        created,
        updated,
        failed: errors.length,
        errors,
        queued: 0,
      };
    } catch (error: any) {
      this.onFailure();

      // Queue all for retry
      await Promise.all(contacts.map((c) => this.queueForRetry(c)));
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: [],
        queued: contacts.length,
      };
    }
  }

  /**
   * Rate limiting - Token bucket algorithm
   * Free tier: 100 requests per 10 seconds
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset window if passed
    if (now - this.windowStart > RATE_LIMIT_WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if under limit (use 90% to be safe = 90 requests)
    if (this.requestCount < RATE_LIMIT_REQUESTS * 0.9) {
      this.requestCount++;
      return true;
    }

    return false;
  }

  /**
   * Queue for retry with exponential backoff
   */
  private async queueForRetry(contact: ContactData): Promise<void> {
    const queueItem = {
      ...contact,
      _retryCount: (contact._retryCount || 0) + 1,
      _queuedAt: Date.now(),
    };

    await this.redis.lpush("hubspot:retry:queue", JSON.stringify(queueItem));
  }

  /**
   * Process retry queue
   * Should be called periodically (e.g., every minute via cron)
   */
  async processRetryQueue(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const results = { processed: 0, successful: 0, failed: 0 };

    // Get items from queue (process in batches of 100 for efficiency)
    const items = await this.redis.lrange("hubspot:retry:queue", 0, BATCH_SIZE - 1);

    if (!items || items.length === 0) {
      return results;
    }

    // Parse contacts
    const contacts: Array<ContactData & { _retryCount: number; _queuedAt: number }> = [];
    for (const item of items) {
      try {
        const contact = JSON.parse(item);
        
        // Check if max retries reached
        if (contact._retryCount > RETRY_MAX_ATTEMPTS) {
          await this.redis.lpush("hubspot:dead:queue", item);
          await this.redis.lrem("hubspot:retry:queue", 1, item);
          results.failed++;
          continue;
        }

        // Check exponential backoff
        const delay = Math.pow(2, contact._retryCount) * RETRY_BASE_DELAY_MS;
        const timeSinceQueued = Date.now() - contact._queuedAt;

        if (timeSinceQueued < delay) {
          continue; // Not ready yet
        }

        contacts.push(contact);
      } catch (error) {
        console.error("Error parsing retry queue item:", error);
        results.failed++;
      }
    }

    // Process batch if we have contacts ready
    if (contacts.length > 0) {
      const batchResult = await this.batchUpsertContacts(contacts);
      results.processed += contacts.length;
      results.successful += batchResult.created + batchResult.updated;
      results.failed += batchResult.failed;

      // Remove processed items from queue
      for (const contact of contacts) {
        const item = JSON.stringify(contact);
        await this.redis.lrem("hubspot:retry:queue", 1, item);
      }
    }

    return results;
  }

  /**
   * Circuit breaker pattern
   * Prevents cascading failures
   */
  private isCircuitOpen(): boolean {
    if (this.circuitState === "open") {
      if (Date.now() - this.lastFailureTime > this.CIRCUIT_TIMEOUT) {
        this.circuitState = "half-open";
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.circuitState === "half-open") {
      this.circuitState = "closed";
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.CIRCUIT_THRESHOLD) {
      this.circuitState = "open";
    }
  }

  /**
   * Determine if error is retryable
   */
  private shouldRetry(error: any): boolean {
    // Retry on rate limits (429) or server errors (5xx)
    if (error.statusCode === 429 || error.statusCode >= 500) {
      return true;
    }
    // Don't retry on auth errors (401) or bad requests (400)
    if (error.statusCode === 401 || error.statusCode === 400) {
      return false;
    }
    return true;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    retryQueue: number;
    deadQueue: number;
    circuitState: string;
    failureCount: number;
  }> {
    const [retryQueue, deadQueue] = await Promise.all([
      this.redis.llen("hubspot:retry:queue"),
      this.redis.llen("hubspot:dead:queue"),
    ]);

    return {
      retryQueue: retryQueue || 0,
      deadQueue: deadQueue || 0,
      circuitState: this.circuitState,
      failureCount: this.failureCount,
    };
  }
}

// Singleton instance
let hubSpotService: HubSpotService | null = null;

export function getHubSpotService(config?: HubSpotServiceConfig): HubSpotService | null {
  if (hubSpotService) return hubSpotService;
  if (!config) return null;

  hubSpotService = new HubSpotService(config);
  return hubSpotService;
}

export function resetHubSpotService(): void {
  hubSpotService = null;
}

// Types
export type { ContactData, UpsertResult, HubSpotServiceConfig };
