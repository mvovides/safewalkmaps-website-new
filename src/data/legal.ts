import type { LegalSection } from '@/components/layout/LegalPage';

/**
 * Legal copy.
 *
 * Substantive commitments here are carried over from the published
 * SafeWalkMaps privacy and terms pages. Where a specific legal or company
 * detail is not established — the operating entity, the governing jurisdiction,
 * a named DPO — the text says so in a visible `needs-confirmation` block
 * instead of inventing one. No certifications, audits or encryption standards
 * are claimed anywhere.
 */

export const PRIVACY_UPDATED = '2026-10-09';
export const TERMS_UPDATED = '2026-10-09';

export const privacySections: LegalSection[] = [
  {
    id: 'principles',
    title: 'The short version',
    blocks: [
      {
        type: 'p',
        text: 'SafeWalkMaps is a personal-safety product, which means the data it touches is sensitive by nature. Our approach is to hold as little of it as possible.',
      },
      {
        type: 'list',
        items: [
          'Your live location is not stored on our servers. Routing runs against map and safety data, not against a history of where you have walked.',
          'If you share a walk, that creates a temporary link which expires. It is not a permanent trail.',
          'Community reports are anonymised. A report carries a place and a time, not a person.',
          'You can plan and walk a route without creating an account.',
          'We do not sell personal data.',
        ],
      },
    ],
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    blocks: [
      {
        type: 'definitions',
        items: [
          {
            term: 'Route requests',
            text: 'A start point and a destination are needed to calculate a route. These are processed to return routes to your device.',
          },
          {
            term: 'Safety reports you submit',
            text: 'The report content, the location it refers to, and a timestamp. Reports are anonymised before they appear to anyone else.',
          },
          {
            term: 'Device and diagnostic information',
            text: 'Operating system version, device model and app version, used to diagnose crashes and performance problems.',
          },
          {
            term: 'Account details, if you create one',
            text: 'An email address, and emergency contacts if you choose to add them. Features that need an account ask for one at the point you use them.',
          },
          {
            term: 'Waitlist details',
            text: 'If you join the iOS waitlist from this website, we hold the email address — and name, if you give one — so we can email you when the app is ready.',
          },
        ],
      },
    ],
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    blocks: [
      {
        type: 'list',
        items: [
          'To calculate and return walking routes and their safety scores.',
          'To keep safety data current, by folding anonymised community reports back into scoring.',
          'To fix bugs, crashes and performance problems.',
          'To contact you about SafeWalkMaps if you asked us to — for example, by joining the waitlist. Every email we send has an unsubscribe link.',
        ],
      },
      {
        type: 'p',
        text: 'We do not use your data to build advertising profiles, and we do not sell it.',
      },
    ],
  },
  {
    id: 'legal-basis',
    title: 'Legal basis and your rights',
    blocks: [
      {
        type: 'p',
        text: 'SafeWalkMaps is committed to compliance with the UK GDPR and the EU General Data Protection Regulation for users in the United Kingdom and the European Economic Area.',
      },
      {
        type: 'p',
        text: 'We process route and report data because it is necessary to provide the service you have asked for. Marketing email is sent on the basis of your consent, which you can withdraw at any time.',
      },
      {
        type: 'list',
        items: [
          'Access — you can request a copy of the personal data we hold about you.',
          'Rectification — you can have inaccurate data corrected.',
          'Erasure — you can ask us to delete your personal data, unless we have a legal obligation to keep it.',
          'Portability — you can receive your data in a structured, machine-readable format.',
          'Restriction and objection — you can ask us to limit how we process your data, or object to processing.',
          'Withdrawal of consent — where processing relies on consent, you can withdraw it at any time.',
          'Complaint — you can complain to your local data protection authority. In the UK that is the Information Commissioner’s Office.',
        ],
      },
      {
        type: 'p',
        text: 'To exercise any of these, email us. We may need to verify your identity before we act on a request, and we aim to respond within 30 days.',
      },
      {
        type: 'needs-confirmation',
        text: 'The registered operating entity, its registered address, and whether a Data Protection Officer has been formally appointed. These must be named here before this policy is published.',
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Who else sees it',
    blocks: [
      {
        type: 'p',
        text: 'We use third-party service providers to run the product — for example, hosting, crash reporting, and the form provider that delivers website enquiries and waitlist signups to our inbox. Those providers process data on our instructions and under their own privacy terms.',
      },
      {
        type: 'p',
        text: 'If you use the SOS feature, the information needed to respond — including your location — is passed to emergency services and to the emergency contacts you have chosen. That is the point of the feature.',
      },
      {
        type: 'p',
        text: 'We may disclose data where we are legally required to do so.',
      },
      {
        type: 'needs-confirmation',
        text: 'The final list of sub-processors, and whether any of them process data outside the UK or EEA (which would require a transfer mechanism such as the UK IDTA or EU Standard Contractual Clauses to be named here).',
      },
    ],
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    blocks: [
      {
        type: 'list',
        items: [
          'Live location: not retained.',
          'Shared walk links: retained only for the life of the link, then expired.',
          'Community reports: retained in anonymised form, and their influence on scoring decays over roughly a month.',
          'Waitlist details: until the launch campaign has run, or until you unsubscribe or ask us to delete them.',
          'Account details: until you delete your account.',
        ],
      },
      {
        type: 'needs-confirmation',
        text: 'Exact retention periods for diagnostic and crash data.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blocks: [
      {
        type: 'p',
        text: 'Traffic between the app, this website and our servers is sent over HTTPS, and access to production systems is restricted to the people who need it.',
      },
      {
        type: 'p',
        text: 'We are deliberately not claiming any security certification or audit here, because we do not hold one. No service can promise absolute security, and anyone who tells you otherwise is overselling.',
      },
    ],
  },
  {
    id: 'children',
    title: 'Children',
    blocks: [
      {
        type: 'p',
        text: 'SafeWalkMaps is not intended for children under 13, and we do not knowingly collect their personal information. If you believe we have, contact us and we will delete it.',
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies on this website',
    blocks: [
      {
        type: 'p',
        text: 'This website does not set advertising or tracking cookies, and it does not embed third-party analytics.',
      },
      {
        type: 'p',
        text: 'Form submissions are sent directly to our form provider when you submit them. Nothing is sent before that.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    blocks: [
      {
        type: 'p',
        text: 'If we make a significant change we will update the date at the top of this page, and tell waitlist members and account holders by email or in-app notice.',
      },
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    id: 'about',
    title: 'About these terms',
    blocks: [
      {
        type: 'p',
        text: 'These terms cover your use of the SafeWalkMaps website and the SafeWalkMaps app. By using either, you agree to them.',
      },
      {
        type: 'p',
        text: 'The app is in beta. Features may change, and coverage varies by city.',
      },
      {
        type: 'needs-confirmation',
        text: 'The registered operating entity that these terms are entered into with, and its registered address.',
      },
    ],
  },
  {
    id: 'what-it-is',
    title: 'What SafeWalkMaps is — and is not',
    blocks: [
      {
        type: 'p',
        text: 'SafeWalkMaps compares walking routes using the data available for an area and presents a relative safety score with the reasons behind it. It is a tool to help you make a more informed choice.',
      },
      {
        type: 'list',
        items: [
          'A Safety Score is a relative comparison produced from available data. It is not a guarantee that a route is safe.',
          'A higher-scoring route is not risk-free, and a lower-scoring street is not inherently dangerous — it may simply be one we hold less data about.',
          'SafeWalkMaps cannot predict crime, and does not claim to.',
          'SafeWalkMaps is not an emergency service and does not replace one. In an emergency, contact your local emergency number.',
          'Data can be incomplete, out of date or wrong. Your own judgement comes first, always.',
        ],
      },
      {
        type: 'p',
        text: 'We do not warrant that the service will protect you from harm, or that any route will be safe at any particular time.',
      },
    ],
  },
  {
    id: 'your-use',
    title: 'Using the service responsibly',
    blocks: [
      {
        type: 'p',
        text: 'There are a few things we need you not to do, mostly because they degrade the data everyone else relies on:',
      },
      {
        type: 'list',
        items: [
          'Do not submit false or misleading safety reports.',
          'Do not use the service for anything illegal.',
          'Do not harass, abuse or endanger other people through the service.',
          'Do not scrape, harvest or bulk-extract data from the service.',
          'Do not attempt to break, overload or circumvent the security of our systems.',
          'Keep your account credentials to yourself, if you have an account.',
        ],
      },
      {
        type: 'p',
        text: 'We may suspend or end access where these terms are broken. You can delete your account at any time from the app.',
      },
    ],
  },
  {
    id: 'content',
    title: 'Reports you submit',
    blocks: [
      {
        type: 'p',
        text: 'When you submit a safety report, you give us permission to use, display and distribute it within the service in anonymised form, so it can improve routing for other people. You confirm it is yours to submit.',
      },
      {
        type: 'p',
        text: 'We may remove reports that appear false, abusive or identifying.',
      },
    ],
  },
  {
    id: 'ip',
    title: 'Intellectual property',
    blocks: [
      {
        type: 'p',
        text: 'The SafeWalkMaps name, logo, interface and software are ours, and are protected by copyright and trade mark law. Using the service does not transfer any of that to you.',
      },
      {
        type: 'p',
        text: 'Underlying public data — such as published police statistics or council street lighting records — belongs to its original publishers and remains subject to their licences.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Price and availability',
    blocks: [
      {
        type: 'p',
        text: 'The core of the app — safety-aware route planning, community reports and location sharing — is free. We plan to offer an optional paid tier later for extras such as extended offline areas; the safety features will stay free.',
      },
      {
        type: 'p',
        text: 'We do not promise uninterrupted or error-free operation. The service is provided on an "as is" and "as available" basis.',
      },
    ],
  },
  {
    id: 'liability',
    title: 'Liability',
    blocks: [
      {
        type: 'p',
        text: 'Nothing in these terms limits liability where the law does not allow it to be limited — including for death or personal injury caused by negligence, or for fraud.',
      },
      {
        type: 'p',
        text: 'Subject to that, and to the fullest extent the law allows, we are not liable for indirect or consequential loss arising from your use of the service, or for decisions you make on the basis of a safety score.',
      },
      {
        type: 'needs-confirmation',
        text: 'The liability cap and the governing law and jurisdiction clause. These need to be set by a qualified adviser for the operating entity rather than drafted here.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    blocks: [
      {
        type: 'p',
        text: 'We may update these terms. If a change is significant we will update the date at the top of this page and notify account holders by email or in-app notice. Continuing to use the service after a change means you accept the updated terms.',
      },
    ],
  },
];
