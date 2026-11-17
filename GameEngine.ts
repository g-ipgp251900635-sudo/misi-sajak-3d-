import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  AREAS,
  HUTAN_FRAGMENTS,
  KAMPUNG_BOOKS,
  POETRY_GEMS,
} from '../data/sajakContent';
import {
  AreaId,
  GameProgress,
  InteractableTarget,
  MinimapMarker,
  PlayerTelemetry,
} from '../types/game';
import { soundEngine } from './audio';
import { createWorldMaterials, WorldMaterials } from './materials';
import {
  ArticulatedAvatar,
  createAstakaPavilion,
  createBookCollectible,
  createFragmentScroll,
  createGemCollectible,
  createGunungArchway,
  createMagicalPavilion,
  createMalayHouse,
  createNpcModel,
  createPlayerAvatar,
  createSignpost,
  createWoodenBridge,
} from './models';
import {
  BRIDGES,
  BUILDING_BOX_COLLIDERS,
  CIRCLE_COLLIDERS,
  CircleCollider,
  getAreaAt,
  getGroundHeight,
  getTerrainHeight,
  isWaterAt,
  WATER_LEVEL,
} from './worldData';

// Module-level reusable math helpers (zero GC inside animation loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export interface EngineCallbacks {
  onTelemetry: (telemetry: PlayerTelemetry) => void;
  onNearestTarget: (target: InteractableTarget | null) => void;
  onInteract: (target: InteractableTarget) => void;
  onCollectGem: (gemId: string) => void;
  onMarkersUpdate: (markers: MinimapMarker[]) => void;
  onContextLost: (lost: boolean) => void;
}

interface FloatingItem {
  id: string;
  kind: 'book' | 'fragment' | 'gem';
  area: AreaId;
  label: string;
  mesh: THREE.Group;
  baseY: number;
  x: number;
  z: number;
  collected: boolean;
}

interface NpcEntity {
  id: string;
  name: string;
  area: AreaId;
  x: number;
  z: number;
  group: THREE.Group;
  beacon: THREE.Mesh;
}

export class GameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private materials!: WorldMaterials;
  private envRT: THREE.WebGLRenderTarget | null = null;

  private isSoftwareGl = false;
  private frameId = 0;
  private disposed = false;
  private clock = new THREE.Clock();

  private mode: 'menu' | 'playing' | 'paused' = 'menu';
  private avatar!: ArticulatedAvatar;
  private playerPos = new THREE.Vector3(0, 0.35, 12);
  private playerVelY = 0;
  private playerYaw = Math.PI; // Facing -Z (toward Cikgu Aminah & Balai Ilmu)
  private isGrounded = true;
  private walkPhase = 0;
  private stepTimer = 0;

  private camYaw = 0; // Camera orbits behind player
  private camPitch = 0.38;
  private camDist = 9.2;
  private currentCamPos = new THREE.Vector3(0, 6, 22);
  private currentLookAt = new THREE.Vector3(0, 1.5, 0);

  private keys: Record<string, boolean> = {};
  private joystickInput = { x: 0, y: 0 };
  private isDraggingCamera = false;
  private dragPointerId: number | null = null;
  private lastPointer = { x: 0, y: 0 };

  private treeColliders: CircleCollider[] = [];
  private npcs: NpcEntity[] = [];
  private floatingItems: FloatingItem[] = [];
  private currentNearest: InteractableTarget | null = null;
  private lastTelemetryTime = 0;
  private lastMarkerHash = '';

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private detectSoftwareWebGL(): boolean {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param) || '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      return true;
    }
  }

  private init() {
    this.isSoftwareGl = this.detectSoftwareWebGL();
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    // WebGL context loss safety
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);

    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xbce3ff);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0xbce3ff, 0.0046);

    // Studio environment map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envRT.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.2, 320);

    // Lighting: 3-point warm sun + cool hemisphere fill + rim light
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x3f6212, 0.85);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff4d6, 1.85);
    sun.position.set(45, 72, 38);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 220;
    const d = 95;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.55);
    rimLight.position.set(-55, 32, -45);
    this.scene.add(rimLight);

    // Materials
    this.materials = createWorldMaterials(
      this.renderer.capabilities.getMaxAnisotropy(),
      this.isSoftwareGl,
    );

    // Build World
    this.buildTerrain();
    this.buildWater();
    this.buildBridgesAndPaths();
    this.buildLandmarks();
    this.buildInstancedFoliageAndRocks();
    this.buildClouds();
    this.buildNpcs();
    this.buildCollectibles();

    // Player Avatar
    this.avatar = createPlayerAvatar();
    const startH = getGroundHeight(this.playerPos.x, this.playerPos.z);
    this.playerPos.y = startH;
    this.avatar.root.position.copy(this.playerPos);
    this.avatar.root.rotation.y = this.playerYaw;
    this.scene.add(this.avatar.root);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.emitMarkers();
    this.tick();
  }

  private buildTerrain() {
    const size = 250;
    const segs = 128;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cMeadow = new THREE.Color(0x4ade80);
    const cHutan = new THREE.Color(0x22c55e);
    const cSand = new THREE.Color(0xfde68a);
    const cRock = new THREE.Color(0x94a3b8);
    const cSummit = new THREE.Color(0xf59e0b);
    const cSnowRim = new THREE.Color(0xe2e8f0);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      if (y < WATER_LEVEL + 0.35) {
        _color.copy(cSand);
      } else if (y > 9.5) {
        _color.copy(cRock).lerp(cSnowRim, Math.min(1, (y - 9.5) / 8));
      } else if (x < -54 && y > 5.8) {
        _color.copy(cMeadow).lerp(cSummit, 0.32);
      } else if (x < -42 && y > 1.8) {
        _color.copy(cMeadow).lerp(cRock, Math.min(0.65, (y - 1.8) / 6));
      } else if (x > 34) {
        _color.copy(cHutan);
      } else {
        _color.copy(cMeadow);
      }

      // Subtle organic tint variation
      const n = Math.sin(x * 0.23) * Math.cos(z * 0.23) * 0.04;
      colors[i * 3] = Math.min(1, Math.max(0, _color.r + n));
      colors[i * 3 + 1] = Math.min(1, Math.max(0, _color.g + n));
      colors[i * 3 + 2] = Math.min(1, Math.max(0, _color.b + n));
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.02,
      flatShading: true,
    });

    const terrain = new THREE.Mesh(geo, mat);
    terrain.receiveShadow = true;
    this.scene.add(terrain);
  }

  private buildWater() {
    const waterGeo = new THREE.PlaneGeometry(240, 240, 64, 64);
    const waterMesh = new THREE.Mesh(waterGeo, this.materials.water);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = WATER_LEVEL;
    waterMesh.receiveShadow = true;
    this.scene.add(waterMesh);
  }

  private buildBridgesAndPaths() {
    for (const b of BRIDGES) {
      const bridge = createWoodenBridge(
        b.x1,
        b.z1,
        b.x2,
        b.z2,
        b.width,
        b.deckY,
        this.materials,
      );
      this.scene.add(bridge);
    }

    // Stepping stone paths in Kampung Puisi (raised +0.03 above terrain to prevent Z-fighting)
    const pathNodes = [
      { x: 0, z: 10, w: 3.4, l: 12 },
      { x: 12, z: 0, w: 22, l: 3.2 },
      { x: -12, z: 0, w: 22, l: 3.2 },
      { x: 0, z: -15, w: 3.2, l: 18 },
    ];
    for (const p of pathNodes) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(p.w, 0.12, p.l),
        this.materials.stonePath,
      );
      const y = getTerrainHeight(p.x, p.z);
      mesh.position.set(p.x, y + 0.03, p.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }
  }

  private buildLandmarks() {
    // Area 1: Kampung Puisi Malaysian Houses
    const balai = createMalayHouse(this.materials, 1.0);
    balai.position.set(0, getTerrainHeight(0, -9.5), -9.5);
    this.scene.add(balai);

    const rumahBarat = createMalayHouse(this.materials, 0.78);
    rumahBarat.position.set(-15, getTerrainHeight(-15, -8), -8);
    rumahBarat.rotation.y = Math.PI / 6;
    this.scene.add(rumahBarat);

    const rumahTimur = createMalayHouse(this.materials, 0.72);
    rumahTimur.position.set(15, getTerrainHeight(15, 9), 9);
    rumahTimur.rotation.y = -Math.PI * 0.75;
    this.scene.add(rumahTimur);

    // Area 3: Astaka Tasik Irama & Pavilion Ajaib Video Sajak
    const astaka = createAstakaPavilion(this.materials);
    astaka.position.set(0, getTerrainHeight(0, -69), -69);
    this.scene.add(astaka);

    const magicalPavilion = createMagicalPavilion(this.materials);
    magicalPavilion.position.set(22, getTerrainHeight(22, -69), -69);
    magicalPavilion.rotation.y = -Math.PI / 2;
    this.scene.add(magicalPavilion);

    // Area 4: Gunung Puisi Summit Archway
    const arch = createGunungArchway(this.materials);
    arch.position.set(-72, getTerrainHeight(-72, 0), 0);
    this.scene.add(arch);

    // Area Signposts near bridges & entrances
    const signs = [
      { x: 21, z: 3.5, rot: -Math.PI / 2, color: 0x059669 }, // East to Hutan Makna
      { x: -21, z: 3.5, rot: Math.PI / 2, color: 0xd97706 }, // West to Gunung Puisi
      { x: 3.5, z: -22, rot: 0, color: 0x0284c7 }, // North to Tasik Irama
    ];
    for (const s of signs) {
      const sign = createSignpost(s.color, this.materials);
      sign.position.set(s.x, getTerrainHeight(s.x, s.z), s.z);
      sign.rotation.y = s.rot;
      this.scene.add(sign);
    }
  }

  private buildInstancedFoliageAndRocks() {
    // Deterministic seeded PRNG so world layout is consistent
    let seed = 4219;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const treePositions: { x: number; z: number; scale: number; tint: number }[] = [];

    const isClearZone = (x: number, z: number): boolean => {
      // Keep paths, bridges, houses, NPCs, and collectibles clear
      if (Math.abs(x) < 6 && z > -80 && z < 22) return true;
      if (Math.abs(z) < 6 && x > -84 && x < 84) return true;
      if (Math.hypot(x, z) < 20) return true;
      if (Math.hypot(x - 64, z) < 24 && Math.hypot(x - 64, z) > 18) return false;
      if (Math.hypot(x, z + 68) < 28) return true; // Lake & island
      if (Math.hypot(x + 72, z) < 19) return true; // Summit plateau
      if (isWaterAt(x, z)) return true;
      for (const b of KAMPUNG_BOOKS) {
        if (Math.hypot(x - b.x, z - b.z) < 3.5) return true;
      }
      for (const f of HUTAN_FRAGMENTS) {
        if (Math.hypot(x - f.x, z - f.z) < 4.2) return true;
      }
      return false;
    };

    // Hutan Makna dense grove + Kampung & outer forest perimeter
    for (let i = 0; i < 240; i++) {
      const isHutan = i < 75;
      const x = isHutan ? 40 + rand() * 52 : (rand() - 0.5) * 195;
      const z = isHutan ? (rand() - 0.5) * 65 : (rand() - 0.5) * 195;
      if (isClearZone(x, z)) continue;
      const y = getTerrainHeight(x, z);
      if (y < WATER_LEVEL + 0.5 || y > 13) continue;
      treePositions.push({
        x,
        z,
        scale: 0.85 + rand() * 0.45,
        tint: rand(),
      });
    }

    const trunkGeo = new THREE.CylinderGeometry(0.32, 0.46, 2.6, 7);
    trunkGeo.translate(0, 1.3, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const canopyLowerGeo = new THREE.ConeGeometry(2.1, 2.8, 7);
    canopyLowerGeo.translate(0, 3.3, 0);
    const canopyUpperGeo = new THREE.ConeGeometry(1.55, 2.3, 7);
    canopyUpperGeo.translate(0, 4.9, 0);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      flatShading: true,
    });

    const count = treePositions.length;
    if (count > 0) {
      const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
      const lowerCanopies = new THREE.InstancedMesh(canopyLowerGeo, canopyMat, count);
      const upperCanopies = new THREE.InstancedMesh(canopyUpperGeo, canopyMat, count);

      trunks.castShadow = true;
      lowerCanopies.castShadow = true;
      upperCanopies.castShadow = true;
      lowerCanopies.receiveShadow = true;

      const c1 = new THREE.Color(0x16a34a);
      const c2 = new THREE.Color(0x15803d);
      const c3 = new THREE.Color(0x22c55e);

      treePositions.forEach((tp, idx) => {
        const y = getTerrainHeight(tp.x, tp.z);
        _dummy.position.set(tp.x, y, tp.z);
        _dummy.rotation.set(0, rand() * Math.PI * 2, 0);
        _dummy.scale.setScalar(tp.scale);
        _dummy.updateMatrix();
        trunks.setMatrixAt(idx, _dummy.matrix);
        lowerCanopies.setMatrixAt(idx, _dummy.matrix);
        upperCanopies.setMatrixAt(idx, _dummy.matrix);

        _color.copy(tp.tint < 0.33 ? c1 : tp.tint < 0.66 ? c2 : c3);
        lowerCanopies.setColorAt(idx, _color);
        _color.offsetHSL(0, 0, 0.05);
        upperCanopies.setColorAt(idx, _color);

        this.treeColliders.push({
          x: tp.x,
          z: tp.z,
          radius: 0.72 * tp.scale,
        });
      });

      trunks.instanceMatrix.needsUpdate = true;
      lowerCanopies.instanceMatrix.needsUpdate = true;
      upperCanopies.instanceMatrix.needsUpdate = true;
      if (lowerCanopies.instanceColor) lowerCanopies.instanceColor.needsUpdate = true;
      if (upperCanopies.instanceColor) upperCanopies.instanceColor.needsUpdate = true;

      trunks.computeBoundingSphere();
      lowerCanopies.computeBoundingSphere();
      upperCanopies.computeBoundingSphere();

      this.scene.add(trunks, lowerCanopies, upperCanopies);
    }

    // Wildflowers (InstancedMesh)
    const flowerCount = 180;
    const flowerGeo = new THREE.DodecahedronGeometry(0.24, 0);
    flowerGeo.translate(0, 0.24, 0);
    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      flatShading: true,
    });
    const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
    const palette = [
      new THREE.Color(0xf43f5e), // Bunga Raya red
      new THREE.Color(0xfacc15), // Yellow
      new THREE.Color(0xf472b6), // Pink
      new THREE.Color(0x38bdf8), // Sky blue
    ];
    let placedFlowers = 0;
    for (let i = 0; i < 320 && placedFlowers < flowerCount; i++) {
      const fx = (rand() - 0.5) * 165;
      const fz = (rand() - 0.5) * 165;
      if (isWaterAt(fx, fz)) continue;
      const fy = getTerrainHeight(fx, fz);
      if (fy < WATER_LEVEL + 0.35 || fy > 8.5) continue;
      _dummy.position.set(fx, fy, fz);
      _dummy.rotation.set(0, rand() * Math.PI * 2, 0);
      _dummy.scale.setScalar(0.75 + rand() * 0.55);
      _dummy.updateMatrix();
      flowers.setMatrixAt(placedFlowers, _dummy.matrix);
      flowers.setColorAt(placedFlowers, palette[placedFlowers % palette.length]);
      placedFlowers++;
    }
    flowers.count = placedFlowers;
    flowers.instanceMatrix.needsUpdate = true;
    if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
    flowers.computeBoundingSphere();
    this.scene.add(flowers);

    // Rocks (InstancedMesh)
    const rockGeo = new THREE.DodecahedronGeometry(0.85, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.88,
      flatShading: true,
    });
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 70);
    let placedRocks = 0;
    for (let i = 0; i < 160 && placedRocks < 70; i++) {
      const rx = (rand() - 0.5) * 180;
      const rz = (rand() - 0.5) * 180;
      if (Math.hypot(rx, rz) < 18 || Math.abs(rz) < 5 || Math.abs(rx) < 5) continue;
      if (isWaterAt(rx, rz)) continue;
      const ry = getTerrainHeight(rx, rz);
      const s = 0.6 + rand() * 1.1;
      _dummy.position.set(rx, ry + s * 0.3, rz);
      _dummy.rotation.set(rand(), rand(), rand());
      _dummy.scale.set(s, s * 0.72, s);
      _dummy.updateMatrix();
      rocks.setMatrixAt(placedRocks, _dummy.matrix);
      _color.setHex(0x64748b).offsetHSL(0, 0, (rand() - 0.5) * 0.12);
      rocks.setColorAt(placedRocks, _color);
      if (s > 0.95) {
        this.treeColliders.push({ x: rx, z: rz, radius: s * 0.75 });
      }
      placedRocks++;
    }
    rocks.count = placedRocks;
    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
    rocks.computeBoundingSphere();
    this.scene.add(rocks);
  }

  private buildClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      flatShading: true,
    });
    const puffGeo = new THREE.DodecahedronGeometry(2.8, 0);
    const positions = [
      [-35, 34, -40],
      [42, 38, -28],
      [18, 36, 44],
      [-65, 42, 22],
      [75, 35, 35],
    ];
    for (const [cx, cy, cz] of positions) {
      const cloud = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((i - 1) * 2.6, i === 1 ? 0.8 : 0, (i % 2) * 0.8);
        puff.scale.set(1.2, 0.72, 0.95);
        cloud.add(puff);
      }
      cloud.position.set(cx, cy, cz);
      this.scene.add(cloud);
    }
  }

  private buildNpcs() {
    const npcConfigs: {
      id: string;
      name: string;
      area: AreaId;
      x: number;
      z: number;
      rotY: number;
      style: Parameters<typeof createNpcModel>[0];
    }[] = [
      {
        id: 'cikgu_aminah',
        name: 'Cikgu Aminah',
        area: 'kampung',
        x: 0,
        z: -3.8,
        rotY: 0,
        style: { robeColor: 0x059669, accentColor: 0xfbbf24, hatColor: 0xf43f5e, hasTudung: true },
      },
      {
        id: 'penjaga_faris',
        name: 'Cikgu Faris',
        area: 'hutan',
        x: 46,
        z: 0,
        rotY: -Math.PI / 2,
        style: { robeColor: 0x15803d, accentColor: 0xf59e0b, hatColor: 0x78350f },
      },
      {
        id: 'puan_melati',
        name: 'Puan Melati',
        area: 'tasik',
        x: 0,
        z: -64,
        rotY: 0,
        style: { robeColor: 0x0284c7, accentColor: 0xfde047, hatColor: 0x0ea5e9, hasTudung: true },
      },
      {
        id: 'tok_pendeta',
        name: 'Tok Pendeta Puisi',
        area: 'gunung',
        x: -72,
        z: -4,
        rotY: Math.PI / 3,
        style: { robeColor: 0x7c3aed, accentColor: 0xfbbf24, hatColor: 0xfbbf24, hasStaff: true },
      },
      {
        id: 'penjaga_sajak',
        name: 'Penjaga Sajak',
        area: 'tasik',
        x: 17.5,
        z: -66.5,
        rotY: -Math.PI * 0.65,
        style: { robeColor: 0x0d9488, accentColor: 0xfbbf24, hatColor: 0x115e59, hasStaff: true },
      },
    ];

    for (const cfg of npcConfigs) {
      const { group, beacon } = createNpcModel(cfg.style);
      const y = getGroundHeight(cfg.x, cfg.z);
      group.position.set(cfg.x, y, cfg.z);
      group.rotation.y = cfg.rotY;
      this.scene.add(group);
      this.npcs.push({
        id: cfg.id,
        name: cfg.name,
        area: cfg.area,
        x: cfg.x,
        z: cfg.z,
        group,
        beacon,
      });
    }
  }

  private buildCollectibles() {
    // 3 Glowing Books in Kampung Puisi
    KAMPUNG_BOOKS.forEach((book, idx) => {
      const mesh = createBookCollectible(idx, this.materials);
      const baseY = getGroundHeight(book.x, book.z) + 1.05;
      mesh.position.set(book.x, baseY, book.z);
      this.scene.add(mesh);
      this.floatingItems.push({
        id: book.id,
        kind: 'book',
        area: book.area,
        label: book.title,
        mesh,
        baseY,
        x: book.x,
        z: book.z,
        collected: false,
      });
    });

    // 4 Poetry Fragments in Hutan Makna
    HUTAN_FRAGMENTS.forEach((frag) => {
      const mesh = createFragmentScroll(this.materials);
      const baseY = getGroundHeight(frag.x, frag.z) + 1.1;
      mesh.position.set(frag.x, baseY, frag.z);
      this.scene.add(mesh);
      this.floatingItems.push({
        id: frag.id,
        kind: 'fragment',
        area: frag.area,
        label: frag.title,
        mesh,
        baseY,
        x: frag.x,
        z: frag.z,
        collected: false,
      });
    });

    // 16 Poetry Gems across the 4 zones
    POETRY_GEMS.forEach((gem) => {
      const mesh = createGemCollectible(this.materials);
      const baseY = getGroundHeight(gem.x, gem.z) + 1.15;
      mesh.position.set(gem.x, baseY, gem.z);
      this.scene.add(mesh);
      this.floatingItems.push({
        id: gem.id,
        kind: 'gem',
        area: gem.area,
        label: 'Permata Puisi',
        mesh,
        baseY,
        x: gem.x,
        z: gem.z,
        collected: false,
      });
    });
  }

  public syncProgress(progress: GameProgress) {
    for (const item of this.floatingItems) {
      let done = false;
      if (item.kind === 'book') done = progress.collectedBooks.includes(item.id);
      if (item.kind === 'fragment') done = progress.completedFragments.includes(item.id);
      if (item.kind === 'gem') done = progress.collectedGems.includes(item.id);
      item.collected = done;
      item.mesh.visible = !done;
    }
    this.emitMarkers();
  }

  public setMode(mode: 'menu' | 'playing' | 'paused') {
    this.mode = mode;
    if (mode !== 'playing') {
      this.keys = {};
      this.joystickInput = { x: 0, y: 0 };
    }
  }

  public setJoystick(x: number, y: number) {
    this.joystickInput.x = x;
    this.joystickInput.y = y;
  }

  public triggerJump() {
    if (this.mode === 'playing' && this.isGrounded) {
      this.playerVelY = 9.4;
      this.isGrounded = false;
      soundEngine.playJump();
    }
  }

  public triggerInteract() {
    if (this.mode === 'playing' && this.currentNearest) {
      this.callbacks.onInteract(this.currentNearest);
    }
  }

  public teleportToArea(areaId: AreaId) {
    const info = AREAS[areaId];
    this.playerPos.x = info.spawn.x;
    this.playerPos.z = info.spawn.z;
    this.playerPos.y = getGroundHeight(info.spawn.x, info.spawn.z);
    this.playerVelY = 0;
    this.isGrounded = true;
    this.avatar.root.position.copy(this.playerPos);
    this.resetCamera();
  }

  public resetCamera() {
    this.camYaw = 0;
    this.camPitch = 0.38;
  }

  private emitMarkers() {
    const markers: MinimapMarker[] = [];
    for (const n of this.npcs) {
      markers.push({ id: n.id, type: 'npc', x: n.x, z: n.z, label: n.name });
    }
    for (const item of this.floatingItems) {
      markers.push({
        id: item.id,
        type: item.kind,
        x: item.x,
        z: item.z,
        completed: item.collected,
        label: item.label,
      });
    }
    const hash = markers.map((m) => `${m.id}:${m.completed ? 1 : 0}`).join('|');
    if (hash !== this.lastMarkerHash) {
      this.lastMarkerHash = hash;
      this.callbacks.onMarkersUpdate(markers);
    }
  }

  private resolveCollisions(nx: number, nz: number): { x: number; z: number } {
    let x = THREE.MathUtils.clamp(nx, -94, 94);
    let z = THREE.MathUtils.clamp(nz, -94, 94);
    const pRadius = 0.55;

    // Building AABB collisions
    for (const box of BUILDING_BOX_COLLIDERS) {
      const closestX = THREE.MathUtils.clamp(x, box.minX, box.maxX);
      const closestZ = THREE.MathUtils.clamp(z, box.minZ, box.maxZ);
      const dx = x - closestX;
      const dz = z - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < pRadius * pRadius) {
        const dist = Math.sqrt(distSq) || 0.001;
        const push = pRadius - dist;
        x += (dx / dist) * push;
        z += (dz / dist) * push;
      }
    }

    // Circle colliders (trees, rocks, NPCs, pillars)
    const resolveCircleList = (list: CircleCollider[]) => {
      for (const c of list) {
        const dx = x - c.x;
        const dz = z - c.z;
        const minDist = pRadius + c.radius;
        const distSq = dx * dx + dz * dz;
        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const push = minDist - dist;
          x += (dx / dist) * push;
          z += (dz / dist) * push;
        }
      }
    };
    resolveCircleList(CIRCLE_COLLIDERS);
    resolveCircleList(this.treeColliders);

    // Prevent stepping directly into deep river/lake water (keep player on shore or bridges!)
    if (isWaterAt(x, z)) {
      // Allow sliding along one axis if safe
      if (!isWaterAt(x, this.playerPos.z)) {
        z = this.playerPos.z;
      } else if (!isWaterAt(this.playerPos.x, z)) {
        x = this.playerPos.x;
      } else {
        x = this.playerPos.x;
        z = this.playerPos.z;
      }
    }

    return { x, z };
  }

  private updatePlayer(dt: number) {
    let moveX = this.joystickInput.x;
    let moveZ = this.joystickInput.y;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Optional Q/Z keyboard camera turn for convenience
    if (this.keys['KeyQ']) this.camYaw += dt * 1.9;
    if (this.keys['KeyC']) this.camYaw -= dt * 1.9;

    const len = Math.hypot(moveX, moveZ);
    const isMoving = len > 0.08;

    if (isMoving) {
      const normX = moveX / Math.max(1, len);
      const normZ = moveZ / Math.max(1, len);
      // Transform input vector by camera yaw
      const sinY = Math.sin(this.camYaw);
      const cosY = Math.cos(this.camYaw);
      const worldMoveX = normX * cosY + normZ * sinY;
      const worldMoveZ = -normX * sinY + normZ * cosY;

      const speed = 10.5 * Math.min(1, len);
      const nextX = this.playerPos.x + worldMoveX * speed * dt;
      const nextZ = this.playerPos.z + worldMoveZ * speed * dt;

      const resolved = this.resolveCollisions(nextX, nextZ);
      this.playerPos.x = resolved.x;
      this.playerPos.z = resolved.z;

      // Smoothly face movement direction
      const targetYaw = Math.atan2(worldMoveX, worldMoveZ);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerYaw += diff * (1 - Math.exp(-12 * dt));

      this.walkPhase += dt * 10.5;
      if (this.isGrounded) {
        this.stepTimer += dt;
        if (this.stepTimer > 0.34) {
          this.stepTimer = 0;
          soundEngine.playStep();
        }
      }
    } else {
      // Gently return limbs to neutral
      this.walkPhase = THREE.MathUtils.damp(this.walkPhase, Math.round(this.walkPhase / Math.PI) * Math.PI, 8, dt);
    }

    // Gravity & Grounding
    this.playerVelY -= 24 * dt;
    this.playerPos.y += this.playerVelY * dt;
    const floorY = getGroundHeight(this.playerPos.x, this.playerPos.z);

    if (this.playerPos.y <= floorY) {
      this.playerPos.y = floorY;
      this.playerVelY = 0;
      this.isGrounded = true;
    } else if (this.playerPos.y - floorY > 0.12) {
      this.isGrounded = false;
    }

    // Animate block avatar limbs
    const swing = isMoving && this.isGrounded ? Math.sin(this.walkPhase) * 0.68 : 0;
    const jumpArm = !this.isGrounded ? -0.9 : 0;
    this.avatar.leftLeg.rotation.x = swing;
    this.avatar.rightLeg.rotation.x = -swing;
    this.avatar.leftArm.rotation.x = -swing + jumpArm;
    this.avatar.rightArm.rotation.x = swing + jumpArm;

    const bob = isMoving && this.isGrounded ? Math.abs(Math.sin(this.walkPhase)) * 0.08 : 0;
    this.avatar.root.position.set(this.playerPos.x, this.playerPos.y + bob, this.playerPos.z);
    this.avatar.root.rotation.y = this.playerYaw;

    // Shadow shrinks slightly during jump
    const airHeight = Math.max(0, this.playerPos.y - floorY);
    const sScale = Math.max(0.45, 1 - airHeight * 0.14);
    this.avatar.shadowPlane.scale.setScalar(sScale);
    this.avatar.shadowPlane.position.y = 0.03 - bob - airHeight;

    // Check gem auto-collection & nearest interactable
    let bestTarget: InteractableTarget | null = null;
    let bestDist = 4.3;

    for (const item of this.floatingItems) {
      if (item.collected) continue;
      const dist = Math.hypot(this.playerPos.x - item.x, this.playerPos.z - item.z);
      if (item.kind === 'gem') {
        if (dist < 1.9) {
          item.collected = true;
          item.mesh.visible = false;
          soundEngine.playGem();
          this.callbacks.onCollectGem(item.id);
          this.emitMarkers();
        }
      } else if (dist < bestDist) {
        bestDist = dist;
        bestTarget = {
          type: item.kind,
          id: item.id,
          label: item.label,
          area: item.area,
          distance: dist,
        };
      }
    }

    for (const npc of this.npcs) {
      const dist = Math.hypot(this.playerPos.x - npc.x, this.playerPos.z - npc.z);
      if (dist < bestDist) {
        bestDist = dist;
        bestTarget = {
          type: 'npc',
          id: npc.id,
          label: `Berbual dengan ${npc.name}`,
          area: npc.area,
          distance: dist,
        };
      }
    }

    // Astaka Tasik Irama central lectern interaction
    const distAstaka = Math.hypot(this.playerPos.x - 0, this.playerPos.z + 69);
    if (distAstaka < 4.5 && distAstaka < bestDist) {
      bestDist = distAstaka;
      bestTarget = {
        type: 'irama',
        id: 'astaka_irama',
        label: 'Buka Makmal Tasik Irama',
        area: 'tasik',
        distance: distAstaka,
      };
    }

    // Pavilion Ajaib Tasik Irama (Misi Dengarkan Sajak)
    const distPavilion = Math.hypot(this.playerPos.x - 22, this.playerPos.z + 69);
    if (distPavilion < 4.8 && distPavilion < bestDist) {
      bestDist = distPavilion;
      bestTarget = {
        type: 'dengarkan_sajak',
        id: 'pavilion_dengarkan',
        label: 'Misi Dengarkan Sajak (Pavilion Ajaib)',
        area: 'tasik',
        distance: distPavilion,
      };
    }

    // Gunung Puisi Summit Archway interaction
    const distGunung = Math.hypot(this.playerPos.x + 74, this.playerPos.z);
    if (distGunung < 4.8 && distGunung < bestDist) {
      bestDist = distGunung;
      bestTarget = {
        type: 'gunung',
        id: 'puncak_gunung',
        label: 'Mulakan Cabaran Puncak Gunung Puisi',
        area: 'gunung',
        distance: distGunung,
      };
    }

    const prevKey = this.currentNearest ? `${this.currentNearest.type}:${this.currentNearest.id}` : '';
    const nextKey = bestTarget ? `${bestTarget.type}:${bestTarget.id}` : '';
    if (prevKey !== nextKey) {
      this.currentNearest = bestTarget;
      this.callbacks.onNearestTarget(bestTarget);
    }
  }

  private updateCamera(dt: number, elapsed: number) {
    if (this.mode === 'menu') {
      // Sweeping scenic orbit over Kampung Puisi, Tasik Irama, and Gunung Puisi
      const angle = elapsed * 0.14;
      _camDesired.set(Math.sin(angle) * 34, 17 + Math.sin(elapsed * 0.3) * 2.5, Math.cos(angle) * 34);
      _lookTarget.set(0, 2.5, -10);
      this.currentCamPos.lerp(_camDesired, 1 - Math.exp(-3 * dt));
      this.currentLookAt.lerp(_lookTarget, 1 - Math.exp(-3 * dt));
      this.camera.position.copy(this.currentCamPos);
      this.camera.lookAt(this.currentLookAt);
      return;
    }

    const horizDist = Math.cos(this.camPitch) * this.camDist;
    const vertDist = Math.sin(this.camPitch) * this.camDist;

    _camDesired.set(
      this.playerPos.x + Math.sin(this.camYaw) * horizDist,
      this.playerPos.y + 1.6 + vertDist,
      this.playerPos.z + Math.cos(this.camYaw) * horizDist,
    );

    // Keep camera smoothly above terrain
    const camGround = getGroundHeight(_camDesired.x, _camDesired.z) + 1.1;
    if (_camDesired.y < camGround) _camDesired.y = camGround;

    _lookTarget.set(this.playerPos.x, this.playerPos.y + 1.5, this.playerPos.z);

    const lambda = 1 - Math.exp(-10 * dt);
    this.currentCamPos.lerp(_camDesired, lambda);
    this.currentLookAt.lerp(_lookTarget, lambda);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
  }

  private updateWorldAnimations(elapsed: number) {
    this.materials.waterUniforms.uTime.value = elapsed;

    for (const item of this.floatingItems) {
      if (item.collected) continue;
      item.mesh.position.y = item.baseY + Math.sin(elapsed * 2.4 + item.x) * 0.22;
      item.mesh.rotation.y = elapsed * 1.4;
    }

    for (const npc of this.npcs) {
      npc.beacon.position.y = 2.65 + Math.sin(elapsed * 3.0 + npc.x) * 0.16;
      npc.beacon.rotation.y = elapsed * 1.8;
    }
  }

  private tick = () => {
    if (this.disposed) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    this.updateWorldAnimations(elapsed);

    if (this.mode === 'playing') {
      this.updatePlayer(dt);
      if (elapsed - this.lastTelemetryTime > 0.08) {
        this.lastTelemetryTime = elapsed;
        this.callbacks.onTelemetry({
          x: this.playerPos.x,
          y: this.playerPos.y,
          z: this.playerPos.z,
          yaw: this.playerYaw,
          currentArea: getAreaAt(this.playerPos.x, this.playerPos.z),
        });
      }
    }

    this.updateCamera(dt, elapsed);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.mode !== 'playing') return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    this.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      this.triggerJump();
    }
    if (e.code === 'KeyE') {
      e.preventDefault();
      this.triggerInteract();
    }
    if (e.code === 'KeyR') {
      this.resetCamera();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.mode !== 'playing') return;
    this.isDraggingCamera = true;
    this.dragPointerId = e.pointerId;
    this.lastPointer.x = e.clientX;
    this.lastPointer.y = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDraggingCamera || this.dragPointerId !== e.pointerId) return;
    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;
    this.lastPointer.x = e.clientX;
    this.lastPointer.y = e.clientY;
    this.camYaw -= dx * 0.0065;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.005, 0.14, 1.05);
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.dragPointerId === e.pointerId) {
      this.isDraggingCamera = false;
      this.dragPointerId = null;
    }
  };

  private onWheel = (e: WheelEvent) => {
    if (this.mode !== 'playing') return;
    this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.005, 5.5, 16);
  };

  private onResize = () => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.callbacks.onContextLost(true);
  };

  private onContextRestored = () => {
    this.callbacks.onContextLost(false);
  };

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: true });
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('wheel', this.onWheel);
    dom.removeEventListener('webglcontextlost', this.onContextLost);
    dom.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });

    this.materials.dispose();
    this.envRT?.dispose();
    this.renderer.dispose();
    if (dom.parentNode === this.container) {
      this.container.removeChild(dom);
    }
  }
}
