import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import FooterCredits from '@/components/footer-credits';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Travis Kim', template: '%s | Travis Kim' },
  description: 'Travis Kim — Philosophy and Cognitive Science at Northwestern University. Research, sewing, photography, fiction, and powerlifting.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SiteHeader />{children}<footer className="site-footer"><div className="footer-inner"><div className="footer-credits"><span>© 2026 Travis Kim</span><FooterCredits /></div><div className="palette" aria-hidden="true"><i /><i /><i /></div></div></footer></body></html>;
}
