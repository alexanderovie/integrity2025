/**
 * Analytics Web Worker
 * Off-main-thread analytics processing
 * Updated: 2025 - Future-proof architecture
 *
 * This worker handles analytics events without blocking the main thread
 * Reduces TBT by processing analytics in background thread
 */

// Message types from main thread
// const WorkerMessage = {
//   type: 'pageView' | 'event' | 'init',
//   data: Record<string, unknown>
// };

// Analytics configuration (from environment)
const ANALYTICS_CONFIG = {
  metaPixelId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_META_PIXEL_ID : undefined,
};

// Queue for batch sending
const eventQueue = [];
const BATCH_SIZE = 5;
const BATCH_DELAY = 1000; // 1 second

/**
 * Send to Meta Pixel via fetch beacon
 */
async function sendMetaEvent(pixelId, eventName, data) {
  if (!pixelId) return;

  try {
    const payload = {
      id: pixelId,
      event: eventName,
      ...data,
      _r: Math.random().toString(36).substring(7),
    };

    await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [payload],
      }),
    });
  } catch {
    // Silent fail - analytics is non-critical
  }
}

/**
 * Process queued events
 * Sends batched events to analytics providers
 */
function processQueue() {
  if (eventQueue.length === 0) return;

  const eventsToSend = eventQueue.splice(0, BATCH_SIZE);
  const pixelId = ANALYTICS_CONFIG.metaPixelId;

  eventsToSend.forEach((msg) => {
    if (msg.type === 'pageView' && pixelId) {
      sendMetaEvent(pixelId, 'PageView', { url: msg.data?.url });
    } else if (msg.type === 'event' && pixelId) {
      sendMetaEvent(pixelId, msg.data?.type, msg.data);
    }
  });
}

// Process queue periodically
if (typeof setInterval !== 'undefined') {
  setInterval(processQueue, BATCH_DELAY);
}

/**
 * Handle messages from main thread
 */
self.onmessage = function(event) {
  const msg = event.data;

  if (msg.type === 'init') {
    // Worker initialized
    return;
  }

  // Add to queue
  eventQueue.push(msg);

  // Process immediately for critical events
  if (msg.type === 'event' && msg.data?.critical) {
    processQueue();
  }
};

// Notify main thread worker is ready
self.postMessage({ type: 'ready' });
