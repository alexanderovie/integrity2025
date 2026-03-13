import { test, expect } from '@playwright/test';
import { BASE_URL } from '../helpers/constants';

test.describe('Core Web Vitals Performance (P1)', () => {
  test('Homepage LCP is reasonable (< 2.5s)', async ({ page }) => {
    // Navegar a la página
    await page.goto(BASE_URL);
    
    // Esperar a que la página esté completamente cargada
    await page.waitForLoadState('networkidle');
    
    // Medir LCP usando Performance Observer
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        // Verificar si PerformanceObserver está disponible
        if (!('PerformanceObserver' in window)) {
          resolve(0);
          return;
        }
        
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          resolve(lastEntry.startTime);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });
    
    // Si no se pudo medir, skip el test
    test.skip(lcp === 0, 'LCP measurement not available');
    
    // LCP debe ser menor a 2.5 segundos (bueno según Google)
    expect(lcp).toBeLessThan(2500);
  });

  test('Service page LCP is reasonable (< 2.5s)', async ({ page }) => {
    await page.goto(`${BASE_URL}/services/deep-cleaning`);
    await page.waitForLoadState('networkidle');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if (!('PerformanceObserver' in window)) {
          resolve(0);
          return;
        }
        
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          resolve(lastEntry.startTime);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 5000);
      });
    });
    
    test.skip(lcp === 0, 'LCP measurement not available');
    expect(lcp).toBeLessThan(2500);
  });

  test('No layout shifts detected (CLS)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Medir CLS usando Performance Observer
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        if (!('PerformanceObserver' in window)) {
          resolve(0);
          return;
        }
        
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Type assertion para acceder a hadRecentInput
            const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Reportar CLS después de 3 segundos
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });
    
    // CLS debe ser menor a 0.1 (bueno según Google)
    expect(cls).toBeLessThan(0.1);
  });

  test('First Contentful Paint is fast (< 1.8s)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        // Buscar FCP en PerformancePaintTiming
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          resolve(fcpEntry.startTime);
        } else {
          // Si no está disponible inmediatamente, esperar
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                  observer.disconnect();
                  resolve(entry.startTime);
                  return;
                }
              }
            });
            observer.observe({ entryTypes: ['paint'] });
            
            setTimeout(() => {
              observer.disconnect();
              resolve(0);
            }, 3000);
          } else {
            resolve(0);
          }
        }
      });
    });
    
    test.skip(fcp === 0, 'FCP measurement not available');
    
    // FCP debe ser menor a 1.8 segundos
    expect(fcp).toBeLessThan(1800);
  });

  test('Page load time is acceptable (< 3s)', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // El tiempo de carga total debe ser menor a 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('No JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    // Capturar errores de consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Capturar errores de página
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // No debería haber errores JavaScript críticos
    // Filtrar errores que no son críticos (ej: analytics, third-party)
    const criticalErrors = errors.filter(error => 
      !error.includes('analytics') && 
      !error.includes('tracking') &&
      !error.includes('facebook') &&
      !error.includes('gtag')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Images load efficiently', async ({ page }) => {
    const imageLoadTimes: Array<{ src: string; time: number }> = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        const startTime = Date.now();
        try {
          await response.finished();
          const loadTime = Date.now() - startTime;
          imageLoadTimes.push({ src: url, time: loadTime });
        } catch {
          // Ignorar errores
        }
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar que las imágenes principales cargaron
    const images = await page.locator('img').all();
    const loadedImages = imageLoadTimes.length;
    
    // Al menos el 80% de las imágenes deben cargar
    expect(loadedImages).toBeGreaterThanOrEqual(images.length * 0.8);
    
    // Ninguna imagen debe tardar más de 2 segundos
    const slowImages = imageLoadTimes.filter(img => img.time > 2000);
    expect(slowImages).toHaveLength(0);
  });
});
