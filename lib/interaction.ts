import { getFocusableElements, isActiveElement, isContainedOrSelf, isFocusable } from './elements.ts';

/**
 * @param container An element containing focusable elements.
 * @param direction Which direction to move focus.
 * @returns Whether focus was manually wrapped.
 */
function moveFocus(container: HTMLElement, direction: 'next' | 'previous'): boolean {
  const focusableElements = getFocusableElements(container, true);
  if (focusableElements.length === 0) {
    // No elements to focus on
    return true;
  }

  const firstElement = focusableElements.at(0);
  const lastElement = focusableElements.at(-1);

  // Rotate focus
  let targetElement: HTMLElement | undefined;
  switch (direction) {
    case 'next': {
      if (lastElement != null && isActiveElement(lastElement)) {
        // Wrap to start
        targetElement = firstElement;
      }
      break;
    }
    case 'previous': {
      if (firstElement != null && isActiveElement(firstElement)) {
        // Wrap to end
        targetElement = lastElement;
      }
      break;
    }
  }

  if (targetElement == null) {
    return false;
  }

  targetElement.focus();
  return true;
}

/**
 * Traps keyboard-initiated (i.e. using the tab key) focus to within a specified element, wrapping focus to the first element after reaching the end. If focus is not currently within the element it will be moved.
 *
 * @param container An element to trap keyboard focus within.
 * @param root The root element to listen to keyboard events within.
 * @returns A function to unbind the event listeners.
 */
export function trapFocus(container: HTMLElement, root: typeof globalThis = globalThis): () => void {
  // Ensure currently focused
  const current = document.activeElement;
  if (current == null || !isContainedOrSelf(current, container)) {
    // Move to first focusable element (falling back to container itself last to match native modal `<dialog>` behaviour)
    const firstElement = getFocusableElements(container, false)[0] ?? (isFocusable(container) ? container : undefined);
    firstElement?.focus();
  }

  // Handle future focus moves
  const handler = (event: KeyboardEvent): void => {
    const didIntercept = event.key === 'Tab' && moveFocus(container, event.shiftKey ? 'previous' : 'next');
    if (didIntercept) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  root.addEventListener('keydown', handler);
  return () => {
    root.removeEventListener('keydown', handler);
  };
}
