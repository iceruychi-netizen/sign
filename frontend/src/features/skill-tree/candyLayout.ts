/**
 * Pure layout for the candy-map learning path: where each unit world, banner, lesson node and finish
 * gate sits, the winding road through the nodes, and the decorations at the sides. No React, no randomness
 * at render time: decorations come from a fixed seed so the map looks the same on every visit.
 */

export const MAP_TOP = 40;
export const BANNER_SPACE = 210;
export const NODE_STEP = 175;
export const GATE_SPACE = 110;
/** Horizontal swing of the road, in % of the lane width around the centre (50 %). */
export const SWING = 27;

export type DecorKind = 'lolly' | 'tree' | 'cupcake' | 'cane' | 'donut' | 'icecream' | 'house' | 'gum';
export const DECOR_KINDS: readonly DecorKind[] = ['lolly', 'tree', 'cupcake', 'cane', 'donut', 'icecream', 'house', 'gum'];
export const DECOR_SIZE: Record<DecorKind, [number, number]> = {
  lolly: [52, 104], tree: [78, 108], cupcake: [58, 68], cane: [34, 86], donut: [58, 58], icecream: [44, 80], house: [92, 92], gum: [46, 38],
};

export type Decor = { kind: DecorKind; left: number; top: number; c1: number; c2: number; float: boolean; delay: number };
export type Spark = { left: number; top: number; size: number; delay: number };
export type NodePos = { x: number; y: number };
export type UnitLayout = {
  zoneTop: number; zoneHeight: number; bannerY: number; gateY: number;
  nodes: NodePos[]; decor: Decor[]; sparks: Spark[];
};
export type MapLayout = { height: number; units: UnitLayout[]; points: NodePos[] };

/** Deterministic value in [0, 1) for decoration seed n (seed 42 as everywhere in the project). */
export function seeded(n: number): number {
  const v = Math.sin((n + 42) * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

/** x position (% of the lane) of the g-th lesson along the whole path. */
export function nodeX(g: number): number {
  return 50 + SWING * Math.sin(g * 1.05 + 0.25);
}

export function layoutMap(lessonCounts: readonly number[]): MapLayout {
  const units: UnitLayout[] = [];
  const points: NodePos[] = [];
  let y = 0;
  let g = 0;
  let seed = 1;
  const next = () => seeded(seed++);

  for (const count of lessonCounts) {
    const zoneTop = y;
    y += MAP_TOP;
    const bannerY = y;
    y += BANNER_SPACE;
    const nodes: NodePos[] = [];
    for (let i = 0; i < count; i++) {
      const p = { x: nodeX(g), y };
      nodes.push(p);
      points.push(p);
      y += NODE_STEP;
      g++;
    }
    const gateY = y - 40;
    y += GATE_SPACE;
    const zoneHeight = y - zoneTop;

    const decor: Decor[] = [];
    const sparks: Spark[] = [];
    const rows = Math.max(1, Math.floor((zoneHeight - 140) / 120));
    for (let r = 0; r < rows; r++) {
      for (const side of [0, 1]) {
        const kind = DECOR_KINDS[Math.floor(next() * DECOR_KINDS.length)];
        const left = side === 0 ? 1 + next() * 17 : 80 + next() * 15;
        const top = 130 + r * 120 + next() * 40;
        const c1 = Math.floor(next() * 5) + 1;
        let c2 = Math.floor(next() * 5) + 1;
        if (c2 === c1) c2 = (c1 % 5) + 1;
        decor.push({ kind, left, top, c1, c2, float: next() > 0.6, delay: next() * 4 });
      }
      sparks.push({ left: 20 + next() * 60, top: 150 + r * 120 + next() * 60, size: 18 + Math.round(next() * 12), delay: next() * 2.6 });
    }
    units.push({ zoneTop, zoneHeight, bannerY, gateY, nodes, decor, sparks });
  }
  return { height: y, units, points };
}

/** Smooth road through the points (Catmull-Rom as cubic Béziers), in a viewBox of 0..100 × px. */
export function roadPath(points: readonly NodePos[]): string {
  if (points.length === 0) return '';
  const f = (n: number) => Number(n.toFixed(2));
  let d = `M${f(points[0].x)} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    d += ` C${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)} ${p2.y}`;
  }
  return d;
}
