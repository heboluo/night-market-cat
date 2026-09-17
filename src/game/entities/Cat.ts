import Phaser from "phaser";
import { CAT_MIN_RADIUS, CAT_START_RADIUS } from "../constants";

export class Cat extends Phaser.GameObjects.Sprite {
  radius = CAT_START_RADIUS;
  eaten = 0;
  biggestName = "还没开口";
  biggestRadius = 0;
  ateArch = false;
  private moving = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "px-cat-0");
    scene.add.existing(this);
    this.setDepth(2000);
    this.setOrigin(0.5, 0.72);
    this.anims.stop();
    this.setTexture("px-cat-0");
    this.refreshScale();
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  growBy(addedArea: number, name: string, eatenRadius: number, isArch = false): void {
    this.setArea(this.area + addedArea);
    this.eaten += 1;
    if (eatenRadius >= this.biggestRadius) {
      this.biggestRadius = eatenRadius;
      this.biggestName = name;
    }
    if (isArch) this.ateArch = true;
  }

  shrinkBy(lostArea: number): void {
    this.setArea(Math.max(this.minArea(), this.area - lostArea));
  }

  get starved(): boolean {
    return this.radius <= CAT_MIN_RADIUS + 0.05;
  }

  steer(ix: number, iy: number, dt: number): void {
    if (ix === 0 && iy === 0) {
      this.setMoving(false);
      return;
    }
    const len = Math.hypot(ix, iy) || 1;
    const nx = ix / len;
    const ny = iy / len;
    const speed = Phaser.Math.Clamp(280 - this.radius * 0.35, 150, 280);
    this.x += nx * speed * dt;
    this.y += ny * speed * dt;
    this.setFlipX(nx < 0);
    this.setMoving(true);
  }

  bounceFrom(nx: number, ny: number, force = 18): void {
    this.x += nx * force;
    this.y += ny * force;
  }

  private setArea(nextArea: number): void {
    this.radius = Math.sqrt(Math.max(this.minArea(), nextArea) / Math.PI);
    this.refreshScale();
  }

  private minArea(): number {
    return Math.PI * CAT_MIN_RADIUS * CAT_MIN_RADIUS;
  }

  private refreshScale(): void {
    this.setScale((this.radius * 2) / 22);
  }

  private setMoving(moving: boolean): void {
    if (this.moving === moving) {
      if (!moving) this.setTexture("px-cat-0");
      return;
    }
    this.moving = moving;
    if (moving) this.play("cat-walk", true);
    else {
      this.anims.stop();
      this.setTexture("px-cat-0");
    }
  }
}
