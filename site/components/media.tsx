import { ImageIcon } from 'lucide-react';
import { asset } from '@/lib/content';
export function Media({ src, alt, label = 'Photo coming soon', className = '', width, height }: { src?: string; alt: string; label?: string; className?: string; width?: number; height?: number }) {
  return src ? <img className={`media-image ${className}`} src={asset(src)} alt={alt} width={width} height={height} loading="lazy" /> : <div className={`media-placeholder ${className}`} role="img" aria-label={alt + ' — ' + label}><ImageIcon size={26} strokeWidth={1} aria-hidden="true" /><span>{label}</span></div>;
}
