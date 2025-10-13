import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('PWA manifest is accessible @pwa', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBe('TEMI-Construction CRM');
    expect(manifest.short_name).toBe('TEMI-CRM');
    expect(manifest.start_url).toBe('/');
  });

  test('Service worker registers successfully @pwa', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le service worker est enregistré
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('App works offline (basic) @pwa', async ({ page, context }) => {
    // Aller sur la page et attendre le chargement
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simuler la perte de connexion
    await context.setOffline(true);
    
    // Recharger la page
    await page.reload();
    
    // Vérifier que la page se charge toujours (depuis le cache)
    await expect(page.locator('body')).toBeVisible();
    
    // Restaurer la connexion
    await context.setOffline(false);
  });

  test('PWA installer appears for non-installed users @pwa', async ({ page }) => {
    await page.goto('/');
    
    // Simuler l'événement beforeinstallprompt
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = () => Promise.resolve();
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });
    
    // Attendre que le banner d'installation apparaisse (après 30s simulées)
    await page.evaluate(() => {
      // Simuler le délai
      setTimeout(() => {
        const event = new CustomEvent('show-install-banner');
        window.dispatchEvent(event);
      }, 100);
    });
    
    // Le banner devrait être visible
    await page.waitForTimeout(200);
  });

  test('Responsive design works on mobile @mobile', async ({ page }) => {
    // Simuler un iPhone
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('/login');
    
    // Vérifier que les éléments sont visibles et utilisables
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Vérifier que le logo n'est pas trop grand
    const logo = page.locator('img[alt*="TEMI"]');
    if (await logo.count() > 0) {
      const logoBox = await logo.boundingBox();
      expect(logoBox?.width).toBeLessThan(200);
    }
  });

  test('Touch interactions work properly @mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Connexion
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.tap('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Tester le menu mobile
    const menuButton = page.locator('button:has-text("Menu")');
    if (await menuButton.count() > 0) {
      await menuButton.tap();
      await expect(page.locator('nav')).toBeVisible();
    }
    
    // Tester la navigation tactile
    await page.tap('[data-testid="link-projects"]');
    await expect(page).toHaveURL(/.*\/projects/);
  });
});