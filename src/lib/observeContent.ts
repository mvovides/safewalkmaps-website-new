const hasElement = (nodes: NodeList) => {
  for (const node of nodes) if (node.nodeType === Node.ELEMENT_NODE) return true;
  return false;
};

/**
 * Whether a mutation could have changed which elements are on the page. Text and
 * comment churn cannot have, and the page does produce it: a number counting up
 * swaps a text node each time it ticks. Attribute records only arrive when the
 * caller asked for some, so they always count.
 */
const affectsElements = (record: MutationRecord) =>
  record.type === 'attributes' || hasElement(record.addedNodes) || hasElement(record.removedNodes);

/**
 * Calls `onChange` whenever elements are added to or removed from the page's
 * content, and returns a function that stops watching.
 *
 * For code that keeps a set of elements in step with the page. The header and
 * the layout mount once and never again, while the content under them changes
 * with the route and, for the lazy routes, arrives after they have mounted — so
 * a query run when the effect starts misses everything that renders later.
 * `onChange` should re-query and reconcile; it is told that something changed,
 * not what.
 *
 * It watches <main> on purpose (the body is only a fallback for a page without
 * one). Chrome outside it changes as the header inverts and its menu opens, and
 * a caller that writes attributes back into the elements it tracks would feed on
 * its own output if the watch reached them. Mutations arrive batched and are
 * filtered first, so a burst of element changes costs one `onChange`.
 *
 * Attribute changes are ignored unless `attributeFilter` names the ones that
 * matter.
 */
export function observeContent(
  onChange: () => void,
  options: { attributeFilter?: string[] } = {},
): () => void {
  const { attributeFilter } = options;
  const observer = new MutationObserver((records) => {
    if (records.some(affectsElements)) onChange();
  });
  observer.observe(document.querySelector('main') ?? document.body, {
    childList: true,
    subtree: true,
    ...(attributeFilter && { attributes: true, attributeFilter }),
  });
  return () => observer.disconnect();
}
