import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { closingSound, eatSound, hurtSound, warnSound } from "../audio/sfx";
import {
  EAT_RATIO,
  GROWTH_KEEP,
  HUNGER_AREA_PER_SEC,
  HUNGER_GRACE,
  HURT_COOLDOWN,
  ROUND_SECONDS,
  SWEEPER_AT,
  WORLD_SIZE,
} from "../constants";
import { Cat } from "../entities/Cat";
import { Edible } from "../entities/Edible";
import { Sweeper } from "../entities/Sweeper";
import { formatSize, type EndReason, type RoundResult } from "../types";
import { paintGround, spawnMarket } from "../world/spawnMarket";

export class PlayScene extends Phaser.Scene {
  private cat!: Cat;
  private items: Edible[] = [];
  private remaining = ROUND_SECONDS;
  private sinceEat = 0;
  private hurtWait = 0;
  private hud!: Phaser.GameObjects.Text;
  private hungerFill!: Phaser.GameObjects.Rectangle;
  private crumbs!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hudCam!: Phaser.Cameras.Scene2D.Camera;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];
  private pointerWorld = new Phaser.Math.Vector2();
  private ended = false;
  private hasPointer = false;
  private sweeper?: Sweeper;
  private warned = false;

  constructor() {
    super("play");
  }

  create(): void {
    ensureArt(this);
    paintGround(this);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.fadeIn(280, 20, 12, 18);

    const rng = new Phaser.Math.RandomDataGenerator();
    this.items = spawnMarket(this, rng);
    this.cat = new Cat(this, WORLD_SIZE / 2, WORLD_SIZE / 2);

    this.crumbs = this.add.particles(0, 0, "px-crumb", {
      lifespan: 420,
      speed: { min: 40, max: 140 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.95, end: 0 },
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
      .text(24, 18, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "18px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 5,
      })
      .setScrollFactor(0)
      .setDepth(5000);

    const hungerBack = this.add.rectangle(24, 128, 168, 12, 0x1a1024, 0.9).setOrigin(0, 0).setScrollFactor(0).setDepth(5000);
    this.hungerFill = this.add.rectangle(26, 130, 164, 8, 0xffc56a).setOrigin(0, 0).setScrollFactor(0).setDepth(5001);
    this.uiObjects = [this.hud, hungerBack, this.hungerFill];
    this.cameras.main.startFollow(this.cat, true, 0.09, 0.09);
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.hudCam.setScroll(0, 0);
    this.hudCam.transparent = true;
    this.bindCameras();
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
    this.sinceEat += dt;
    this.hurtWait = Math.max(0, this.hurtWait - dt);

    if (this.hasPointer) {
      const pointer = this.input.activePointer;
      this.cameras.main.getWorldPoint(pointer.x, pointer.y, this.pointerWorld);
      this.cat.follow(this.pointerWorld, dt);
    }
    this.cat.x = Phaser.Math.Clamp(this.cat.x, 80, WORLD_SIZE - 80);
    this.cat.y = Phaser.Math.Clamp(this.cat.y, 80, WORLD_SIZE - 80);

    this.applyHunger(dt);
    this.spawnSweeperIfNeeded();
    this.sweeper?.chase(this.cat, dt);
    this.resolveEats(dt);
    this.resolveSweeper();
    this.updateZoom();
    this.updateHud();

    if (!this.ended && this.cat.starved) this.finish("hungry");
    if (!this.ended && this.remaining <= 0) this.finish("time");
  }

  private applyHunger(dt: number): void {
    if (this.sinceEat <= HUNGER_GRACE) return;
    this.cat.shrinkBy(HUNGER_AREA_PER_SEC * dt);
  }

  private spawnSweeperIfNeeded(): void {
    if (this.sweeper || ROUND_SECONDS - this.remaining < SWEEPER_AT) return;
    const edge = this.cat.x > WORLD_SIZE / 2 ? 80 : WORLD_SIZE - 80;
    this.sweeper = new Sweeper(this, edge, this.cat.y);
    this.hudCam.ignore(this.sweeper);
    if (!this.warned) {
      this.warned = true;
      warnSound();
    }
  }

  private resolveSweeper(): void {
    if (!this.sweeper || this.ended) return;
    const dx = this.sweeper.x - this.cat.x;
    const dy = this.sweeper.y - this.cat.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.cat.radius + this.sweeper.radius * 0.55) return;
    if (this.cat.radius > this.sweeper.radius * EAT_RATIO) {
      this.cat.growBy(this.sweeper.radius * this.sweeper.radius * Math.PI * GROWTH_KEEP, "收摊车", this.sweeper.radius);
      this.sweeper.destroy();
      this.sweeper = undefined;
      this.sinceEat = 0;
      eatSound(80);
      return;
    }
    if (this.cat.radius < 38) {
      this.finish("swept");
      return;
    }
    if (this.hurtWait > 0) return;
    const inv = dist === 0 ? 1 : 1 / dist;
    this.cat.bounceFrom(-dx * inv, -dy * inv, 42);
    this.cat.shrinkBy(220);
    this.hurtWait = HURT_COOLDOWN;
    hurtSound();
  }

  private resolveEats(dt: number): void {
    const cat = this.cat;
    for (const item of this.items) {
      if (item.eaten) continue;
      item.wander(dt);
      const dx = item.x - cat.x;
      const dy = item.y - cat.y;
      const dist = Math.hypot(dx, dy);
      const reach = cat.radius + item.radius * 0.12;
      if (dist > reach) continue;

      if (cat.radius > item.radius * EAT_RATIO) {
        this.swallow(item);
      } else if (item.radius > cat.radius * 1.2) {
        const inv = dist === 0 ? 1 : 1 / dist;
        cat.bounceFrom(-dx * inv, -dy * inv, 24);
        if (item.def.tier === "vehicle" && this.hurtWait <= 0) {
          cat.shrinkBy(90);
          this.hurtWait = HURT_COOLDOWN;
          hurtSound();
        }
      }
    }
  }

  private swallow(item: Edible): void {
    item.eaten = true;
    this.sinceEat = 0;
    eatSound(item.radius);
    this.crumbs.emitParticleAt(item.x, item.y, Math.min(18, 6 + Math.floor(item.radius / 8)));
    this.cameras.main.shake(70, Math.min(0.008, item.radius / 9000));
    this.cat.growBy(item.area * GROWTH_KEEP, item.def.name, item.radius, item.def.tier === "landmark");
    this.tweens.add({
      targets: this.cat,
      scaleX: this.cat.scaleX * 1.12,
      scaleY: this.cat.scaleY * 0.9,
      yoyo: true,
      duration: 90,
    });
    this.tweens.add({
      targets: item,
      scale: 0,
      alpha: 0,
      duration: 140,
      onComplete: () => item.destroy(),
    });
    if (this.cat.ateArch && !this.ended) this.finish("time");
  }

  private updateZoom(): void {
    const zoom = Phaser.Math.Clamp(92 / this.cat.radius, 0.22, 1.35);
    const cam = this.cameras.main;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, zoom, 0.08));
  }

  private updateHud(): void {
    const t = Math.ceil(this.remaining);
    const full = 1 - Phaser.Math.Clamp((this.sinceEat - HUNGER_GRACE) / 9, 0, 1);
    this.hungerFill.width = 164 * full;
    this.hungerFill.setFillStyle(full < 0.28 ? 0xe07070 : 0xffc56a);
    const warn = this.sweeper ? "\n收摊车来了" : "";
    this.hud.setText(
      `打烊 ${t}s   ${formatSize(this.cat.radius)}\n吞下 ${this.cat.eaten}  饱食\n目标：越吃越大，去吞牌坊${warn}`,
    );
  }

  private finish(reason: EndReason): void {
    if (this.ended) return;
    this.ended = true;
    closingSound();
    const result: RoundResult = {
      eaten: this.cat.eaten,
      radius: this.cat.radius,
      biggestName: this.cat.biggestName,
      remaining: this.items.filter((item) => !item.eaten).length,
      ateArch: this.cat.ateArch,
      reason,
    };
    this.scene.start("result", result);
  }

  private bindCameras(): void {
    this.cameras.main.ignore(this.uiObjects);
    this.hudCam.ignore(this.children.list.filter((obj) => !this.uiObjects.includes(obj)));
  }
}
