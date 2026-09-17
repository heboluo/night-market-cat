import Phaser from "phaser";
import { startSound, unlockAudio } from "../audio/sfx";
import { formatSize, type RoundResult } from "../types";

export class ResultScene extends Phaser.Scene {
  private result!: RoundResult;

  constructor() {
    super("result");
  }

  init(data: RoundResult): void {
    this.result = data;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#140c18");
    this.add.rectangle(width / 2, height / 2, width, height, 0x140c18);

    this.add
      .text(width / 2, height * 0.22, "夜市打烊了", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "56px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const lines = [
      `今晚吞下 ${this.result.eaten} 样东西`,
      `体型：${formatSize(this.result.radius)}`,
      `最大的一口：${this.result.biggestName}`,
    ];

    this.add
      .text(width / 2, height * 0.46, lines.join("\n"), {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#ffd7a0",
        align: "center",
        lineSpacing: 14,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.74, "再来一局", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "28px",
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
