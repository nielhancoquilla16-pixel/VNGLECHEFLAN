const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...walk(full));
    } else if (ent.isFile() && full.endsWith('.jsx')) {
      files.push(full);
    }
  }
  return files;
}

function stripTypes(code) {
  // Remove type-only import specifiers
  code = code.replace(/\btype\s+\w+\s*(,?)/g, (_, comma) => (comma ? '' : ''));
  code = code.replace(/,\s*,/g, ',');
  code = code.replace(/import\s*\{\s*,/g, 'import {');

  // Remove import type lines
  code = code.replace(/^import\s+type\s+[^\n]+\n/gm, '');

  // Remove React.ComponentProps/ComponentPropsWithoutRef and other React types in params
  code = code.replace(/(\}):\s*React\.[^\)\n]+\)/gs, '$1)');

  // Remove any remaining explicit type annotations in destructured props or variables
  code = code.replace(/(\b\w+)(\s*):\s*[^,\n\)\}]+(?=[,\n\)\}])/g, '$1');

  // Remove 'as React.X' assertions
  code = code.replace(/\s+as\s+React\.[A-Za-z0-9_]+/g, '');

  return code;
}

const root = path.resolve(__dirname, '..');
const files = walk(root);
if (!files.length) {
  console.log('No .jsx files found');
  process.exit(0);
}

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const stripped = stripTypes(code);
  if (stripped !== code) {
    fs.writeFileSync(file, stripped, 'utf8');
    console.log('Updated', file);
  }
}
