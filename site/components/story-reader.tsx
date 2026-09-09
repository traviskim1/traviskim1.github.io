import type { CSSProperties } from 'react';
import oldDelivery from '@/content/stories/old-delivery.json';
import confetti from '@/content/stories/confetti.json';
type Paragraph = { style?: CSSProperties; runs: { text: string; style?: CSSProperties }[]; divider?: boolean };
type Story = { source: string; paragraphs: Paragraph[] };
const stories: Record<string, Story> = { 'old-delivery': oldDelivery as unknown as Story, confetti: confetti as unknown as Story };
export default function StoryReader({ slug }: { slug: string }) {
  const story = stories[slug];
  if (!story) return <p>Story text coming soon.</p>;
  // The source author and title are represented by the page byline and heading.
  return <article className="story-reader" aria-label="Story text">{story.paragraphs.slice(2).map((paragraph, i) => paragraph.divider ? <hr className="story-divider" key={i} /> : <p key={i} style={paragraph.style}>{paragraph.runs.length ? paragraph.runs.map((run, j) => <span key={j} style={run.style}>{run.text}</span>) : <br />}</p>)}</article>;
}
