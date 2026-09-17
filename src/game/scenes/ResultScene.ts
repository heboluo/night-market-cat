import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { formatRank, type RoundResult } from "../types";
import { paintStreet } from "../world/street";
import { STREET_Y } from "../constants";

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
    this.cameras.main.centerOn(960, STREET_Y - 20);
    const cx = 960;
    const cy = 150;
    this.add.rectangle(cx, cy + 20, 420, 280, 0x0a0610, 0.55).setDepth(2000);
    this.add.sprite(cx, cy - 70, "cat-chonk-0").setScale(3).setDepth(3000);

    const title =
      this.result.reason === "king" ? "牌坊进肚了" : this.result.reason === "win" ? "今晚吃饱了" : "被摊主抓住了";

    this.add
      .text(cx, cy - 18, title, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "18px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    const lines = [
      `评价：${formatRank(this.result)}`,
      `清单 ${this.result.completed}/3  ${this.result.courses.join(" → ")}`,
      `今晚吞下 ${this.result.eaten} 样 · ${this.result.biggestName}`,
    ];

    this.add
      .text(cx, cy + 40, lines.join("\n"), {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "11px",
        color: "#ffd7a0",
        align: "center",
        lineSpacing: 6,
        stroke: "#1a0c10",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    this.add
      .text(cx, cy + 100, "再来一局", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "13px",
        color: "#fff3dd",
        stroke: "#1a0c10",
        strokeThickness: 3,
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
