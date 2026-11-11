// ============================================================
// App router. Mobile-first routes; all wrapped by AppShell.
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { ItemsPage } from "@/pages/ItemsPage";
import { ItemDetailPage } from "@/pages/ItemDetailPage";
import { LocationsPage } from "@/pages/LocationsPage";
import { ContainersPage } from "@/pages/ContainersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { StorageUnavailable } from "@/components/StorageUnavailable";
import { isIndexedDbAvailable } from "@/db";

export default function App() {
  // If IndexedDB isn't available, show a friendly fallback instead of
  // letting the app silently fail on every DB operation.
  if (!isIndexedDbAvailable()) {
    return <StorageUnavailable />;
  }

  return (
    <BrowserRouter>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface-overlay focus:px-4 focus:py-2 focus:shadow-raised focus:text-content-primary"
      >
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/containers" element={<ContainersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
