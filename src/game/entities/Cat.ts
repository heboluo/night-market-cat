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
    this.play("cat-idle");
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

  follow(target: Phaser.Math.Vector2, dt: number): void {
    const speed = Phaser.Math.Clamp(300 - this.radius * 0.42, 150, 300);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 14) {
      this.setMoving(false);
      return;
    }
    const step = Math.min(dist, speed * dt);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.setFlipX(dx < 0);
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
    const scale = (this.radius * 2) / 22;
    this.setScale(scale);
  }

  private setMoving(moving: boolean): void {
    if (this.moving === moving) return;
    this.moving = moving;
    this.play(moving ? "cat-walk" : "cat-idle", true);
  }
}
