"use client";

import { PracticeSession } from "@/types";

const SESSIONS_KEY = "classica_practice_sessions";

function getSessions(): PracticeSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: PracticeSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event("practice-updated"));
}

export function getAllSessions(): PracticeSession[] {
  return getSessions().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getSessionById(id: string): PracticeSession | undefined {
  return getSessions().find((s) => s.id === id);
}

export function getSessionsByPiece(pieceId: string): PracticeSession[] {
  return getSessions()
    .filter((s) => s.pieceId === pieceId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addSession(session: PracticeSession): void {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
}

export function updateSession(
  id: string,
  updater: (session: PracticeSession) => PracticeSession,
): void {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return;
  sessions[index] = updater(sessions[index]);
  saveSessions(sessions);
}

export function removeSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
}

export function updateSessionNotes(id: string, notes: string): void {
  const sessions = getSessions();
  const session = sessions.find((s) => s.id === id);
  if (session) {
    session.notes = notes;
    saveSessions(sessions);
  }
}

export function updateSessionReflection(
  id: string,
  reflection: PracticeSession["reflection"],
): void {
  updateSession(id, (session) => ({ ...session, reflection }));
}

export function updateSessionNotionSync(
  id: string,
  fields: Partial<Pick<PracticeSession, "notionPageId" | "notionCalendarEventId" | "notionSyncStatus" | "notionLastSynced">>,
): void {
  updateSession(id, (session) => ({
    ...session,
    ...fields,
  }));
}
