const { execSync } = require('child_process');
const fs = require('fs');

try {
  const out = execSync('npm run build:verbose', { encoding: 'utf8', stdio: 'pipe' });
  fs.writeFileSync('build.log', out);
  console.log(out);
} catch (e) {
  const out =
    (e.stdout?.toString?.() || '') + '\n--- STDERR ---\n' + (e.stderr?.toString?.() || '');
  fs.writeFileSync('build.log', out);
  console.error(out);
  process.exit(1);
}
