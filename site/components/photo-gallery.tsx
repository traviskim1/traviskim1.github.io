'use client';
import { useEffect, useMemo, useState } from 'react';
import { Media } from '@/components/media';
import { photoDate, photoSettings, type Photo } from '@/lib/content';
function PhotoCaption({ photo }: { photo: Photo }) {
  const [body, ...rest] = photoSettings(photo);
  return <><strong>{body}</strong>{rest.length > 0 && <span>{rest.join(' · ')}</span>}{photo.caption && <span>{photo.caption}</span>}</>;
}
// Two columns on desktop, one once the grid would be too narrow to read.
function useColumnCount() {
  const [count, setCount] = useState(2);
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 740px)');
    const sync = () => setCount(narrow.matches ? 1 : 2);
    sync();
    narrow.addEventListener('change', sync);
    return () => narrow.removeEventListener('change', sync);
  }, []);
  return count;
}
// Masonry: each photo joins the shortest column so far, so tall and wide frames pack without gaps.
function useColumns(photos: Photo[], count: number) {
  return useMemo(() => {
    const columns = Array.from({ length: count }, () => ({ entries: [] as { photo: Photo; index: number }[], height: 0 }));
    photos.forEach((photo, index) => {
      const shortest = columns.reduce((a, b) => b.height < a.height ? b : a);
      shortest.entries.push({ photo, index });
      shortest.height += (photo.width && photo.height ? photo.height / photo.width : 0.75) + 0.3;
    });
    return columns;
  }, [photos, count]);
}
export default function PhotoGallery({ photos, photography, title }: { photos: Photo[]; photography: boolean; title: string }) {
  const [pinned, setPinned] = useState<number | null>(null);
  const columns = useColumns(photos, useColumnCount());
  const heading = <div className="gallery-heading"><h2>Gallery</h2>{photography && title !== '2026 Selects' && <p>Hover, focus, or tap a photo for its caption.</p>}</div>;
  if (!photos.length) return <>{heading}<div className="photo-gallery">{Array.from({ length: 4 }, (_, index) => <figure key={index} className="gallery-photo"><Media src="" alt={`${title}, photo ${index + 1}`} label={`Photo ${String(index + 1).padStart(2, '0')} coming soon`} /></figure>)}</div></>;
  const frame = (photo: Photo, index: number) => <Media src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} label={`Photo ${String(index + 1).padStart(2, '0')} coming soon`} />;
  return <>{heading}<div className="photo-gallery has-photos photo-masonry">{columns.map((column, columnIndex) => <div className="masonry-column" key={columnIndex}>{column.entries.map(({ photo, index }) => photography ? <figure className="photo-item" key={photo.src}><button type="button" className={`gallery-photo caption-photo ${pinned === index ? 'is-pinned' : ''}`} aria-label={`${photo.alt}. ${pinned === index ? 'Unpin' : 'Pin'} caption`} aria-pressed={pinned === index} aria-describedby={`caption-${index}`} onClick={() => setPinned(pinned === index ? null : index)} onKeyDown={e => { if (e.key === 'Escape') { setPinned(null); e.currentTarget.blur(); } }}>{frame(photo, index)}<span className="caption-hint" aria-hidden="true">i</span><span className="photo-caption" id={`caption-${index}`}><PhotoCaption photo={photo} /></span></button><figcaption className="photo-index">{String(index + 1).padStart(3, '0')}{photoDate(photo) && <> · {photoDate(photo)}</>}</figcaption>{photo.metadata && Object.keys(photo.metadata).length > 0 && <details className="photo-metadata"><summary>Photo details</summary><dl>{Object.entries(photo.metadata).map(([key, value]) => <div key={key}><dt>{key.replace(/([a-z])([A-Z])/g, '$1 $2')}</dt><dd>{value}</dd></div>)}</dl></details>}</figure> : <figure key={photo.src} className="gallery-photo">{frame(photo, index)}{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>)}</div>)}</div></>;
}
