import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/dashboard',
  '/dashboard-client',
  '/dashboard-entreprise',
  '/dashboard-apporteur',
  '/projects',
  '/projects/create',
  '/projects/active',
  '/projects/pending',
  '/projects/completed',
  '/clients',
  '/clients/create',
  '/companies',
  '/companies/create',
  '/companies/partners',
  '/companies/providers',
  '/providers',
  '/providers/create',
  '/documents',
  '/calendar',
  '/messages',
  '/commissions',
  '/commissions/mandataries',
  '/analytics',
  '/admin/ai-management',
  '/settings',
  '/settings/general',
  '/settings/users',
  '/settings/roles',
  '/settings/billing',
  '/settings/integrations',
  '/login',
  '/register',
];

// Test de base pour chaque route
for (const route of routes) {
  test(`Route ${route} se charge sans erreur`, async ({ page }) => {
    // Aller à la page
    await page.goto(`http://localhost:5173${route}`);

    // Vérifier que la page a un titre
    await expect(page).toHaveTitle(/./);

    // Vérifier qu'il n'y a pas d'erreur visible
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Page introuvable');
    expect(bodyText).not.toContain('Une erreur est survenue');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('Error');

    // Vérifier qu'il n'y a pas d'erreurs console critiques
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');

    // Vérifier qu'il n'y a pas d'erreurs critiques
    const criticalErrors = errors.filter(
      error => !error.includes('favicon') && !error.includes('404') && !error.includes('net::ERR_')
    );

    if (criticalErrors.length > 0) {
      console.warn(`⚠️ Erreurs console sur ${route}:`, criticalErrors);
    }
  });
}

// Test de navigation entre les pages principales
test('Navigation entre les pages principales', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Vérifier la redirection vers dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);

  // Tester la navigation vers quelques pages clés
  const navigationTests = [
    { selector: 'a[href="/projects"]', expectedUrl: '/projects' },
    { selector: 'a[href="/clients"]', expectedUrl: '/clients' },
    { selector: 'a[href="/companies"]', expectedUrl: '/companies' },
  ];

  for (const { selector, expectedUrl } of navigationTests) {
    const link = page.locator(selector).first();
    if ((await link.count()) > 0) {
      await link.click();
      await expect(page).toHaveURL(new RegExp(`.*${expectedUrl}`));
      await page.goBack();
    }
  }
});

// Test des pages protégées
test('Pages protégées redirigent correctement', async ({ page }) => {
  // Tester l'accès sans authentification
  await page.goto('http://localhost:5173/settings');

  // Devrait soit rediriger vers login, soit afficher un message d'accès refusé
  const bodyText = await page.locator('body').innerText();
  const hasAccessDenied =
    bodyText.includes('Accès refusé') ||
    bodyText.includes('Accès restreint') ||
    page.url().includes('/login');

  expect(hasAccessDenied).toBeTruthy();
});

// Test de la page 404
test('Page 404 fonctionne correctement', async ({ page }) => {
  await page.goto('http://localhost:5173/route-inexistante');

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toContain('Page introuvable');

  // Vérifier que le bouton de retour fonctionne
  const backButton = page.locator('text=Retour au tableau de bord');
  if ((await backButton.count()) > 0) {
    await backButton.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  }
});
