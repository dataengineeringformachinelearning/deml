import type { CardVisual } from '../components/card/card';

import { BLUE_NOTES } from './blue-notes.generated';

export interface BlueNoteHeading {
	readonly slug: string;
	readonly text: string;
}

/** Blue Notes field-log entry (replaces placeholder blog posts). */
export interface BlueNote {
	readonly slug: string;
	readonly title: string;
	readonly summary: string;
	readonly note: string;
	readonly publishedAt: string;
	readonly updatedAt: string | null;
	readonly categories: readonly string[];
	readonly featured: boolean;
	readonly meta: string;
	readonly publishedLabel: string;
	readonly visual: Exclude<CardVisual, 'none'>;
	readonly html: string;
	readonly headings: readonly BlueNoteHeading[];
}

export { BLUE_NOTES };

/** Newest-first archive (generated list is already sorted). */
export const BLOG_POSTS = BLUE_NOTES;

export function getBlueNote(slug: string): BlueNote | undefined {
	return BLUE_NOTES.find((note) => note.slug === slug);
}

/** @deprecated Use getBlueNote — kept for route title helpers. */
export function getBlogPost(slug: string): BlueNote | undefined {
	return getBlueNote(slug);
}

export function blueNoteHref(note: Pick<BlueNote, 'slug'>): string {
	return `/blog/${note.slug}`;
}

export function adjacentBlueNotes(slug: string): {
	older: BlueNote | undefined;
	newer: BlueNote | undefined;
} {
	const index = BLUE_NOTES.findIndex((note) => note.slug === slug);
	if (index < 0) return { older: undefined, newer: undefined };
	return {
		// Newest-first: index+1 is older, index-1 is newer
		older: BLUE_NOTES[index + 1],
		newer: BLUE_NOTES[index - 1],
	};
}
