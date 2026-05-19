"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SettingsState {
  configured: boolean;
  hasApiKey: boolean;
  hasActivityId: boolean;
  activityPageId: string;
  databaseId: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [activityPageId, setActivityPageId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; dbName?: string; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/notion/settings")
      .then((r) => r.json())
      .then((data: SettingsState) => {
        setSettings(data);
        setActivityPageId(data.activityPageId || "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, string> = {};
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      if (activityPageId.trim() !== (settings?.activityPageId || "")) {
        body.activityPageId = activityPageId.trim();
      }

      if (Object.keys(body).length === 0) {
        setMessage({ type: "error", text: "No changes to save" });
        return;
      }

      const res = await fetch("/api/notion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Settings saved. Restart the dev server for changes to take effect." });
        setApiKey("");
        const refreshed = await fetch("/api/notion/settings").then((r) => r.json());
        setSettings(refreshed);
        setActivityPageId(refreshed.activityPageId || "");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/notion/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ ok: false, error: "Network error" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="px-5 pt-14 pb-32 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-display italic text-text-primary">Settings</h1>
      </div>

      {/* Notion Integration */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h2v8H8z" />
            <path d="M14 8l-2 8h2l2-8h-2z" />
          </svg>
          <h2 className="text-base font-body font-semibold text-text-primary">
            Notion Integration
          </h2>
          {settings?.configured && (
            <span className="ml-auto text-[10px] font-body px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
              Connected
            </span>
          )}
        </div>

        <p className="text-xs font-body text-text-secondary leading-relaxed">
          Sync your practice sessions to your Notion Planning database. Reflections, duration, and timestamps will appear as rows alongside your other tracked activities.
        </p>

        {/* API Key */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-body font-medium text-text-secondary">
            Notion API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={settings?.hasApiKey ? "••••••••  (key saved)" : "ntn_..."}
            className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-body text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/40"
          />
          <p className="text-[10px] font-body text-text-secondary/60">
            Create an integration at{" "}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noreferrer"
              className="text-accent/80 underline"
            >
              notion.so/my-integrations
            </a>
          </p>
        </div>

        {/* Activity Page ID */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-body font-medium text-text-secondary">
            Activity Page ID
          </label>
          <input
            type="text"
            value={activityPageId}
            onChange={(e) => setActivityPageId(e.target.value)}
            placeholder="Paste the ID of your Violin Practice activity page"
            className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-body text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/40"
          />
          <p className="text-[10px] font-body text-text-secondary/60">
            The page ID of your &quot;Violin Practice&quot; activity (for the Activities Done relation).
            Find it in the page URL after the last dash.
          </p>
        </div>

        {/* Database ID (read-only) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-body font-medium text-text-secondary">
            Planning Database ID
          </label>
          <div className="w-full bg-black/10 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm font-body text-text-secondary/60 select-all">
            {settings?.databaseId || "1725c6b8b015815f80e7e30b26fa4b1d"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-full text-sm font-body font-medium"
            style={{
              background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
              color: "#1a1f0e",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTest}
            disabled={testing || !settings?.hasApiKey}
            className="h-10 px-4 rounded-full text-sm font-body font-medium border border-accent/30"
            style={{
              background: "rgba(197, 201, 96, 0.12)",
              color: "#c5c960",
              opacity: testing || !settings?.hasApiKey ? 0.5 : 1,
            }}
          >
            {testing ? "Testing..." : "Test Connection"}
          </motion.button>
        </div>

        {/* Messages */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-body ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
          >
            {message.text}
          </motion.p>
        )}

        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[var(--border-subtle)] p-2.5"
          >
            {testResult.ok ? (
              <div className="space-y-1">
                <p className="text-xs font-body text-green-400 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Connected successfully
                </p>
                {testResult.dbName && (
                  <p className="text-[10px] font-body text-text-secondary">
                    Database: {testResult.dbName}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs font-body text-red-400">
                {testResult.error}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Field Mapping Info */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-body font-semibold text-text-primary">
          Field Mapping
        </h3>
        <p className="text-[11px] font-body text-text-secondary leading-relaxed">
          When a practice session syncs, Classica maps data to your Planning database like this:
        </p>
        <div className="space-y-1.5">
          {[
            ["Session start", "Start"],
            ["Session end", "End"],
            ["Duration (min)", "Duration"],
            ["Piece, reflection, journal", "Reflection"],
            ["Violin Practice", "Activities Done"],
          ].map(([from, to]) => (
            <div key={from} className="flex items-center gap-2 text-[10px] font-body">
              <span className="text-text-secondary/70 flex-1">{from}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6e58" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="text-accent/80 flex-1 text-right">{to}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
