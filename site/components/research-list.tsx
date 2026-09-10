'use client';
import { Fragment } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Empty, EmptyTitle } from '@/components/ui/empty';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
import { Media } from '@/components/media';
import { RichText } from '@/components/rich-text';
import { research, researchDates } from '@/lib/content';
type ResearchLink = { label: string; url: string; description: string };
// A link either leaves the page or explains the project in place, so the blurb opens on hover as well as on click.
function ResearchLink({ link }: { link: ResearchLink }) {
  return link.url ? <a className="small-link" href={link.url}>{link.label}{'\u00a0'}<span aria-hidden="true">↗</span></a> : <Popover><PopoverTrigger openOnHover delay={150} closeDelay={200} className="small-link blurb-trigger">{link.label}</PopoverTrigger><PopoverContent side="bottom" align="start" sideOffset={10} className="research-blurb"><PopoverTitle className="sr-only">{link.label}</PopoverTitle><p><RichText text={link.description} /></p></PopoverContent></Popover>;
}
// The note and the links share one wrapping row, separated by dots so they read as one line wherever there is room.
function ResearchFooter({ note, links }: { note: boolean; links: ResearchLink[] }) {
  const parts = [...(note ? [<em key="note" className="pending-note">Publication link forthcoming</em>] : []), ...links.map(link => <ResearchLink key={link.label} link={link} />)];
  return <div className="research-links">{parts.map((part, index) => <Fragment key={index}>{index > 0 && <span className="link-dot" aria-hidden="true">·</span>}{part}</Fragment>)}</div>;
}
export default function ResearchList() {
  return <Tabs defaultValue="All" className="filter-tabs"><TabsList variant="line" className="filters" aria-label="Research status">{['All', 'Published', 'Ongoing'].map(status => <TabsTrigger key={status} value={status} className={status === 'All' ? 'research-filter-all' : status === 'Published' ? 'research-filter-published' : 'research-filter-progress'}>{status}</TabsTrigger>)}</TabsList>{['All', 'Published', 'Ongoing'].map(status => {
    const items = research.filter(item => status === 'All' || item.status === status);
    return <TabsContent key={status} value={status}><div className="research-list">{items.length ? items.map(item => {
      const links: ResearchLink[] = [...(item.url ? [{ label: item.linkLabel || 'Project description', url: item.url, description: '' }] : []), ...item.links];
      return <article key={item.id} className="research-entry"><div className="research-image" data-fit={item.coverFit || undefined}><Media src={item.image} alt={item.title} /></div><div><span className="status-label" data-status={item.status}>{item.status}</span><h2>{item.title}</h2><p className="research-dates">{researchDates(item)}</p><p className="research-credit">{item.authors.length ? item.authors.map((author, i) => <span key={author}>{i > 0 && ', '}{author === 'Travis Kim' ? <strong>{author}</strong> : author}</span>) : item.credit}</p>{item.description && <p className="research-description">{item.description}</p>}<ResearchFooter note={!item.url} links={links} /></div></article>;
    }) : <Empty className="research-empty"><EmptyTitle>No published research yet.</EmptyTitle></Empty>}</div></TabsContent>;
  })}</Tabs>;
}
