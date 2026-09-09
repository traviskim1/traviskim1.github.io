// The pinned Vinext exporter redirects trailing-slash routes before rendering.
// Export .html pages, then add directory indexes for portable static hosting.
import { readdir, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root = new URL('../dist/client/', import.meta.url);
async function directoryIndexes(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await directoryIndexes(path);
    else if (entry.name.endsWith('.html') && !['index.html', '404.html'].includes(entry.name)) {
      const folder = path.slice(0, -5);
      await mkdir(folder, { recursive: true });
      await copyFile(path, join(folder, 'index.html'));
    }
  }
}
await directoryIndexes(root.pathname);
await writeFile(new URL('.nojekyll', root), '');
console.log('Static site ready in dist/client (directory URLs and GitHub Pages .nojekyll included).');
