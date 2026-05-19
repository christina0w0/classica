type PortraitShape = {
  borderRadius?: string;
  clipPath?: string;
};

const SHAPES: PortraitShape[] = [
  // 0 — circle
  { borderRadius: '50%' },
  // 1 — organic blob
  { borderRadius: '62% 38% 53% 47% / 45% 58% 42% 55%' },
  // 2 — flower (8-petal scallop)
  {
    clipPath:
      'polygon(50% 0%, 69% 11%, 85% 15%, 89% 31%, 100% 50%, 89% 69%, 85% 85%, 69% 89%, 50% 100%, 31% 89%, 15% 85%, 11% 69%, 0% 50%, 11% 31%, 15% 15%, 31% 11%)',
  },
  // 3 — heart
  {
    clipPath:
      'polygon(50% 18%, 56% 10%, 65% 3%, 76% 0%, 87% 3%, 95% 12%, 99% 25%, 98% 38%, 92% 52%, 82% 66%, 70% 78%, 58% 88%, 50% 98%, 42% 88%, 30% 78%, 18% 66%, 8% 52%, 2% 38%, 1% 25%, 5% 12%, 13% 3%, 24% 0%, 35% 3%, 44% 10%)',
  },
  // 4 — soft blob 2
  { borderRadius: '40% 60% 55% 45% / 52% 40% 62% 48%' },
  // 5 — squircle
  { borderRadius: '22%' },
];

function hashId(id: string, seed: number): number {
  let h = 0;
  for (const ch of id) h = ((h << seed) - h) + ch.charCodeAt(0);
  return h;
}

export function getPortraitShape(composerId: string) {
  const idx = Math.abs(hashId(composerId, 4)) % SHAPES.length;
  return { ...SHAPES[idx], index: idx };
}

export function getPortraitRotation(composerId: string): number {
  return ((hashId(composerId, 5) % 11) - 5) * 1.3;
}
