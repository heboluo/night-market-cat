import Phaser from "phaser";
import { SWEEPER_RADIUS, SWEEPER_SPEED, WORLD_H, WORLD_W } from "../constants";

export class Sweeper extends Phaser.GameObjects.Sprite {
  readonly radius = SWEEPER_RADIUS;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "px-sweeper");
    scene.add.existing(this);
    this.setDepth(1800);
    this.setScale((this.radius * 2) / 70);
  }

  chase(target: { x: number; y: number }, dt: number): void {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.x += (dx / dist) * SWEEPER_SPEED * dt;
    this.y += (dy / dist) * SWEEPER_SPEED * dt;
    this.setFlipX(dx < 0);
    this.x = Phaser.Math.Clamp(this.x, 60, WORLD_W - 60);
    this.y = Phaser.Math.Clamp(this.y, 60, WORLD_H - 60);
  }
}
