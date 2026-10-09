export type FaqItem = {
  id: string;
  question: string;
  /** Paragraphs — rendered in order. */
  answer: string[];
};

/**
 * Answers are rewritten from the published SafeWalkMaps FAQ and the routing
 * specification. Where the honest answer is "we do not know yet" or "this has
 * limits", it says so.
 */
export const faqItems: FaqItem[] = [
  {
    id: 'how-safer',
    question: 'How does SafeWalkMaps work out which route is safer?',
    answer: [
      'Every street segment on a candidate route gets its own score, built from street lighting, recent police-recorded incident density, how busy that street tends to be at your departure time, CCTV coverage where a council publishes it, community reports and street context such as roadworks or a closed pavement.',
      'Those segment scores roll up into a route score weighted by distance — but not only by distance. The model also penalises the single worst segment on the route and the share of the walk that sits below a low-score threshold. That stops one long dark stretch from hiding behind an otherwise good average, which is the failure mode of a simple average.',
    ],
  },
  {
    id: 'guarantee',
    question: 'Does a high Safety Score mean a route is safe?',
    answer: [
      'No, and we will not claim otherwise. A Safety Score is a relative comparison between the routes available to you at a particular time, produced from the data we hold for that area.',
      'It is not a guarantee, not a prediction, and not a substitute for your own judgement. A higher-scoring route is not risk-free, and a lower-scoring street is not inherently dangerous — it may simply be a street nobody has published much data about. SafeWalkMaps is also not an emergency service: in an emergency, contact your local emergency number.',
    ],
  },
  {
    id: 'data',
    question: 'What data does SafeWalkMaps use?',
    answer: [
      'Council streetlight records, published police incident data, foot traffic patterns, CCTV locations where councils publish them, roadworks and closure feeds, and anonymised reports from people using the app.',
      'Each signal carries its own confidence value based on how reliable the source is, how well it covers the area and how recent it is. Where confidence is low, the app scores more conservatively and tells you that it is doing so rather than presenting a shaky number as a firm one.',
    ],
  },
  {
    id: 'coverage',
    question: 'Will SafeWalkMaps work where I live?',
    answer: [
      'SafeWalkMaps is in beta in London and Sheffield. Coverage depends on how much useful open data a city publishes — street lighting records in particular vary a great deal between councils.',
      'We are expanding city by city based on demand, so joining the waitlist genuinely does tell us where to look next.',
    ],
  },
  {
    id: 'launch',
    question: 'When does the iOS app launch?',
    answer: [
      'SafeWalkMaps is being prepared for iOS and we have not committed to a public launch date.',
      'We would rather not announce a date and miss it. The waitlist gets the build first, and an email when there is something real to open.',
    ],
  },
  {
    id: 'privacy',
    question: 'How does SafeWalkMaps handle my location?',
    answer: [
      'Your live location is not stored on our servers. Routing works against map and safety data rather than a history of your walks, so there is no journey log sitting in a database.',
      'If you share a walk, that creates a temporary link which expires once you arrive. Community reports are anonymised. You can plan and walk a route without creating an account at all.',
    ],
  },
  {
    id: 'fastest',
    question: 'Can I still just take the fastest route?',
    answer: [
      'Yes. Fastest, Balanced and Safer are shown side by side with their times, distances and scores, and the choice is yours every time.',
      'Sometimes the fastest route is also the best-scoring one, and SafeWalkMaps will tell you that too. The point is to add information to the decision, not to take the decision away from you.',
    ],
  },
  {
    id: 'night',
    question: 'Does it work at night?',
    answer: [
      'Night is the case it exists for. Lighting carries much more weight once the sun is down, and foot traffic is judged against what is normal for that street at that hour rather than an all-day average.',
      'The practical consequence is that the same walk can score differently at 7pm and at 1am, and the route it suggests can change accordingly.',
    ],
  },
  {
    id: 'cost',
    question: 'Will it cost anything?',
    answer: [
      'The core of the app — safety-aware route planning, community reports and location sharing — is free.',
      'We plan to offer an optional paid tier later for extras such as extended offline areas. The safety features stay free.',
    ],
  },
];
