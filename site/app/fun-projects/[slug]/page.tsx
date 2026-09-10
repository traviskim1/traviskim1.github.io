import type { Metadata } from 'next';
import ProjectBackLink from '@/components/project-back-link';
import { notFound } from 'next/navigation';
import { Play } from 'lucide-react';
import { projects, projectDate, asset } from '@/lib/content';
import PhotoGallery from '@/components/photo-gallery';
import StoryReader from '@/components/story-reader';
import { RichText } from '@/components/rich-text';
export const dynamicParams = false;
export function generateStaticParams() { return projects.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  return { title: project?.title || 'Project not found' };
}
function youtubeEmbed(raw: string) {
  try {
    const url = new URL(raw);
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) ? url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1] : null;
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch { return ''; }
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();
  const embed = youtubeEmbed(project.videoUrl);
  return <main id="main" className={`page project-detail category-${project.category.toLowerCase()}`}>
    <ProjectBackLink />
    <p className="eyebrow">{project.category} <span aria-hidden="true">/</span> <time dateTime={project.date}>{projectDate(project.date)}</time></p>
    <h1>{project.title}</h1>
    {project.category === 'Fiction' ? <><p className="publication-credit">{project.url ? <a href={project.url}>Published in {project.venue}</a> : <>Published in {project.venue}</>}</p><p className="story-byline">Travis Kim</p><StoryReader slug={project.slug} /></> : <>
      {project.location && <p className="meet-location">{project.location}</p>}
      {project.category === 'Powerlifting' && <section className="meet-results" aria-labelledby="lift-results-title"><h2 id="lift-results-title">Lift results</h2><p className="meet-recap">{project.recap}</p><div className="lift-video-grid">{project.results.map(result => <section className="lift-video" key={result.lift}><h3>{result.lift} <span className="lift-weight">{result.result}</span></h3>{result.video ? <video controls playsInline preload="none" poster={result.poster ? asset(result.poster) : undefined} aria-label={`${project.title}: ${result.lift}, ${result.result}`}><source src={asset(result.video)} type="video/mp4" />Your browser does not support embedded video. <a href={asset(result.video)}>Watch {result.lift}</a>.</video> : <p className="pending-note">Video coming soon.</p>}</section>)}</div></section>}
      {project.videoFirst && <section className="featured-video" aria-label="Featured project video">{embed ? <iframe src={embed} title={`${project.title} — project video`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : project.videoUrl ? <a href={project.videoUrl} className="video-placeholder" target="_blank" rel="noopener noreferrer"><Play size={30} strokeWidth={1} /><span>Watch the project video ↗</span></a> : <div className="video-placeholder"><Play size={30} strokeWidth={1} aria-hidden="true" /><span>Project video coming soon</span><small>{project.title} · {projectDate(project.date)}</small></div>}</section>}
      <PhotoGallery photos={project.photos} photography={project.category === 'Photography'} title={project.title} />
      {!['Powerlifting', 'Photography'].includes(project.category) && <section className="project-writing"><h2>About this project</h2><p className={!project.description ? 'pending-note' : 'preserve-lines'}>{project.description ? <RichText text={project.description} /> : 'A short description is coming soon.'}</p>{project.supportingUrl && <a className="small-link" href={project.supportingUrl} target="_blank" rel="noopener noreferrer">{project.supportingLabel} ↗</a>}</section>}
    </>}
    <ProjectBackLink bottom />
  </main>;
}
