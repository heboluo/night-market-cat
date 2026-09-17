import Phaser from "phaser";
import { ensureItemTexture } from "../art/createSprites";
import { WORLD_SIZE } from "../constants";
import type { ItemDef } from "../data/catalog";

export class Edible extends Phaser.GameObjects.Container {
  readonly def: ItemDef;
  readonly radius: number;
  eaten = false;
  vx = 0;
  vy = 0;
  private drift = 0;
  private readonly sprite: Phaser.GameObjects.Image;
  private readonly glow?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, def: ItemDef, radius: number) {
    super(scene, x, y);
    this.def = def;
    this.radius = radius;
    const key = ensureItemTexture(scene, def);
    if (def.shape === "lantern") {
      this.glow = scene.add.image(0, 0, "px-glow");
      this.glow.setAlpha(0.35);
      this.glow.setScale((radius * 2.4) / 16);
      this.add(this.glow);
    }
    this.sprite = scene.add.image(0, 0, key);
    this.sprite.setScale((radius * 2) / 28);
    this.add(this.sprite);
    scene.add.existing(this);
    this.setDepth(def.tier === "landmark" ? 50 : 100 + Math.floor(radius));
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  wander(dt: number): void {
    if (this.vx !== 0 || this.vy !== 0) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x < 90 || this.x > WORLD_SIZE - 90) this.vx *= -1;
      if (this.y < 90 || this.y > WORLD_SIZE - 90) this.vy *= -1;
      this.sprite.setFlipX(this.vx < 0);
      return;
    }
    if (this.def.tier !== "snack") return;
    this.drift += dt;
    this.x += Math.cos(this.drift * 0.7) * 8 * dt;
    this.y += Math.sin(this.drift * 0.9) * 8 * dt;
    if (this.glow) this.glow.setAlpha(0.28 + Math.sin(this.drift * 3) * 0.08);
  }
}
