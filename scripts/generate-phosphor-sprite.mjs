import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const sourceRoot = resolve(root, 'node_modules/@phosphor-icons/core/assets');
const output = resolve(root, 'public/assets/icons/phosphor.svg');

const icons = [
  'arrow-square-out',
  'bank',
  'caret-down',
  'certificate',
  'chat-text',
  'clock',
  'compass',
  'door-open',
  'envelope',
  'factory',
  'file-text',
  'globe',
  'globe-hemisphere-east',
  'hand-coins',
  'handshake',
  'hospital',
  'lock-simple',
  'magnifying-glass',
  'map-pin-area',
  'map-pin-line',
  'map-trifold',
  'network',
  'paper-plane-tilt',
  'plus',
  'seal-check',
  'shield-check',
  'sliders-horizontal',
  'strategy',
  'trend-up',
  'x',
];

const symbols = [];

for (const name of icons) {
  const filename = resolve(sourceRoot, 'duotone', `${name}-duotone.svg`);
  const svg = readFileSync(filename, 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  const inner = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  if (!viewBox || inner === undefined) throw new Error(`Could not parse ${filename}`);
  symbols.push(`  <symbol id="ph-duotone-${name}" viewBox="${viewBox}">${inner}</symbol>`);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`);
console.log(`Generated ${symbols.length} Phosphor symbols at ${output}`);
