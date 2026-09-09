'use client';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/content';
export default function ProjectBackLink({ bottom = false }: { bottom?: boolean }) {
  const [fromHome, setFromHome] = useState(false);
  useEffect(() => {
    setFromHome(new URLSearchParams(window.location.search).get('from') === 'home');
  }, []);
  const label = fromHome ? 'Home' : 'Personal Interests';
  return <a href={asset(fromHome ? '/' : '/fun-projects/')} className={`back-link${bottom ? ' bottom-back' : ''}`}>← {bottom ? 'Back to ' : ''}{label}</a>;
}
