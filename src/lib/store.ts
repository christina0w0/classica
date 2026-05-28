"use client";

import { MusicPiece, Composer } from "@/types";

const COLLECTION_KEY = "classica_collection";
const CUSTOM_COMPOSERS_KEY = "classica_custom_composers";
const HIDDEN_COMPOSERS_KEY = "classica_hidden_composers";

function getCollection(): MusicPiece[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCollection(pieces: MusicPiece[]) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(pieces));
}

export function getAllPieces(): MusicPiece[] {
  return getCollection();
}

export function getPieceById(id: string): MusicPiece | undefined {
  return getCollection().find((p) => p.id === id);
}

export function getPiecesByComposer(composerId: string): MusicPiece[] {
  return getCollection().filter((p) => p.composerId === composerId);
}

export function addPiece(piece: MusicPiece): void {
  const collection = getCollection();
  const exists = collection.find((p) => p.id === piece.id);
  if (!exists) {
    collection.push(piece);
    saveCollection(collection);
  }
}

export function removePiece(id: string): void {
  const collection = getCollection().filter((p) => p.id !== id);
  saveCollection(collection);
}

export function toggleFavorite(id: string): boolean {
  const collection = getCollection();
  const piece = collection.find((p) => p.id === id);
  if (piece) {
    piece.isFavorite = !piece.isFavorite;
    saveCollection(collection);
    return piece.isFavorite;
  }
  return false;
}

export function getFavoritePieces(): MusicPiece[] {
  return getCollection().filter((p) => p.isFavorite);
}

export function isPieceInCollection(id: string): boolean {
  return getCollection().some((p) => p.id === id);
}

export function getCollectionByEra(): Record<string, MusicPiece[]> {
  const collection = getCollection();
  return collection.reduce(
    (acc, piece) => {
      if (!acc[piece.era]) acc[piece.era] = [];
      acc[piece.era].push(piece);
      return acc;
    },
    {} as Record<string, MusicPiece[]>,
  );
}

export function getComposerPieceCounts(): Record<string, number> {
  const collection = getCollection();
  return collection.reduce(
    (acc, piece) => {
      acc[piece.composerId] = (acc[piece.composerId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function getCustomComposers(): Composer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_COMPOSERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomComposers(list: Composer[]) {
  localStorage.setItem(CUSTOM_COMPOSERS_KEY, JSON.stringify(list));
}

export function getAllCustomComposers(): Composer[] {
  return getCustomComposers();
}

export function getCustomComposerById(id: string): Composer | undefined {
  return getCustomComposers().find((c) => c.id === id);
}

export function addCustomComposer(composer: Composer): void {
  const list = getCustomComposers();
  if (!list.find((c) => c.id === composer.id)) {
    list.push(composer);
    saveCustomComposers(list);
  }
}

export function updateCustomComposer(id: string, updates: Partial<Composer>): void {
  const list = getCustomComposers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveCustomComposers(list);
  }
}

function getHiddenComposers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_COMPOSERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHiddenComposers(ids: string[]): void {
  localStorage.setItem(HIDDEN_COMPOSERS_KEY, JSON.stringify(ids));
}

export function getAllHiddenComposers(): string[] {
  return getHiddenComposers();
}

export function removeComposerAndPieces(composerId: string): void {
  const collection = getCollection().filter((p) => p.composerId !== composerId);
  saveCollection(collection);

  const customs = getCustomComposers();
  const wasCustom = customs.some((c) => c.id === composerId);
  if (wasCustom) {
    saveCustomComposers(customs.filter((c) => c.id !== composerId));
  } else {
    const hidden = getHiddenComposers();
    if (!hidden.includes(composerId)) {
      saveHiddenComposers([...hidden, composerId]);
    }
  }

  window.dispatchEvent(new Event("collection-updated"));
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
