// ============================================================
// useDebouncedValue — generic debounce hook for forms + search.
// Returns the latest value after `delay` ms of quiet time.
// Used by the search bar (Phase 3) so we don't filter on every
// keystroke — 250ms feels instant but skips fast typing.
// ============================================================

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
