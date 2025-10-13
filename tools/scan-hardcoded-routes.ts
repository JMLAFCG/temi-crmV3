#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const ARTIFACTS_DIR = path.join(ROOT, 'artifacts');

interface HardcodedRoute {
  file: string;
  line: number;
  column: number;
  type: 'link' | 'navigate';
  value: string;
  context: string;
}

function ensureArtifactsDir() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }
}

function walkDirectory(dir: string, filterFn: (filePath: string) => boolean): string[] {
  const files = fs.readdirSync(dir);
  let results: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(walkDirectory(filePath, filterFn));
    } else if (filterFn(filePath)) {
      results.push(filePath);
    }
  }

  return results;
}

function scanFileForHardcodedRoutes(filePath: string): HardcodedRoute[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const hardcodedRoutes: HardcodedRoute[] = [];

  // Pattern for <Link to="/...">
  const linkPattern = /to\s*=\s*["'`](\/[^"'`]+)["'`]/g;
  
  // Pattern for navigate('/...')
  const navigatePattern = /navigate\s*\(\s*["'`](\/[^"'`]+)["'`]/g;

  lines.forEach((line, lineIndex) => {
    let match;

    // Check for Link to="/..."
    linkPattern.lastIndex = 0;
    while ((match = linkPattern.exec(line)) !== null) {
      hardcodedRoutes.push({
        file: path.relative(ROOT, filePath),
        line: lineIndex + 1,
        column: match.index + 1,
        type: 'link',
        value: match[1],
        context: line.trim(),
      });
    }

    // Check for navigate('/...')
    navigatePattern.lastIndex = 0;
    while ((match = navigatePattern.exec(line)) !== null) {
      hardcodedRoutes.push({
        file: path.relative(ROOT, filePath),
        line: lineIndex + 1,
        column: match.index + 1,
        type: 'navigate',
        value: match[1],
        context: line.trim(),
      });
    }
  });

  return hardcodedRoutes;
}

function main() {
  console.log('🔍 Scanning for hardcoded routes...');

  ensureArtifactsDir();

  const files = walkDirectory(
    SRC_DIR,
    filePath => filePath.endsWith('.tsx') || filePath.endsWith('.ts')
  );

  const allHardcodedRoutes: HardcodedRoute[] = [];

  for (const file of files) {
    try {
      const hardcodedRoutes = scanFileForHardcodedRoutes(file);
      allHardcodedRoutes.push(...hardcodedRoutes);
    } catch (error) {
      console.warn(`⚠️ Error scanning ${file}:`, error);
    }
  }

  // Write results to artifacts
  const artifactPath = path.join(ARTIFACTS_DIR, 'hardcoded-routes.json');
  fs.writeFileSync(artifactPath, JSON.stringify(allHardcodedRoutes, null, 2), 'utf8');

  console.log(`📊 Scan complete: ${allHardcodedRoutes.length} hardcoded routes found`);
  console.log(`📄 Results written to: ${path.relative(ROOT, artifactPath)}`);

  if (allHardcodedRoutes.length > 0) {
    console.log('\n❌ Hardcoded routes found:');
    allHardcodedRoutes.forEach(route => {
      console.log(`   ${route.file}:${route.line}:${route.column} - ${route.type}("${route.value}")`);
      console.log(`      ${route.context}`);
    });
    console.log('\n💡 Use <SafeLink route="routeKey" /> or safeNavigate(navigate, "routeKey") instead.');
    process.exit(1);
  }

  console.log('✅ No hardcoded routes found!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}