// The hosted CV is a copy of resume_cv/cv.pdf. GitHub Pages builds from this repo alone,
// so the copy is refreshed locally (dev, build, every commit) and committed with the site.
// Where the source is absent, as on the Pages runner, the committed copy is left as is.
import { readFile, writeFile } from 'node:fs/promises';
const source = new URL('../../../resume_cv/cv.pdf', import.meta.url);
const target = new URL('../public/Travis-Kim-CV.pdf', import.meta.url);
const read = path => readFile(path).catch(() => null);
const [pdf, current] = await Promise.all([read(source), read(target)]);
if (!pdf) console.log('sync-cv: resume_cv/cv.pdf not found; keeping the committed public/Travis-Kim-CV.pdf.');
// LaTeX rewrites the PDF in place, so a copy taken mid-compile would be truncated: require the header and the end-of-file marker.
else if (pdf.subarray(0, 5).toString() !== '%PDF-' || !pdf.subarray(-1024).toString('latin1').includes('%%EOF')) {
  console.error('sync-cv: resume_cv/cv.pdf looks incomplete (still compiling?); keeping the current copy.');
  process.exitCode = 1;
} else if (current && pdf.equals(current)) console.log('sync-cv: public/Travis-Kim-CV.pdf is already current.');
else {
  await writeFile(target, pdf);
  console.log('sync-cv: copied resume_cv/cv.pdf to public/Travis-Kim-CV.pdf.');
}
