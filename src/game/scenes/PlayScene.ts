import Phaser from "phaser";
import { ensureArt } from "../art/createSprites";
import { closingSound, eatSound, hurtSound, successSound, warnSound } from "../audio/sfx";
import {
  CRAVING_GROWTH,
  EAT_RATIO,
  GROWTH_KEEP,
  HURT_COOLDOWN,
  MAX_ALERT,
  WORLD_SIZE,
} from "../constants";
import { Cat } from "../entities/Cat";
import { Edible } from "../entities/Edible";
import { Sweeper } from "../entities/Sweeper";
import { NightList } from "../systems/NightList";
import { alertStars, type EndReason, type RoundResult } from "../types";
import { paintGround, spawnMarket } from "../world/spawnMarket";

export class PlayScene extends Phaser.Scene {
  private cat!: Cat;
  private items: Edible[] = [];
  private list!: NightList;
  private hurtWait = 0;
  private hud!: Phaser.GameObjects.Text;
  private crumbs!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hudCam!: Phaser.Cameras.Scene2D.Camera;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];
  private pointerWorld = new Phaser.Math.Vector2();
  private ended = false;
  private sweeper?: Sweeper;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private pings: Phaser.GameObjects.Image[] = [];
  private pingT = 0;

  constructor() {
    super("play");
  }

  create(): void {
    ensureArt(this);
    paintGround(this);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.fadeIn(280, 20, 12, 18);

    const rng = new Phaser.Math.RandomDataGenerator();
    this.list = new NightList(rng);
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

    const kb = this.input.keyboard;
    this.keys = kb
      ? (kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>)
      : {};

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

    this.uiObjects = [this.hud];
    this.cameras.main.startFollow(this.cat, true, 0.09, 0.09);
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.hudCam.setScroll(0, 0);
    this.hudCam.transparent = true;
    this.bindCameras();
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.hudCam.setSize(gameSize.width, gameSize.height);
    });
    this.updateHud();
    this.updateZoom();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 40) / 1000;
    this.hurtWait = Math.max(0, this.hurtWait - dt);
    this.pingT += dt;
    this.readMove(dt);
    this.cat.x = Phaser.Math.Clamp(this.cat.x, 80, WORLD_SIZE - 80);
    this.cat.y = Phaser.Math.Clamp(this.cat.y, 80, WORLD_SIZE - 80);
    this.spawnHunterIfNeeded();
    this.sweeper?.chase(this.cat, dt);
    this.resolveEats(dt);
    this.resolveSweeper();
    this.refreshPings();
    this.updateZoom();
    this.updateHud();
  }

  private readMove(dt: number): void {
    let ix = 0;
    let iy = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) ix -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) ix += 1;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) iy -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) iy += 1;
    if (ix === 0 && iy === 0 && this.input.activePointer.isDown) {
      this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y, this.pointerWorld);
      ix = this.pointerWorld.x - this.cat.x;
      iy = this.pointerWorld.y - this.cat.y;
    }
    this.cat.steer(ix, iy, dt);
  }

  private spawnHunterIfNeeded(): void {
    if (this.sweeper || this.list.alert < 2) return;
    const edge = this.cat.x > WORLD_SIZE / 2 ? 80 : WORLD_SIZE - 80;
    this.sweeper = new Sweeper(this, edge, this.cat.y);
    this.hudCam.ignore(this.sweeper);
    warnSound();
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
      this.list.alert = Math.max(0, this.list.alert - 1);
      eatSound(80);
      return;
    }
    if (this.list.alert >= MAX_ALERT) {
      this.finish("caught");
      return;
    }
    if (this.hurtWait > 0) return;
    const inv = dist === 0 ? 1 : 1 / dist;
    this.cat.bounceFrom(-dx * inv, -dy * inv, 42);
    this.list.raise(1);
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
          this.list.raise(1);
          this.hurtWait = HURT_COOLDOWN;
          hurtSound();
        }
      }
    }
  }

  private swallow(item: Edible): void {
    item.eaten = true;
    const target = this.list.isTarget(item.def);
    const keep = target ? CRAVING_GROWTH : item.def.tier === "snack" ? GROWTH_KEEP : GROWTH_KEEP * 0.6;
    this.cat.growBy(item.area * keep, item.def.name, item.radius, item.def.tier === "landmark");
    this.crumbs.emitParticleAt(item.x, item.y, Math.min(18, 6 + Math.floor(item.radius / 8)));
    this.cameras.main.shake(70, Math.min(0.008, item.radius / 9000));
    this.tweens.add({
      targets: item,
      scale: 0,
      alpha: 0,
      duration: 140,
      onComplete: () => item.destroy(),
    });

    if (item.def.tier === "landmark") {
      this.finish("king");
      return;
    }
    if (target) {
      successSound();
      this.list.succeed();
      this.flash("吃到了！");
      if (this.list.done) this.finish("win");
      return;
    }
    eatSound(item.radius);
    if (item.def.tier !== "snack") {
      this.list.raise(item.def.tier === "stall" ? 2 : 1);
      this.flash("惊动了摊主");
    }
  }

  private flash(text: string): void {
    const label = this.add
      .text(this.cat.x, this.cat.y - this.cat.radius - 18, text, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "20px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(4000);
    this.hudCam.ignore(label);
    this.tweens.add({
      targets: label,
      y: label.y - 28,
      alpha: 0,
      duration: 700,
      onComplete: () => label.destroy(),
    });
  }

  private refreshPings(): void {
    const name = this.list.current?.name;
    const live = this.items.filter((item) => !item.eaten && item.def.name === name);
    while (this.pings.length < live.length) {
      const ping = this.add.image(0, 0, "px-ping").setDepth(2500).setScale(2);
      this.hudCam.ignore(ping);
      this.pings.push(ping);
    }
    this.pings.forEach((ping, i) => {
      const item = live[i];
      if (!item) {
        ping.setVisible(false);
        return;
      }
      ping.setVisible(true);
      ping.setPosition(item.x, item.y - item.radius - 16 + Math.sin(this.pingT * 6) * 4);
    });
  }

  private updateZoom(): void {
    const zoom = Phaser.Math.Clamp(92 / this.cat.radius, 0.22, 1.35);
    const cam = this.cameras.main;
    cam.setZoom(Phaser.Math.Linear(cam.zoom, zoom, 0.08));
  }

  private updateHud(): void {
    const want = this.list.current ? this.list.current.name : "今晚吃饱了";
    const trail = this.list.courses.map((course, i) => (i < this.list.index ? "✓" : i === this.list.index ? `【${course.name}】` : course.name)).join(" → ");
    const hunt = this.sweeper ? "\n摊主追来了，躲开或反吃" : "";
    this.hud.setText(`今晚想吃  ${want}\n${trail}\n惊动 ${alertStars(this.list.alert)}    WASD 走路${hunt}`);
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
      completed: this.list.completed,
      alert: this.list.alert,
      courses: this.list.courses.map((course) => course.name),
    };
    this.scene.start("result", result);
  }

  private bindCameras(): void {
    this.cameras.main.ignore(this.uiObjects);
    this.hudCam.ignore(this.children.list.filter((obj) => !this.uiObjects.includes(obj)));
  }
}
