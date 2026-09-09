'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Empty, EmptyTitle } from '@/components/ui/empty';
import { Media } from '@/components/media';
import { site } from '@/lib/content';
export default function ResearchList() {
  return <Tabs defaultValue="All" className="filter-tabs"><TabsList variant="line" className="filters" aria-label="Research status">{['All', 'Published', 'In Progress'].map(status => <TabsTrigger key={status} value={status} className={status === 'All' ? 'research-filter-all' : status === 'Published' ? 'research-filter-published' : 'research-filter-progress'}>{status}</TabsTrigger>)}</TabsList>{['All', 'Published', 'In Progress'].map(status => {
    const items = site.research.filter(item => status === 'All' || item.status === status);
    return <TabsContent key={status} value={status}><div className="research-list">{items.length ? items.map(item => <article key={item.id} className="research-entry"><div className="research-image"><Media src={item.image} alt={item.title} /></div><div><span className="status-label" data-status={item.status}>{item.status}</span><h2>{item.title}</h2><p className="research-credit">{item.authors.length ? item.authors.map((author, i) => <span key={author}>{i > 0 && ', '}{author === 'Travis Kim' ? <strong>{author}</strong> : author}</span>) : item.credit}</p>{item.description && <p className="research-description">{item.description}</p>}{item.url ? <a className="small-link" href={item.url}>{item.linkLabel || 'Project description'} <span aria-hidden="true">↗</span></a> : <span className="pending-note">Publication link forthcoming</span>}</div></article>) : <Empty className="research-empty"><EmptyTitle>No published research yet.</EmptyTitle></Empty>}</div></TabsContent>;
  })}</Tabs>;
}
