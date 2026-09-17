import Phaser from "phaser";
import { closingSound, eatSound } from "../audio/sfx";
import { EAT_RATIO, GROWTH_KEEP, ROUND_SECONDS, WORLD_SIZE } from "../constants";
import { Cat } from "../entities/Cat";
import { Edible } from "../entities/Edible";
import { formatSize, type RoundResult } from "../types";
import { paintGround, spawnMarket } from "../world/spawnMarket";

export class PlayScene extends Phaser.Scene {
  private cat!: Cat;
  private items: Edible[] = [];
  private remaining = ROUND_SECONDS;
  private hud!: Phaser.GameObjects.Text;
  private crumbs!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hudCam!: Phaser.Cameras.Scene2D.Camera;
  private pointerWorld = new Phaser.Math.Vector2();
  private ended = false;
  private hasPointer = false;

  constructor() {
    super("play");
  }

  create(): void {
    paintGround(this);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.fadeIn(280, 20, 12, 18);

    const rng = new Phaser.Math.RandomDataGenerator();
    this.items = spawnMarket(this, rng);
    this.cat = new Cat(this, WORLD_SIZE / 2, WORLD_SIZE / 2);

    this.ensureCrumbTexture();
    this.crumbs = this.add.particles(0, 0, "crumb", {
      lifespan: 420,
      speed: { min: 40, max: 140 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      emitting: false,
      quantity: 8,
    });
    this.crumbs.setDepth(3000);
    this.input.on("pointermove", () => {
      this.hasPointer = true;
    });
    this.input.on("pointerdown", () => {
      this.hasPointer = true;
    });

    this.hud = this.add
      .text(24, 20, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(5000);

    this.cameras.main.startFollow(this.cat, true, 0.09, 0.09);
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.hudCam.setScroll(0, 0);
    this.hudCam.transparent = true;
    this.cameras.main.ignore(this.hud);
    this.hudCam.ignore(this.children.list.filter((obj) => obj !== this.hud));
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.hudCam.setSize(gameSize.width, gameSize.height);
    });
    this.hasPointer = true;
    this.updateHud();
    this.updateZoom();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 40) / 1000;
    this.remaining = Math.max(0, this.remaining - dt);

    if (this.hasPointer) {
      const pointer = this.input.activePointer;
      this.cameras.main.getWorldPoint(pointer.x, pointer.y, this.pointerWorld);
      this.cat.follow(this.pointerWorld, dt);
    }
    this.cat.x = Phaser.Math.Clamp(this.cat.x, 80, WORLD_SIZE - 80);
    this.cat.y = Phaser.Math.Clamp(this.cat.y, 80, WORLD_SIZE - 80);

    this.resolveEats(dt);
    this.updateZoom();
    this.updateHud();

    if (this.remaining <= 0 && !this.ended) {
      this.ended = true;
      this.finish();
    }
  }

  private resolveEats(dt: number): void {
    const cat = this.cat;
    for (const item of this.items) {
      if (item.eaten) continue;
      item.wander(dt);
      const dx = item.x - cat.x;
      const dy = item.y - cat.y;
      const dist = Math.hypot(dx, dy);
      const reach = cat.radius + item.radius * 0.15;
      if (dist > reach) continue;

      if (cat.radius > item.radius * EAT_RATIO) {
        this.swallow(item);
      } else if (item.radius > cat.radius * 1.25) {
        const inv = dist === 0 ? 1 : 1 / dist;
        cat.bounceFrom(-dx * inv, -dy * inv, 22);
      }
    }
  }

  private swallow(item: Edible): void {
    item.eaten = true;
    eatSound(item.radius);
    this.crumbs.emitParticleAt(item.x, item.y, Math.min(18, 6 + Math.floor(item.radius / 8)));
    this.cameras.main.shake(80, Math.min(0.01, item.radius / 8000));
    this.tweens.add({
      targets: this.cat,
      scaleX: 1.16,
      scaleY: 0.88,
      yoyo: true,
      duration: 90,
      onComplete: () => this.cat.setScale(1),
    });
    this.tweens.add({
      targets: item,
      scale: 0,
      alpha: 0,
      duration: 140,
      onComplete: () => item.destroy(),
    });
    this.cat.growBy(item.area * GROWTH_KEEP, item.def.name, item.radius);
  }

  private updateZoom(): void {
    const zoom = Phaser.Math.Clamp(92 / this.cat.radius, 0.22, 1.28);
    const cam = this.cameras.main;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, zoom, 0.08));
  }

  private updateHud(): void {
    const t = Math.ceil(this.remaining);
    this.hud.setText(
      `打烊倒计时  ${t}s\n已经吞下  ${this.cat.eaten}  样\n体型  ${formatSize(this.cat.radius)}`,
    );
  }

  private finish(): void {
    closingSound();
    const result: RoundResult = {
      eaten: this.cat.eaten,
      radius: this.cat.radius,
      biggestName: this.cat.biggestName,
      remaining: this.items.filter((item) => !item.eaten).length,
    };
    this.scene.start("result", result);
  }

  private ensureCrumbTexture(): void {
    if (this.textures.exists("crumb")) return;
    const g = this.add.graphics();
    g.fillStyle(0xffd7a0, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("crumb", 8, 8);
    g.destroy();
  }
}
