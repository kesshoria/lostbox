// ============================================================
// Settings page — Phase 6 wires up the Export/Import/Clear buttons.
// Theme toggle was already live from Phase 1.
// Feedback card added post-Phase 7 with the maintainer's email.
// ============================================================

import { useState, type ReactNode } from "react";
import { Sun, Moon, Monitor, Download, Upload, Trash2, Shield, Mail, MessageSquare, Copy } from "lucide-react";
import { AppShell } from "@/components/layout";
import { Card, Button, ConfirmDialog, useToast } from "@/components/ui";
import { useTheme } from "@/components/ThemeProvider";
import { exportBackup } from "@/lib/export";
import { ImportModal } from "@/components/settings/ImportModal";
import { clearAllData } from "@/db";
import type { ThemePref } from "@/lib/types";

const APP_VERSION = "0.1.2";
const FEEDBACK_EMAIL = "kesshoria@gmail.com";

export function SettingsPage() {
  const { pref, setPref } = useTheme();
  const toast = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const themeOptions: { value: ThemePref; label: string; icon: ReactNode }[] = [
    { value: "system", label: "System", icon: <Monitor size={18} /> },
    { value: "light", label: "Light", icon: <Sun size={18} /> },
    { value: "dark", label: "Dark", icon: <Moon size={18} /> },
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportBackup();
      const msg =
        `Exported ${result.itemCount} item${result.itemCount === 1 ? "" : "s"}, ` +
        `${result.locationCount} location${result.locationCount === 1 ? "" : "s"}, ` +
        `${result.containerCount} container${result.containerCount === 1 ? "" : "s"}, ` +
        `${result.photoCount} photo${result.photoCount === 1 ? "" : "s"}. ` +
        `(${Math.round(result.byteSize / 1024)} KB)`;
      // Use the underlying toast() to pass a custom duration — success() doesn't take one.
      toast.toast(msg, "success", 5000);
    } catch (err) {
      console.error(err);
      toast.error("Could not export backup. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleClearAll() {
    try {
      await clearAllData();
      toast.success("All data cleared.");
    } catch (err) {
      console.error(err);
      toast.error("Could not clear data. Please try again.");
    }
  }

  // Open the user's email app with a pre-filled message. Including the
  // app version + browser info so bug reports are actually useful.
  function handleFeedback() {
    const subject = encodeURIComponent("Feedback for “Where Did I Put It?”");
    // Collect a few diagnostic details to help with bug reports. We do
    // NOT include any user data — just browser/OS info that's already
    // visible to any website.
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
    const platform = typeof navigator !== "undefined" ? (navigator.platform || "unknown") : "unknown";
    const language = typeof navigator !== "undefined" ? (navigator.language || "unknown") : "unknown";
    const onlineStatus = typeof navigator !== "undefined" ? (navigator.onLine ? "online" : "offline") : "unknown";
    const body = encodeURIComponent(
      `Hi,

[Write your feedback, bug report, or feature request here.]


— — — — — — — — — — — — — — — — — — — —
Diagnostic info (helpful for bug reports):
App: Where Did I Put It? v${APP_VERSION}
Platform: ${platform}
Language: ${language}
Connection: ${onlineStatus}
User-Agent: ${userAgent}
— — — — — — — — — — — — — — — — — — — —`,
    );
    //mailto: link — opens the user's default email app
    const mailtoUrl = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  }

  // Copy the email to clipboard — useful if the user wants to email
  // from a different account, or if mailto: doesn't work on their device.
  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      toast.success("Email copied to clipboard.");
    } catch (err) {
      console.error(err);
      toast.error("Could not copy email.");
    }
  }

  return (
    <AppShell title="Settings" subtitle="Theme, backup, and privacy">
      <div className="app-container py-6 space-y-6 max-w-2xl">
        {/* Theme */}
        <Card padding="lg">
          <h2 className="text-base font-semibold text-content-primary mb-1">
            Appearance
          </h2>
          <p className="text-sm text-content-secondary mb-4">
            Choose how the app looks. System follows your device setting.
          </p>
          <div
            role="radiogroup"
            aria-label="Theme"
            className="grid grid-cols-3 gap-2"
          >
            {themeOptions.map(({ value, label, icon }) => {
              const active = pref === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPref(value)}
                  className={[
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition-colors duration-150 ease-calm",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border-subtle bg-surface-raised text-content-secondary hover:bg-surface-inset",
                  ].join(" ")}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Backup */}
        <Card padding="lg">
          <h2 className="text-base font-semibold text-content-primary mb-1">
            Backup
          </h2>
          <p className="text-sm text-content-secondary mb-4">
            Export your data to a JSON file you can save anywhere. Import it later to restore or move to a new device.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleExport}
              loading={exporting}
              disabled={exporting}
            >
              <Download size={18} /> Export backup
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setImportOpen(true)}
            >
              <Upload size={18} /> Import backup
            </Button>
          </div>
        </Card>

        {/* Privacy */}
        <Card padding="lg">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent shrink-0"
            >
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-content-primary mb-1">
                Private by design
              </h2>
              <p className="text-sm text-content-secondary">
                All your data stays in your browser's local storage on this device. Nothing is uploaded to any server. No account, no tracking, no cloud sync. The app works fully offline after first load.
              </p>
            </div>
          </div>
        </Card>

        {/* Feedback */}
        <Card padding="lg">
          <div className="flex items-start gap-3 mb-4">
            <div
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent shrink-0"
            >
              <MessageSquare size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-content-primary mb-1">
                Feedback &amp; support
              </h2>
              <p className="text-sm text-content-secondary">
                Found a bug? Have a feature request? Want to share how you use the app? Send an email — your feedback is welcome.
              </p>
            </div>
          </div>

          {/* Email row — shows the address + opens mail client */}
          <div className="rounded-xl border border-border-subtle bg-surface-inset p-3.5">
            <p className="text-xs text-content-muted mb-1">Email the maintainer</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-accent" aria-hidden="true" />
              <code className="flex-1 text-sm text-content-primary font-mono break-all">
                {FEEDBACK_EMAIL}
              </code>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email to clipboard"
                className="shrink-0 rounded-md p-1.5 text-content-muted hover:bg-surface-raised hover:text-content-primary transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Send feedback button — opens mailto: with pre-filled subject + body */}
          <Button
            variant="primary"
            size="md"
            onClick={handleFeedback}
            className="mt-3 w-full"
          >
            <Mail size={18} /> Send feedback
          </Button>
          <p className="mt-2 text-xs text-content-muted">
            Tapping "Send feedback" opens your email app with the maintainer's
            address, a pre-filled subject, and a few diagnostic details (app
            version, browser, language) that help with bug reports. No data
            from your items, photos, or activity log is included.
          </p>
        </Card>

        {/* Danger zone */}
        <Card padding="lg" className="border-status-lost/30">
          <h2 className="text-base font-semibold text-status-lost mb-1">
            Danger zone
          </h2>
          <p className="text-sm text-content-secondary mb-4">
            Permanently delete every item, location, container, and borrow record on this device. This can't be undone — export a backup first.
          </p>
          <Button
            variant="danger-ghost"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={18} /> Clear all data
          </Button>
        </Card>

        {/* About */}
        <Card padding="md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-content-muted">App version</span>
            <span className="font-medium text-content-primary">{APP_VERSION}</span>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear all data?"
        description="This will permanently delete every item, location, container, and borrow record on this device. There's no undo. Export a backup first if you might want this data later."
        confirmLabel="I understand — delete everything"
        destructive
        typeToConfirm="delete"
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </AppShell>
  );
}
