"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Composer, MusicPiece, ERA_CONFIG } from "@/types";
import { getComposerById } from "@/lib/composers-seed";
import { getComposerImage } from "@/lib/composer-images";
import { getPiecesByComposer, getCustomComposerById } from "@/lib/store";
import PieceCard from "@/components/PieceCard";
import AddPieceModal from "@/components/AddPieceModal";


export default function ComposerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [composer, setComposer] = useState<Composer | null>(null);
  const [pieces, setPieces] = useState<MusicPiece[]>([]);
  const [bio, setBio] = useState<string>("");
  const [loadingBio, setLoadingBio] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const refreshPieces = useCallback(() => {
    const id = params.id as string;
    setPieces(getPiecesByComposer(id));
  }, [params.id]);

  useEffect(() => {
    const id = params.id as string;
    const found = getComposerById(id) || getCustomComposerById(id);
    if (found) {
      setComposer(found);
      setBio(found.bio || "");
      setPieces(getPiecesByComposer(id));
      if (!found.bio) fetchBio(id, found.name);
    }
  }, [params.id]);

  useEffect(() => {
    const handler = () => refreshPieces();
    window.addEventListener("collection-updated", handler);
    return () => window.removeEventListener("collection-updated", handler);
  }, [refreshPieces]);

  async function fetchBio(id: string, name: string) {
    setLoadingBio(true);
    try {
      const url = `/api/composer/${id}/bio?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.bio) setBio(data.bio);
      }
    } catch {
      /* use seed bio */
    } finally {
      setLoadingBio(false);
    }
  }

  if (!composer) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-sm font-body text-text-secondary">
          Composer not found
        </p>
      </div>
    );
  }

  const eraColor = ERA_CONFIG[composer.era].color;
  const lifespan = composer.birthYear === 0
    ? null
    : composer.deathYear
      ? `${composer.birthYear}–${composer.deathYear}`
      : `b. ${composer.birthYear}`;

  return (
    <div className="min-h-dvh pb-24 relative overflow-hidden">
      {/* Ambient floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${eraColor}0c 0%, transparent 70%)`,
            top: "5%",
            left: "-10%",
            animation: "float-drift 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${eraColor}0a 0%, transparent 70%)`,
            top: "25%",
            right: "-8%",
            animation: "float-drift-reverse 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-56 h-56 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${eraColor}08 0%, transparent 70%)`,
            bottom: "15%",
            left: "20%",
            animation: "float-drift 30s ease-in-out infinite 5s",
          }}
        />
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${eraColor}09 0%, transparent 70%)`,
            top: "60%",
            right: "10%",
            animation: "float-drift-reverse 22s ease-in-out infinite 3s",
          }}
        />
      </div>

      {/* Portrait blended into page background */}
      {getComposerImage(composer.id) && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-0"
          aria-hidden="true"
          style={{
            height: 480,
            maskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
          }}
        >
          <img
            src={getComposerImage(composer.id)}
            alt=""
            className="w-full h-full object-cover"
            style={{
              opacity: 0.45,
              filter: "saturate(0.35) contrast(1.1) brightness(0.7)",
              objectPosition: "center 0%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `${eraColor}0e`, mixBlendMode: "color" }}
          />
        </div>
      )}

      {/* Header */}
      <div className="relative">
        {/* Glow pulse behind content */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 25%, ${eraColor}14 0%, transparent 55%)`,
            animation: "pulse-glow 8s ease-in-out infinite",
          }}
        />

        <header className="relative px-5 pt-12 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => router.push("/")}
              className="w-10 h-10 rounded-full flex items-center justify-center glass-card"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e8e4d4"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-body text-text-secondary">
              <button
                onClick={() => router.push("/")}
                className="hover:text-text-primary transition-colors"
              >
                Collection
              </button>
              <span className="opacity-40">/</span>
              <span className="text-text-primary truncate max-w-[160px]">
                {composer.name}
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mt-10"
          >
            <h1 className="font-display text-3xl italic font-light text-text-primary">
              {composer.name}
            </h1>
            {composer.pronunciation && (
              <p className="text-xs font-body text-text-secondary italic mt-1">
                {composer.pronunciation}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <span
                className="text-[10px] font-body font-medium tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                style={{
                  color: eraColor,
                  background: `${eraColor}15`,
                  border: `1px solid ${eraColor}30`,
                }}
              >
                {ERA_CONFIG[composer.era].label}
              </span>
              {lifespan && (
                <span className="text-xs font-body text-text-secondary">
                  {lifespan}
                </span>
              )}
            </div>
          </motion.div>
        </header>
      </div>

      <div className="px-5 space-y-8">
        {/* Bio */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="font-display text-lg text-text-primary mb-3">About</h2>
          {loadingBio ? (
            <div className="glass-card p-4 h-20 animate-pulse" />
          ) : (
            <div className="glass-card p-4">
              <p className="text-sm font-body text-text-secondary leading-relaxed">
                {bio || "No biography available."}
              </p>
            </div>
          )}
        </motion.section>

        {/* Collected Pieces */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-text-primary">
              Collected Pieces
              {pieces.length > 0 && (
                <span className="text-text-secondary text-sm ml-2">
                  ({pieces.length})
                </span>
              )}
            </h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: `${eraColor}15`,
                border: `1px solid ${eraColor}30`,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={eraColor}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>
          </div>
          {pieces.length > 0 ? (
            <div className="space-y-3">
              {pieces.map((piece, i) => (
                <PieceCard key={piece.id} piece={piece} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm font-body text-text-secondary">
                No pieces collected yet.
              </p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-body font-medium transition-colors"
                  style={{
                    color: eraColor,
                    background: `${eraColor}15`,
                    border: `1px solid ${eraColor}30`,
                  }}
                >
                  Add Manually
                </button>
                <button
                  onClick={() => router.push("/listen")}
                  className="px-4 py-2 rounded-full text-xs font-body font-medium glass-card transition-colors"
                  style={{ color: "#a8d8c8" }}
                >
                  Identify with Mic
                </button>
              </div>
            </div>
          )}
        </motion.section>
      </div>

      <AddPieceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={refreshPieces}
        preselectedComposer={composer}
      />
    </div>
  );
}
