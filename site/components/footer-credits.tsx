'use client';
import { usePathname } from 'next/navigation';
import { RichText } from '@/components/rich-text';
import { site } from '@/lib/content';
// The icons this credits only appear on the research page, so the attribution rides along with them.
export default function FooterCredits() {
  const currentPath = usePathname();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const pathname = base && currentPath.startsWith(base + '/') ? currentPath.slice(base.length) : currentPath;
  if (!pathname.startsWith('/research')) return null;
  return <span className="icon-credits"><RichText text={site.iconCredit} /></span>;
}
