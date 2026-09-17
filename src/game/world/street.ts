import Phaser from "phaser";
import { WORLD_H, WORLD_W } from "../constants";
import { disc, ellipse, glow, paintCanvas, roundRect } from "../art/canvas";

function n(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function paintStreet(scene: Phaser.Scene): void {
  paintCanvas(scene, "night-far-v2", WORLD_W, 820, paintFar);
  paintCanvas(scene, "night-near-v2", WORLD_W, WORLD_H, paintNear);
  scene.add.image(WORLD_W / 2, 390, "night-far-v2").setScrollFactor(0.28, 0.4).setDepth(0);
  scene.add.image(WORLD_W / 2, WORLD_H / 2, "night-near-v2").setDepth(1);
}

function paintFar(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#070614");
  sky.addColorStop(0.28, "#140a28");
  sky.addColorStop(0.55, "#2e1238");
  sky.addColorStop(0.78, "#6a2438");
  sky.addColorStop(1, "#e26a42");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 90; i++) {
    disc(ctx, n(i) * w, 18 + n(i + 3) * h * 0.42, i % 7 === 0 ? 2.1 : 1.15, `rgba(255,236,200,${0.22 + n(i + 9) * 0.55})`);
  }

  glow(ctx, w * 0.78, 128, 90, "rgba(255, 214, 150, 0.55)");
  disc(ctx, w * 0.78, 128, 38, "#fff3d2");
  disc(ctx, w * 0.78 - 12, 118, 12, "rgba(255,255,255,0.55)");

  ctx.fillStyle = "#120814";
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 40) {
    const y = h * 0.58 + Math.sin(x * 0.008) * 28 + n(x) * 22;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 22; i++) {
    const x = 40 + i * 118;
    const bw = 70 + n(i) * 50;
    const bh = 90 + n(i + 4) * 120;
    const top = h - bh - 40;
    ctx.fillStyle = i % 3 === 0 ? "#1a0e22" : "#140c1c";
    ctx.fillRect(x, top, bw, bh);
    const cols = 3 + (i % 2);
    const rows = 3 + (i % 3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (n(i * 20 + r * 5 + c) < 0.22) continue;
        ctx.fillStyle = n(i + r + c) > 0.55 ? "#ffd27a" : "#ff8a5a";
        ctx.globalAlpha = 0.55 + n(i + r) * 0.4;
        ctx.fillRect(x + 8 + c * ((bw - 16) / cols), top + 12 + r * ((bh - 24) / rows), 7, 9);
        ctx.globalAlpha = 1;
      }
    }
  }
}

function paintNear(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const streetTop = h * 0.46;
  const ground = ctx.createLinearGradient(0, streetTop - 80, 0, h);
  ground.addColorStop(0, "rgba(42, 18, 28, 0)");
  ground.addColorStop(0.12, "#2a151c");
  ground.addColorStop(0.4, "#3a2422");
  ground.addColorStop(0.72, "#4a3028");
  ground.addColorStop(1, "#2a1816");
  ctx.fillStyle = ground;
  ctx.fillRect(0, streetTop - 80, w, h - streetTop + 80);

  paintShops(ctx, w, streetTop);
  paintRoad(ctx, w, h, streetTop);
  paintLanterns(ctx, streetTop);
  paintCrowd(ctx, streetTop);
  paintProps(ctx, w, streetTop);
}

function paintShops(ctx: CanvasRenderingContext2D, _w: number, streetTop: number): void {
  const names = ["烧烤", "面馆", "糖水", "杂货", "鱼丸", "奶茶", "炒粉", "灯笼", "板栗", "鱿鱼", "夜茶", "小食"];
  const colors = ["#8b2a22", "#5a3a22", "#6a2a44", "#2f4a32", "#7a4a1a", "#4a2a38", "#6a3220", "#7a2818", "#5a3a18", "#4a3040", "#3a2a48", "#6a2428"];
  const accents = ["#ff9a4a", "#e8d2a0", "#ffb7c5", "#c9e29a", "#ffd36a", "#f5d0c5", "#ffc56a", "#ff8a3d", "#e6c07b", "#d7b899", "#c5b0ff", "#ffe6c4"];
  const shopW = 210;
  for (let i = 0; i < names.length; i++) {
    const x = 30 + i * shopW;
    const facadeH = 210 + (i % 3) * 18;
    const y = streetTop - facadeH + 36;
    roundRect(ctx, x, y, shopW - 18, facadeH, 8, "#1c1016");
    roundRect(ctx, x + 8, y + 18, shopW - 34, facadeH - 46, 6, colors[i]);
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 70);
    ctx.lineTo(x + (shopW - 18) / 2, y + 18);
    ctx.lineTo(x + shopW - 12, y + 70);
    ctx.closePath();
    ctx.fillStyle = accents[i];
    ctx.fill();
    roundRect(ctx, x + 36, y + 86, shopW - 90, 36, 6, "#241018");
    ctx.fillStyle = "#ffe7c2";
    ctx.font = "bold 22px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(names[i], x + (shopW - 18) / 2, y + 112);
    for (let k = 0; k < 3; k++) {
      glow(ctx, x + 40 + k * 52, y + 150, 18, "rgba(255, 190, 90, 0.35)");
      roundRect(ctx, x + 28 + k * 52, y + 138, 28, 36, 4, "rgba(255, 214, 140, 0.28)");
    }
    roundRect(ctx, x + 16, streetTop - 28, shopW - 50, 22, 4, "#4a2a22");
  }
}

function paintRoad(ctx: CanvasRenderingContext2D, w: number, _h: number, streetTop: number): void {
  const pathY = streetTop + 110;
  roundRect(ctx, 20, pathY, w - 40, 168, 28, "#4a322c");
  const wet = ctx.createLinearGradient(0, pathY, 0, pathY + 168);
  wet.addColorStop(0, "rgba(255, 180, 90, 0.08)");
  wet.addColorStop(0.45, "rgba(255, 220, 160, 0.16)");
  wet.addColorStop(1, "rgba(40, 16, 20, 0.2)");
  roundRect(ctx, 48, pathY + 18, w - 96, 118, 22, wet);

  for (let i = 0; i < 70; i++) {
    const x = 80 + (i * 97) % (w - 160);
    const y = pathY + 24 + n(i + 11) * 120;
    ctx.strokeStyle = `rgba(70, 42, 36, ${0.18 + n(i) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 16 + n(i) * 10, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(255, 210, 140, ${0.04 + n(i) * 0.06})`;
    ctx.fillRect(120 + i * 140, pathY + 40, 18, 90);
  }

  roundRect(ctx, 30, pathY + 176, w - 60, 220, 24, "#3a241e");
  for (let i = 0; i < 12; i++) {
    const x = 90 + i * 200;
    roundRect(ctx, x, pathY + 210, 70, 36, 8, "#5a3224");
    glow(ctx, x + 34, pathY + 200, 22, "rgba(255, 170, 80, 0.2)");
    ellipse(ctx, x + 120, pathY + 250, 14, 20, "rgba(12, 8, 14, 0.5)");
    disc(ctx, x + 120, pathY + 232, 10, "rgba(24, 14, 20, 0.55)");
  }
}

function paintLanterns(ctx: CanvasRenderingContext2D, streetTop: number): void {
  const yBase = streetTop - 28;
  ctx.strokeStyle = "rgba(90, 40, 24, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, yBase);
  for (let i = 0; i < 32; i++) {
    const x = 40 + i * 80;
    const y = yBase + Math.sin(i * 0.62) * 16;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  for (let i = 0; i < 32; i++) {
    const x = 40 + i * 80;
    const y = yBase + Math.sin(i * 0.62) * 16;
    glow(ctx, x, y + 34, 38, i % 3 === 0 ? "rgba(255, 120, 70, 0.32)" : "rgba(255, 190, 80, 0.34)");
    disc(ctx, x, y + 10, 5, "#ffd36a");
    disc(ctx, x, y + 30, 12, i % 2 === 0 ? "#ff8a3a" : "#ff5a5a");
    disc(ctx, x - 3, y + 26, 3.2, "rgba(255,255,255,0.5)");
  }
}

function paintCrowd(ctx: CanvasRenderingContext2D, streetTop: number): void {
  for (let i = 0; i < 26; i++) {
    const x = 70 + i * 96 + n(i) * 20;
    const y = streetTop + 36 + (i % 2) * 16;
    ellipse(ctx, x, y + 18, 16, 22, "rgba(12, 8, 14, 0.55)");
    disc(ctx, x, y, 11, "rgba(24, 14, 20, 0.6)");
  }
}

function paintProps(ctx: CanvasRenderingContext2D, w: number, streetTop: number): void {
  for (let i = 0; i < 10; i++) {
    const x = 180 + i * 230;
    const y = streetTop + 210 + n(i) * 40;
    roundRect(ctx, x, y, 34, 26, 4, "#6b3f1f");
    roundRect(ctx, x + 40, y + 6, 28, 22, 3, "#8a5a32");
    glow(ctx, x + 90, y - 30, 26, "rgba(80, 180, 90, 0.18)");
  }

  ctx.fillStyle = "#8b1e1e";
  ctx.fillRect(w - 300, streetTop - 210, 28, 180);
  ctx.fillRect(w - 120, streetTop - 210, 28, 180);
  roundRect(ctx, w - 330, streetTop - 250, 250, 44, 8, "#ffd36a");
  roundRect(ctx, w - 310, streetTop - 292, 210, 42, 8, "#8b1e1e");
  ctx.fillStyle = "#ffd36a";
  ctx.font = "bold 26px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("夜 市", w - 205, streetTop - 262);
}
