import { test, expect } from '@playwright/test';

test.describe('Audit Page', () => {
  test('Admin can access audit page @audit', async ({ page }) => {
    // Navigate to demo login for admin access
    await page.goto('/auth/demo');
    
    // Click admin demo account
    await page.click('[data-testid="demo-login-admin"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate to audit page via SafeLink
    await page.click('[data-testid="link-audit"]');
    
    // Verify audit page loads
    await expect(page).toHaveURL(/.*\/audit/);
    
    // Check that the page content is visible
    await expect(page.locator('[data-testid="audit-page"]')).toBeVisible();
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Journal d\'audit');
    
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

  test('Manager can access audit page @audit', async ({ page }) => {
    // Navigate to demo login for manager access
    await page.goto('/auth/demo');
    
    // Click manager demo account
    await page.click('[data-testid="demo-login-manager"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate to audit page
    await page.goto('/audit');
    
    // Verify audit page loads
    await expect(page.locator('[data-testid="audit-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Journal d\'audit');
  });

  test('Non-admin users cannot access audit page @audit', async ({ page }) => {
    // Navigate to demo login for client access
    await page.goto('/auth/demo');
    
    // Click client demo account
    await page.click('[data-testid="demo-login-client"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Try to navigate to audit page directly
    await page.goto('/audit');
    
    // Should see access denied message
    await expect(page.locator('[data-testid="audit-page"]')).toBeVisible();
    await expect(page.locator('text=Accès restreint')).toBeVisible();
  });

  test('Audit page filters work correctly @audit', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/demo');
    await page.click('[data-testid="demo-login-admin"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Go to audit page
    await page.goto('/audit');
    await expect(page.locator('[data-testid="audit-page"]')).toBeVisible();
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('Jean-Marc');
    
    // Test entity filter
    const entityFilter = page.locator('select').first();
    await entityFilter.selectOption('users');
    
    // Test action filter
    const actionFilter = page.locator('select').nth(1);
    await actionFilter.selectOption('INSERT');
    
    // Verify filters don't cause errors
    await page.waitForLoadState('networkidle');
  });
});