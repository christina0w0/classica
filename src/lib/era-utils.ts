import { MusicEra, ERA_CONFIG } from "@/types";

export function yearToEra(year: number): MusicEra {
  if (year < 1600) return "renaissance";
  if (year < 1750) return "baroque";
  if (year < 1820) return "classical";
  if (year < 1910) return "romantic";
  return "modern";
}

export function eraToYearRange(era: MusicEra): { start: number; end: number } {
  const config = ERA_CONFIG[era];
  return { start: config.yearStart, end: config.yearEnd };
}

export function getEraLabel(era: MusicEra): string {
  return ERA_CONFIG[era].label;
}

export function getEraColor(era: MusicEra): string {
  return ERA_CONFIG[era].color;
}

export function yearToTimelinePosition(
  year: number,
  timelineStart = 1550,
  timelineEnd = 2010,
): number {
  return (year - timelineStart) / (timelineEnd - timelineStart);
}
