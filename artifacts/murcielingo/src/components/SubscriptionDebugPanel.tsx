import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { api } from "@/lib/api";

/**
 * Developer-only diagnostic panel. Renders nothing in production builds
 * (`import.meta.env.DEV` is false). Shows the resolved plan, entitlement
 * keys, last sync timestamp and a presence-only view of subscription
 * env vars (booleans only — never the values themselves).
 *
 * Mount it on internal pages (the manage page, the admin tab) when
 * triaging gating bugs. Safe to leave in source — Vite tree-shakes the
 * body in production builds.
 */
const SubscriptionDebugPanel: React.FC<{ defaultOpen?: boolean }> = ({
  defaultOpen = false,
}) => {
  if (!import.meta.env.DEV) return null;
  return <Panel defaultOpen={defaultOpen} />;
};

interface HealthPayload {
  model: "A" | "B";
  stripe: { configured: boolean; env: Record<string, boolean> };
  revenuecat: { webhookConfigured: boolean; env: Record<string, boolean> };
}

const Panel: React.FC<{ defaultOpen: boolean }> = ({ defaultOpen }) => {
  const sub = useSubscription();
  const [open, setOpen] = useState(defaultOpen);
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api.subscription
      .health()
      .then((h) => {
        if (!cancelled) setHealth(h);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setHealthError(e instanceof Error ? e.message : "Health unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const lastSync = sub.lastSyncAt
    ? new Date(sub.lastSyncAt).toLocaleString()
    : "never";

  return (
    <div
      className="mt-6 rounded-md border border-dashed border-purple-400 bg-purple-50/50 dark:bg-purple-950/10 dark:border-purple-700 text-xs"
      data-testid="subscription-debug-panel"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 font-medium text-purple-900 dark:text-purple-200"
      >
        <span className="flex items-center gap-1.5">
          <Bug className="h-3.5 w-3.5" />
          Subscription debug (DEV only)
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 font-mono text-purple-900/90 dark:text-purple-200/90">
          <Row label="loading" value={String(sub.loading)} />
          <Row label="error" value={sub.error ?? "—"} />
          <Row label="planId" value={sub.planId} />
          <Row label="status" value={sub.status} />
          <Row label="isPremium" value={String(sub.isPremium)} />
          <Row label="lastSyncAt" value={lastSync} />
          <Row
            label="entitlements"
            value={sub.entitlements.length ? sub.entitlements.join(", ") : "—"}
          />
          {sub.data?.subscription && (
            <Row
              label="provider"
              value={sub.data.subscription.provider ?? "—"}
            />
          )}
          <hr className="border-purple-300/40 my-2" />
          {healthError && (
            <Row label="health.error" value={healthError} />
          )}
          {health && (
            <>
              <Row label="model" value={health.model} />
              <Row
                label="stripe.configured"
                value={String(health.stripe.configured)}
              />
              {Object.entries(health.stripe.env).map(([k, v]) => (
                <Row key={k} label={`env.${k}`} value={v ? "set" : "missing"} />
              ))}
              <Row
                label="revenuecat.webhookConfigured"
                value={String(health.revenuecat.webhookConfigured)}
              />
              {Object.entries(health.revenuecat.env).map(([k, v]) => (
                <Row key={k} label={`env.${k}`} value={v ? "set" : "missing"} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-3 leading-snug">
    <span className="opacity-70">{label}</span>
    <span className="text-right break-all">{value}</span>
  </div>
);

export default SubscriptionDebugPanel;
