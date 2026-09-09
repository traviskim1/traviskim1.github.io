import type { Metadata } from 'next';
import InterestsIntro from '@/components/interests-intro';
import ProjectList from '@/components/project-list';
export const metadata: Metadata = { title: 'Personal Interests' };
export default function FunProjectsPage() {
  return <main id="main" className="page"><h1 className="page-title">Personal Interests</h1><span className="heading-tick" /><InterestsIntro /><ProjectList /></main>;
}
