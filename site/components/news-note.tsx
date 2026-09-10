'use client';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle } from '@/components/ui/popover';
// A footnote on a news line: the phrase stays in the sentence and the note opens on hover as well as on click.
export function NewsNote({ label, note }: { label: string; note: string }) {
  return <Popover><PopoverTrigger openOnHover delay={150} closeDelay={200} className="news-note">{label}</PopoverTrigger><PopoverContent side="bottom" align="start" sideOffset={10} className="blurb-popup"><PopoverTitle className="sr-only">{label}</PopoverTitle><p>{note}</p></PopoverContent></Popover>;
}
