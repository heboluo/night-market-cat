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
  private readonly bang?: Phaser.GameObjects.Image;
  private readonly mark: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, def: ItemDef, radius: number, phase = 0, startWatching = false) {
    super(scene, x, y);
    this.def = def;
    this.radius = radius;
    this.phase = phase;
    this.lookT = 0;
    this.watching = startWatching;
    const key = ensureItemTexture(scene, def);
    if (def.tier === "snack" || def.tier === "stall") {
      this.glow = scene.add.image(0, 6, "px-glow");
      this.glow.setAlpha(def.tier === "stall" ? 0.2 : 0.22);
      this.glow.setScale((radius * 2) / 14);
      this.add(this.glow);
    }
    this.sprite = scene.add.image(0, 0, key);
    this.sprite.setScale((radius * 2) / 16);
    this.add(this.sprite);
    if (def.tier === "stall") {
      this.lamp = scene.add.image(0, -radius - 6, "px-lamp");
      this.lamp.setScale(2);
      this.add(this.lamp);
      this.bang = scene.add.image(12, -radius - 16, "px-bang");
      this.bang.setVisible(startWatching);
      this.add(this.bang);
    }
    this.mark = scene.add.image(0, -radius - 8, "px-yes");
    this.mark.setVisible(false);
    this.mark.setScale(1.2);
    this.add(this.mark);
    scene.add.existing(this);
    this.setDepth(def.tier === "landmark" ? 40 : 100 + Math.floor(y + radius));
    this.refreshLamp();
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  markStarter(): void {
    this.glow?.setAlpha(0.7);
    this.glow?.setScale((this.radius * 2) / 10);
  }

  showMark(kind: "yes" | "no" | "none"): void {
    if (kind === "none") {
      this.mark.setVisible(false);
      return;
    }
    this.mark.setTexture(kind === "yes" ? "px-yes" : "px-no");
    this.mark.setVisible(true);
  }

  watch(dt: number): void {
    if (this.def.tier !== "stall" || this.eaten) return;
    this.lookT += dt;
    const green = Math.max(1.2, 2.6 - this.tension * 0.5);
    const red = 1.1 + this.tension * 0.35;
    const span = this.watching ? red : green;
    if (this.lookT >= span) {
      this.lookT = 0;
      this.watching = !this.watching;
    }
    this.refreshLamp();
  }

  private refreshLamp(): void {
    this.lamp?.setTint(this.watching ? 0xff5a5a : 0x63e38a);
    this.bang?.setVisible(this.watching);
  }

  wander(dt: number): void {
    this.watch(dt);
    if (this.vx !== 0 || this.vy !== 0) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x < 40 || this.x > WORLD_W - 40) this.vx *= -1;
      if (this.y < 160 || this.y > WORLD_H - 24) this.vy *= -1;
      this.sprite.setFlipX(this.vx < 0);
      return;
    }
    if (this.def.tier !== "snack") return;
    this.drift += dt;
    this.x += Math.cos(this.drift * 0.7 + this.phase) * 5 * dt;
    this.y += Math.sin(this.drift * 0.9 + this.phase) * 4 * dt;
    if (this.glow) this.glow.setAlpha(0.2 + Math.sin(this.drift * 4) * 0.12);
  }
}
