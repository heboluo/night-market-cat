import Phaser from "phaser";
import { startSound, unlockAudio } from "../audio/sfx";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#140c18");

    this.add.rectangle(width / 2, height / 2, width, height, 0x140c18);
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(40, height - 40);
      this.add.circle(x, y, Phaser.Math.Between(4, 10), 0xffb35a, 0.18);
    }

    const title = this.add
      .text(width / 2, height * 0.32, "夜市猫", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "84px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.46, "跟着走，碰到就吃", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "28px",
        color: "#ffb35a",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.58, "没有按键，没有失败\n把夜市一点点吞进肚子里", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "20px",
        color: "#d9c4b0",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(width / 2, height * 0.78, "点一下开始", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [title, hint],
      y: "+=8",
      yoyo: true,
      duration: 900,
      repeat: -1,
      ease: "sine.inOut",
    });

    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.cameras.main.fadeOut(220, 20, 12, 18);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("play"));
    });

  }
}
