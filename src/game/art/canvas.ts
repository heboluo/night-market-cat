import Phaser from "phaser";
import { css } from "./palette";

export { css };

export function paintCanvas(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  painter(ctx, w, h);
  tex.refresh();
  tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

export type PaintFill = string | CanvasGradient | CanvasPattern;

export function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: PaintFill): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  const g = ctx.createRadialGradient(x, y, r * 0.08, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.45, color);
  g.addColorStop(1, css(0x000000, 0));
  disc(ctx, x, y, r, g);
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: PaintFill,
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

export function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: PaintFill): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
