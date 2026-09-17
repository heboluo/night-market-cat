import { GOLD, css } from "./palette";
import { disc, ellipse, glow, roundRect } from "./canvas";
import type { ItemDef } from "../data/catalog";

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry = rx * 0.38): void {
  ellipse(ctx, x, y, rx, ry, "rgba(8, 4, 10, 0.42)");
}

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: number, accent?: number): void {
  const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.38, r * 0.1, x, y, r);
  g.addColorStop(0, css(color, 1));
  g.addColorStop(0.55, css(color, 1));
  g.addColorStop(1, css(accent ?? 0x4a2018, 1));
  disc(ctx, x, y, r, g);
  disc(ctx, x - r * 0.28, y - r * 0.32, r * 0.22, "rgba(255,255,255,0.55)");
}

export function paintItem(ctx: CanvasRenderingContext2D, def: ItemDef): void {
  const m = 64;
  shadow(ctx, m, 108, 28, 10);
  switch (def.name) {
    case "小鱼丸":
      paintSkewer(ctx, m, 70, [0xf3d3a0, 0xe8c48a, 0xf7ddb0], 0xe8896a);
      break;
    case "烤肠":
      paintSausage(ctx);
      break;
    case "臭豆腐":
      paintTofu(ctx);
      break;
    case "糖葫芦":
      paintTanghulu(ctx);
      break;
    case "珍珠奶茶":
      paintTea(ctx);
      break;
    case "章鱼小丸子":
      paintTakoyaki(ctx);
      break;
    case "烤鱿鱼":
      paintSquid(ctx);
      break;
    case "炒板栗":
      paintChestnuts(ctx);
      break;
    case "小板凳":
      paintStool(ctx);
      break;
    case "灯笼":
      paintLantern(ctx, def.color, def.accent);
      break;
    case "蒸笼":
      paintSteamer(ctx);
      break;
    case "花盆":
      paintPot(ctx);
      break;
    case "纸箱":
      paintBox(ctx);
      break;
    case "烧烤摊":
    case "面摊":
    case "糖水摊":
    case "杂货摊":
      paintStall(ctx, def);
      break;
    case "电动车":
      paintScooter(ctx);
      break;
    case "夜市牌坊":
      paintArch(ctx);
      break;
    default:
      ball(ctx, m, m, 28, def.color, def.accent);
  }
}

function paintSkewer(ctx: CanvasRenderingContext2D, x: number, y: number, colors: number[], tip: number): void {
  ctx.strokeStyle = "#6a3a22";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 6, 18);
  ctx.lineTo(x + 4, 112);
  ctx.stroke();
  colors.forEach((color, i) => ball(ctx, x + (i - 1) * 2, y - 18 + i * 22, 16, color, tip));
}

function paintSausage(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.translate(64, 66);
  ctx.rotate(-0.35);
  roundRect(ctx, -42, -14, 84, 28, 14, "#8b2a22");
  roundRect(ctx, -40, -12, 80, 24, 12, "#e36b4e");
  ctx.strokeStyle = "rgba(80,20,16,0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-28 + i * 14, -8);
    ctx.lineTo(-22 + i * 14, 8);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#5a2a18";
  ctx.fillRect(86, 28, 5, 70);
}

function paintTofu(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, 28, 40, 72, 58, 8, "#2d2114");
  roundRect(ctx, 32, 36, 64, 54, 7, "#6c5a3a");
  roundRect(ctx, 38, 42, 28, 16, 4, "rgba(255,220,160,0.28)");
  ctx.fillStyle = "#8b1e1e";
  ctx.globalAlpha = 0.8;
  roundRect(ctx, 44, 58, 40, 10, 4, "#8b1e1e");
  ctx.globalAlpha = 1;
  disc(ctx, 72, 72, 6, "#c45a3a");
}

function paintTanghulu(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#d4a056";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(64, 18);
  ctx.lineTo(64, 112);
  ctx.stroke();
  [0, 1, 2].forEach((i) => {
    ball(ctx, 64, 36 + i * 22, 15, 0xc62828, 0x7a1010);
    disc(ctx, 64, 36 + i * 22, 15, "rgba(255, 230, 120, 0.18)");
  });
}

function paintTea(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, 38, 38, 52, 62, 10, "#f5d0c5");
  ctx.fillStyle = "#8d6e4c";
  ctx.fillRect(42, 58, 44, 38);
  for (let i = 0; i < 6; i++) disc(ctx, 50 + (i % 3) * 12, 86 + Math.floor(i / 3) * 10, 4, "#3a2418");
  ellipse(ctx, 64, 58, 22, 8, "rgba(255,255,255,0.55)");
  ctx.strokeStyle = "#e8c8b8";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(92, 64, 12, -0.8, 0.8);
  ctx.stroke();
  disc(ctx, 58, 32, 7, "#fff6ea");
}

function paintTakoyaki(ctx: CanvasRenderingContext2D): void {
  [[48, 58], [78, 54], [62, 78]].forEach(([x, y], i) => {
    ball(ctx, x, y, 16, 0xd9a066, 0x5d3a1a);
    ctx.fillStyle = "#5d3a1a";
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 2);
    ctx.quadraticCurveTo(x, y - 14 - i, x + 8, y);
    ctx.strokeStyle = "#5d3a1a";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

function paintSquid(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 64, 46, 22, 16, "#d7b899");
  disc(ctx, 56, 42, 3, "#2a1820");
  disc(ctx, 72, 42, 3, "#2a1820");
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = "#c9a07e";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(48 + i * 8, 58);
    ctx.quadraticCurveTo(44 + i * 9, 88, 50 + i * 7, 108);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(122,62,43,0.35)";
  ctx.fillRect(46, 52, 36, 6);
}

function paintChestnuts(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(64, 28);
  ctx.lineTo(104, 108);
  ctx.lineTo(24, 108);
  ctx.closePath();
  ctx.fillStyle = "#e6c07b";
  ctx.fill();
  ctx.fillStyle = "#c44a3a";
  ctx.fillRect(24, 100, 80, 10);
  ball(ctx, 52, 78, 12, 0x8a4b22, 0x3a1e10);
  ball(ctx, 74, 74, 11, 0xa05a28, 0x3a1e10);
  ball(ctx, 64, 92, 10, 0x7a3e18, 0x3a1e10);
}

function paintStool(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, 30, 40, 68, 14, 6, "#6b3f1f");
  roundRect(ctx, 32, 38, 64, 12, 6, "#c48a4a");
  ctx.fillStyle = "#8a5a32";
  ctx.fillRect(38, 52, 8, 48);
  ctx.fillRect(82, 52, 8, 48);
  ctx.fillRect(40, 92, 48, 8);
}

function paintLantern(ctx: CanvasRenderingContext2D, color: number, accent: number): void {
  glow(ctx, 64, 70, 42, css(color, 0.35));
  ctx.fillStyle = "#6b3226";
  ctx.fillRect(60, 18, 8, 14);
  roundRect(ctx, 36, 30, 56, 12, 4, "#6b3226");
  ball(ctx, 64, 70, 30, color, accent);
  roundRect(ctx, 36, 96, 56, 10, 4, "#6b3226");
  ctx.strokeStyle = css(accent, 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 42);
  ctx.lineTo(64, 96);
  ctx.stroke();
}

function paintSteamer(ctx: CanvasRenderingContext2D): void {
  ellipse(ctx, 64, 96, 36, 12, "#8a5a32");
  roundRect(ctx, 30, 58, 68, 38, 8, "#d8b07a");
  roundRect(ctx, 34, 40, 60, 28, 8, "#c49a68");
  ctx.strokeStyle = "rgba(90,50,24,0.4)";
  ctx.lineWidth = 2;
  for (let y = 48; y < 92; y += 8) {
    ctx.beginPath();
    ctx.moveTo(38, y);
    ctx.lineTo(90, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.35;
  disc(ctx, 50, 36, 10, "#fff");
  disc(ctx, 70, 30, 12, "#fff");
  ctx.globalAlpha = 1;
}

function paintPot(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, 40, 70, 48, 36, 8, "#5d8a5a");
  ctx.beginPath();
  ctx.moveTo(40, 74);
  ctx.lineTo(28, 70);
  ctx.lineTo(100, 70);
  ctx.lineTo(88, 74);
  ctx.fillStyle = "#4a6e48";
  ctx.fill();
  disc(ctx, 64, 52, 16, "#c45a4a");
  disc(ctx, 64, 50, 10, "#ff8aa0");
  ctx.fillStyle = "#3d6a3a";
  ctx.fillRect(62, 52, 5, 22);
}

function paintBox(ctx: CanvasRenderingContext2D): void {
  roundRect(ctx, 28, 44, 72, 56, 4, "#7a6240");
  roundRect(ctx, 32, 40, 64, 52, 4, "#c4a574");
  ctx.strokeStyle = "#7a6240";
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 40, 64, 52);
  ctx.beginPath();
  ctx.moveTo(64, 40);
  ctx.lineTo(64, 92);
  ctx.stroke();
  ctx.fillStyle = "#8b3a1e";
  ctx.fillRect(44, 58, 40, 10);
}

function paintStall(ctx: CanvasRenderingContext2D, def: ItemDef): void {
  glow(ctx, 64, 86, 50, css(def.accent, 0.2));
  ctx.fillStyle = "#2a1814";
  ctx.fillRect(18, 70, 92, 42);
  roundRect(ctx, 16, 68, 96, 18, 4, "#5a3224");
  ctx.beginPath();
  ctx.moveTo(8, 68);
  ctx.lineTo(64, 22);
  ctx.lineTo(120, 68);
  ctx.closePath();
  ctx.fillStyle = css(def.color);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, 64);
  ctx.lineTo(64, 28);
  ctx.lineTo(114, 64);
  ctx.closePath();
  ctx.fillStyle = css(def.accent);
  ctx.fill();
  roundRect(ctx, 40, 78, 48, 16, 4, "#ffe6c4");
  disc(ctx, 28, 58, 6, css(GOLD));
  disc(ctx, 64, 46, 6, css(GOLD));
  disc(ctx, 100, 58, 6, css(GOLD));
  ctx.fillStyle = "#fff3dd";
  ctx.font = "bold 14px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(def.name.replace("摊", ""), 64, 56);
}

function paintScooter(ctx: CanvasRenderingContext2D): void {
  disc(ctx, 36, 96, 14, "#1a1020");
  disc(ctx, 96, 96, 14, "#1a1020");
  disc(ctx, 36, 96, 8, "#6a7384");
  disc(ctx, 96, 96, 8, "#6a7384");
  roundRect(ctx, 28, 70, 76, 18, 8, "#3a4458");
  roundRect(ctx, 32, 66, 40, 10, 4, "#5a6780");
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(90, 40, 8, 36);
  roundRect(ctx, 82, 34, 22, 10, 4, "#ffd166");
  disc(ctx, 24, 76, 5, "#ff9a4a");
}

function paintArch(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#8b1e1e";
  ctx.fillRect(18, 48, 18, 70);
  ctx.fillRect(92, 48, 18, 70);
  roundRect(ctx, 10, 36, 108, 20, 4, "#ffd54f");
  roundRect(ctx, 22, 18, 84, 22, 6, "#8b1e1e");
  ctx.fillStyle = "#ffd54f";
  ctx.font = "bold 13px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("夜市", 64, 34);
  glow(ctx, 28, 58, 10, "rgba(255,200,80,0.5)");
  glow(ctx, 100, 58, 10, "rgba(255,200,80,0.5)");
}
