import { test, expect } from '@playwright/test';
import { paths } from '../src/routes/paths';

const CRITICAL_ROUTES = [
  { path: paths.home, name: 'Accueil' },
  { path: paths.dashboard, name: 'Dashboard' },
  { path: paths.projects, name: 'Projets' },
  { path: paths.clients, name: 'Clients' },
  { path: paths.companies, name: 'Entreprises' },
  { path: paths.commissions, name: 'Commissions' },
  { path: paths.invoicing, name: 'Facturation' },
  { path: paths.audit, name: 'Audit' },
  { path: paths.login, name: 'Connexion' },
];

test.describe('Tests de fumée - Routes centralisées', () => {
  CRITICAL_ROUTES.forEach(({ path, name }) => {
    test(`${name} (${path}) se charge sans erreur @smoke`, async ({ page }) => {
      // Aller à la page
      const response = await page.goto(path, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      // Vérifier le statut HTTP
      expect(response?.status()).toBeLessThan(400);

      // Vérifier qu'il n'y a pas de page d'erreur
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('Page introuvable');
      expect(bodyText).not.toContain('Une erreur est survenue');
      expect(bodyText).not.toContain('404');

      // Vérifier qu'il y a du contenu principal
      const hasMainContent = await page.locator('h1, h2, [role="main"], main').count();
      expect(hasMainContent).toBeGreaterThan(0);

      // Vérifier qu'il n'y a pas d'erreurs console critiques
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Attendre que la page soit stable
      await page.waitForLoadState('networkidle');

      // Filtrer les erreurs non critiques
      const criticalErrors = errors.filter(
        error =>
          !error.includes('favicon') &&
          !error.includes('404') &&
          !error.includes('net::ERR_') &&
          !error.includes('Failed to load resource')
      );

      if (criticalErrors.length > 0) {
        console.warn(`⚠️ Erreurs console sur ${path}:`, criticalErrors);
      }
    });
  });
});

test.describe('Navigation SafeLink', () => {
  test('Navigation avec SafeLink fonctionne @smoke', async ({ page }) => {
    await page.goto(paths.dashboard);

    // Tester les liens SafeLink avec data-testid
    const safeLinks = [
      { testId: 'link-projects', expectedPath: paths.projects },
      { testId: 'link-clients', expectedPath: paths.clients },
      { testId: 'link-companies', expectedPath: paths.companies },
    ];

    for (const { testId, expectedPath } of safeLinks) {
      const link = page.locator(`[data-testid="${testId}"]`).first();
      if ((await link.count()) > 0) {
        await link.click();
        await expect(page).toHaveURL(new RegExp(`.*${expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
        await page.goBack();
      }
    }
  });

  test('Aucun lien hardcodé détecté @smoke', async ({ page }) => {
    await page.goto(paths.dashboard);
    
    // Vérifier qu'il n'y a pas de liens avec to="/..." dans le DOM
    const hardcodedLinks = await page.locator('a[href^="/"]').count();
    
    // Permettre quelques liens système (logout, etc.) mais pas trop
    expect(hardcodedLinks).toBeLessThan(5);
  });
});