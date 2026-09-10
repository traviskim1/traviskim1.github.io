'use client';
import { asset as sitePath } from '@/lib/content';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/content';
export function PendingLink({ children, label }: { children: React.ReactNode; label: string }) {
  return <span className="pending-link" role="link" aria-disabled="true" title={label}>{children}<span className="sr-only"> — {label}</span></span>;
}
export default function SiteHeader() {
  const currentPath = usePathname();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const pathname = base && currentPath.startsWith(base + '/') ? currentPath.slice(base.length) : currentPath;
  return <><a href="#main" className="skip-link">Skip to content</a><header className="site-header"><div className="header-inner"><nav aria-label="Main navigation">{[['/', 'Home'], ['/research/', 'Research'], ['/fun-projects/', 'Personal Interests']].map(([href, label]) => <a key={href} href={sitePath(href)} aria-current={(href === '/' ? pathname === '/' : pathname.startsWith(href.slice(0, -1))) ? 'page' : undefined}>{label}</a>)}{site.cvUrl ? <a href={site.cvUrl} target="_blank" rel="noopener noreferrer">Resume <span aria-hidden="true">↗</span></a> : <PendingLink label="Resume link coming soon">Resume</PendingLink>}</nav></div></header></>;
}
