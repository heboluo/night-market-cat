import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { paintStreet } from "../world/street";
import { WORLD_H } from "../constants";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    ensureArt(this);
    paintStreet(this);
    const cx = 820;
    const cy = WORLD_H * 0.62;
    this.cameras.main.setZoom(0.9);
    this.cameras.main.centerOn(cx, cy);

    this.add.rectangle(cx, cy + 80, 1600, 520, 0x08040a, 0.18).setDepth(2000);
    const cat = this.add.sprite(cx, cy - 70, "px-cat-0").setScale(2.4).setDepth(3000);
    cat.play("cat-walk");

    this.add
      .text(cx, cy + 70, "夜市猫", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "84px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    const hint = this.add
      .text(cx, cy + 160, "点一下，去偷今晚三口", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
        stroke: "#1a0c10",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(3000);

    this.tweens.add({ targets: hint, alpha: 0.4, yoyo: true, duration: 800, repeat: -1 });
    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.cameras.main.fadeOut(240, 12, 8, 18);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("play"));
    });
  }
}
