import Phaser from "phaser";
import type { ItemDef } from "../data/catalog";
import {
  CREAM,
  GOLD,
  INK,
  NIGHT,
  ORANGE,
  ORANGE_HI,
  ORANGE_SH,
  PINK,
  ROAD,
  STONE,
  STONE_HI,
  WHITE,
  WOOD,
  WOOD_HI,
  hueShadow,
  lighten,
} from "./palette";
import { paintMap, paintTexture, type PixelPlotter } from "./pixel";

const CAT: Record<string, number | undefined> = {
  k: INK,
  o: ORANGE,
  O: ORANGE_HI,
  d: ORANGE_SH,
  c: CREAM,
  p: PINK,
  e: WHITE,
  b: INK,
  s: WHITE,
  n: 0xe07070,
  t: 0xd4783a,
};

const CAT_IDLE = [
  "........................",
  "......kk......kk........",
  ".....ko.k....k.ok.......",
  ".....kppk....kppk.......",
  "....kOooooooooooOk......",
  "...kOooooooooooooOk.....",
  "...kOo.ee....ee.oOk.....",
  "...kOo.kb....bk.oOk.....",
  "...kOooooooooooooOk.....",
  "...kOooo..nn..oooOk.....",
  "....kOoccccccccoOk......",
  "....kkooooooooookk......",
  ".....koddddddddok.......",
  "......k........k........",
  "......kk......kk........",
  ".......t......t.........",
];

const CAT_STEP = [
  "........................",
  "......kk......kk........",
  ".....ko.k....k.ok.......",
  ".....kppk....kppk.......",
  "....kOooooooooooOk......",
  "...kOooooooooooooOk.....",
  "...kOo.ee....ee.oOk.....",
  "...kOo.kb....bk.oOk.....",
  "...kOooooooooooooOk.....",
  "...kOooo..nn..oooOk.....",
  "....kOoccccccccoOk......",
  "....kkooooooooookk......",
  ".....koddddddddok.......",
  ".....k..........k.......",
  "....kk..........kk......",
  "....t............t......",
];

export function ensureArt(scene: Phaser.Scene): void {
  paintMap(scene, "cat-chonk-0", CAT_IDLE, CAT);
  paintMap(scene, "cat-chonk-1", CAT_STEP, CAT);
  paintTiles(scene);
  paintSweeper(scene);
  paintGlow(scene);
  paintCrumb(scene);
  paintPing(scene);
  paintLamp(scene);
  paintMarks(scene);

  if (!scene.anims.exists("cat-walk")) {
    scene.anims.create({
      key: "cat-walk",
      frames: [{ key: "cat-chonk-0" }, { key: "cat-chonk-1" }],
      frameRate: 8,
      repeat: -1,
    });
  }
}

export function itemTextureKey(def: ItemDef): string {
  return `pix-item-${def.name}`;
}

export function ensureItemTexture(scene: Phaser.Scene, def: ItemDef): string {
  const key = itemTextureKey(def);
  if (scene.textures.exists(key)) return key;
  paintTexture(scene, key, 32, 32, (p) => drawItem(p, def));
  return key;
}

function paintTiles(scene: Phaser.Scene): void {
  paintTexture(scene, "tile-sky", 16, 16, (p) => {
    p.fillRect(0, 0, 16, 16, NIGHT);
    p.set(3, 4, 0x2a1838);
    p.set(11, 2, STONE);
    p.set(7, 9, 0x201428);
  });
  paintTexture(scene, "tile-road", 16, 16, (p) => {
    p.fillRect(0, 0, 16, 16, ROAD);
    p.set(2, 3, STONE);
    p.set(9, 6, STONE_HI);
    p.set(5, 12, 0x22141c);
    p.set(13, 10, STONE);
    p.set(7, 1, 0x3a2a22);
  });
  paintTexture(scene, "tile-shop", 48, 40, (p) => {
    p.fillRect(0, 0, 48, 40, 0x1a1018);
    p.fillRect(2, 8, 44, 24, WOOD);
    p.fillRect(4, 4, 40, 8, 0xc45a3a);
    p.fillRect(12, 14, 24, 8, INK);
    p.fillRect(6, 26, 10, 10, GOLD);
    p.fillRect(20, 26, 10, 10, GOLD);
    p.fillRect(34, 26, 10, 10, GOLD);
    p.fillRect(0, 32, 48, 8, WOOD_HI);
  });
  paintTexture(scene, "tile-lantern", 8, 12, (p) => {
    p.fillRect(3, 0, 2, 3, WOOD);
    p.disc(4, 7, 4, 0xff8a3a);
    p.disc(4, 7, 2, GOLD);
  });
  paintTexture(scene, "tile-moon", 16, 16, (p) => {
    p.disc(8, 8, 6, 0xffe6c4);
    p.disc(6, 6, 2, WHITE);
    p.disc(11, 7, 2, NIGHT);
  });
}

function paintSweeper(scene: Phaser.Scene): void {
  paintTexture(scene, "px-sweeper", 32, 24, (p) => {
    p.fillRect(4, 8, 24, 10, 0x4a5568);
    p.fillRect(6, 6, 16, 6, 0x6a7384);
    p.fillRect(6, 4, 8, 4, GOLD);
    p.disc(8, 20, 3, INK);
    p.disc(22, 20, 3, INK);
    p.fillRect(1, 12, 5, 3, 0xc45a3a);
  });
}

function paintGlow(scene: Phaser.Scene): void {
  paintTexture(scene, "px-glow", 16, 16, (p) => {
    p.disc(8, 8, 7, GOLD);
    p.disc(8, 8, 4, ORANGE_HI);
    p.disc(8, 8, 2, WHITE);
  });
}

function paintCrumb(scene: Phaser.Scene): void {
  paintTexture(scene, "px-crumb", 4, 4, (p) => {
    p.fillRect(1, 1, 2, 2, GOLD);
    p.set(0, 1, ORANGE);
  });
}

function paintPing(scene: Phaser.Scene): void {
  paintTexture(scene, "px-ping", 9, 10, (p) => {
    p.fillRect(4, 0, 1, 2, GOLD);
    p.fillRect(3, 2, 3, 2, GOLD);
    p.fillRect(2, 4, 5, 2, GOLD);
    p.fillRect(1, 6, 7, 2, GOLD);
    p.fillRect(3, 8, 3, 2, WHITE);
  });
}

function paintLamp(scene: Phaser.Scene): void {
  paintTexture(scene, "px-lamp", 10, 10, (p) => {
    p.fillRect(1, 1, 8, 8, INK);
    p.fillRect(2, 2, 6, 6, 0x63e38a);
    p.fillRect(3, 3, 2, 2, WHITE);
  });
}

function paintMarks(scene: Phaser.Scene): void {
  paintTexture(scene, "px-yes", 11, 11, (p) => {
    p.fillRect(0, 0, 11, 11, INK);
    p.fillRect(1, 1, 9, 9, 0x2d6a38);
    p.fillRect(2, 5, 2, 2, GOLD);
    p.fillRect(4, 6, 2, 2, GOLD);
    p.fillRect(6, 4, 2, 2, GOLD);
    p.fillRect(8, 2, 2, 2, GOLD);
  });
  paintTexture(scene, "px-no", 11, 11, (p) => {
    p.fillRect(0, 0, 11, 11, INK);
    p.fillRect(1, 1, 9, 9, 0x8b1e1e);
    p.set(3, 3, WHITE);
    p.set(4, 4, WHITE);
    p.set(5, 5, WHITE);
    p.set(6, 6, WHITE);
    p.set(7, 7, WHITE);
    p.set(7, 3, WHITE);
    p.set(6, 4, WHITE);
    p.set(4, 6, WHITE);
    p.set(3, 7, WHITE);
  });
  paintTexture(scene, "px-bang", 9, 12, (p) => {
    p.fillRect(2, 0, 5, 8, 0x8b1e1e);
    p.fillRect(3, 1, 3, 6, GOLD);
    p.fillRect(3, 9, 3, 3, GOLD);
  });
}

function drawItem(p: PixelPlotter, def: ItemDef): void {
  const mid = 16;
  const fill = def.color;
  const accent = def.accent;
  const shadow = hueShadow(fill);
  const hi = lighten(fill);
  switch (def.shape) {
    case "round":
      p.disc(mid, mid + 1, 11, INK);
      p.disc(mid, mid, 10, fill);
      p.disc(mid - 3, mid - 4, 3, hi);
      p.disc(mid + 2, mid + 3, 3, shadow);
      p.disc(mid, mid, 2, accent);
      break;
    case "box":
      p.fillRect(4, 8, 24, 18, INK);
      p.fillRect(5, 9, 22, 16, fill);
      p.fillRect(6, 10, 10, 4, hi);
      p.fillRect(7, 16, 18, 3, accent);
      break;
    case "bowl":
      p.disc(mid, mid + 3, 11, INK);
      p.disc(mid, mid + 2, 10, accent);
      p.disc(mid, mid, 8, fill);
      p.disc(mid - 3, mid - 3, 3, hi);
      break;
    case "lantern":
      p.fillRect(15, 2, 2, 4, WOOD);
      p.disc(mid, mid + 2, 11, INK);
      p.disc(mid, mid + 1, 10, fill);
      p.disc(mid, mid, 6, accent);
      p.fillRect(10, 4, 12, 3, WOOD);
      p.fillRect(10, 24, 12, 3, WOOD);
      break;
    case "stall":
      p.fillRect(2, 14, 28, 16, INK);
      p.fillRect(3, 15, 26, 14, WOOD);
      p.fillRect(3, 8, 26, 8, fill);
      p.fillRect(4, 6, 24, 4, accent);
      p.disc(8, 10, 1, GOLD);
      p.disc(16, 9, 1, GOLD);
      p.disc(24, 10, 1, GOLD);
      p.fillRect(12, 18, 8, 6, CREAM);
      break;
    case "scooter":
      p.disc(8, 24, 5, INK);
      p.disc(24, 24, 5, INK);
      p.disc(8, 24, 3, STONE);
      p.disc(24, 24, 3, STONE);
      p.fillRect(6, 14, 22, 8, INK);
      p.fillRect(7, 15, 20, 6, fill);
      p.fillRect(22, 8, 3, 10, accent);
      p.fillRect(20, 6, 6, 4, GOLD);
      break;
    case "arch":
      p.fillRect(4, 14, 6, 16, fill);
      p.fillRect(22, 14, 6, 16, fill);
      p.fillRect(2, 8, 28, 8, accent);
      p.fillRect(4, 4, 24, 6, fill);
      p.fillRect(6, 5, 8, 3, GOLD);
      p.fillRect(18, 5, 8, 3, GOLD);
      break;
    default:
      p.disc(mid, mid, 10, fill);
  }
}
