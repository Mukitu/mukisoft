#!/usr/bin/env node
/**
 * Inject `unstable_setRequestLocale(locale)` at the top of every public
 * server component so next-intl can resolve the right dictionary and CMS
 * translations get a chance to apply.
 *
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('usage: node scripts/inject-locale.js <file> [<file> ...]');
  process.exit(1);
}

function patch(file) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes('unstable_setRequestLocale(')) {
    console.log(`skip ${file}`);
    return;
  }

  // 1. Add imports.
  if (!src.includes("from 'next-intl/server'")) {
    const block = "import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';";
    src = src.replace(/(^import[^\n]+\n)/, `$1${block}\n`);
  }
  if (!src.includes("@/lib/i18n/config")) {
    const block = "import { isLocale, type Locale } from '@/lib/i18n/config';";
    src = src.replace(/(^import[^\n]+\n)/, `$1${block}\n`);
  }

  // 2. Patch default export signature.
  const sig = src.match(/export default async function ([A-Za-z0-9_]+)\s*\(\s*\)\s*\{/);
  if (!sig) {
    console.log(`no-match ${file}`);
    return;
  }
  const name = sig[1];
  const replacement =
    `export default async function ${name}({\n` +
    `  params,\n` +
    `}: {\n` +
    `  params: { locale: string };\n` +
    `}) {\n` +
    `  if (!isLocale(params.locale)) return null;\n` +
    `  const locale = params.locale as Locale;\n` +
    `  unstable_setRequestLocale(locale);\n`;
  src = src.replace(sig[0], replacement);

  fs.writeFileSync(file, src);
  console.log(`patched ${file}`);
}

for (const t of targets) patch(path.resolve(t));
