import Phaser from "phaser";
import { ensureItemTexture } from "../art/createSprites";
import { WORLD_H, WORLD_W } from "../constants";
import type { ItemDef } from "../data/catalog";

export class Edible extends Phaser.GameObjects.Container {
  readonly def: ItemDef;
  readonly radius: number;
  eaten = false;
  vx = 0;
  vy = 0;
  watching = false;
  private lookT = 0;
  private readonly lookPeriod: number;
  private drift = 0;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow?: Phaser.GameObjects.Image;
  private readonly lamp?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, def: ItemDef, radius: number, lookPeriod = 1.8) {
    super(scene, x, y);
    this.def = def;
    this.radius = radius;
    this.lookPeriod = lookPeriod;
    const key = ensureItemTexture(scene, def);
    if (def.shape === "lantern" || def.tier === "stall") {
      this.glow = scene.add.image(0, 18, "px-glow");
      this.glow.setAlpha(def.tier === "stall" ? 0.22 : 0.4);
      this.glow.setScale((radius * 2.8) / 16);
      this.add(this.glow);
    }
    this.sprite = scene.add.image(0, 0, key);
    this.sprite.setScale((radius * 2) / 50);
    this.add(this.sprite);
    if (def.tier === "stall") {
      this.lamp = scene.add.circle(0, -radius - 10, 8, 0x63e38a, 1);
      this.add(this.lamp);
      this.watching = false;
    }
    scene.add.existing(this);
    this.setDepth(def.tier === "landmark" ? 40 : 100 + Math.floor(radius));
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  watch(dt: number): void {
    if (this.def.tier !== "stall" || this.eaten) return;
    this.lookT += dt;
    if (this.lookT >= this.lookPeriod) {
      this.lookT = 0;
      this.watching = !this.watching;
      this.lamp?.setFillStyle(this.watching ? 0xff5a5a : 0x63e38a, 1);
    }
  }

  wander(dt: number): void {
    this.watch(dt);
    if (this.vx !== 0 || this.vy !== 0) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x < 90 || this.x > WORLD_W - 90) this.vx *= -1;
      if (this.y < 90 || this.y > WORLD_H - 90) this.vy *= -1;
      this.sprite.setFlipX(this.vx < 0);
      return;
    }
    if (this.def.tier !== "snack") return;
    this.drift += dt;
    this.x += Math.cos(this.drift * 0.7) * 6 * dt;
    this.y += Math.sin(this.drift * 0.9) * 6 * dt;
    if (this.glow) this.glow.setAlpha(0.3 + Math.sin(this.drift * 3) * 0.1);
  }
}
