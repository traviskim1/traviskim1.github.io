import type { Metadata } from 'next';
import ResearchList from '@/components/research-list';
export const metadata: Metadata = { title: 'Research' };
export default function ResearchPage() {
  return <main id="main" className="page"><h1 className="page-title">Research</h1><span className="heading-tick" /><ResearchList /></main>;
}
