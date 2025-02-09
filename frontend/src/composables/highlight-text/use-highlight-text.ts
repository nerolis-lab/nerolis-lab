export function useHighlightText() {
  function highlightText(event: FocusEvent) {
    const target = event.target as HTMLInputElement

    // Use a slight delay to avoid browser conflicts
    setTimeout(() => target.select(), 1)
  }

  return { highlightText }
}
