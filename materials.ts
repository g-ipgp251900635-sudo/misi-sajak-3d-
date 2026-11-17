import * as THREE from 'three';

export interface WorldMaterials {
  woodPlank: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  roofTile: THREE.MeshStandardMaterial;
  batikTrim: THREE.MeshStandardMaterial;
  stonePath: THREE.MeshStandardMaterial;
  stoneCliff: THREE.MeshStandardMaterial;
  goldAccent: THREE.MeshStandardMaterial;
  water: THREE.MeshStandardMaterial;
  bookCoverRed: THREE.MeshStandardMaterial;
  bookCoverBlue: THREE.MeshStandardMaterial;
  bookCoverEmerald: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  gemCrystal: THREE.MeshPhysicalMaterial;
  scrollGold: THREE.MeshStandardMaterial;
  waterUniforms: { uTime: { value: number } };
  dispose: () => void;
}

function makeCanvasTexture(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  size = 256,
  repeatX = 1,
  repeatY = 1,
  anisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createWorldMaterials(
  maxAnisotropy: number,
  isSoftwareGl: boolean,
): WorldMaterials {
  const aniso = Math.min(maxAnisotropy || 4, 8);
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];

  // Wood plank texture (for Malay rumah panggung & bridges)
  const woodTex = makeCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#9a6338';
      ctx.fillRect(0, 0, w, h);
      const planks = 6;
      const ph = h / planks;
      for (let i = 0; i < planks; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#a66d3f' : '#8d5932';
        ctx.fillRect(0, i * ph + 2, w, ph - 4);
        ctx.fillStyle = 'rgba(40, 20, 5, 0.25)';
        ctx.fillRect(0, i * ph, w, 2);
        // subtle grain
        ctx.fillStyle = 'rgba(60, 30, 10, 0.14)';
        for (let g = 0; g < 4; g++) {
          ctx.fillRect((g * 67 + i * 23) % w, i * ph + 8 + g * 6, 48, 2);
        }
      }
    },
    256,
    2,
    2,
    aniso,
  );
  textures.push(woodTex);

  // Malaysian Batik / Songket inspired decorative trim texture
  const batikTex = makeCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      const step = 64;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x + step / 2, y + 6);
          ctx.lineTo(x + step - 6, y + step / 2);
          ctx.lineTo(x + step / 2, y + step - 6);
          ctx.lineTo(x + 6, y + step / 2);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(x + step / 2, y + step / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    256,
    3,
    1,
    aniso,
  );
  textures.push(batikTex);

  // Stone paving texture
  const stoneTex = makeCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, w, h);
      const cols = 4;
      const rows = 4;
      const cw = w / cols;
      const ch = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offset = (r % 2) * (cw * 0.5);
          const shade = 195 + ((r * 7 + c * 13) % 28);
          ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`;
          ctx.fillRect((c * cw + offset) % w + 3, r * ch + 3, cw - 6, ch - 6);
        }
      }
    },
    256,
    4,
    4,
    aniso,
  );
  textures.push(stoneTex);

  const woodPlank = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.78,
    metalness: 0.04,
  });
  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x5c361d,
    roughness: 0.85,
    metalness: 0.05,
  });
  const roofTile = new THREE.MeshStandardMaterial({
    color: 0xb93822,
    roughness: 0.62,
    metalness: 0.08,
    flatShading: true,
  });
  const batikTrim = new THREE.MeshStandardMaterial({
    map: batikTex,
    roughness: 0.5,
    metalness: 0.18,
  });
  const stonePath = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: 0.86,
    metalness: 0.02,
  });
  const stoneCliff = new THREE.MeshStandardMaterial({
    color: 0x788292,
    roughness: 0.9,
    metalness: 0.04,
    flatShading: true,
  });
  const goldAccent = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.25,
    metalness: 0.82,
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
  });

  // Animated water PBR material via onBeforeCompile
  const waterUniforms = { uTime: { value: 0 } };
  const water = new THREE.MeshStandardMaterial({
    color: 0x1aa7ec,
    roughness: 0.16,
    metalness: 0.15,
    transparent: true,
    opacity: 0.86,
    flatShading: true,
  });
  water.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.vertexShader =
      `uniform float uTime;\n` +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         transformed.z += sin(position.x * 0.45 + uTime * 2.1) * 0.07 + cos(position.y * 0.4 + uTime * 1.7) * 0.06;`,
      );
  };

  const bookCoverRed = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.45,
    metalness: 0.12,
    emissive: 0x881337,
    emissiveIntensity: 0.28,
  });
  const bookCoverBlue = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.45,
    metalness: 0.12,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.28,
  });
  const bookCoverEmerald = new THREE.MeshStandardMaterial({
    color: 0x059669,
    roughness: 0.45,
    metalness: 0.12,
    emissive: 0x064e3b,
    emissiveIntensity: 0.28,
  });
  const paper = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    roughness: 0.88,
    metalness: 0.0,
  });

  const gemCrystal = new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    emissive: 0x6b21a8,
    emissiveIntensity: 0.45,
    roughness: 0.1,
    metalness: 0.05,
    clearcoat: 1.0,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.82 : 0.96,
    ior: 1.65,
    thickness: 0.8,
  });

  const scrollGold = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xd97706,
    emissiveIntensity: 0.3,
    roughness: 0.35,
    metalness: 0.25,
  });

  materials.push(
    woodPlank,
    woodDark,
    roofTile,
    batikTrim,
    stonePath,
    stoneCliff,
    goldAccent,
    water,
    bookCoverRed,
    bookCoverBlue,
    bookCoverEmerald,
    paper,
    gemCrystal,
    scrollGold,
  );

  return {
    woodPlank,
    woodDark,
    roofTile,
    batikTrim,
    stonePath,
    stoneCliff,
    goldAccent,
    water,
    bookCoverRed,
    bookCoverBlue,
    bookCoverEmerald,
    paper,
    gemCrystal,
    scrollGold,
    waterUniforms,
    dispose: () => {
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
