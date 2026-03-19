const fs = require('fs');
const path = require('path');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...walk(full));
    } else if (ent.isFile() && full.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function stripTypes(code) {
  // Remove TS type-only import specifiers (e.g. "type VariantProps")
  code = code.replace(/\btype\s+\w+\s*(,?)/g, (_, comma) => (comma ? '' : ''));
  // Clean up leftover redundant commas
  code = code.replace(/,\s*,/g, ',');
  code = code.replace(/import\s*\{\s*,/g, 'import {');

  // Remove type-only import lines
  code = code.replace(/^import\s+type\s+[^\n]+\n/gm, '');

  // Remove React.ComponentProps<...> annotations in function args
  code = code.replace(/(\}):(\s*)React\.ComponentProps<[^>]+>(\s*)\)/g, '$1)$3');

  // Remove React.ComponentProps<...> & { ... } patterns
  code = code.replace(/(\}):(\s*)React\.ComponentProps<[^>]+>\s*&\s*\{[^}]*\}(\s*)\)/gs, '$1)$3');

  // Remove any remaining explicit type annotations in destructured props (e.g. "foo: string,")
  code = code.replace(/(\b\w+)(\s*):\s*[^,\n\}]+(?=[,\n\}])/g, '$1');

  // Remove "as React.X" type assertions
  code = code.replace(/\s+as\s+React\.[A-Za-z0-9_]+/g, '');

  return code;
}

const root = path.resolve(__dirname, '..');
const files = walk(root);
if (!files.length) {
  console.log('No .tsx files found');
  process.exit(0);
}

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const stripped = stripTypes(code);
  const newFile = file.replace(/\.tsx$/, '.jsx');
  fs.writeFileSync(newFile, stripped, 'utf8');
  fs.unlinkSync(file);
  console.log('Converted', file, '->', newFile);
}
