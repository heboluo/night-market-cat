import Phaser from "phaser";
import { STREET_Y, WORLD_H, WORLD_W } from "../constants";

export function paintStreet(scene: Phaser.Scene): void {
  scene.add.tileSprite(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, "tile-sky").setDepth(0);
  scene.add.image(WORLD_W - 80, 36, "tile-moon").setScale(2).setDepth(1);
  scene.add.tileSprite(WORLD_W / 2, STREET_Y + 40, WORLD_W, 140, "tile-road").setDepth(2);

  for (let i = 0; i < 14; i++) {
    const x = 70 + i * 136;
    scene.add.image(x, STREET_Y - 86, "tile-shop").setScale(2).setDepth(3);
  }

  for (let i = 0; i < 24; i++) {
    const x = 40 + i * 80;
    const y = 70 + (i % 2) * 6;
    scene.add.image(x, y, "tile-lantern").setScale(2).setDepth(4);
  }
}
