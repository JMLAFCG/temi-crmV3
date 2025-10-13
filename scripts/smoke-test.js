#!/usr/bin/env node

import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const CRITICAL_ROUTES = ['/', '/dashboard', '/projects', '/clients', '/companies', '/login'];

async function runSmokeTest() {
  console.log('🔥 Lancement des tests de fumée...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let passed = 0;
  let failed = 0;

  for (const route of CRITICAL_ROUTES) {
    try {
      console.log(`🧪 Test: ${route}`);

      const response = await page.goto(`${BASE_URL}${route}`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      if (response?.status() >= 400) {
        throw new Error(`HTTP ${response.status()}`);
      }

      // Vérifier qu'il n'y a pas d'erreur visible
      const bodyText = await page.locator('body').innerText();
      if (
        bodyText.includes('Page introuvable') ||
        bodyText.includes('Une erreur est survenue') ||
        bodyText.includes('404')
      ) {
        throw new Error("Page d'erreur détectée");
      }

      // Vérifier qu'il y a du contenu
      const hasContent = (await page.locator('h1, h2, [role="main"]').count()) > 0;
      if (!hasContent) {
        throw new Error('Aucun contenu principal détecté');
      }

      console.log(`   ✅ OK`);
      passed++;
    } catch (error) {
      console.log(`   ❌ ÉCHEC: ${error.message}`);
      failed++;
    }
  }

  await browser.close();

  console.log(`\n📊 Résultats:`);
  console.log(`   ✅ Réussis: ${passed}`);
  console.log(`   ❌ Échecs: ${failed}`);
  console.log(`   📈 Taux de réussite: ${Math.round((passed / CRITICAL_ROUTES.length) * 100)}%`);

  if (failed > 0) {
    console.log('\n🚨 Certains tests ont échoué. Vérifiez les routes critiques.');
    process.exit(1);
  }

  console.log('\n🎉 Tous les tests de fumée sont passés!');
}

runSmokeTest().catch(error => {
  console.error('💥 Erreur lors des tests de fumée:', error);
  process.exit(1);
});
