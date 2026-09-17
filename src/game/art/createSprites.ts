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

  if (!scene.anims.exists("cat-idle")) {
    scene.anims.create({
      key: "cat-idle",
      frames: [{ key: "px-cat-0" }, { key: "px-cat-1" }],
      frameRate: 3,
      repeat: -1,
    });
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
  paintTexture(scene, key, 32, 32, (p) => drawItemPixels(p, def));
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

function drawItemPixels(p: PixelPlotter, def: ItemDef): void {
  const mid = 16;
  const fill = def.color;
  const accent = def.accent;
  const shadow = hueShadow(fill);
  const hi = lighten(fill);
  switch (def.shape) {
    case "round":
      p.disc(mid, mid + 1, 11, INK);
      p.disc(mid, mid, 10, fill);
      p.disc(mid - 3, mid - 3, 4, hi);
      p.disc(mid + 3, mid + 3, 3, shadow);
      p.disc(mid - 1, mid, 2, accent);
      break;
    case "box":
      p.fillRect(4, 8, 24, 18, INK);
      p.fillRect(5, 9, 22, 16, fill);
      p.fillRect(6, 10, 10, 4, hi);
      p.fillRect(7, 16, 18, 3, accent);
      p.fillRect(8, 20, 16, 3, shadow);
      break;
    case "bowl":
      p.disc(mid, mid + 3, 11, INK);
      p.disc(mid, mid + 2, 10, accent);
      p.disc(mid, mid, 8, fill);
      p.disc(mid - 2, mid - 2, 3, hi);
      break;
    case "lantern":
      p.fillRect(15, 2, 2, 4, WOOD);
      p.disc(mid, mid + 2, 11, INK);
      p.disc(mid, mid + 1, 10, fill);
      p.disc(mid, mid, 7, accent);
      p.disc(mid - 3, mid - 2, 3, hi);
      p.fillRect(10, 4, 12, 3, WOOD);
      p.fillRect(10, 24, 12, 3, WOOD);
      break;
    case "stall":
      p.fillRect(2, 14, 28, 16, INK);
      p.fillRect(3, 15, 26, 14, WOOD);
      p.fillRect(4, 16, 10, 5, WOOD_HI);
      p.fillRect(3, 8, 26, 8, fill);
      p.fillRect(4, 6, 24, 4, accent);
      p.set(8, 10, GOLD);
      p.set(16, 9, GOLD);
      p.set(24, 10, GOLD);
      p.fillRect(12, 18, 8, 6, CREAM);
      break;
    case "scooter":
      p.disc(8, 24, 5, INK);
      p.disc(26, 24, 5, INK);
      p.disc(8, 24, 3, STONE);
      p.disc(26, 24, 3, STONE);
      p.fillRect(6, 14, 24, 8, INK);
      p.fillRect(7, 15, 22, 6, fill);
      p.fillRect(8, 16, 8, 3, hi);
      p.fillRect(22, 8, 3, 10, accent);
      p.fillRect(21, 7, 5, 3, GOLD);
      break;
    case "arch":
      p.fillRect(4, 14, 6, 16, INK);
      p.fillRect(22, 14, 6, 16, INK);
      p.fillRect(5, 15, 4, 14, fill);
      p.fillRect(23, 15, 4, 14, fill);
      p.fillRect(2, 8, 28, 8, INK);
      p.fillRect(3, 9, 26, 6, accent);
      p.fillRect(4, 4, 24, 6, fill);
      p.fillRect(6, 5, 8, 3, GOLD);
      p.fillRect(18, 5, 8, 3, GOLD);
      break;
    default:
      p.disc(mid, mid, 10, fill);
  }
}
