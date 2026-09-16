/** First paint of the sidebar; more rows mount as you scroll. */
export const SESSION_LIST_PAGE = 32;

export function sessionListWindow(
  total: number,
  requested: number,
  activeIndex: number,
): number {
  if (total <= 0) return 0;
  const includeActive = activeIndex >= 0 ? activeIndex + 1 : 0;
  return Math.min(total, Math.max(SESSION_LIST_PAGE, requested, includeActive));
}
