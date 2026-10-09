export type Feature = {
  id: string;
  title: string;
  body: string;
};

/**
 * What the app does once you are actually walking.
 *
 * Every entry below reflects functionality described on the current
 * SafeWalkMaps product pages — nothing here is invented for the redesign.
 */
export const features: Feature[] = [
  {
    id: 'navigation',
    title: 'Turn-by-turn, with the score in view',
    body: 'Walking directions that keep the route’s safety score and the reason behind it on screen, instead of burying them behind a tap.',
  },
  {
    id: 'updates',
    title: 'Updates mid-walk',
    body: 'If a new report lands on the street ahead or a closure appears, SafeWalkMaps offers you a re-route rather than quietly changing its mind.',
  },
  {
    id: 'sharing',
    title: 'Share the walk, not your history',
    body: 'Send someone a temporary link that follows you until you arrive, then expires. No permanent trail, no account needed to use it.',
  },
  {
    id: 'reports',
    title: 'Report what the data misses',
    body: 'A light that is out, a pavement that is closed, an underpass that feels wrong. Two taps, anonymous, and it feeds back into everyone’s routing.',
  },
  {
    id: 'offline',
    title: 'Works without a signal',
    body: 'Download an area before you leave and keep navigation and saved safety scores. Live reports sync back up when you reconnect.',
  },
  {
    id: 'sos',
    title: 'SOS when you need it',
    body: 'Alerts emergency services with your location, notifies your emergency contacts with a link to follow, and sounds an alarm from your phone.',
  },
];

export type Scenario = {
  id: string;
  title: string;
  time: string;
  body: string;
};

/**
 * Real situations, written without implying cities are dangerous.
 */
export const scenarios: Scenario[] = [
  {
    id: 'library',
    title: 'Leaving the library late',
    time: '23:40',
    body: 'The quickest way back cuts behind the sports hall. SafeWalkMaps shows you what three extra minutes on the main road buys you, and you decide.',
  },
  {
    id: 'station',
    title: 'Walking home from the station',
    time: '22:15',
    body: 'You take the same route most nights without thinking about it. Worth knowing whether the one street over is better lit.',
  },
  {
    id: 'dinner',
    title: 'Heading back after dinner',
    time: '21:30',
    body: 'An unfamiliar part of town and a phone on 12%. Download the area first and the directions keep working either way.',
  },
  {
    id: 'shift',
    title: 'Starting an early shift',
    time: '05:20',
    body: 'Before sunrise the lighting weighting still applies, and the streets that are busy at 6pm are empty now. The score reflects that.',
  },
  {
    id: 'new-city',
    title: 'A city you do not know yet',
    time: '20:05',
    body: 'No local instinct to fall back on. The score and the reasons behind it stand in for the knowledge you have not built up.',
  },
];

export type PrivacyPoint = {
  title: string;
  body: string;
};

/**
 * Privacy claims. Each one is drawn from the published SafeWalkMaps privacy
 * messaging — deliberately no certifications, audits or encryption standards
 * are claimed here.
 */
export const privacyPoints: PrivacyPoint[] = [
  {
    title: 'Your live location is not stored',
    body: 'Routing runs against map and safety data, not against a record of where you have walked. There is no journey history on our servers to leak, subpoena or sell.',
  },
  {
    title: 'Shared links expire',
    body: 'Sharing a walk creates a temporary link that stops working once you arrive. It is a door you open, not one left unlocked.',
  },
  {
    title: 'Reports are anonymous',
    body: 'A report carries a place and a time, not a person. Nothing you submit is attributable to you in anyone else’s app.',
  },
  {
    title: 'No account required',
    body: 'You can plan and walk a route without signing up for anything. The features that genuinely need an account — like emergency contacts — ask for one then.',
  },
];
