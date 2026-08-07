/**
 * Keep focused form controls above the soft keyboard on phone.
 * Uses visualViewport when available; falls back to scrollIntoView.
 */
export const ensureFieldVisible = (target: EventTarget | null): void => {
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (!target.matches('input, textarea, select, [contenteditable="true"]')) {
    return;
  }

  const scroll = () => {
    target.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });
  };

  // Wait a beat for the keyboard / viewport resize.
  requestAnimationFrame(() => {
    window.setTimeout(scroll, 80);
  });
};
