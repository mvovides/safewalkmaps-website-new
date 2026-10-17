/**
 * The card material: translucent glass with a hairline edge.
 *
 * A card over an illustration or a tinted panel reads as a layer above it
 * rather than a hole cut in it, and there is no shadow — the theme is flat, so
 * depth comes from the material and the line. Padding stays with each card.
 *
 * Kept as utilities rather than a CSS class on purpose: the
 * reduced-transparency rule in src/styles/index.css finds blurs by matching
 * `backdrop-blur` in the class attribute, so a class name would hide it.
 */
export const cardSurface = 'rounded-card border border-line bg-surface/70 backdrop-blur-md';
