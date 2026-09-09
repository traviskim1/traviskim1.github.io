import data from '@/content/site.json';
export type Photo = { src: string; alt: string; date?: string; location?: string; camera?: string; lens?: string; focalLength?: string; aperture?: string; shutterSpeed?: string; iso?: string; caption?: string; filename?: string; source?: string; width?: number; height?: number; metadata?: Record<string, string> };
export type Project = Omit<(typeof data.projects)[number], 'photos' | 'results'> & { photos: Photo[]; location?: string; recap?: string; storySource?: string; results: { lift: string; result: string; kg?: number; lbs?: number; video?: string; poster?: string }[] };
export const site = data;
// Hand-authored `date` wins over EXIF, so frames stripped of metadata can still be placed.
const photoStamp = (photo: Photo) => {
  const parts = (photo.date || photo.metadata?.DateTimeOriginal || photo.metadata?.CreateDate || '').match(/^(\d{4})[:-](\d{2})[:-](\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/);
  return parts ? `${parts[1]}-${parts[2]}-${parts[3]}T${parts[4] || '00'}:${parts[5] || '00'}:${parts[6] || '00'}Z` : '';
};
const byDate = (photos: Photo[]) => photos.map((photo, index) => ({ photo, index, stamp: photoStamp(photo) })).sort((a, b) => (a.stamp && b.stamp ? a.stamp.localeCompare(b.stamp) : b.stamp.length - a.stamp.length) || a.index - b.index).map(entry => entry.photo);
export const projects = ([...data.projects] as Project[]).sort((a, b) => b.date.localeCompare(a.date)).map(project => project.category === 'Photography' ? { ...project, photos: byDate(project.photos) } : project);
export const projectDate = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}-01T00:00:00Z`));
// A source file named cover.* is the deliberate choice; otherwise fall back to the stored cover, then the first frame.
export const projectCover = (project: Project) => {
  const photo = project.photos.find(p => (p.filename || '').toLowerCase().startsWith('cover')) || project.photos.find(p => p.src === project.cover) || project.photos[0];
  return { src: photo?.src || project.cover, alt: photo?.alt || project.title };
};
export const photoSettings = (photo: Photo) => {
  const settings = [photo.camera, (photo.lens || '').trim(), photo.focalLength, photo.aperture, photo.shutterSpeed, photo.iso ? `ISO ${photo.iso}` : ''].filter(Boolean) as string[];
  // Nothing embedded: these frames were all shot on the same body and adapted prime.
  return settings.length ? settings : ['Panasonic DC-S5', '50mm F1.4 Pentax Super Takumar'];
};
export const photoDate = (photo: Photo) => {
  const stamp = photoStamp(photo);
  return stamp ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(stamp)) : '';
};
export const categories = ['All', 'Sewing', 'Photography', 'Fiction', 'Powerlifting'];
export const asset = (path: string) => path.startsWith('/') ? `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}` : path;
