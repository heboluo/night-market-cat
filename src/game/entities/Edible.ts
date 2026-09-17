import Phaser from "phaser";
import type { ItemDef } from "../data/catalog";

export class Edible extends Phaser.GameObjects.Container {
  readonly def: ItemDef;
  readonly radius: number;
  eaten = false;
  private drift = 0;
  private readonly driftSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, def: ItemDef, radius: number) {
    super(scene, x, y);
    this.def = def;
    this.radius = radius;
    this.driftSpeed = def.tier === "snack" ? 8 : 0;
    const gfx = scene.add.graphics();
    this.add(gfx);
    drawItem(gfx, def, radius);
    scene.add.existing(this);
    this.setDepth(def.tier === "landmark" ? 50 : 100 + Math.floor(radius));
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  wander(dt: number): void {
    if (this.driftSpeed <= 0) return;
    this.drift += dt;
    this.x += Math.cos(this.drift * 0.7) * this.driftSpeed * dt;
    this.y += Math.sin(this.drift * 0.9) * this.driftSpeed * dt;
  }
}

function drawItem(g: Phaser.GameObjects.Graphics, def: ItemDef, r: number): void {
  g.clear();
  switch (def.shape) {
    case "round":
      g.fillStyle(def.color, 1);
      g.fillCircle(0, 0, r);
      g.fillStyle(def.accent, 0.85);
      g.fillCircle(-r * 0.2, -r * 0.2, r * 0.35);
      break;
    case "box":
      g.fillStyle(def.color, 1);
      g.fillRoundedRect(-r, -r * 0.7, r * 2, r * 1.4, r * 0.2);
      g.fillStyle(def.accent, 0.7);
      g.fillRect(-r * 0.7, -r * 0.15, r * 1.4, r * 0.2);
      break;
    case "bowl":
      g.fillStyle(def.accent, 1);
      g.fillEllipse(0, r * 0.15, r * 1.8, r * 1.1);
      g.fillStyle(def.color, 1);
      g.fillEllipse(0, 0, r * 1.5, r * 1.1);
      break;
    case "lantern":
      g.lineStyle(Math.max(2, r * 0.08), 0x5a2a14, 1);
      g.lineBetween(0, -r * 1.3, 0, -r);
      g.fillStyle(def.color, 1);
      g.fillEllipse(0, 0, r * 1.5, r * 1.8);
      g.fillStyle(def.accent, 0.55);
      g.fillEllipse(0, -r * 0.1, r * 0.9, r * 1.1);
      g.fillStyle(0x5a2a14, 1);
      g.fillRect(-r * 0.45, -r, r * 0.9, r * 0.18);
      g.fillRect(-r * 0.45, r * 0.75, r * 0.9, r * 0.18);
      break;
    case "stall":
      g.fillStyle(0x2a1a14, 1);
      g.fillRoundedRect(-r, -r * 0.2, r * 2, r * 1.2, 8);
      g.fillStyle(def.color, 1);
      g.fillTriangle(-r * 1.15, -r * 0.15, r * 1.15, -r * 0.15, 0, -r * 1.05);
      g.fillStyle(def.accent, 0.9);
      g.fillRect(-r * 0.85, -r * 0.05, r * 1.7, r * 0.22);
      g.fillStyle(0xffd7a0, 0.35);
      g.fillCircle(0, r * 0.25, r * 0.45);
      break;
    case "scooter":
      g.fillStyle(0x1c1c1c, 1);
      g.fillCircle(-r * 0.7, r * 0.45, r * 0.28);
      g.fillCircle(r * 0.75, r * 0.45, r * 0.28);
      g.fillStyle(def.color, 1);
      g.fillRoundedRect(-r, -r * 0.2, r * 2, r * 0.7, 10);
      g.fillStyle(def.accent, 1);
      g.fillRect(r * 0.35, -r * 0.7, r * 0.18, r * 0.6);
      break;
    case "arch":
      g.fillStyle(def.color, 1);
      g.fillRect(-r * 1.1, -r * 0.1, r * 0.35, r * 1.1);
      g.fillRect(r * 0.75, -r * 0.1, r * 0.35, r * 1.1);
      g.fillStyle(def.accent, 1);
      g.fillRoundedRect(-r * 1.2, -r * 0.85, r * 2.4, r * 0.45, 8);
      g.fillStyle(def.color, 1);
      g.fillRect(-r * 1.05, -r * 1.15, r * 2.1, r * 0.32);
      break;
  }
}
