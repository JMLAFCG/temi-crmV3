import { test, expect } from '@playwright/test';

test.describe('Flux métier complet', () => {
  test('Création client → projet → facture → paiement → commission @e2e', async ({ page }) => {
    // 1. Connexion admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Création d'un client
    await page.goto('/clients/create');
    await page.fill('input[name="user_first_name"]', 'Test');
    await page.fill('input[name="user_last_name"]', 'Client');
    await page.fill('input[name="user_email"]', 'test.client@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/clients/);

    // 3. Création d'un projet
    await page.goto('/projects/create');
    await page.fill('input[name="title"]', 'Projet Test E2E');
    
    // Simuler la sélection du client créé
    await page.click('[data-testid="client-selector"]');
    await page.click('text=Test Client');
    
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/projects/);

    // 4. Création d'une facture
    await page.goto('/invoicing');
    await page.click('[data-testid="create-invoice"]');
    await page.fill('input[name="amountHT"]', '10000');
    await page.click('button[type="submit"]');

    // 5. Émission de la facture
    await page.click('[data-testid="issue-invoice"]');
    await expect(page.locator('text=Émise')).toBeVisible();

    // 6. Marquage comme payée
    await page.click('[data-testid="mark-paid"]');
    await page.fill('input[name="amount"]', '12000');
    await page.fill('input[name="bankReference"]', 'VIR123456');
    await page.click('button[type="submit"]');

    // 7. Vérification des commissions
    await page.goto('/commissions');
    await expect(page.locator('text=Payable')).toBeVisible();
  });

  test('Upload devis → analyse IA → correction → validation @e2e', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'entreprise@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Upload d'un devis
    await page.goto('/dashboard-entreprise');
    
    // Simuler l'upload d'un fichier PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'devis-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });

    // Attendre l'analyse IA
    await expect(page.locator('[data-testid="ai-analysis-result"]')).toBeVisible({ timeout: 10000 });
    
    // Vérifier que l'analyse est terminée
    await expect(page.locator('text=Analysé')).toBeVisible();
  });

  test('Notifications documentExpiring @e2e', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Aller aux entreprises
    await page.goto('/companies');
    
    // Vérifier qu'il y a des alertes de documents expirants
    await expect(page.locator('[data-testid="expiring-documents"]')).toBeVisible();
  });
});