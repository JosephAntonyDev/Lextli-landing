import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The exported book pose adds gripping paws over the standing front legs.
// Replace those legs with the lifted pose, retaining the two hind legs.
// Keep this correction reproducible until the mobile rig exports this pose.
const source = new URL('../../Lextli_Kit/public/loti/accessory-book.svg', import.meta.url);
const original = readFileSync(source, 'utf8');
const standingLegPaths = [
  'M75.5 150', 'M90 183.01', 'M78 186.5',
  'M124.5 150', 'M124.57 151.5', 'M122 186.5',
];
let removed = 0;
let corrected = original.replace(/<path\b[^>]*\/>/g, (path) => {
  const d = path.match(/\bd="([^"]+)"/)?.[1];
  if (d && standingLegPaths.some(prefix => d.startsWith(prefix))) {
    removed++;
    return '';
  }
  return path;
});
if (removed !== 8) throw new Error('The kit pose has changed. Review the limb correction before regenerating.');
const cover = '<path d="M72 145';
if (!corrected.includes(cover)) throw new Error('Book cover not found.');
const arms = `<g id="book-lifted-arms" fill="#F5BEDC" stroke="#C24E96" stroke-width="2.72" stroke-linecap="round" stroke-linejoin="round"><path d="M75.5 150 C75 156 74.5 162 76 167 C78 172 86 172 88.5 167 C89 162 89 156 88.5 150"/><path d="M124.5 150 C125 156 125.5 162 124 167 C122 172 114 172 111.5 167 C111 162 111 156 111.5 150"/></g>`;
corrected = corrected.replace(cover, arms + cover);
for (const [name, contents] of [
  ['accessory-book.svg', corrected],
  ['accessory-book-still.svg', corrected.replace(/<style>[\s\S]*?<\/style>/, '')],
]) {
  const target = new URL(`../public/loti/${name}`, import.meta.url);
  writeFileSync(target, contents);
  console.log(`Corrected four-limb pose: ${fileURLToPath(target)}`);
}
