import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { formatRank, type RoundResult } from "../types";

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
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#16101c");
    this.add.tileSprite(width / 2, height / 2, width, height, "px-ground");
    const cat = this.add.sprite(width / 2, height * 0.18, "px-cat-0");
    cat.setScale(3.4);

    const title =
      this.result.reason === "king"
        ? "牌坊进肚了"
        : this.result.reason === "win"
          ? "今晚吃饱了"
          : "被摊主抓住了";

    this.add
      .text(width / 2, height * 0.34, title, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "46px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const lines = [
      `评价：${formatRank(this.result)}`,
      `清单 ${this.result.completed}/3    ${this.result.courses.join(" → ")}`,
      `今晚吞下 ${this.result.eaten} 样`,
      `最大的一口：${this.result.biggestName}`,
    ];

    this.add
      .text(width / 2, height * 0.54, lines.join("\n"), {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffd7a0",
        align: "center",
        lineSpacing: 12,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.8, "再来一局", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.scene.start("play");
    });
  }
}
