'use client';
import { asset as sitePath } from '@/lib/content';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Media } from '@/components/media';
import { projects, categories, projectDate, projectCover, type Project } from '@/lib/content';
function CardContents({ project }: { project: Project }) {
  const cover = projectCover(project);
  return <><div className="card-image"><Media src={cover.src} alt={cover.alt} /></div><div className="card-copy"><div className="card-meta"><span>{project.category}</span><time dateTime={project.date}>{projectDate(project.date)}</time></div><h2>{project.title}</h2>{(project.venue || project.location) && <p className="card-venue">{project.venue || project.location}</p>}</div></>;
}
export default function ProjectList() {
  return <Tabs defaultValue="All" className="filter-tabs"><TabsList variant="line" className="filters" aria-label="Project category">{categories.map(category => <TabsTrigger key={category} value={category} className={`category-${category.toLowerCase()}`}>{category}</TabsTrigger>)}</TabsList>{categories.map(category => <TabsContent key={category} value={category}><div className="project-grid">{projects.filter(p => category === 'All' || p.category === category).map(p => <a href={sitePath(`/fun-projects/${p.slug}/`)} key={p.slug} className={`project-card category-${p.category.toLowerCase()}`}><CardContents project={p} /></a>)}</div></TabsContent>)}</Tabs>;
}
