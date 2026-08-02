import type { CardVisual } from '../components/card/card';
import type { ArticleEntry } from '../shared/article-entry';

export interface BlogPost extends ArticleEntry {
  visual: Exclude<CardVisual, 'none'>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'build-with-clarity',
    title: 'Build with clarity',
    excerpt:
      'How a quieter interface makes room for the work that actually matters—and why less chrome often means more signal.',
    meta: 'Jul 2026 · Process',
    visual: 'gold',
    body: [
      'Clarity is not the absence of detail. It is the discipline of showing only what helps someone take the next step.',
      'When every surface competes for attention, nothing earns it. We strip the chrome so the idea can lead.',
    ],
  },
  {
    slug: 'sites-without-clutter',
    title: 'Sites without the clutter',
    excerpt:
      'A calm presence on the web starts with ruthless editing—of layout, of copy, and of the features you choose not to ship.',
    meta: 'Jun 2026 · Product',
    visual: 'olive',
    body: [
      'Most sites fail from accumulation, not from a lack of ideas. Each widget is a tax on attention.',
      'We design for the page you can hold in your head after you leave—not the one that tries to keep you scrolling.',
    ],
  },
  {
    slug: 'focus-is-a-feature',
    title: 'Focus is a feature',
    excerpt:
      'Distraction is the default. Tools that protect attention are doing the hard product work most teams skip.',
    meta: 'May 2026 · Notes',
    visual: 'red',
    body: [
      'Focus cannot be bolted on later. It has to be a constraint from the first wireframe.',
      'If a control does not serve the primary job, it is noise—even when it is beautiful.',
    ],
  },
  {
    slug: 'writing-in-public',
    title: 'Writing in public',
    excerpt:
      'Shipping short, honest notes beats waiting for a perfect essay. The archive grows one clear paragraph at a time.',
    meta: 'Apr 2026 · Writing',
    visual: 'gold',
    body: [
      'Public writing is a practice, not a performance. The goal is a trail of thought you can stand behind.',
      'Publish when the sentence is true. Revise when you know more. Leave the rest alone.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
