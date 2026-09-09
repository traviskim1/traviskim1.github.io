'use client';
import { Fragment, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
import { RichText } from '@/components/rich-text';
import { site } from '@/lib/content';
export default function InterestsIntro() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  return <><p className="projects-intro">Outside of my studies I enjoy {site.interests.map((interest, index) => <Fragment key={interest.category}>{index > 0 && (index === site.interests.length - 1 ? ', and ' : ', ')}<Popover open={openCategory === interest.category} onOpenChange={open => setOpenCategory(current => open ? interest.category : current === interest.category ? null : current)}><PopoverTrigger onMouseEnter={() => setOpenCategory(current => current && current !== interest.category ? interest.category : current)} openOnHover delay={150} closeDelay={200} className={`interest-trigger category-${interest.category.toLowerCase()}`}>{interest.phrase}</PopoverTrigger><PopoverContent side="bottom" align="start" sideOffset={10} className={`interest-blurb category-${interest.category.toLowerCase()}`}><PopoverTitle className="sr-only">{interest.phrase}</PopoverTitle><p><RichText text={interest.blurb} /></p></PopoverContent></Popover></Fragment>)}.</p><p className="commission-note">For commission inquiries, please email {site.emailDisplay}.</p></>;
}
