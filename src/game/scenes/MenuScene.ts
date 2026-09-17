import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { startSound, unlockAudio } from "../audio/sfx";
import { paintStreet } from "../world/street";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create(): void {
    ensureArt(this);
    paintStreet(this);
    this.cameras.main.setZoom(0.55);
    this.cameras.main.centerOn(900, 720);

    const { width, height } = this.scale;
    const cat = this.add.sprite(width / 2, height * 0.38, "px-cat-0").setScrollFactor(0).setScale(3.2);
    this.add
      .text(width / 2, height * 0.58, "夜市猫", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "82px",
        color: "#ffe7c2",
        stroke: "#8b3a1e",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const hint = this.add
      .text(width / 2, height * 0.78, "点一下，走进夜市", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "26px",
        color: "#fff3dd",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.tweens.add({ targets: [cat, hint], y: "+=7", yoyo: true, duration: 900, repeat: -1, ease: "sine.inOut" });
    this.input.once("pointerdown", () => {
      unlockAudio();
      startSound();
      this.cameras.main.fadeOut(240, 12, 8, 18);
      this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("play"));
    });
  }
}
