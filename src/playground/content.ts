import { getRoute, saferRouteDelta } from '@/data/city';
import type { HEADLINES, TONES } from '@/theme/config';

/**
 * Copy variants for the lab. Every line stays inside the claims the site already
 * makes: nothing here adds a capability, a guarantee or a launch date.
 */

export type HeadlineCopy = { line1: string; line2: string; lede: string };

export const headlines: Record<(typeof HEADLINES)[number], HeadlineCopy> = {
  default: {
    line1: 'The safer route.',
    line2: 'Not just the fastest one.',
    lede: 'SafeWalkMaps reads street lighting, recent incident data, foot traffic and community reports, then shows you how the routes you could take actually compare — and why.',
  },
  benefit: {
    line1: 'Know what three extra minutes buy.',
    line2: 'Before you set off.',
    lede: 'SafeWalkMaps compares the routes you could take on lighting, recent incident data, foot traffic and community reports, and shows you the trade.',
  },
  direct: {
    line1: 'Walking directions that explain themselves.',
    line2: 'Lighting. Incidents. Footfall. Reports.',
    lede: 'Every route gets a safety score and the reasons behind it. You still choose.',
  },
  question: {
    line1: 'Which way home tonight?',
    line2: 'Now you can see the difference.',
    lede: 'SafeWalkMaps compares your options on street lighting, recent incident data, foot traffic and community reports, and tells you why each one scored the way it did.',
  },
};

export const toneCaptions: Record<(typeof TONES)[number], string> = {
  calm: 'In beta in London and Sheffield. No spam — one email when it launches.',
  confident: 'In beta in London and Sheffield. One email when it launches.',
  urgent: 'Beta in London and Sheffield. Coming soon on iOS.',
};

/** The only testimonial the playground will ever show. */
export const PLACEHOLDER_TESTIMONIAL = {
  quote:
    'Placeholder quote — replace with a real, permissioned testimonial before this section ships.',
  author: 'Name withheld',
  context: 'Placeholder, not a customer',
} as const;

const safer = getRoute('safer');

/** Figures for the Stats composition, all from the illustrative route data. */
export const labStats = [
  { label: 'Safety score', value: safer.safetyScore, suffix: '/100' },
  { label: 'Walk time', value: safer.minutes, suffix: ' min' },
  { label: 'Lowest stretch', value: safer.lowestSegment, suffix: '' },
  { label: 'Data confidence', value: safer.confidencePercent, suffix: '%' },
  { label: 'For a safer route', value: saferRouteDelta, suffix: ' min', prefix: '+' },
] as const;
