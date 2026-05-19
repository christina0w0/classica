import { PracticeSession } from "@/types";
import { updateSessionNotionSync } from "@/lib/practice-store";

export async function syncToNotion(session: PracticeSession): Promise<boolean> {
  try {
    updateSessionNotionSync(session.id, { notionSyncStatus: "pending" });

    const appBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const syncRes = await fetch("/api/notion/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, appBaseUrl }),
    });
    const syncData = await syncRes.json();

    if (!syncRes.ok) {
      updateSessionNotionSync(session.id, { notionSyncStatus: "error" });
      return false;
    }

    updateSessionNotionSync(session.id, {
      notionPageId: syncData.notionPageId,
      notionSyncStatus: "synced",
      notionLastSynced: new Date().toISOString(),
    });

    return true;
  } catch {
    updateSessionNotionSync(session.id, { notionSyncStatus: "error" });
    return false;
  }
}

export async function checkNotionConfigured(): Promise<boolean> {
  try {
    const res = await fetch("/api/notion/settings");
    const data = await res.json();
    return data.configured === true;
  } catch {
    return false;
  }
}
