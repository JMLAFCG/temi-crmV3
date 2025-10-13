import { test, expect } from '@playwright/test';

test.describe('Messages Page', () => {
  test('should load messages page for admin user', async ({ page }) => {
    // Navigate to demo login
    await page.goto('/demo-login');
    
    // Login as admin
    await page.click('[data-testid="demo-admin"]');
    
    // Wait for dashboard to load
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Navigate to messages
    await page.click('a[href="/messages"]');
    
    // Verify messages page loads
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Messages');
    
    // Check for no console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(1000);
    
    // Filter out known harmless errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to fetch dynamically imported module') &&
      !error.includes('Loading chunk') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should allow searching conversations', async ({ page }) => {
    // Navigate and login
    await page.goto('/demo-login');
    await page.click('[data-testid="demo-admin"]');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Go to messages
    await page.click('a[href="/messages"]');
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('Martin');
    
    // Should show filtered results
    await expect(page.locator('text=Martin Dupont')).toBeVisible();
  });

  test('should allow message interaction for client user', async ({ page }) => {
    // Navigate and login as client
    await page.goto('/demo-login');
    await page.click('[data-testid="demo-client"]');
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Navigate to messages
    await page.click('a[href="/messages"]');
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
    
    // Select a conversation
    await page.click('text=Martin Dupont');
    
    // Test message input
    const messageInput = page.locator('input[placeholder*="Tapez votre message"]');
    await messageInput.fill('Test message');
    
    // Send button should be enabled
    const sendButton = page.locator('button:has-text("Envoyer")');
    await expect(sendButton).not.toBeDisabled();
  });
});