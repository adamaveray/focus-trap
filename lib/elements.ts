const possibleFocusableElementsSelector =
  'a,button,input:not([type="hidden"]),select,textarea,details,iframe,embed,object,summary,dialog,audio[controls],video[controls],[contenteditable],[tabindex]';
const nonFocusableElementsSelector = '[disabled],[hidden],[aria-hidden="true"],[tabindex="-1"]';
const focusableElementsSelector = `:is(${possibleFocusableElementsSelector}):not(${nonFocusableElementsSelector})`;

export function isActiveElement(element: Element): boolean {
  return document.activeElement === element;
}

export function isContainedOrSelf(element: Node, container: Node): boolean {
  return element === container || container.contains(element);
}

function elementMatchesSelector(element: Node, selector: string): element is Element {
  return element instanceof Element && element.matches(selector);
}

function hasNonFocusableParent(element: Element): boolean {
  return element.closest(nonFocusableElementsSelector) != null;
}

export function isFocusable(element: Element): boolean {
  return elementMatchesSelector(element, focusableElementsSelector) && !hasNonFocusableParent(element);
}

/**
 * @param container An element to locate focusable elements within.
 * @param includeSelf Whether to include the container itself if it also is a focusable element. It will be added to the start of the collection.
 * @returns All focusable elements found within the container.
 */
export function getFocusableElements(container: HTMLElement | Document, includeSelf: boolean = false): HTMLElement[] {
  return [
    ...(includeSelf && elementMatchesSelector(container, focusableElementsSelector) ? [container] : []),
    ...container.querySelectorAll<HTMLElement>(focusableElementsSelector),
  ].filter((element) => !hasNonFocusableParent(element));
}
