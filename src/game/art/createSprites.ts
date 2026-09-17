import Phaser from "phaser";
import type { ItemDef } from "../data/catalog";
import { CREAM, GOLD, INK, NIGHT, ORANGE, ORANGE_HI, ORANGE_SH, PINK, ROAD, STONE, STONE_HI, WHITE, WOOD, WOOD_HI, hueShadow, lighten } from "./palette";
import { paintMap, paintTexture, type PixelPlotter } from "./pixel";

const CAT_LEGEND: Record<string, number | undefined> = {
  k: INK,
  o: ORANGE,
  O: ORANGE_HI,
  d: ORANGE_SH,
  c: CREAM,
  p: PINK,
  e: WHITE,
  b: INK,
  n: 0xe07070,
  t: 0xd4783a,
};

const CAT_IDLE = [
  "................................",
  "................................",
  "..........kk....kk..............",
  ".........ko.k..k.ok.............",
  ".........kppkkkkppk.............",
  "........kOooooooOook............",
  "........koOOOOOOoook............",
  ".......kooo.ee.ee.ook...........",
  ".......kooo.kb.bk.ook...........",
  "......koooooonoooOook...........",
  "......koccccccccccook...........",
  ".......kccccccccccck............",
  "......kkoooooooooookk...........",
  ".....k.kooooooooook.k...........",
  "........kddddddddk..............",
  ".........k......k...............",
  ".........kk....kk...............",
  "..........t....t................",
  "...........tttt.................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
];

const CAT_STEP = [
  "................................",
  "................................",
  "..........kk....kk..............",
  ".........ko.k..k.ok.............",
  ".........kppkkkkppk.............",
  "........kOooooooOook............",
  "........koOOOOOOoook............",
  ".......kooo.ee.ee.ook...........",
  ".......kooo.kb.bk.ook...........",
  "......koooooonoooOook...........",
  "......koccccccccccook...........",
  ".......kccccccccccck............",
  "......kkoooooooooookk...........",
  ".....k.kooooooooook.k...........",
  "........kddddddddk..............",
  "........k........k..............",
  ".......kk........kk.............",
  "......t............t............",
  ".....ttt..........tt............",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
];

export function ensureArt(scene: Phaser.Scene): void {
  paintMap(scene, "px-cat-0", CAT_IDLE, CAT_LEGEND);
  paintMap(scene, "px-cat-1", CAT_STEP, CAT_LEGEND);
  paintGroundTiles(scene);
  paintSweeper(scene);
  paintGlow(scene);
  paintCrumb(scene);
  paintPing(scene);

  if (!scene.anims.exists("cat-walk")) {
    scene.anims.create({
      key: "cat-walk",
      frames: [{ key: "px-cat-0" }, { key: "px-cat-1" }],
      frameRate: 8,
      repeat: -1,
    });
  }
}

export function itemTextureKey(def: ItemDef): string {
  return `px-item-${def.shape}-${def.name}`;
}

export function ensureItemTexture(scene: Phaser.Scene, def: ItemDef): string {
  const key = itemTextureKey(def);
  if (scene.textures.exists(key)) return key;
  paintTexture(scene, key, 64, 64, (p) => drawItemPixels(p, def));
  return key;
}

function paintGroundTiles(scene: Phaser.Scene): void {
  paintTexture(scene, "px-ground", 16, 16, (p) => {
    p.fillRect(0, 0, 16, 16, NIGHT);
    p.set(2, 3, STONE);
    p.set(9, 5, STONE_HI);
    p.set(4, 11, STONE);
    p.set(13, 12, STONE);
    p.set(7, 8, 0x20141c);
    p.set(1, 14, STONE);
  });
  paintTexture(scene, "px-road", 16, 16, (p) => {
    p.fillRect(0, 0, 16, 16, ROAD);
    p.set(2, 4, STONE);
    p.set(9, 2, STONE_HI);
    p.set(5, 10, 0x22141c);
    p.set(13, 12, STONE);
    p.set(7, 7, 0x3a2a22);
    p.set(11, 14, STONE_HI);
  });
}

function paintSweeper(scene: Phaser.Scene): void {
  paintTexture(scene, "px-sweeper", 48, 32, (p) => {
    p.fillRect(6, 10, 36, 16, 0x4a5568);
    p.fillRect(8, 8, 32, 8, 0x6a7384);
    p.fillRect(10, 6, 12, 6, GOLD);
    p.fillRect(28, 12, 12, 6, 0x2a3140);
    p.disc(12, 26, 4, INK);
    p.disc(36, 26, 4, INK);
    p.disc(12, 26, 2, STONE);
    p.disc(36, 26, 2, STONE);
    p.fillRect(2, 18, 8, 4, 0xc45a3a);
    p.fillRect(1, 20, 10, 2, 0xffd36a);
    p.ring(24, 16, 15, INK);
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
    p.set(2, 3, ORANGE_HI);
  });
}

function paintPing(scene: Phaser.Scene): void {
  paintTexture(scene, "px-ping", 11, 10, (p) => {
    p.fillRect(5, 0, 1, 1, GOLD);
    p.fillRect(4, 1, 3, 2, GOLD);
    p.fillRect(3, 3, 5, 2, GOLD);
    p.fillRect(2, 5, 7, 2, GOLD);
    p.fillRect(4, 7, 3, 2, 0xfff6ea);
  });
}

function drawItemPixels(p: PixelPlotter, def: ItemDef): void {
  const mid = 32;
  const fill = def.color;
  const accent = def.accent;
  const shadow = hueShadow(fill);
  const hi = lighten(fill);
  switch (def.shape) {
    case "round":
      p.disc(mid, mid + 2, 22, INK);
      p.disc(mid, mid, 20, fill);
      p.disc(mid - 6, mid - 7, 8, hi);
      p.disc(mid + 6, mid + 7, 6, shadow);
      p.disc(mid - 2, mid, 5, accent);
      break;
    case "box":
      p.fillRect(8, 16, 48, 36, INK);
      p.fillRect(10, 18, 44, 32, fill);
      p.fillRect(12, 20, 20, 8, hi);
      p.fillRect(14, 32, 36, 6, accent);
      p.fillRect(16, 40, 32, 6, shadow);
      break;
    case "bowl":
      p.disc(mid, mid + 6, 22, INK);
      p.disc(mid, mid + 4, 20, accent);
      p.disc(mid, mid, 16, fill);
      p.disc(mid - 5, mid - 5, 6, hi);
      break;
    case "lantern":
      p.fillRect(30, 4, 4, 8, WOOD);
      p.disc(mid, mid + 4, 22, INK);
      p.disc(mid, mid + 2, 20, fill);
      p.disc(mid, mid, 14, accent);
      p.disc(mid - 6, mid - 4, 6, hi);
      p.fillRect(20, 8, 24, 6, WOOD);
      p.fillRect(20, 48, 24, 6, WOOD);
      break;
    case "stall":
      p.fillRect(4, 28, 56, 32, INK);
      p.fillRect(6, 30, 52, 28, WOOD);
      p.fillRect(8, 32, 20, 10, WOOD_HI);
      p.fillRect(6, 16, 52, 16, fill);
      p.fillRect(8, 12, 48, 8, accent);
      p.disc(16, 20, 3, GOLD);
      p.disc(32, 18, 3, GOLD);
      p.disc(48, 20, 3, GOLD);
      p.fillRect(24, 36, 16, 12, CREAM);
      break;
    case "scooter":
      p.disc(16, 48, 10, INK);
      p.disc(50, 48, 10, INK);
      p.disc(16, 48, 6, STONE);
      p.disc(50, 48, 6, STONE);
      p.fillRect(12, 28, 48, 16, INK);
      p.fillRect(14, 30, 44, 12, fill);
      p.fillRect(16, 32, 16, 6, hi);
      p.fillRect(44, 16, 6, 20, accent);
      p.fillRect(42, 14, 10, 6, GOLD);
      break;
    case "arch":
      p.fillRect(8, 28, 12, 32, INK);
      p.fillRect(44, 28, 12, 32, INK);
      p.fillRect(10, 30, 8, 28, fill);
      p.fillRect(46, 30, 8, 28, fill);
      p.fillRect(4, 16, 56, 16, INK);
      p.fillRect(6, 18, 52, 12, accent);
      p.fillRect(8, 8, 48, 12, fill);
      p.fillRect(12, 10, 16, 6, GOLD);
      p.fillRect(36, 10, 16, 6, GOLD);
      break;
    default:
      p.disc(mid, mid, 20, fill);
  }
}
