import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { paintStreet } from "../world/street";
import { STREET_Y } from "../constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    ensureArt(this);
    paintStreet(this);
    this.cameras.main.centerOn(320, STREET_Y);
    const cat = this.add.sprite(320, STREET_Y + 8, "cat-chonk-0").setScale(3).setOrigin(0.5, 1).setDepth(3000);
    cat.play("cat-walk");

    this.add
      .text(320, 72, "夜市猫", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "36px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    const hint = this.add
      .text(320, STREET_Y + 28, "WASD 走路 · 绿灯偷箭头", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "14px",
        color: "#fff3dd",
        stroke: "#1a0c10",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    this.tweens.add({ targets: hint, alpha: 0.35, yoyo: true, duration: 700, repeat: -1 });
    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.cameras.main.fadeOut(180, 12, 8, 18);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("play"));
    });
  }
}
