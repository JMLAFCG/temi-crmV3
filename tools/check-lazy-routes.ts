#!/usr/bin/env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface LazyRouteCheck {
  importPath: string;
  resolvedPath: string;
  exists: boolean;
  hasDefaultExport: boolean;
  error?: string;
}

interface HealthReport {
  timestamp: string;
  totalChecked: number;
  passed: number;
  failed: number;
  failures: LazyRouteCheck[];
}

console.log('🔍 Checking lazy route imports...');

// Read router file
const routerPath = resolve(__dirname, '../src/router.tsx');
const routerContent = readFileSync(routerPath, 'utf-8');

// Extract lazy imports using regex
const lazyImportRegex = /lazy\(\(\)\s*=>\s*import\(['"`]([^'"`]+)['"`]\)/g;
const lazyImports: string[] = [];
let match;

while ((match = lazyImportRegex.exec(routerContent)) !== null) {
  lazyImports.push(match[1]);
}

console.log(`📊 Found ${lazyImports.length} lazy imports to check`);

const results: LazyRouteCheck[] = [];

for (const importPath of lazyImports) {
  const check: LazyRouteCheck = {
    importPath,
    resolvedPath: '',
    exists: false,
    hasDefaultExport: false,
  };

  try {
    // Resolve the import path relative to router.tsx
    const routerDir = dirname(routerPath);
    let resolvedPath = resolve(routerDir, importPath);
    
    // Add .tsx extension if not present
    if (!resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.ts')) {
      resolvedPath += '.tsx';
    }
    
    check.resolvedPath = resolvedPath;
    check.exists = existsSync(resolvedPath);

    if (check.exists) {
      // Check for default export
      const fileContent = readFileSync(resolvedPath, 'utf-8');
      
      // Look for default export patterns
      const defaultExportPatterns = [
        /export\s+default\s+/,
        /export\s*{\s*\w+\s+as\s+default\s*}/,
        /export\s*=\s*/
      ];
      
      check.hasDefaultExport = defaultExportPatterns.some(pattern => 
        pattern.test(fileContent)
      );
      
      if (!check.hasDefaultExport) {
        check.error = 'Missing default export';
      }
    } else {
      check.error = 'File does not exist';
    }

    const status = check.exists && check.hasDefaultExport ? '✅' : '❌';
    const displayPath = importPath.replace('./pages/', './');
    console.log(`${status} ${displayPath}: ${check.exists && check.hasDefaultExport ? 'OK' : check.error}`);

  } catch (error) {
    check.error = `Error checking file: ${error}`;
    console.log(`❌ ${importPath}: ${check.error}`);
  }

  results.push(check);
}

// Generate report
const failures = results.filter(r => !r.exists || !r.hasDefaultExport);
const report: HealthReport = {
  timestamp: new Date().toISOString(),
  totalChecked: results.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failures,
};

// Ensure artifacts directory exists
const artifactsDir = resolve(__dirname, '../artifacts');
if (!existsSync(artifactsDir)) {
  const { mkdirSync } = await import('fs');
  mkdirSync(artifactsDir, { recursive: true });
}

// Write report
const reportPath = resolve(artifactsDir, 'route-lazy-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n📋 Report written to: ${reportPath}`);
console.log(`✅ Passed: ${report.passed}/${report.totalChecked}`);

if (failures.length > 0) {
  console.log(`❌ Failed: ${failures.length}`);
  console.log('\n🚨 Failures:');
  failures.forEach(failure => {
    console.log(`  - ${failure.importPath}: ${failure.error}`);
  });
  process.exit(1);
} else {
  console.log('🎉 All lazy routes are healthy!');
  process.exit(0);
}