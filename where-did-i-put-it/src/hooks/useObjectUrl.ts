// ============================================================
// useObjectUrl — converts a Blob to a temporary URL for use in
// <img src>, and revokes the URL when the blob changes or the
// component unmounts. Prevents memory leaks (object URLs hold
// onto memory until explicitly revoked).
// ============================================================

import { useEffect, useState } from "react";

export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
    };
  }, [blob]);

  return url;
}
