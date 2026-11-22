// VitePress toggles `.active` on the outline link but never scrolls it into view or resets scroll when nothing's active.
export function watchActiveOutlineLink(): () => void {
  let observer: MutationObserver | null = null;

  const outline = document.querySelector('.VPDocAsideOutline');
  const scrollContainer = document.querySelector('.aside-container');
  if (outline) {
    observer = new MutationObserver(() => {
      const activeLink = outline.querySelector('.outline-link.active');
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'nearest' });
      } else {
        scrollContainer?.scrollTo({ top: 0 });
      }
    });
    observer.observe(outline, { attributes: true, attributeFilter: ['class'], subtree: true });
  }

  return () => observer?.disconnect();
}
