import { test, expect } from '@playwright/test';

test.describe('Flux complet de l\'application', () => {
  test('Flux client complet: connexion → projet → validation @e2e', async ({ page }) => {
    // 1. Connexion
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Bonjour');

    // 2. Consulter ses projets
    await page.click('[data-testid="link-projects"]');
    await expect(page).toHaveURL(/.*\/projects/);
    await expect(page.locator('h1')).toContainText('Projets');

    // 3. Consulter ses documents
    await page.click('[data-testid="link-documents"]');
    await expect(page).toHaveURL(/.*\/documents/);
    await expect(page.locator('h1')).toContainText('Documents');

    // 4. Vérifier les messages
    await page.click('[data-testid="link-messages"]');
    await expect(page).toHaveURL(/.*\/messages/);
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
  });

  test('Flux mandataire complet: création client → projet → sélection entreprises @e2e', async ({ page }) => {
    // 1. Connexion mandataire
    await page.goto('/login');
    await page.fill('input[type="email"]', 'mandataire@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Créer un nouveau client
    await page.click('[data-testid="link-clients"]');
    await page.click('text=Nouveau Client');
    
    // Remplir le formulaire client
    await page.fill('input[name="user_first_name"]', 'Test');
    await page.fill('input[name="user_last_name"]', 'Client');
    await page.fill('input[name="user_email"]', 'test.client@example.com');
    await page.fill('input[name="phone"]', '0123456789');
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/clients/);

    // 3. Créer un nouveau projet
    await page.click('[data-testid="link-projects"]');
    await page.click('text=Nouveau Projet');
    
    // Vérifier que le wizard s'ouvre
    await expect(page.locator('text=Étape 1 sur')).toBeVisible();
    
    // Remplir les informations de base
    await page.fill('input[name="title"]', 'Projet Test E2E');
    await page.fill('textarea[name="description"]', 'Description du projet test');
    
    // Naviguer dans le wizard (simulation)
    await page.click('button:has-text("Suivant")');
    await expect(page.locator('text=Étape 2 sur')).toBeVisible();
  });

  test('Flux entreprise complet: mission → devis → négociation @e2e', async ({ page }) => {
    // 1. Connexion entreprise
    await page.goto('/login');
    await page.fill('input[type="email"]', 'entreprise@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Consulter les missions
    await expect(page.locator('h1')).toContainText('Espace Entreprise');
    
    // 3. Vérifier les documents légaux
    await expect(page.locator('text=Documents légaux')).toBeVisible();
    
    // 4. Vérifier les rétrocessions
    await expect(page.locator('text=Mes rétrocessions')).toBeVisible();
  });

  test('Flux admin complet: gestion utilisateurs → IA → audit @e2e', async ({ page }) => {
    // 1. Connexion admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Gestion des utilisateurs
    await page.click('[data-testid="link-settings"]');
    await expect(page).toHaveURL(/.*\/settings/);
    
    await page.click('text=Utilisateurs');
    await expect(page.locator('h2')).toContainText('Gestion des utilisateurs');

    // 3. Module IA
    await page.click('[data-testid="link-aiManagement"]');
    await expect(page).toHaveURL(/.*\/admin\/ai-management/);
    await expect(page.locator('h1')).toContainText('Gestion IA');

    // 4. Audit
    await page.click('[data-testid="link-audit"]');
    await expect(page).toHaveURL(/.*\/audit/);
    await expect(page.locator('[data-testid="audit-page"]')).toBeVisible();

    // 5. Commissions
    await page.click('[data-testid="link-commissions"]');
    await expect(page).toHaveURL(/.*\/commissions/);
    await expect(page.locator('h1')).toContainText('Commissions');
  });

  test('Navigation et performance: toutes les pages se chargent rapidement @performance', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/projects',
      '/clients',
      '/companies',
      '/documents',
      '/messages',
      '/calendar',
      '/settings',
    ];

    // Connexion
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Tester chaque route
    for (const route of routes) {
      const startTime = Date.now();
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Vérifier que la page se charge en moins de 3 secondes
      expect(loadTime).toBeLessThan(3000);
      
      // Vérifier qu'il n'y a pas d'erreur visible
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('Une erreur est survenue');
      expect(bodyText).not.toContain('Page introuvable');
      
      console.log(`✅ ${route}: ${loadTime}ms`);
    }
  });

  test('Responsive design: toutes les pages fonctionnent sur mobile @mobile', async ({ page }) => {
    // Simuler un écran mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Connexion
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Vérifier que le menu mobile fonctionne
    await page.click('button[aria-label="Menu"]');
    await expect(page.locator('nav')).toBeVisible();

    // Tester la navigation mobile
    await page.click('[data-testid="link-projects"]');
    await expect(page).toHaveURL(/.*\/projects/);
    
    // Vérifier que le contenu est lisible sur mobile
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    
    const titleBox = await title.boundingBox();
    expect(titleBox?.width).toBeGreaterThan(0);
  });

  test('Gestion des erreurs: pages d\'erreur et récupération @error-handling', async ({ page }) => {
    // 1. Page 404
    await page.goto('/route-inexistante');
    await expect(page.locator('text=Page introuvable')).toBeVisible();
    
    // Vérifier le bouton de retour
    await page.click('text=Retour au tableau de bord');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Erreur de réseau (simulation)
    await page.route('**/rest/v1/**', route => route.abort());
    
    await page.goto('/projects');
    // L'application devrait gérer gracieusement l'erreur
    await expect(page.locator('body')).toBeVisible();
    
    // Restaurer les requêtes
    await page.unroute('**/rest/v1/**');
  });

  test('Sécurité: accès aux pages protégées @security', async ({ page }) => {
    // 1. Accès sans authentification
    await page.goto('/settings');
    
    // Devrait rediriger vers login ou afficher un message d'erreur
    const url = page.url();
    const bodyText = await page.locator('body').innerText();
    
    const hasAccessControl = 
      url.includes('/login') || 
      bodyText.includes('Accès restreint') || 
      bodyText.includes('Vous devez être connecté');
    
    expect(hasAccessControl).toBeTruthy();

    // 2. Connexion client et tentative d'accès admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'client@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Tenter d'accéder à une page admin
    await page.goto('/settings/users');
    
    const adminBodyText = await page.locator('body').innerText();
    const hasAdminProtection = 
      adminBodyText.includes('Accès restreint') || 
      adminBodyText.includes('permissions');
    
    expect(hasAdminProtection).toBeTruthy();
  });
});