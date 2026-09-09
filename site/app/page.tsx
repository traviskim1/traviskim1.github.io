import { asset as sitePath } from '@/lib/content';
import { site } from '@/lib/content';
import { Media } from '@/components/media';
import { Mail, FileText } from 'lucide-react';
import { Fragment } from 'react';
import { PendingLink } from '@/components/site-header';
function LinkedBio({ text }: { text: string }) {
  const pattern = new RegExp('(' + site.biographyLinks.map(link => link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  return text.split(pattern).map((part, index) => {
    const link = site.biographyLinks.find(link => link.text === part);
    return link ? <a key={index} href={link.url}>{part}</a> : <Fragment key={index}>{part}</Fragment>;
  });
}
function NewsText({ item }: { item: (typeof site.news)[number] }) {
  const start = item.text.indexOf(item.linkText);
  if (!item.linkText || start === -1) return <>{item.text}</>;
  return <>{item.text.slice(0, start)}{item.url ? <a className="news-highlight" href={item.url}><strong>{item.linkText}</strong></a> : <strong className="news-highlight" title="Publication link coming soon">{item.linkText}</strong>}{item.text.slice(start + item.linkText.length)}</>;
}
export default function Home() {
  const [bio, cvText, paperText, sewingText] = site.biography.split('[here]');
  const paper = site.research.find(p => p.id === 'voice-clones');
  return <main id="main" className="page home"><section className="bio-grid" aria-labelledby="name"><div className="bio"><h1 id="name">Travis Kim</h1><p className="email-display">{site.emailDisplay}</p><p className="bio-copy"><LinkedBio text={bio} />{site.cvUrl ? <a href={site.cvUrl}>here</a> : <PendingLink label="Resume link coming soon">here</PendingLink>}{cvText}{paper?.status === 'Published' && paper.url ? <a href={paper.url}>here</a> : <PendingLink label="Publication link pending publication">here</PendingLink>}{paperText}<a href={sitePath(`/fun-projects/navy-selvedge-jeans/?from=home`)}>here</a>{sewingText}</p></div><div className="portrait-wrap"><Media src={site.portrait} alt={site.portraitAlt} label="Portrait coming soon" className="portrait" /><div className="contact-icons" aria-label="Contact links"><a href={`mailto:${site.email}`} aria-label="Email Travis Kim" title="Email"><Mail size={21} strokeWidth={1.6} aria-hidden="true" /></a>{site.profiles.find(p => p.label === 'LinkedIn')?.url ? <a href={site.profiles.find(p => p.label === 'LinkedIn')!.url} aria-label="LinkedIn" title="LinkedIn"><img src={sitePath("/media/linkedin.svg")} width={21} height={21} alt="" aria-hidden="true" /></a> : <PendingLink label="LinkedIn link coming soon"><img src={sitePath("/media/linkedin.svg")} width={21} height={21} alt="" aria-hidden="true" /><span className="sr-only">LinkedIn</span></PendingLink>}{site.cvUrl ? <a href={site.cvUrl} aria-label="Resume" title="Resume"><FileText className="resume-icon" size={21} strokeWidth={1.6} aria-hidden="true" /></a> : <PendingLink label="Resume link coming soon"><FileText className="resume-icon" size={21} strokeWidth={1.6} aria-hidden="true" /><span className="sr-only">Resume</span></PendingLink>}</div></div></section><section className="news" aria-labelledby="news-title"><div className="section-heading"><span className="section-rule" /><h2 id="news-title">Recent News</h2><span className="section-tick" /></div><ol className="news-list">{site.news.map((item, i) => <li key={i}><time>{item.date}</time><p><NewsText item={item} /></p></li>)}</ol></section></main>;
}
