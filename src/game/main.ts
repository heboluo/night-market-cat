import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { PlayScene } from "./scenes/PlayScene";
import { ResultScene } from "./scenes/ResultScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#140c18",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    antialias: true,
    roundPixels: false,
    pixelArt: false,
  },
  scene: [MenuScene, PlayScene, ResultScene],
};

export function startGame(): Phaser.Game {
  return new Phaser.Game(gameConfig);
}
