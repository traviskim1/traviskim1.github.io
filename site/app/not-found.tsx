import { asset as sitePath } from '@/lib/content';
export default function NotFound() { return <main id="main" className="page"><p className="eyebrow">404</p><h1>Page not found.</h1><p>This page doesn’t exist. <a href={sitePath("/")}>Return home</a> or browse <a href={sitePath("/fun-projects/")}>Personal Interests</a>.</p></main>; }
