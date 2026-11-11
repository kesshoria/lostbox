// 404 page.
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <AppShell title="Not found">
      <div className="app-container py-16">
        <div className="text-center">
          <p className="text-5xl font-bold text-content-muted">404</p>
          <p className="mt-4 text-lg font-semibold text-content-primary">
            This page wandered off.
          </p>
          <p className="mt-1 text-content-secondary">
            We couldn't find what you were looking for.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
