import { describe, expect, it } from 'vitest';
import { BANNER_SPACE, GATE_SPACE, MAP_TOP, NODE_STEP, layoutMap, nodeX, roadPath, seeded } from './candyLayout';

describe('candyLayout', () => {
  it('places one node per lesson, top to bottom, inside its unit world', () => {
    const map = layoutMap([7, 1, 2]);
    expect(map.points).toHaveLength(10);
    expect(map.units.map((u) => u.nodes.length)).toEqual([7, 1, 2]);
    for (let i = 1; i < map.points.length; i++) expect(map.points[i].y).toBeGreaterThan(map.points[i - 1].y);
    for (const u of map.units) {
      for (const n of u.nodes) {
        expect(n.y).toBeGreaterThan(u.zoneTop);
        expect(n.y).toBeLessThan(u.zoneTop + u.zoneHeight);
        expect(n.x).toBeGreaterThanOrEqual(50 - 27);
        expect(n.x).toBeLessThanOrEqual(50 + 27);
      }
    }
  });

  it('stacks unit worlds without gaps and sizes the map to fit them', () => {
    const map = layoutMap([2, 3]);
    expect(map.units[0].zoneTop).toBe(0);
    expect(map.units[1].zoneTop).toBe(map.units[0].zoneTop + map.units[0].zoneHeight);
    expect(map.units[0].nodes[0].y).toBe(MAP_TOP + BANNER_SPACE);
    expect(map.units[0].zoneHeight).toBe(MAP_TOP + BANNER_SPACE + 2 * NODE_STEP + GATE_SPACE);
    const last = map.units[1];
    expect(map.height).toBeGreaterThanOrEqual(last.zoneTop + last.zoneHeight);
  });

  it('keeps decorations to the sides and is the same on every call', () => {
    const a = layoutMap([7, 1, 2]);
    const b = layoutMap([7, 1, 2]);
    expect(a).toEqual(b);
    for (const u of a.units) {
      expect(u.decor.length).toBeGreaterThan(0);
      for (const d of u.decor) {
        expect(d.left < 20 || d.left > 78).toBe(true);
        expect(d.c1).not.toBe(d.c2);
      }
    }
    expect(seeded(3)).toBeGreaterThanOrEqual(0);
    expect(seeded(3)).toBeLessThan(1);
  });

  it('draws the road through every point', () => {
    expect(roadPath([])).toBe('');
    expect(roadPath([{ x: 50, y: 10 }])).toBe('M50 10');
    const d = roadPath([{ x: nodeX(0), y: 10 }, { x: nodeX(1), y: 200 }, { x: nodeX(2), y: 400 }]);
    expect(d.startsWith('M')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d.endsWith(' 400')).toBe(true);
  });
});
