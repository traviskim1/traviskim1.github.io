import { Fragment } from 'react';
// Limited inline Markdown: links and italic titles, without interpreting HTML.
export function RichText({ text }: { text: string }) {
  return text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*[^*]+\*)/g).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}
