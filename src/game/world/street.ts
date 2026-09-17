import Phaser from "phaser";
import { WORLD_H, WORLD_W } from "../constants";
import { GOLD } from "../art/palette";

export function paintStreet(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(0);
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const r = 12 + t * 70;
    const gg = 8 + t * 22;
    const b = 28 + t * 8;
    g.fillStyle(Phaser.Display.Color.GetColor(r, gg, b), 1);
    g.fillRect(0, (WORLD_H / 24) * i, WORLD_W, WORLD_H / 24 + 2);
  }

  g.fillStyle(0x24151c, 1);
  g.fillRect(0, WORLD_H * 0.42, WORLD_W, WORLD_H * 0.58);
  g.fillStyle(0x3a2420, 1);
  g.fillRoundedRect(0, WORLD_H * 0.52, WORLD_W, 220, 8);
  g.fillStyle(0x4a3028, 0.55);
  g.fillRoundedRect(40, WORLD_H * 0.55, WORLD_W - 80, 140, 12);

  for (let i = 0; i < 28; i++) {
    const x = 60 + i * 90;
    const y = 70 + Math.sin(i * 0.7) * 14;
    g.fillStyle(0xffc56a, 0.12);
    g.fillCircle(x, y + 80, 70);
    g.fillStyle(GOLD, 0.95);
    g.fillCircle(x, y, 7);
    g.fillStyle(0xff8a3a, 0.9);
    g.fillCircle(x, y + 16, 11);
    g.lineStyle(2, 0x5a2a14, 0.8);
    if (i < 27) g.lineBetween(x, y - 8, x + 90, 70 + Math.sin((i + 1) * 0.7) * 14 - 8);
  }

  for (let i = 0; i < 18; i++) {
    g.fillStyle(0x1a1018, 0.55);
    g.fillEllipse(120 + i * 140, WORLD_H * 0.48, 28, 44);
    g.fillStyle(0x2a1822, 0.4);
    g.fillCircle(120 + i * 140, WORLD_H * 0.44, 16);
  }

  g.fillStyle(0x8b1e1e, 1);
  g.fillRect(WORLD_W - 280, 220, 36, 220);
  g.fillRect(WORLD_W - 90, 220, 36, 220);
  g.fillStyle(0xffd36a, 1);
  g.fillRoundedRect(WORLD_W - 300, 170, 260, 56, 8);
  g.fillStyle(0x8b1e1e, 1);
  g.fillRect(WORLD_W - 280, 130, 220, 42);
}
