/**
 * Speculation Rules Loader
 * Loads Speculation Rules for intelligent prefetching
 * Updated: 2025 - PageSpeed optimization
 */

'use client';

import { useEffect } from 'react';

/**
 * Load Speculation Rules for prefetching
 * Only loads if browser supports the API
 */
export function SpeculationRules() {
  useEffect(() => {
    // Check if browser supports Speculation Rules API
    if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) {
      return;
    }

    // Create speculation rules script
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.src = '/speculation-rules.json';
    script.id = 'speculation-rules';

    // Remove existing if present
    const existing = document.getElementById('speculation-rules');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);
  }, []);

  return null;
}

/**
 * Prefetch a specific URL programmatically
 * Use for high-priority navigation
 */
export function prefetchUrl(url: string): void {
  if (typeof window === 'undefined') return;

  if (
    HTMLScriptElement.supports &&
    HTMLScriptElement.supports('speculationrules')
  ) {
    const speculation = document.querySelector(
      'script[type="speculationrules"]'
    ) as unknown as { setAttribute: (key: string, value: string) => void };

    if (speculation) {
      // Update rules to prefetch specific URL
      const rules = {
        prefetch: [
          {
            source: 'list',
            urls: [url],
            eagerness: 'immediate',
          },
        ],
      };

      speculation.setAttribute(
        'dangerouslySetInnerHTML',
        JSON.stringify(rules)
      );
    }
  }
}

/**
 * Prefetch URLs from DOM selectors
 * Useful for links in viewport
 */
export function prefetchVisibleLinks(): void {
  if (typeof window === 'undefined') return;

  // Get links in viewport (first 2 for performance)
  const links = document.querySelectorAll(
    'a[href^="/services"]:not([href*="?"]), a.cta-button'
  );

  const urls: string[] = [];
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && !urls.includes(href)) {
      urls.push(href);
    }
    if (urls.length >= 2) return;
  });

  if (urls.length > 0 && HTMLScriptElement.supports?.('speculationrules')) {
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify({
      prefetch: [
        {
          source: 'list',
          urls,
          eagerness: 'moderate',
        },
      ],
    });
    document.head.appendChild(script);
  }
}
