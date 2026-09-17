import Phaser from "phaser";
import type { ItemDef } from "../data/catalog";
import { CREAM, GOLD, INK, ORANGE, ORANGE_HI, PINK, WHITE } from "./palette";
import { css } from "./palette";
import { disc, ellipse, glow, paintCanvas, roundRect } from "./canvas";
import { paintItem } from "./paintItems";

export function ensureArt(scene: Phaser.Scene): void {
  paintCat(scene, "px-cat-0", 0);
  paintCat(scene, "px-cat-1", 1);
  paintSweeper(scene);
  paintGlow(scene);
  paintCrumb(scene);
  paintPing(scene);
  paintSteam(scene);
  paintLamp(scene);

  if (!scene.anims.exists("cat-walk")) {
    scene.anims.create({
      key: "cat-walk",
      frames: [{ key: "px-cat-0" }, { key: "px-cat-1" }],
      frameRate: 10,
      repeat: -1,
    });
  }
}

export function itemTextureKey(def: ItemDef): string {
  return `item-${def.name}`;
}

export function ensureItemTexture(scene: Phaser.Scene, def: ItemDef): string {
  const key = itemTextureKey(def);
  paintCanvas(scene, key, 128, 128, (ctx) => paintItem(ctx, def));
  return key;
}

function paintCat(scene: Phaser.Scene, key: string, frame: number): void {
  paintCanvas(scene, key, 80, 80, (ctx) => {
    const walk = frame === 1;
    ellipse(ctx, 40, 68, 18, 7, "rgba(10,6,12,0.35)");
    ctx.beginPath();
    ctx.moveTo(22, 16);
    ctx.lineTo(16, 4);
    ctx.lineTo(30, 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(58, 16);
    ctx.lineTo(64, 4);
    ctx.lineTo(50, 14);
    ctx.closePath();
    ctx.fill();
    disc(ctx, 22, 12, 5, css(PINK));
    disc(ctx, 58, 12, 5, css(PINK));
    ellipse(ctx, 40, 44, 22, 18, css(ORANGE));
    disc(ctx, 40, 28, 18, css(ORANGE_HI));
    ellipse(ctx, 40, 50, 12, 10, css(CREAM));
    disc(ctx, 33, 26, 5, css(WHITE));
    disc(ctx, 47, 26, 5, css(WHITE));
    disc(ctx, 34, 27, 2.3, css(INK));
    disc(ctx, 48, 27, 2.3, css(INK));
    disc(ctx, 32, 25, 1.1, css(WHITE));
    disc(ctx, 46, 25, 1.1, css(WHITE));
    disc(ctx, 40, 33, 2.4, css(0xe07070));
    ctx.strokeStyle = css(INK);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(40, 35);
    ctx.quadraticCurveTo(40, 40, 36, 42);
    ctx.moveTo(40, 35);
    ctx.quadraticCurveTo(40, 40, 44, 42);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,230,200,0.7)";
    ctx.lineWidth = 1.2;
    [[18, 32, 4, 30], [18, 36, 4, 38], [62, 32, 76, 30], [62, 36, 76, 38]].forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
    ctx.strokeStyle = css(ORANGE);
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(56, 52);
    ctx.quadraticCurveTo(74, 48, 70, 66);
    ctx.stroke();
    ctx.fillStyle = css(ORANGE);
    const feet = walk
      ? [
          [26, 64],
          [40, 62],
          [34, 66],
          [50, 64],
        ]
      : [
          [28, 64],
          [38, 64],
          [44, 64],
          [54, 64],
        ];
    feet.forEach(([x, y]) => ellipse(ctx, x, y, 5, 3.4, css(ORANGE)));
  });
}

function paintSweeper(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-sweeper", 128, 80, (ctx) => {
    ellipse(ctx, 64, 70, 40, 8, "rgba(10,6,12,0.4)");
    roundRect(ctx, 18, 28, 92, 32, 10, "#4a5568");
    roundRect(ctx, 22, 22, 70, 16, 6, "#6a7384");
    roundRect(ctx, 24, 18, 28, 14, 4, css(GOLD));
    disc(ctx, 32, 64, 10, css(INK));
    disc(ctx, 96, 64, 10, css(INK));
    disc(ctx, 32, 64, 5, "#8a93a4");
    disc(ctx, 96, 64, 5, "#8a93a4");
    ctx.fillStyle = "#c45a3a";
    ctx.fillRect(6, 40, 18, 8);
    disc(ctx, 10, 44, 6, css(GOLD));
    ctx.fillStyle = "#ffe7c2";
    ctx.font = "bold 12px Microsoft YaHei, sans-serif";
    ctx.fillText("收摊", 48, 42);
  });
}

function paintGlow(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-glow", 64, 64, (ctx) => {
    glow(ctx, 32, 32, 30, "rgba(255, 210, 110, 0.9)");
    disc(ctx, 32, 32, 8, "rgba(255,246,230,0.85)");
  });
}

function paintCrumb(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-crumb", 8, 8, (ctx) => {
    disc(ctx, 4, 4, 3, css(GOLD));
    disc(ctx, 3, 3, 1.2, css(WHITE));
  });
}

function paintPing(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-ping", 32, 36, (ctx) => {
    ctx.fillStyle = css(GOLD);
    ctx.beginPath();
    ctx.moveTo(16, 32);
    ctx.lineTo(4, 12);
    ctx.lineTo(28, 12);
    ctx.closePath();
    ctx.fill();
    disc(ctx, 16, 10, 8, "#fff6ea");
  });
}

function paintSteam(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-steam", 24, 24, (ctx) => {
    glow(ctx, 12, 12, 11, "rgba(255,255,255,0.55)");
  });
}

function paintLamp(scene: Phaser.Scene): void {
  paintCanvas(scene, "px-lamp", 24, 24, (ctx) => {
    glow(ctx, 12, 12, 11, "rgba(255,255,255,0.8)");
    disc(ctx, 12, 12, 6, "#fff");
  });
}
