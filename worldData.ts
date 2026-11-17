import { AreaId } from '../types/game';

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
  maxY?: number;
}

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface BridgeDef {
  id: string;
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  width: number;
  deckY: number;
}

export const WATER_LEVEL = -0.55;

export const BRIDGES: BridgeDef[] = [
  {
    id: 'bridge_east',
    x1: 24,
    z1: 0,
    x2: 40,
    z2: 0,
    width: 5.6,
    deckY: 0.75,
  },
  {
    id: 'bridge_west',
    x1: -25,
    z1: 0,
    x2: -40,
    z2: 0,
    width: 5.6,
    deckY: 0.75,
  },
  {
    id: 'bridge_north',
    x1: 0,
    z1: -26,
    x2: 0,
    z2: -56,
    width: 5.6,
    deckY: 0.75,
  },
  {
    id: 'bridge_tasik_pavilion',
    x1: 9,
    z1: -69,
    x2: 18,
    z2: -69,
    width: 4.8,
    deckY: 0.85,
  },
];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getBridgeFloorAt(x: number, z: number): number | null {
  for (const b of BRIDGES) {
    const dx = b.x2 - b.x1;
    const dz = b.z2 - b.z1;
    const lenSq = dx * dx + dz * dz;
    if (lenSq === 0) continue;
    const t = ((x - b.x1) * dx + (z - b.z1) * dz) / lenSq;
    if (t < -0.02 || t > 1.02) continue;
    const projX = b.x1 + t * dx;
    const projZ = b.z1 + t * dz;
    const dist = Math.hypot(x - projX, z - projZ);
    if (dist <= b.width * 0.5) {
      // Slight graceful arch along the bridge
      const arch = Math.sin(Math.max(0, Math.min(1, t)) * Math.PI) * 0.65;
      return b.deckY + arch;
    }
  }
  return null;
}

/**
 * Computes raw terrain height (without bridges) at world coordinates (x, z).
 * Used identically for vertex displacement and physics grounding.
 */
export function getTerrainHeight(x: number, z: number): number {
  let h = 0.25 + Math.sin(x * 0.06) * Math.cos(z * 0.06) * 0.25;

  // Flatten central Kampung Puisi plaza
  const distKampung = Math.hypot(x, z);
  const kampungFlat = 1 - smoothstep(14, 24, distKampung);
  h = h * (1 - kampungFlat) + 0.35 * kampungFlat;

  // Hutan Makna gentle rolling hills (east, around x = 64, z = 0)
  const distHutan = Math.hypot(x - 64, z);
  if (distHutan < 42) {
    const hutanWeight = 1 - smoothstep(26, 42, distHutan);
    const rolling = 0.85 + Math.sin(x * 0.11) * 0.55 + Math.cos(z * 0.12) * 0.45;
    h += rolling * hutanWeight * 0.6;
  }

  // Gunung Puisi mountain ramp & summit plateau (west, around x = -72, z = 0)
  const distGunung = Math.hypot(x + 72, z);
  if (distGunung < 36) {
    // Broad plateau at center (r <= 14), smooth walkable ramp from r=35 down to r=14
    const plateau = 1 - smoothstep(13.5, 34, distGunung);
    h += plateau * 7.2;
  }
  // Gentle ramp bridge connection from x=-40 to x=-54 along z=0
  if (x < -38 && x > -62 && Math.abs(z) < 12) {
    const pathBlend = (1 - smoothstep(5, 12, Math.abs(z))) * smoothstep(-38, -56, x);
    h = Math.max(h, 0.35 + pathBlend * 3.8);
  }

  // East River channel (x ~ 32)
  const eastRiverDist = Math.abs(x - 32 + Math.sin(z * 0.08) * 1.4);
  if (eastRiverDist < 6.5 && Math.abs(z) < 42) {
    const carve = 1 - smoothstep(2.6, 6.5, eastRiverDist);
    h -= carve * 2.1;
  }

  // West River channel (x ~ -32.5)
  const westRiverDist = Math.abs(x + 32.5 + Math.cos(z * 0.07) * 1.2);
  if (westRiverDist < 6.2 && Math.abs(z) < 42) {
    const carve = 1 - smoothstep(2.5, 6.2, westRiverDist);
    h -= carve * 2.1;
  }

  // North Lake (Tasik Irama centered at (0, -68)) + inlet channel at z ~ -36
  const distTasik = Math.hypot(x * 0.9, z + 68);
  if (distTasik < 27) {
    // Outer lake basin carved below water level
    const basin = 1 - smoothstep(20, 27, distTasik);
    h -= basin * 2.2;
    // Central island for Astaka Tasik Irama (radius 12)
    if (distTasik < 14.5) {
      const island = 1 - smoothstep(9.5, 14.5, distTasik);
      h += island * 2.6;
    }
  }
  // Pavilion Ajaib Island at (22, -69) in Tasik Irama
  const distPavilion = Math.hypot(x - 22, z + 69);
  if (distPavilion < 9.5) {
    const pavIsland = 1 - smoothstep(5.5, 9.5, distPavilion);
    h = Math.max(h, -1.2) + pavIsland * 2.1;
  }
  // Inlet channel connecting lake to kampung north edge
  if (z < -28 && z > -48 && Math.abs(x) < 18) {
    const channelCarve = (1 - smoothstep(10, 18, Math.abs(x))) * (1 - smoothstep(7, 11, Math.abs(z + 37)));
    h -= channelCarve * 1.9;
  }

  // Surrounding distant mountain ring (natural outdoor perimeter)
  const edgeDist = Math.max(Math.abs(x), Math.abs(z));
  if (edgeDist > 92) {
    const rim = smoothstep(92, 125, edgeDist);
    const ridgeNoise = Math.abs(Math.sin(x * 0.09) * Math.cos(z * 0.09)) * 7;
    h += rim * (14 + ridgeNoise);
  }

  // Extra scenic peaks behind Gunung Puisi
  const backPeakDist = Math.hypot(x + 96, z - 24);
  if (backPeakDist < 22) {
    h += (1 - smoothstep(4, 22, backPeakDist)) * 13;
  }
  const backPeakDist2 = Math.hypot(x + 96, z + 26);
  if (backPeakDist2 < 24) {
    h += (1 - smoothstep(4, 24, backPeakDist2)) * 15;
  }

  return h;
}

export function getGroundHeight(x: number, z: number): number {
  const bridgeH = getBridgeFloorAt(x, z);
  const terrainH = getTerrainHeight(x, z);
  if (bridgeH !== null) {
    return Math.max(bridgeH, terrainH);
  }
  return terrainH;
}

export function isWaterAt(x: number, z: number): boolean {
  if (getBridgeFloorAt(x, z) !== null) return false;
  return getTerrainHeight(x, z) < WATER_LEVEL + 0.08;
}

export function getAreaAt(x: number, z: number): AreaId {
  if (x > 33) return 'hutan';
  if (x < -34) return 'gunung';
  if (z < -35) return 'tasik';
  return 'kampung';
}

// Building & landmark colliders (populated cleanly so world & physics match)
export const BUILDING_BOX_COLLIDERS: BoxCollider[] = [
  // Balai Ilmu Kampung Puisi (x: 0, z: -9, size ~ 8x6)
  { minX: -4.4, maxX: 4.4, minZ: -13.2, maxZ: -6.2 },
  // Rumah Melayu Barat Kampung (x: -15, z: -8)
  { minX: -18.2, maxX: -11.8, minZ: -11.2, maxZ: -4.8 },
  // Pondokan Timur Kampung (x: 15, z: 9)
  { minX: 12.2, maxX: 17.8, minZ: 6.2, maxZ: 11.8 },
];

export const CIRCLE_COLLIDERS: CircleCollider[] = [
  // NPC stands (gentle collision so player doesn't clip inside NPC)
  { x: 0, z: -3.8, radius: 0.9 }, // Cikgu Aminah
  { x: 46, z: 0, radius: 0.9 }, // Cikgu Faris
  { x: 0, z: -64, radius: 0.9 }, // Puan Melati
  { x: -72, z: -4, radius: 0.9 }, // Tok Pendeta
  // Astaka Tasik Irama pillars
  { x: -4.2, z: -72.2, radius: 0.55 },
  { x: 4.2, z: -72.2, radius: 0.55 },
  { x: -4.2, z: -65.8, radius: 0.55 },
  { x: 4.2, z: -65.8, radius: 0.55 },
  // Gunung Puisi Arch pillars
  { x: -76.5, z: -3.6, radius: 0.85 },
  { x: -76.5, z: 3.6, radius: 0.85 },
  // Penjaga Sajak NPC & Pavilion Ajaib pillars at (22, -69)
  { x: 17.5, z: -66.5, radius: 0.9 },
  { x: 19.2, z: -71.8, radius: 0.45 },
  { x: 24.8, z: -71.8, radius: 0.45 },
  { x: 19.2, z: -66.2, radius: 0.45 },
  { x: 24.8, z: -66.2, radius: 0.45 },
];
