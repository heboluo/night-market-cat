import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { PlayScene } from "./scenes/PlayScene";
import { ResultScene } from "./scenes/ResultScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#140c18",
  pixelArt: false,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 360,
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
