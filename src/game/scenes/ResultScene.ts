import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { formatRank, type RoundResult } from "../types";
import { paintStreet } from "../world/street";
import { WORLD_H } from "../constants";

export class ResultScene extends Phaser.Scene {
  private result!: RoundResult;

  constructor() {
    super("result");
  }

  init(data: RoundResult): void {
    this.result = data;
  }

  create(): void {
    ensureArt(this);
    paintStreet(this);
    const cx = 1100;
    const cy = WORLD_H * 0.62;
    this.cameras.main.setZoom(0.86);
    this.cameras.main.centerOn(cx, cy);
    this.add.rectangle(cx, cy, 1600, 900, 0x0a0610, 0.42).setDepth(2000);

    this.add.sprite(cx, cy - 210, "px-cat-0").setScale(2.3).setDepth(3000);

    const title =
      this.result.reason === "king"
        ? "牌坊进肚了"
        : this.result.reason === "win"
          ? "今晚吃饱了"
          : "被摊主抓住了";

    this.add
      .text(cx, cy - 80, title, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "48px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    const lines = [
      `评价：${formatRank(this.result)}`,
      `清单 ${this.result.completed}/3    ${this.result.courses.join(" → ")}`,
      `今晚吞下 ${this.result.eaten} 样`,
      `最大的一口：${this.result.biggestName}`,
    ];

    this.add
      .text(cx, cy + 50, lines.join("\n"), {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffd7a0",
        align: "center",
        lineSpacing: 12,
        stroke: "#1a0c10",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    this.add
      .text(cx, cy + 200, "再来一局", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
        stroke: "#1a0c10",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.scene.start("play");
    });
  }
}
