import type { CardVisual } from '../components/card/card';

/** Shared shape for blog posts and learn topics. */
export interface ArticleEntry {
  slug: string;
  title: string;
  excerpt: string;
  /** Display meta, e.g. "Jul 2026 · Process" or "Backend (Python)". */
  meta: string;
  visual: Exclude<CardVisual, 'none'>;
  body: string[];
}
