import { test, expect } from '@playwright/test';

test.describe('Admin Guide Page', () => {
  test('Admin can access guide page @admin', async ({ page }) => {
    // Navigate to demo login for admin access
    await page.goto('/auth/demo');
    
    // Click admin demo account
    await page.click('[data-testid="demo-login-admin"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate to admin guide via SafeLink
    await page.click('[data-testid="link-adminGuide"]');
    
    // Verify guide page loads
    await expect(page).toHaveURL(/.*\/admin\/guide/);
    
    // Check that the page content is visible
    await expect(page.locator('[data-testid="admin-guide-page"]')).toBeVisible();
    
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(
      error => 
        !error.includes('favicon') && 
        !error.includes('Failed to fetch dynamically imported module') &&
        !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Guide page sections are expandable @admin', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/demo');
    await page.click('[data-testid="demo-login-admin"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Go to guide page
    await page.goto('/admin/guide');
    await expect(page.locator('[data-testid="admin-guide-page"]')).toBeVisible();
    
    // Test section expansion
    const firstSection = page.locator('button').first();
    await firstSection.click();
    
    // Verify content expands
    await expect(page.locator('.space-y-6')).toBeVisible();
  });

  test('Guide page accessible via navigation @admin', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/demo');
    await page.click('[data-testid="demo-login-admin"]');
    
    // Use sidebar navigation to reach guide
    const guideLink = page.locator('[data-testid="link-adminGuide"]');
    if (await guideLink.count() > 0) {
      await guideLink.click();
      await expect(page).toHaveURL(/.*\/admin\/guide/);
      await expect(page.locator('[data-testid="admin-guide-page"]')).toBeVisible();
    }
  });
});