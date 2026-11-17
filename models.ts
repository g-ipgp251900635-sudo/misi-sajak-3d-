import * as THREE from 'three';
import { WorldMaterials } from './materials';

export interface ArticulatedAvatar {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  head: THREE.Group;
  shadowPlane: THREE.Mesh;
}

function createContactShadow(radius = 0.75): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.03;
  return mesh;
}

/**
 * Original block-style cheerful Year 5 Malaysian adventurer avatar (9-part composite THREE.Group).
 * Bottom-center pivot at y = 0.
 */
export function createPlayerAvatar(): ArticulatedAvatar {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf4c29f, roughness: 0.65 });
  const tunicMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.55 });
  const sashMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.2 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.45 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });

  const shadowPlane = createContactShadow(0.65);
  root.add(shadowPlane);

  // Legs (pivoted at hip y = 0.72)
  const makeLeg = (xOffset: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0.72, 0);
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.32), pantsMat);
    legMesh.position.y = -0.29;
    legMesh.castShadow = true;
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.4), shoeMat);
    shoeMesh.position.set(0, -0.64, 0.04);
    shoeMesh.castShadow = true;
    legGroup.add(legMesh, shoeMesh);
    return legGroup;
  };
  const leftLeg = makeLeg(-0.2);
  const rightLeg = makeLeg(0.2);
  root.add(leftLeg, rightLeg);

  // Torso (y: 0.72 to 1.48)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.76, 0.44), tunicMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  root.add(torso);

  // Golden sash & adventurer backpack
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.48), sashMat);
  sash.position.y = 0.82;
  root.add(sash);

  const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.52, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }),
  );
  backpack.position.set(0, 1.12, -0.32);
  backpack.castShadow = true;
  root.add(backpack);

  // Arms (pivoted at shoulder y = 1.42)
  const makeArm = (xOffset: number) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xOffset, 1.42, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.28), tunicMat);
    sleeve.position.y = -0.18;
    sleeve.castShadow = true;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.24), skinMat);
    hand.position.y = -0.5;
    hand.castShadow = true;
    armGroup.add(sleeve, hand);
    return armGroup;
  };
  const leftArm = makeArm(-0.54);
  const rightArm = makeArm(0.54);
  root.add(leftArm, rightArm);

  // Head + Adventurer Songkok/Cap (pivoted at neck y = 1.52)
  const head = new THREE.Group();
  head.position.set(0, 1.52, 0);
  const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.62, 0.62), skinMat);
  headBox.position.y = 0.31;
  headBox.castShadow = true;
  head.add(headBox);

  // Hair cap
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.64), hairMat);
  hairTop.position.set(0, 0.58, -0.02);
  head.add(hairTop);

  // Malaysian-inspired adventurer cap / tanjak crest
  const capBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.4, 0.18, 6),
    new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.5 }),
  );
  capBase.position.set(0, 0.68, 0);
  const capCrest = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 4), sashMat);
  capCrest.position.set(0, 0.84, 0.08);
  capCrest.rotation.x = 0.25;
  head.add(capBase, capCrest);

  // Eyes & smile
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), eyeMat);
  leftEye.position.set(-0.14, 0.34, 0.31);
  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.04), eyeMat);
  rightEye.position.set(0.14, 0.34, 0.31);
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.05, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.4 }),
  );
  mouth.position.set(0, 0.18, 0.31);
  head.add(leftEye, rightEye, mouth);

  root.add(head);

  return { root, leftArm, rightArm, leftLeg, rightLeg, head, shadowPlane };
}

export interface NpcStyle {
  robeColor: number;
  accentColor: number;
  hatColor: number;
  hasTudung?: boolean;
  hasStaff?: boolean;
}

/**
 * Composite 6-8 part block-style NPC teacher/mentor with floating quest beacon.
 */
export function createNpcModel(style: NpcStyle): {
  group: THREE.Group;
  beacon: THREE.Mesh;
} {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c29b, roughness: 0.65 });
  const robeMat = new THREE.MeshStandardMaterial({ color: style.robeColor, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: style.accentColor,
    roughness: 0.35,
    metalness: 0.2,
  });
  const hatMat = new THREE.MeshStandardMaterial({ color: style.hatColor, roughness: 0.55 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });

  group.add(createContactShadow(0.75));

  // Pedestal base ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.92, 24),
    new THREE.MeshBasicMaterial({ color: style.accentColor, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  // Lower skirt/legs
  const lower = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.74, 0.44), robeMat);
  lower.position.y = 0.37;
  lower.castShadow = true;
  group.add(lower);

  // Upper body
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.72, 0.46), robeMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  group.add(torso);

  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.14, 0.5), accentMat);
  sash.position.y = 0.85;
  group.add(sash);

  // Arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.64, 0.26), robeMat);
  armL.position.set(-0.52, 1.08, 0);
  armL.castShadow = true;
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.64, 0.26), robeMat);
  armR.position.set(0.52, 1.08, 0);
  armR.castShadow = true;
  group.add(armL, armR);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.6, 0.6), skinMat);
  head.position.y = 1.78;
  head.castShadow = true;
  group.add(head);

  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.04), eyeMat);
  eyeL.position.set(-0.14, 1.82, 0.31);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.04), eyeMat);
  eyeR.position.set(0.14, 1.82, 0.31);
  group.add(eyeL, eyeR);

  if (style.hasTudung) {
    const tudungTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.68), hatMat);
    tudungTop.position.set(0, 2.04, -0.02);
    const tudungBack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.22), hatMat);
    tudungBack.position.set(0, 1.68, -0.24);
    const tudungDrape = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.34, 0.48), hatMat);
    tudungDrape.position.set(0, 1.36, 0.02);
    group.add(tudungTop, tudungBack, tudungDrape);
  } else {
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.22, 6), hatMat);
    hat.position.set(0, 2.15, 0);
    group.add(hat);
  }

  if (style.hasStaff) {
    const staff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 }),
    );
    staff.position.set(0.62, 1.05, 0.15);
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      }),
    );
    orb.position.set(0.62, 2.18, 0.15);
    group.add(staff, orb);
  }

  // Floating diamond quest marker above head
  const beacon = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.24, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.5,
    }),
  );
  beacon.position.y = 2.65;
  group.add(beacon);

  return { group, beacon };
}

/**
 * Traditional Malaysian stilted house (Rumah Melayu / Balai Ilmu) with 8+ composite parts.
 */
export function createMalayHouse(mats: WorldMaterials, scale = 1): THREE.Group {
  const group = new THREE.Group();

  // 4 corner stilts (tiang)
  const stiltGeo = new THREE.BoxGeometry(0.42, 1.2, 0.42);
  const corners = [
    [-3.4, -2.4],
    [3.4, -2.4],
    [-3.4, 2.4],
    [3.4, 2.4],
  ];
  corners.forEach(([cx, cz]) => {
    const stilt = new THREE.Mesh(stiltGeo, mats.woodDark);
    stilt.position.set(cx, 0.6, cz);
    stilt.castShadow = true;
    stilt.receiveShadow = true;
    group.add(stilt);
  });

  // Raised wooden floor deck + verandah
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 6.2), mats.woodPlank);
  deck.position.y = 1.2;
  deck.castShadow = true;
  deck.receiveShadow = true;
  group.add(deck);

  // Walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 2.8, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 }),
  );
  walls.position.y = 2.75;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // Decorative batik waist trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(7.32, 0.5, 5.32), mats.batikTrim);
  trim.position.y = 1.75;
  group.add(trim);

  // Door & wooden shutters
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.0, 0.18), mats.woodDark);
  door.position.set(0, 2.35, 2.62);
  group.add(door);

  [-2.2, 2.2].forEach((wx) => {
    const win = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.1 }),
    );
    win.position.set(wx, 2.8, 2.62);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.26, 1.26, 0.12), mats.woodDark);
    frame.position.set(wx, 2.8, 2.58);
    group.add(frame, win);
  });

  // Pitched Bumbung Panjang roof (4-sided prism via ExtrudeGeometry)
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-4.8, 0);
  roofShape.lineTo(0, 2.6);
  roofShape.lineTo(4.8, 0);
  roofShape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 6.4,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 1,
  });
  roofGeo.center();
  const roof = new THREE.Mesh(roofGeo, mats.roofTile);
  roof.position.y = 5.3;
  roof.castShadow = true;
  group.add(roof);

  // Golden ridge ornament (tebar layar finial)
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.85, 4), mats.goldAccent);
  finial.position.set(0, 6.85, 3.1);
  group.add(finial);

  // Front wooden stairs
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 0.55), mats.woodPlank);
    step.position.set(0, 0.2 + s * 0.34, 3.85 - s * 0.42);
    step.castShadow = true;
    step.receiveShadow = true;
    group.add(step);
  }

  group.scale.setScalar(scale);
  return group;
}

/**
 * Octagonal lakeside pavilion (Astaka Tasik Irama).
 */
export function createAstakaPavilion(mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();

  // Octagonal stone base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.2, 0.7, 8), mats.stonePath);
  base.position.y = 0.35;
  base.receiveShadow = true;
  group.add(base);

  // 4 carved pillars
  const pillarGeo = new THREE.CylinderGeometry(0.28, 0.32, 4.2, 8);
  const pillarOffsets = [
    [-3.6, -3.2],
    [3.6, -3.2],
    [-3.6, 3.2],
    [3.6, 3.2],
  ];
  pillarOffsets.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, mats.woodDark);
    pillar.position.set(px, 2.6, pz);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Two-tier Malaysian octagonal roof
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 2.2, 8), mats.roofTile);
  lowerRoof.position.y = 5.4;
  lowerRoof.castShadow = true;
  const upperRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.0, 1.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45, flatShading: true }),
  );
  upperRoof.position.y = 6.9;
  upperRoof.castShadow = true;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 6), mats.goldAccent);
  spire.position.y = 8.2;
  group.add(lowerRoof, upperRoof, spire);

  // Central musical poetry lectern
  const lectern = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.1, 6), mats.batikTrim);
  lectern.position.y = 1.25;
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), mats.goldAccent);
  orb.position.y = 2.25;
  group.add(lectern, orb);

  return group;
}

/**
 * Grand stone archway at the summit of Gunung Puisi.
 */
export function createGunungArchway(mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();

  // Stepped dais
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.6, 0.6, 8), mats.stonePath);
  dais.position.y = 0.3;
  dais.receiveShadow = true;
  group.add(dais);

  // Left & Right pillars
  [-3.6, 3.6].forEach((pz) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.4, 1.3), mats.stoneCliff);
    col.position.set(-4.5, 3.0, pz);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.6), mats.goldAccent);
    cap.position.set(-4.5, 5.8, pz);
    group.add(col, cap);
  });

  // Lintel beam & golden crown crest
  const beam = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 9.2), mats.stoneCliff);
  beam.position.set(-4.5, 6.4, 0);
  beam.castShadow = true;
  const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.75, 0), mats.goldAccent);
  crown.position.set(-4.5, 7.6, 0);
  group.add(beam, crown);

  return group;
}

/**
 * Wooden arched bridge spanning across rivers.
 */
export function createWoodenBridge(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  width: number,
  deckY: number,
  mats: WorldMaterials,
): THREE.Group {
  const group = new THREE.Group();
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);

  group.position.set((x1 + x2) / 2, deckY, (z1 + z2) / 2);
  group.rotation.y = angle;

  const segments = Math.max(8, Math.round(length / 2));
  const segLen = length / segments;

  for (let i = 0; i < segments; i++) {
    const t = (i + 0.5) / segments;
    const localZ = (t - 0.5) * length;
    const arch = Math.sin(t * Math.PI) * 0.65;

    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.24, segLen + 0.08),
      mats.woodPlank,
    );
    plank.position.set(0, arch - 0.12, localZ);
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);

    // Side posts every 2 segments
    if (i % 2 === 0 || i === segments - 1) {
      [-width * 0.46, width * 0.46].forEach((rx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.22), mats.woodDark);
        post.position.set(rx, arch + 0.45, localZ);
        post.castShadow = true;
        group.add(post);

        const support = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.4, 0.24), mats.woodDark);
        support.position.set(rx, arch - 1.3, localZ);
        group.add(support);
      });
    }
  }

  // Side handrails
  [-width * 0.46, width * 0.46].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, length), mats.woodDark);
    rail.position.set(rx, 1.15, 0);
    group.add(rail);
  });

  return group;
}

/**
 * Glowing 3D Poetry Book collectible (Area 1).
 */
export function createBookCollectible(
  colorIndex: number,
  mats: WorldMaterials,
): THREE.Group {
  const group = new THREE.Group();
  const coverMat =
    colorIndex === 0
      ? mats.bookCoverRed
      : colorIndex === 1
        ? mats.bookCoverBlue
        : mats.bookCoverEmerald;

  const backCover = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 1.25), coverMat);
  backCover.castShadow = true;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.22, 1.14), mats.paper);
  pages.position.set(0.03, 0.16, 0);
  const topCover = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 1.25), coverMat);
  topCover.position.y = 0.3;
  topCover.castShadow = true;

  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.22), mats.goldAccent);
  clasp.position.set(0.45, 0.16, 0);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.04, 8, 24),
    mats.goldAccent,
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.16;

  group.add(backCover, pages, topCover, clasp, halo);
  return group;
}

/**
 * Glowing 3D Poetry Fragment scroll (Area 2).
 */
export function createFragmentScroll(mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();

  const parchment = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 1.2, 12),
    mats.scrollGold,
  );
  parchment.rotation.z = Math.PI / 2;
  parchment.castShadow = true;

  const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 12), mats.woodDark);
  capL.rotation.z = Math.PI / 2;
  capL.position.x = -0.64;

  const capR = capL.clone();
  capR.position.x = 0.64;

  const ribbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4 }),
  );
  ribbon.rotation.z = Math.PI / 2;

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.04, 8, 24), mats.goldAccent);
  ring.rotation.x = Math.PI / 2;

  group.add(parchment, capL, capR, ribbon, ring);
  return group;
}

/**
 * Floating Poetry Gem (Permata Puisi) collectible.
 */
export function createGemCollectible(mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), mats.gemCrystal);
  crystal.scale.set(0.9, 1.35, 0.9);
  crystal.castShadow = true;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.035, 8, 20),
    mats.goldAccent,
  );
  ring.rotation.x = Math.PI / 2;
  group.add(crystal, ring);
  return group;
}

/**
 * Wooden Area Signpost with colored banner.
 */
export function createSignpost(bannerColor: number, mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.2, 0.24), mats.woodDark);
  post.position.y = 1.1;
  post.castShadow = true;

  const board = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.72, 0.16), mats.woodPlank);
  board.position.y = 1.85;
  board.castShadow = true;

  const crest = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.16, 0.2),
    new THREE.MeshStandardMaterial({ color: bannerColor, roughness: 0.45 }),
  );
  crest.position.y = 2.25;

  group.add(post, board, crest);
  return group;
}

/**
 * Magical lakeside video pavilion (Pavilion Ajaib Tasik Irama) with 16:9 screen & floating crystal spire.
 */
export function createMagicalPavilion(mats: WorldMaterials): THREE.Group {
  const group = new THREE.Group();

  // Octagonal raised platform
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.2, 0.65, 8), mats.stonePath);
  base.position.y = 0.32;
  base.receiveShadow = true;
  group.add(base);

  const trimRing = new THREE.Mesh(new THREE.CylinderGeometry(4.75, 4.75, 0.14, 8), mats.goldAccent);
  trimRing.position.y = 0.66;
  group.add(trimRing);

  // 4 carved corners
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.28, 4.0, 8);
  const offsets = [
    [-2.8, -2.8],
    [2.8, -2.8],
    [-2.8, 2.8],
    [2.8, 2.8],
  ];
  offsets.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(pillarGeo, mats.woodDark);
    pillar.position.set(px, 2.6, pz);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Glowing turquoise & gold magical roof
  const lowerRoof = new THREE.Mesh(
    new THREE.ConeGeometry(5.6, 1.9, 8),
    new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.38,
      metalness: 0.15,
      flatShading: true,
    }),
  );
  lowerRoof.position.y = 5.2;
  lowerRoof.castShadow = true;

  const upperRoof = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 1.5, 8),
    mats.goldAccent,
  );
  upperRoof.position.y = 6.6;
  upperRoof.castShadow = true;

  const crystalSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), mats.gemCrystal);
  crystalSpire.position.y = 7.95;
  group.add(lowerRoof, upperRoof, crystalSpire);

  // 16:9 Magical Poetry Screen Frame inside the pavilion
  const screenPedestal = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.8), mats.batikTrim);
  screenPedestal.position.set(0, 1.15, 0);
  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.05, 0.18), mats.woodDark);
  screenFrame.position.set(0, 2.65, 0);
  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.8),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    }),
  );
  screenGlow.position.set(0, 2.65, 0.11);
  group.add(screenPedestal, screenFrame, screenGlow);

  return group;
}

