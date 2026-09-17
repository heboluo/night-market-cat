import Phaser from "phaser";
import { rgb } from "./palette";

export class PixelPlotter {
  constructor(
    private readonly data: Uint8ClampedArray,
    readonly w: number,
    readonly h: number,
  ) {}

  set(x: number, y: number, color: number, alpha = 255): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return;
    const i = (iy * this.w + ix) * 4;
    const [r, g, b] = rgb(color);
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = alpha;
  }

  fillRect(x: number, y: number, w: number, h: number, color: number): void {
    for (let iy = 0; iy < h; iy++) {
      for (let ix = 0; ix < w; ix++) this.set(x + ix, y + iy, color);
    }
  }

  disc(cx: number, cy: number, radius: number, color: number): void {
    const r = Math.max(1, Math.round(radius));
    const r2 = r * r;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r2) this.set(cx + x, cy + y, color);
      }
    }
  }

  ring(cx: number, cy: number, radius: number, color: number): void {
    const r = Math.max(1, Math.round(radius));
    const inner = Math.max(0, r - 1);
    const r2 = r * r;
    const i2 = inner * inner;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d <= r2 && d > i2) this.set(cx + x, cy + y, color);
      }
    }
  }
}

export function paintTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  painter: (p: PixelPlotter) => void,
): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const image = ctx.createImageData(w, h);
  painter(new PixelPlotter(image.data, w, h));
  ctx.putImageData(image, 0, 0);
  tex.refresh();
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export function paintMap(
  scene: Phaser.Scene,
  key: string,
  rows: string[],
  legend: Record<string, number | undefined>,
): void {
  const h = rows.length;
  const w = Math.max(...rows.map((row) => row.length));
  paintTexture(scene, key, w, h, (p) => {
    for (let y = 0; y < h; y++) {
      const row = rows[y].padEnd(w, ".");
      for (let x = 0; x < w; x++) {
        const color = legend[row[x]];
        if (color !== undefined) p.set(x, y, color);
      }
    }
  });
}
