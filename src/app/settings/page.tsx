"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const COLLECTION_KEY = "classica_collection";
const CUSTOM_COMPOSERS_KEY = "classica_custom_composers";
const HIDDEN_COMPOSERS_KEY = "classica_hidden_composers";
const PRACTICE_SESSIONS_KEY = "classica_practice_sessions";

interface BackupPayload {
  app: "classica";
  version: 1;
  exportedAt: string;
  collection: unknown;
  customComposers: unknown;
  hiddenComposers: unknown;
  practiceSessions: unknown;
}

function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    setMessage(null);
    try {
      const payload: BackupPayload = {
        app: "classica",
        version: 1,
        exportedAt: new Date().toISOString(),
        collection: readJSON(COLLECTION_KEY) ?? [],
        customComposers: readJSON(CUSTOM_COMPOSERS_KEY) ?? [],
        hiddenComposers: readJSON(HIDDEN_COMPOSERS_KEY) ?? [],
        practiceSessions: readJSON(PRACTICE_SESSIONS_KEY) ?? [],
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      a.download = `classica-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "Backup downloaded" });
    } catch {
      setMessage({ type: "error", text: "Export failed" });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Partial<BackupPayload>;
      if (data.app !== "classica") {
        throw new Error("Not a Classica backup file");
      }
      if (Array.isArray(data.collection)) {
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(data.collection));
      }
      if (Array.isArray(data.customComposers)) {
        localStorage.setItem(CUSTOM_COMPOSERS_KEY, JSON.stringify(data.customComposers));
      }
      if (Array.isArray(data.hiddenComposers)) {
        localStorage.setItem(HIDDEN_COMPOSERS_KEY, JSON.stringify(data.hiddenComposers));
      }
      if (Array.isArray(data.practiceSessions)) {
        localStorage.setItem(PRACTICE_SESSIONS_KEY, JSON.stringify(data.practiceSessions));
      }
      window.dispatchEvent(new Event("collection-updated"));
      window.dispatchEvent(new Event("practice-updated"));
      setMessage({ type: "success", text: "Backup restored. Reload the page to see changes." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setMessage({ type: "error", text: msg });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <h2 className="text-base font-body font-semibold text-text-primary">
            Your data
          </h2>
        </div>

        <p className="text-xs font-body text-text-secondary leading-relaxed">
          Classica stores your pieces, composers, and practice journal in this
          browser only. Nothing is uploaded. Export a backup if you want to move
          to another device or guard against clearing browser data.
        </p>

        <p className="text-[11px] font-body text-text-secondary/60 leading-relaxed">
          Practice videos are stored separately and aren&apos;t included in this backup.
        </p>

        <div className="flex gap-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex-1 h-10 rounded-full text-sm font-body font-medium"
            style={{
              background: "linear-gradient(135deg, #c5c960 0%, #a8b84d 100%)",
              color: "#1a1f0e",
            }}
          >
            Export backup
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleImportClick}
            className="h-10 px-4 rounded-full text-sm font-body font-medium border border-accent/30"
            style={{
              background: "rgba(197, 201, 96, 0.12)",
              color: "#c5c960",
            }}
          >
            Import
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
        />

        {message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-body ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
          >
            {message.text}
          </motion.p>
        )}
      </div>
    </div>
  );
}
