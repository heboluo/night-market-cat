import Phaser from "phaser";
import { CAT_START_RADIUS } from "../constants";

export class Cat extends Phaser.GameObjects.Container {
  radius = CAT_START_RADIUS;
  eaten = 0;
  biggestName = "还没开口";
  biggestRadius = 0;
  private readonly bodyGfx: Phaser.GameObjects.Graphics;
  private facing = 0;
  private wobble = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.bodyGfx = scene.add.graphics();
    this.add(this.bodyGfx);
    scene.add.existing(this);
    this.setDepth(2000);
    this.redraw();
  }

  get area(): number {
    return Math.PI * this.radius * this.radius;
  }

  growBy(addedArea: number, name: string, eatenRadius: number): void {
    const nextArea = this.area + addedArea;
    this.radius = Math.sqrt(nextArea / Math.PI);
    this.eaten += 1;
    if (eatenRadius >= this.biggestRadius) {
      this.biggestRadius = eatenRadius;
      this.biggestName = name;
    }
    this.redraw();
  }

  follow(target: Phaser.Math.Vector2, dt: number): void {
    const speed = Phaser.Math.Clamp(310 - this.radius * 0.28, 165, 310);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) return;
    const step = Math.min(dist, speed * dt);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    this.facing = Math.atan2(dy, dx);
    this.wobble += dt * 9;
    this.redraw();
  }

  bounceFrom(nx: number, ny: number, force = 18): void {
    this.x += nx * force;
    this.y += ny * force;
  }

  private redraw(): void {
    const g = this.bodyGfx;
    const r = this.radius;
    g.clear();

    const tailWag = Math.sin(this.wobble) * r * 0.18;
    const tx = Math.cos(this.facing + Math.PI) * r * 1.15;
    const ty = Math.sin(this.facing + Math.PI) * r * 1.15;
    g.lineStyle(Math.max(4, r * 0.18), 0xf0a35a, 1);
    g.lineBetween(tx * 0.25, ty * 0.25, tx * 0.7 + tailWag, ty * 0.7);
    g.lineBetween(tx * 0.7 + tailWag, ty * 0.7, tx + tailWag * 0.4, ty);

    g.fillStyle(0xf4b26a, 1);
    g.fillCircle(0, 0, r);
    g.fillStyle(0xffd7a8, 0.9);
    g.fillCircle(-r * 0.12, r * 0.08, r * 0.62);

    const ear = r * 0.46;
    for (const side of [-1, 1]) {
      const ex = Math.cos(this.facing - Math.PI / 2) * r * 0.55 * side - Math.cos(this.facing) * r * 0.15;
      const ey = Math.sin(this.facing - Math.PI / 2) * r * 0.55 * side - Math.sin(this.facing) * r * 0.15;
      g.fillStyle(0xf0a35a, 1);
      g.fillTriangle(ex, ey - ear, ex - ear * 0.55, ey + ear * 0.2, ex + ear * 0.55, ey + ear * 0.2);
      g.fillStyle(0xffb6c8, 1);
      g.fillTriangle(ex, ey - ear * 0.55, ex - ear * 0.28, ey + ear * 0.05, ex + ear * 0.28, ey + ear * 0.05);
    }

    const eyeOffset = r * 0.32;
    const fx = Math.cos(this.facing) * r * 0.18;
    const fy = Math.sin(this.facing) * r * 0.18;
    for (const side of [-1, 1]) {
      const px = fx + Math.cos(this.facing + Math.PI / 2) * eyeOffset * side;
      const py = fy + Math.sin(this.facing + Math.PI / 2) * eyeOffset * side;
      g.fillStyle(0x2a1a14, 1);
      g.fillCircle(px, py, Math.max(2.4, r * 0.09));
      g.fillStyle(0xffffff, 0.85);
      g.fillCircle(px - r * 0.03, py - r * 0.03, Math.max(1.1, r * 0.035));
    }

    g.fillStyle(0xe07a6a, 1);
    g.fillCircle(fx * 1.4, fy * 1.4 + r * 0.08, Math.max(2, r * 0.08));
  }
}
