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
  parentStall?: Edible;
  tension = 0;
  private lookT: number;
  private readonly phase: number;
  private drift = 0;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow?: Phaser.GameObjects.Image;
  private readonly lamp?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, def: ItemDef, radius: number, phase = 0) {
    super(scene, x, y);
    this.def = def;
    this.radius = radius;
    this.phase = phase;
    this.lookT = phase;
    const key = ensureItemTexture(scene, def);
    if (def.shape === "lantern" || def.tier === "stall" || def.tier === "snack") {
      this.glow = scene.add.image(0, 16, "px-glow");
      this.glow.setAlpha(def.tier === "stall" ? 0.28 : def.tier === "snack" ? 0.16 : 0.4);
      this.glow.setScale((radius * 2.4) / 32);
      this.add(this.glow);
    }
    this.sprite = scene.add.image(0, 0, key);
    this.sprite.setScale((radius * 2) / 78);
    this.add(this.sprite);
    if (def.tier === "stall") {
      this.lamp = scene.add.image(radius * 0.08, -radius * 0.78, "px-lamp");
      this.lamp.setScale(1.35);
      this.add(this.lamp);
      this.watching = false;
    }
    scene.add.existing(this);
    this.setDepth(def.tier === "landmark" ? 40 : 100 + Math.floor(y * 0.1 + radius));
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  markStarter(): void {
    this.glow?.setAlpha(0.55);
    this.glow?.setScale((this.radius * 3.4) / 32);
  }

  watch(dt: number): void {
    if (this.def.tier !== "stall" || this.eaten) return;
    this.lookT += dt;
    const green = Math.max(1.05, 2.5 - this.tension * 0.55);
    const red = 0.95 + this.tension * 0.42;
    const span = this.watching ? red : green;
    if (this.lookT >= span) {
      this.lookT = 0;
      this.watching = !this.watching;
    }
    const color = this.watching ? 0xff5a5a : 0x6dff8c;
    this.lamp?.setTint(color);
    this.lamp?.setScale(this.watching ? 1.55 : 1.25 + Math.sin(this.lookT * 6) * 0.12);
    this.sprite.setTint(this.watching ? 0xffd0d0 : 0xffffff);
  }

  wander(dt: number): void {
    this.watch(dt);
    if (this.vx !== 0 || this.vy !== 0) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x < 90 || this.x > WORLD_W - 90) this.vx *= -1;
      if (this.y < 520 || this.y > WORLD_H - 90) this.vy *= -1;
      this.sprite.setFlipX(this.vx < 0);
      return;
    }
    if (this.def.tier !== "snack") return;
    this.drift += dt;
    this.x += Math.cos(this.drift * 0.7 + this.phase) * 8 * dt;
    this.y += Math.sin(this.drift * 0.9 + this.phase) * 6 * dt;
    if (this.glow) this.glow.setAlpha(0.18 + Math.sin(this.drift * 3) * 0.1);
  }
}
