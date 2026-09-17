import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    ensureArt(this);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#16101c");
    this.add.tileSprite(width / 2, height / 2, width, height, "px-ground");

    for (let i = 0; i < 8; i++) {
      const glow = this.add.image(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(40, height - 80),
        "px-glow",
      );
      glow.setScale(Phaser.Math.FloatBetween(1.6, 2.8));
      glow.setAlpha(0.35);
    }

    const cat = this.add.sprite(width / 2, height * 0.22, "px-cat-0");
    cat.setScale(4);
    cat.play("cat-idle");

    this.add
      .text(width / 2, height * 0.4, "夜市猫", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "78px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.52, "跟着走，碰到就吃", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#ffb35a",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.64, "开局没有门槛，但你会饿\n电动车会撞，收摊车会追\n吞下牌坊才算真正赢", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "18px",
        color: "#d9c4b0",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(width / 2, height * 0.82, "点一下开始", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      y: "+=6",
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
