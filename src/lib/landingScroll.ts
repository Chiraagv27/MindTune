/** Scroll so the section's vertical center aligns with the viewport center. */
export function scrollToLandingSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY;
  const height = el.offsetHeight;
  const viewport = window.innerHeight;
  const target = top + height / 2 - viewport / 2;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport);
  const clamped = Math.max(0, Math.min(maxScroll, target));

  window.dispatchEvent(new CustomEvent('landing:navbar-hide'));
  window.scrollTo({ top: clamped, behavior: 'smooth' });
  window.history.replaceState(null, '', `#${sectionId}`);
}

export function landingSectionNavClick(
  event: { preventDefault: () => void },
  sectionId: string,
) {
  event.preventDefault();
  scrollToLandingSection(sectionId);
}
