// ============================================================
// StorageUnavailable — full-screen fallback shown when the app
// detects that IndexedDB isn't available (very old browser, or
// some browsers in private/incognito mode that disable it).
// ============================================================

import { AlertCircle } from "lucide-react";

export function StorageUnavailable() {
  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-card bg-surface-raised border border-border-subtle shadow-card p-6 text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-lost/15 text-status-lost mb-4"
        >
          <AlertCircle size={28} />
        </div>
        <h1 className="text-lg font-semibold text-content-primary">
          This browser can't run “Where Did I Put It?”
        </h1>
        <p className="mt-2 text-sm text-content-secondary">
          The app needs local storage (IndexedDB) to save your data, but this
          browser has it disabled. This usually happens when:
        </p>
        <ul className="mt-3 text-sm text-content-secondary text-left list-disc list-inside space-y-1">
          <li>You're using private / incognito mode (some browsers disable storage)</li>
          <li>You're using a very old browser (try Chrome, Firefox, Safari, or Edge)</li>
          <li>You've disabled site data storage in your browser settings</li>
        </ul>
        <p className="mt-4 text-sm text-content-secondary">
          Try opening this page in a normal browser window. Your data is
          always stored locally on your device — never on a server.
        </p>
      </div>
    </div>
  );
}
